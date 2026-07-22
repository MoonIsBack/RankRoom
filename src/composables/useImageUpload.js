// Wandelt Bilddateien (per Dateiauswahl oder Drag & Drop) in ein Format um,
// das wir direkt in einem Item speichern und später wieder aus dem localStorage
// laden können: eine "Data-URL" (das Bild als Text kodiert).
//
// WICHTIG — was hier beim Einlesen passiert und warum:
//
// Das Bild wird NICHT einfach 1:1 übernommen, sondern einmal komplett neu
// gezeichnet (über ein Canvas). Das hat zwei Gründe:
//
// 1. DATENSCHUTZ: Fotodateien enthalten versteckte Zusatzinformationen
//    (EXIF-Daten) — je nach Kamera unter anderem die GPS-Koordinaten des
//    Aufnahmeorts, den Aufnahmezeitpunkt und das Gerätemodell. Beim
//    Neuzeichnen werden ausschließlich die sichtbaren Bildpunkte übernommen,
//    alles andere fällt weg. Ohne diesen Schritt landeten die GPS-Daten im
//    Browser-Speicher und wanderten beim JSON-Export unbemerkt in die Datei —
//    wer sie weitergibt, hätte also seinen Aufnahmeort mitgeschickt.
//
// 2. PLATZ UND TEMPO: Handyfotos sind oft 4000 Pixel breit. Als Text kodiert
//    braucht so ein Bild mehrere Megabyte, und der Browser-Speicher fasst
//    insgesamt nur etwa 5–10 MB. Auf 1600 Pixel begrenzt passen sehr viel mehr
//    Bilder hinein, und das Ziehen der Karten bleibt flüssig.
import {
  MAX_FILES_PER_SELECTION,
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_FILE_SIZE,
} from '../utils/validation'

// Nur diese Bildformate werden akzeptiert (nur hier drin gebraucht)
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg']

// Für das <input accept="..."> im Datei-Dialog: MIME-Typen UND Dateiendungen,
// weil manche Betriebssysteme nur nach der Endung filtern
export const ALLOWED_IMAGE_ACCEPT = 'image/png,image/jpeg,.png,.jpg,.jpeg'

// HEIC/HEIF-Dateiendungen, die IMMER abgelehnt werden — unabhängig davon, was
// der Browser als file.type meldet. Grund: macOS wandelt HEIC-Fotos beim
// Auswählen manchmal automatisch intern in JPEG um, bevor die Datei im
// Browser ankommt. Dadurch meldet file.type fälschlich "image/jpeg" und die
// Datei rutscht am reinen MIME-Type-Filter vorbei.
const BLOCKED_IMAGE_EXTENSIONS = ['.heic', '.heif']

// JPG-Qualität beim Neuzeichnen. 0.9 ist optisch praktisch nicht von der
// Vorlage zu unterscheiden, spart aber deutlich Platz.
const JPEG_QUALITY = 0.9

function hasBlockedExtension(fileName) {
  const lowerCaseName = fileName.toLowerCase()
  return BLOCKED_IMAGE_EXTENSIONS.some((extension) => lowerCaseName.endsWith(extension))
}

// Liest eine einzelne Datei ein und wandelt sie in eine Data-URL um.
// Das ist noch die UNBEARBEITETE Fassung inklusive aller Metadaten — sie wird
// gleich nur als Zwischenschritt zum Neuzeichnen verwendet und nie gespeichert.
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)

    reader.readAsDataURL(file)
  })
}

// Lädt eine Data-URL in ein Bild-Objekt, damit wir es zeichnen können
function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Bild konnte nicht gelesen werden'))

    image.src = dataUrl
  })
}

