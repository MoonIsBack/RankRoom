// BILD-EXPORT: Zeichnet die Tier-Reihen einer Tierlist auf ein Canvas (eine
// Zeichenfläche) und ermöglicht den Download als PNG oder JPG.
//
// Wir zeichnen alles selbst (statt eine externe Bibliothek zu benutzen), damit
// das Ergebnis exakt vorhersehbar ist und keine zusätzliche Abhängigkeit nötig ist.
import { sanitizeFileBaseName } from './fileName'

// --- Maße & Farben des exportierten Bildes ---
const SCALE = 2 // doppelte Auflösung -> scharfes Bild (wie Retina)
const WIDTH = 1000 // Bildbreite (logische Pixel)
const LABEL_W = 96 // Breite der farbigen Tier-Beschriftung links
const ITEM = 88 // Kantenlänge einer Item-Kachel
const GAP = 10 // Abstand zwischen Kacheln
const ROW_PAD = 12 // Innenabstand oben/unten je Reihe
const MIN_ROW_H = ITEM + ROW_PAD * 2 // Mindesthöhe einer (auch leeren) Reihe
const TITLE_H = 78 // Höhe des Titelbalkens oben

const BG_COLOR = '#0f0f16'
const TITLE_COLOR = '#f1f2f7'
const BRAND_COLOR = '#898da1'
const CARD_BG = '#20222e'
const CARD_TEXT = '#f1f2f7'
const CARD_BORDER = 'rgba(255, 255, 255, 0.1)'
const CONTENT_BG = 'rgba(255, 255, 255, 0.02)'
const LABEL_TEXT = 'rgba(0, 0, 0, 0.75)'

const FONT = 'Inter, system-ui, sans-serif'

// Zeichnet einen abgerundeten Rechteck-Pfad (für Item-Kacheln)
function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

// Lädt ein Bild (aus einer Data-URL). Bei einem Fehler wird null geliefert,
// damit ein kaputtes Bild den ganzen Export nicht verhindert.
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

// Kürzt einen Text mit "…", falls er breiter als maxWidth wäre.
// Setzt voraus, dass ctx.font bereits auf die gewünschte Schrift gesetzt ist,
// denn measureText misst immer mit der gerade aktiven Schrift.
function cutText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) {
    return text
  }

  let shortened = text
  while (shortened.length > 1 && ctx.measureText(`${shortened}…`).width > maxWidth) {
    shortened = shortened.slice(0, -1)
  }

  return `${shortened}…`
}

// Wie cutText, zeichnet den gekürzten Text aber direkt mittig an die Stelle
function drawTruncatedText(ctx, text, centerX, centerY, maxWidth) {
  ctx.fillText(cutText(ctx, text, maxWidth), centerX, centerY)
}

