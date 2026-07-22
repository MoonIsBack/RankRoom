// ZENTRALE GRENZWERTE UND PRÜFUNGEN.
//
// Vorher waren Prüfungen über mehrere Dateien verstreut (mal ein trim(), mal
// eine Formatprüfung) und Obergrenzen gab es fast gar nicht. Hier stehen sie
// an einer Stelle, damit dieselbe Regel überall gleich gilt und man sie an
// einem Ort anpassen kann.
//
// WICHTIG zur Einordnung: Diese Grenzen sind KEIN Schutz vor Schadcode.
// RankRoom rendert Nutzertexte ausschließlich über Vues normale Textausgabe
// ({{ }} und Attribut-Bindungen), und Vue wandelt dabei Zeichen wie < und >
// automatisch in harmlosen Text um. Es gibt im gesamten Projekt kein v-html,
// kein innerHTML und kein eval — überprüft. Die Grenzen hier dienen der
// Stabilität und dem Speicherplatz, nicht der Abwehr von Angriffen.

// --- Textlängen --------------------------------------------------------------
// Orientiert sich daran, was in der Oberfläche noch lesbar dargestellt wird.
export const MAX_ITEM_NAME_LENGTH = 80 // passt in eine Item-Karte
export const MAX_TIER_NAME_LENGTH = 24 // passt in die farbige Beschriftung links
export const MAX_TIER_LIST_NAME_LENGTH = 60 // passt in Überschrift und Dateinamen

// --- Mengen ------------------------------------------------------------------
// Der localStorage eines Browsers fasst je nach Gerät ungefähr 5–10 MB.
// Bilder sind als Text kodiert (Data-URL) und brauchen deshalb besonders viel
// Platz. Diese Grenzen sollen verhindern, dass man den Speicher unbemerkt
// sprengt und dadurch Daten verliert.
export const MAX_ITEMS_PER_LIST = 500 // Pool + alle Tier-Reihen zusammen
export const MAX_FILES_PER_SELECTION = 50 // Bilder pro Auswahl-/Ablegevorgang

// --- Dateigrößen -------------------------------------------------------------
// Werden geprüft, BEVOR die Datei eingelesen wird — eine 200-MB-Datei soll gar
// nicht erst im Arbeitsspeicher landen.
export const MAX_IMAGE_FILE_SIZE = 15 * 1024 * 1024 // 15 MB je Bild
export const MAX_JSON_FILE_SIZE = 25 * 1024 * 1024 // 25 MB je Import-Datei

// --- Bildverarbeitung --------------------------------------------------------
// Längste Kante, auf die eingelesene Bilder heruntergerechnet werden.
// 1600px reichen für die Anzeige und für den Bild-Export (dort ist eine
// Item-Kachel 88px groß, bei doppelter Auflösung also 176px) mit großem
// Sicherheitsabstand. Siehe useImageUpload.js.
export const MAX_IMAGE_DIMENSION = 1600

// Erlaubte Anfänge einer Bild-Data-URL. Wird beim JSON-Import gebraucht:
// Eine importierte Datei darf nur echte PNG/JPG-Bilder mitbringen und keine
// beliebigen anderen Inhalte, die später in ein <img> gesteckt würden.
const ALLOWED_IMAGE_DATA_URL_PREFIXES = [
  'data:image/png;base64,',
  'data:image/jpeg;base64,',
  'data:image/jpg;base64,',
]

// Alle Steuerzeichen (Zeilenumbrüche, Tabs, Nullbytes und Ähnliches).
// \p{Cc} ist die Unicode-Kategorie "Control" — kürzer und deutlich besser
// lesbar, als die Zeichen einzeln aufzuzählen. Das u am Ende schaltet die
// Unicode-Erkennung ein, ohne die \p{...} nicht funktioniert.
//
// Warum überhaupt: Steuerzeichen sind unsichtbar, kommen aber leicht über
// kopierten Text mit hinein und zerschießen dann Zeilenhöhen und Ausrichtung.
const CONTROL_CHARACTERS = /\p{Cc}/gu

// --- Prüf- und Zurechtschneide-Funktionen ------------------------------------

// Macht aus einer beliebigen Eingabe einen sauberen, begrenzten Namen.
// Gibt einen leeren String zurück, wenn nichts Brauchbares übrig bleibt —
// die aufrufende Stelle entscheidet dann, was damit passiert.
export function sanitizeName(value, maxLength) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.replace(CONTROL_CHARACTERS, ' ').trim().slice(0, maxLength)
}

export function sanitizeItemName(value) {
  return sanitizeName(value, MAX_ITEM_NAME_LENGTH)
}

export function sanitizeTierName(value) {
  return sanitizeName(value, MAX_TIER_NAME_LENGTH)
}

export function sanitizeTierListName(value) {
  return sanitizeName(value, MAX_TIER_LIST_NAME_LENGTH)
}

// Ist das eine Data-URL, die wirklich ein PNG- oder JPG-Bild enthält?
// Beim eigenen Bild-Upload ist das ohnehin sichergestellt (dort wird das Bild
// neu gezeichnet), beim JSON-Import kommen die Daten aber aus einer fremden
// Datei und müssen geprüft werden.
export function isAllowedImageDataUrl(value) {
  if (typeof value !== 'string') {
    return false
  }

  return ALLOWED_IMAGE_DATA_URL_PREFIXES.some((prefix) => value.startsWith(prefix))
}

// Schlüsselnamen, die beim Einlesen fremder JSON-Daten niemals übernommen
// werden dürfen. Über sie ließen sich sonst im ungünstigsten Fall interne
// Eigenschaften von JavaScript-Objekten überschreiben ("Prototype Pollution").
//
// Praktisch baut RankRoom importierte Objekte ohnehin Feld für Feld neu auf,
// übernimmt also nie ein fremdes Objekt direkt. Diese Prüfung ist die zweite
// Sicherheitslinie, falls das später einmal jemand umstellt.
const FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype']

export function hasForbiddenKeys(value) {
  if (!value || typeof value !== 'object') {
    return false
  }

  if (Array.isArray(value)) {
    return value.some(hasForbiddenKeys)
  }

  // Object.keys() zeigt "__proto__" aus JSON.parse tatsächlich an, weil es
  // dort als ganz normale eigene Eigenschaft angelegt wird.
  return Object.keys(value).some((key) => {
    return FORBIDDEN_KEYS.includes(key) || hasForbiddenKeys(value[key])
  })
}

// Wandelt eine Byte-Zahl in etwas Lesbares um ("3,4 MB") — für Fehlermeldungen,
// damit dort nicht "14680064" steht.
export function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}
