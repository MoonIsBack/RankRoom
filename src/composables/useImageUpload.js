// Hilfsfunktionen, um Bilddateien (per Dateiauswahl oder Drag & Drop) in ein
// Format umzuwandeln, das wir direkt in einem Item speichern und später
// wieder aus dem localStorage laden können: eine "Data-URL".
//
// Eine Data-URL ist das Bild als Text kodiert (z. B. "data:image/png;base64,...").
// Der Vorteil: Wir brauchen keinen eigenen Server, um Bilder zu speichern —
// der Nachteil: Bilder brauchen im localStorage deutlich mehr Platz als reiner Text.

// Nur diese Bildformate werden akzeptiert
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg']

// Für das <input accept="..."> im Datei-Dialog: MIME-Typen UND Dateiendungen,
// weil manche Betriebssysteme nur nach der Endung filtern
export const ALLOWED_IMAGE_ACCEPT = 'image/png,image/jpeg,.png,.jpg,.jpeg'

// Liest eine einzelne Datei ein und wandelt sie in eine Data-URL um
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)

    reader.readAsDataURL(file)
  })
}

// Entfernt die Dateiendung aus einem Dateinamen, z. B. "Waves.png" -> "Waves"
function fileNameWithoutExtension(fileName) {
  const dotIndex = fileName.lastIndexOf('.')

  if (dotIndex <= 0) {
    return fileName
  }

  return fileName.slice(0, dotIndex)
}

// Nimmt eine Liste von Dateien (aus einer Dateiauswahl oder einem Drop-Event)
// entgegen und trennt sie in zwei Gruppen:
// - items: gültige PNG/JPG-Bilder, bereit zum Hinzufügen als neue Items
// - rejectedFileNames: Namen aller Dateien, die NICHT PNG/JPG waren
export async function readImageFiles(fileList) {
  const allFiles = Array.from(fileList)

  const validFiles = allFiles.filter((file) => ALLOWED_IMAGE_TYPES.includes(file.type))
  const rejectedFileNames = allFiles
    .filter((file) => !ALLOWED_IMAGE_TYPES.includes(file.type))
    .map((file) => file.name)

  const items = await Promise.all(
    validFiles.map(async (file) => ({
      name: fileNameWithoutExtension(file.name),
      image: await readFileAsDataUrl(file),
    })),
  )

  return { items, rejectedFileNames }
}