// Zeichnet eine einzelne Item-Kachel (mit Bild oder als Text-Karte)
async function drawItem(ctx, item, x, y) {
  const img = item.image ? await loadImage(item.image) : null

  if (img) {
    // Bild "cover" in die quadratische Kachel einpassen (füllt sie ganz aus)
    ctx.save()
    roundRectPath(ctx, x, y, ITEM, ITEM, 12)
    ctx.clip()

    const scale = Math.max(ITEM / img.width, ITEM / img.height)
    const drawW = img.width * scale
    const drawH = img.height * scale
    ctx.drawImage(img, x + (ITEM - drawW) / 2, y + (ITEM - drawH) / 2, drawW, drawH)

    // Dunkler Balken unten + Name als Bildunterschrift
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(x, y + ITEM - 22, ITEM, 22)
    ctx.restore()

    ctx.fillStyle = '#ffffff'
    ctx.font = `700 11px ${FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    drawTruncatedText(ctx, item.name, x + ITEM / 2, y + ITEM - 11, ITEM - 10)
    ctx.textAlign = 'left'
    return
  }

  // Text-Karte (Item ohne Bild)
  ctx.fillStyle = CARD_BG
  roundRectPath(ctx, x, y, ITEM, ITEM, 12)
  ctx.fill()

  ctx.strokeStyle = CARD_BORDER
  ctx.lineWidth = 1
  roundRectPath(ctx, x + 0.5, y + 0.5, ITEM - 1, ITEM - 1, 12)
  ctx.stroke()

  ctx.fillStyle = CARD_TEXT
  ctx.font = `700 12px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  drawTruncatedText(ctx, item.name, x + ITEM / 2, y + ITEM / 2, ITEM - 12)
  ctx.textAlign = 'left'
}

// Rendert die komplette Tierlist (Titel + alle Tier-Reihen) auf ein Canvas
// und gibt dieses zurück.
export async function renderTierListToCanvas(tierList) {
  const contentW = WIDTH - LABEL_W

  // Wie viele Kacheln passen nebeneinander in den Inhaltsbereich?
  const itemsPerRow = Math.max(1, Math.floor((contentW - GAP) / (ITEM + GAP)))

  // Höhe jeder Reihe vorab berechnen (abhängig davon, wie viele Kachel-Zeilen
  // die Items brauchen, wenn sie umbrechen)
  const rowHeights = tierList.tiers.map((tier) => {
    const itemRows = Math.max(1, Math.ceil(tier.items.length / itemsPerRow))
    return Math.max(MIN_ROW_H, ROW_PAD * 2 + itemRows * ITEM + (itemRows - 1) * GAP)
  })

  const totalH = TITLE_H + rowHeights.reduce((sum, h) => sum + h, 0)

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH * SCALE
  canvas.height = totalH * SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE)

  // Hintergrund
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, WIDTH, totalH)

  // Titel (Name der Liste) links, "RankRoom" als kleine Marke rechts
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillStyle = TITLE_COLOR
  ctx.font = `700 30px ${FONT}`
  ctx.fillText(cutText(ctx, tierList.name, WIDTH - 200), 24, TITLE_H / 2)

  ctx.fillStyle = BRAND_COLOR
  ctx.font = `700 15px ${FONT}`
  ctx.textAlign = 'right'
  ctx.fillText('RankRoom', WIDTH - 24, TITLE_H / 2)
  ctx.textAlign = 'left'

  // Reihen zeichnen
  let y = TITLE_H
  for (let t = 0; t < tierList.tiers.length; t++) {
    const tier = tierList.tiers[t]
    const rowH = rowHeights[t]

    // Farbige Beschriftung links
    ctx.fillStyle = tier.color
    ctx.fillRect(0, y, LABEL_W, rowH)
    ctx.fillStyle = LABEL_TEXT
    ctx.font = `800 30px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(tier.name, LABEL_W / 2, y + rowH / 2)
    ctx.textAlign = 'left'

    // Inhaltsbereich rechts
    ctx.fillStyle = CONTENT_BG
    ctx.fillRect(LABEL_W, y, contentW, rowH)

    // Items einzeln zeichnen (mit Umbruch)
    for (let i = 0; i < tier.items.length; i++) {
      const col = i % itemsPerRow
      const row = Math.floor(i / itemsPerRow)
      const itemX = LABEL_W + ROW_PAD + col * (ITEM + GAP)
      const itemY = y + ROW_PAD + row * (ITEM + GAP)
      await drawItem(ctx, tier.items[i], itemX, itemY)
    }

    y += rowH
  }

  return canvas
}

// Macht aus dem gezeichneten Canvas eine fertige Bilddatei.
// format ist "jpg" oder "png"; JPG braucht eine Qualitätsangabe (0..1).
//
// Absichtlich getrennt vom Weitergeben (siehe unten): auf dem iPhone muss
// das Teilen-Menü direkt aus dem Antippen heraus geöffnet werden. Wäre das
// Erzeugen der Datei noch dazwischen, hätte Safari den Tipp-Bezug schon
// verloren und das Menü gar nicht erst geöffnet. Deshalb wird die Datei
// vorher erzeugt und beim Antippen nur noch weitergereicht.
export function canvasToImageFile(canvas, format, name) {
  const isPng = format === 'png'
  const mimeType = isPng ? 'image/png' : 'image/jpeg'
  const extension = isPng ? 'png' : 'jpg'
  const fileName = `${sanitizeFileBaseName(name)}.${extension}`

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ? new File([blob], fileName, { type: mimeType }) : null),
      mimeType,
      isPng ? undefined : 0.92,
    )
  })
}

// Soll für diese Datei das System-Teilen-Menü genutzt werden?
//
// Auf dem Handy ja: dort öffnet sich das bekannte Teilen-Menü mit "Bild
// sichern", das direkt in die Fotos-App speichert. Ein normaler Download
// zeigt auf dem iPhone stattdessen nur eine graue Datei-Seite an, auf der
// das Bild gar nicht zu sehen ist.
//
// Am Rechner NICHT: dort ist der Download in den Download-Ordner das
// Erwartete. Die reine Abfrage navigator.canShare reicht dafür nicht —
// Safari am Mac meldet ebenfalls, dass es Dateien teilen kann. Deshalb
// zusätzlich die Zeigerart: "coarse" heißt Finger statt Mauszeiger, trifft
// also genau die Geräte, bei denen das Teilen-Menü der bessere Weg ist.
export function canShareFile(file) {
  return Boolean(file && navigator.canShare?.({ files: [file] }) && isTouchDevice())
}

// Wird mit dem Finger bedient (Handy/Tablet) statt mit der Maus?
// "coarse" beschreibt einen ungenauen Zeiger — also einen Finger.
export function isTouchDevice() {
  return window.matchMedia?.('(pointer: coarse)').matches ?? false
}

// Zeigt das Bild in einem neuen Tab an, statt es herunterzuladen.
//
// Rückfalllösung für Handys, auf denen das Teilen-Menü nicht zur Verfügung
// steht (ältere iOS-Versionen, In-App-Browser). Ein normaler Download endet
// dort auf einer grauen Datei-Seite, auf der das Bild gar nicht zu sehen
// ist — so wird es wenigstens angezeigt und lässt sich per langem Tippen
// sichern.
//
// Die URL wird bewusst NICHT sofort wieder freigegeben: der neue Tab lädt
// sie erst noch. Der Browser räumt sie beim Schließen der Seite selbst auf.
export function openImageFile(file) {
  // noopener: Der neue Tab bekommt keinen Zugriff auf das Fenster, aus dem er
  // geöffnet wurde. Bei einer blob:-Adresse aus dem eigenen Gerät ist das
  // ungefährlich, aber es ist die richtige Grundeinstellung für window.open —
  // und kostet nichts.
  window.open(URL.createObjectURL(file), '_blank', 'noopener')
}

// Öffnet das System-Teilen-Menü. Bricht der Nutzer ab, ist das kein Fehler.
// Gibt zurück, ob das Teilen tatsächlich stattgefunden hat.
export async function shareImageFile(file) {
  try {
    await navigator.share({ files: [file] })
    return true
  } catch (error) {
    // AbortError = der Nutzer hat das Menü einfach wieder geschlossen
    return error?.name === 'AbortError'
  }
}

// Klassischer Download über einen unsichtbaren Link (Rechner, Android-Browser)
export function downloadImageFile(file) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')

  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