// Berechnet die Zielgröße: Seitenverhältnis bleibt erhalten, die längere Kante
// wird auf höchstens MAX_IMAGE_DIMENSION begrenzt. Kleinere Bilder werden
// NICHT vergrößert — das würde sie nur unscharf machen und Platz kosten.
function fitWithinLimit(width, height) {
  const longestEdge = Math.max(width, height)

  if (longestEdge <= MAX_IMAGE_DIMENSION) {
    return { width, height }
  }

  const scale = MAX_IMAGE_DIMENSION / longestEdge

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

// Zeichnet das Bild neu und gibt eine frische Data-URL zurück.
// Hier verschwinden die EXIF-Daten, weil nur noch Bildpunkte übrig bleiben.
async function redrawWithoutMetadata(dataUrl, mimeType) {
  const image = await loadImage(dataUrl)

  // naturalWidth/naturalHeight statt width/height: Bei Fotos mit
  // EXIF-Drehinformation liefern moderne Browser hier bereits die GEDREHTEN
  // Maße und zeichnen das Bild anschließend auch gedreht. Damit stimmt die
  // Ausrichtung von Handyfotos automatisch.
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height

  if (!sourceWidth || !sourceHeight) {
    throw new Error('Bild hat keine gültige Größe')
  }

  const { width, height } = fitWithinLimit(sourceWidth, sourceHeight)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Zeichenfläche nicht verfügbar')
  }

  // Beim Verkleinern sieht das Ergebnis mit guter Glättung deutlich sauberer aus
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  context.drawImage(image, 0, 0, width, height)

  // PNG bleibt PNG, damit Transparenz erhalten bleibt. Ein transparentes PNG
  // als JPG zu speichern würde die durchsichtigen Stellen schwarz färben.
  if (mimeType === 'image/png') {
    return canvas.toDataURL('image/png')
  }

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

// Entfernt die Dateiendung aus einem Dateinamen, z. B. "Waves.png" -> "Waves"
function fileNameWithoutExtension(fileName) {
  const dotIndex = fileName.lastIndexOf('.')

  if (dotIndex <= 0) {
    return fileName
  }

  return fileName.slice(0, dotIndex)
}

// Nimmt eine Liste von Dateien entgegen und sortiert sie in vier Gruppen:
//
//   items              — fertig verarbeitete Bilder, bereit zum Hinzufügen
//   rejectedFileNames  — falsches Format (kein PNG/JPG) oder nicht lesbar
//   oversizedFileNames — zu große Dateien, gar nicht erst eingelesen
//   ignoredFileNames   — über die Höchstzahl pro Vorgang hinaus
//
// App.vue zeigt die drei Ablehnungsgruppen anschließend als Hinweis an, damit
// nie eine Datei stillschweigend verschwindet.
export async function readImageFiles(fileList) {
  const allFiles = Array.from(fileList)

  // Sehr viele Dateien auf einmal würden den Browser für mehrere Sekunden
  // einfrieren. Der Rest wird benannt statt still verschluckt.
  const filesToProcess = allFiles.slice(0, MAX_FILES_PER_SELECTION)
  const ignoredFileNames = allFiles.slice(MAX_FILES_PER_SELECTION).map((file) => file.name)

  const rejectedFileNames = []
  const oversizedFileNames = []
  const validFiles = []

  filesToProcess.forEach((file) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type) || hasBlockedExtension(file.name)) {
      rejectedFileNames.push(file.name)
      return
    }

    // Größe VOR dem Einlesen prüfen — eine 200-MB-Datei soll gar nicht erst
    // im Arbeitsspeicher landen
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      oversizedFileNames.push(file.name)
      return
    }

    validFiles.push(file)
  })

  const results = await Promise.all(
    validFiles.map(async (file) => {
      try {
        const originalDataUrl = await readFileAsDataUrl(file)
        const cleanDataUrl = await redrawWithoutMetadata(originalDataUrl, file.type)

        return {
          name: fileNameWithoutExtension(file.name),
          image: cleanDataUrl,
        }
      } catch {
        // Beschädigte oder nicht darstellbare Datei. Bewusst NICHT auf das
        // Original zurückfallen: Dann läge wieder ein Bild mit Metadaten im
        // Speicher — genau das, was hier verhindert werden soll.
        return { failedName: file.name }
      }
    }),
  )

  const items = []

  results.forEach((result) => {
    if (result.failedName) {
      rejectedFileNames.push(result.failedName)
      return
    }

    items.push(result)
  })

  return { items, rejectedFileNames, oversizedFileNames, ignoredFileNames }
}
