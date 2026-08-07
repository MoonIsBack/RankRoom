// IMPORT: Liest eine vom Nutzer gewählte JSON-Datei ein und macht daraus
// wieder eine nutzbare Tierlist-Struktur (die dann in useTierLists eingefügt wird).
//
// GRUNDSATZ: Eine importierte Datei ist eine FREMDE Datei. Sie kann beschädigt
// sein, aus einer anderen RankRoom-Version stammen oder absichtlich manipuliert
// worden sein. Deshalb wird hier nichts übernommen, was nicht ausdrücklich
// geprüft wurde — es wird eine komplett neue Struktur Feld für Feld aufgebaut,
// statt das eingelesene Objekt weiterzureichen.
import { SUPPORTED_FORMAT_VERSIONS, EXPORT_FORMAT } from './tierListFormat'
import {
  MAX_ITEMS_PER_LIST,
  MAX_JSON_FILE_SIZE,
  formatFileSize,
  hasForbiddenKeys,
  isAllowedImageDataUrl,
  sanitizeItemName,
  sanitizeTierListName,
  sanitizeTierName,
} from './validation'

// Höchstzahl an Tier-Reihen. Passt zu MAX_TIERS in useTierLists.js — eine
// importierte Datei darf diese Grenze nicht umgehen.
const MAX_TIERS_ON_IMPORT = 20

// Prüft, ob ein einzelnes Item die erwartete Form hat (mindestens ein Name)
function isValidItem(item) {
  return Boolean(item) && typeof item === 'object' && typeof item.name === 'string'
}

// Prüft, ob die eingelesenen Daten wirklich eine Tierlist beschreiben
function isValidTierList(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return false
  }

  if (typeof raw.name !== 'string') {
    return false
  }

  if (!Array.isArray(raw.items) || !Array.isArray(raw.tiers)) {
    return false
  }

  if (!raw.items.every(isValidItem)) {
    return false
  }

  return raw.tiers.every((tier) => {
    return (
      Boolean(tier) &&
      typeof tier === 'object' &&
      typeof tier.name === 'string' &&
      typeof tier.color === 'string' &&
      Array.isArray(tier.items) &&
      tier.items.every(isValidItem)
    )
  })
}

// Nur Farben in der Schreibweise #rgb oder #rrggbb übernehmen.
//
// Der Wert landet direkt in einer CSS-Eigenschaft. Ein unerwarteter Inhalt
// könnte dort das Layout zerlegen — deshalb wird alles andere durch ein
// neutrales Grau ersetzt, statt die Datei komplett abzulehnen.
const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const FALLBACK_COLOR = '#9aa0b4'

function cleanColor(value) {
  return typeof value === 'string' && HEX_COLOR.test(value.trim()) ? value.trim() : FALLBACK_COLOR
}

// Übernimmt aus einem Item nur die Felder, die wir kennen (Name + Bild) und
// wirft eventuellen Fremd-Ballast aus der Datei weg.
//
// Beim Bild wird jetzt geprüft, dass es sich wirklich um eine PNG- oder
// JPG-Data-URL handelt. Vorher genügte "ist ein Text" — damit hätte eine
// manipulierte Datei beliebige andere Inhalte an die Stelle setzen können, an
// der später ein Bild angezeigt wird. Passt nicht, wird das Bild verworfen und
// das Item bleibt als reines Text-Item erhalten.
function cleanItem(item) {
  return {
    name: sanitizeItemName(item.name) || 'Item',
    image: isAllowedImageDataUrl(item.image) ? item.image : null,
  }
}

// Holt aus den eingelesenen Daten eine saubere Tierlist-Struktur heraus.
// Akzeptiert sowohl unser Export-Format (mit Hülle) als auch eine "blanke"
// Tierlist. Wirft einen Fehler mit lesbarem Text, wenn die Daten nicht passen.
function extractTierList(data) {
  // Zuerst die gefährlichen Schlüsselnamen abfangen, bevor überhaupt etwas
  // aus den Daten gelesen wird
  if (hasForbiddenKeys(data)) {
    throw new Error('Die Datei enthält unerlaubte Feldnamen und wurde nicht geladen.')
  }

  const isWrapped = data && data.format === EXPORT_FORMAT && data.tierList

  // Versionsprüfung nur bei Dateien mit Hülle — nur die haben überhaupt eine
  // Versionsangabe. Eine "blanke" Tierlist ohne Hülle wird wie bisher akzeptiert.
  if (isWrapped && data.version !== undefined) {
    if (!SUPPORTED_FORMAT_VERSIONS.includes(data.version)) {
      throw new Error(
        `Diese Datei wurde mit einer neueren RankRoom-Version erstellt (Format ${data.version}) ` +
          'und kann hier noch nicht geöffnet werden.',
      )
    }
  }

  const raw = isWrapped ? data.tierList : data

  if (!isValidTierList(raw)) {
    throw new Error('Die Datei ist keine gültige RankRoom-Tierlist (JSON).')
  }

  if (raw.tiers.length > MAX_TIERS_ON_IMPORT) {
    throw new Error(
      `Die Datei enthält ${raw.tiers.length} Tier-Reihen. Erlaubt sind höchstens ` +
        `${MAX_TIERS_ON_IMPORT}.`,
    )
  }

  const totalItems = raw.items.length + raw.tiers.reduce((sum, tier) => sum + tier.items.length, 0)

  if (totalItems > MAX_ITEMS_PER_LIST) {
    throw new Error(
      `Die Datei enthält ${totalItems} Items. Erlaubt sind höchstens ${MAX_ITEMS_PER_LIST}.`,
    )
  }

  // Erst hier wird die neue Struktur gebaut — und zwar vollständig, bevor sie
  // zurückgegeben wird. Dadurch ist der Import "atomar": Entweder er gelingt
  // ganz, oder es wird gar nichts übernommen. Eine halb eingelesene Liste
  // kann so nicht entstehen.
  return {
    name: sanitizeTierListName(raw.name) || 'Importierte Tierlist',
    items: raw.items.map(cleanItem),
    tiers: raw.tiers.map((tier) => ({
      name: sanitizeTierName(tier.name) || 'Reihe',
      color: cleanColor(tier.color),
      items: tier.items.map(cleanItem),
    })),
  }
}

// Liest eine vom Nutzer ausgewählte JSON-Datei ein und gibt eine geprüfte,
// saubere Tierlist zurück (ohne ids — die vergibt useTierLists beim Einfügen).
// Bei einer ungültigen Datei wird das Promise mit einer Fehlermeldung abgelehnt.
export function parseTierListFile(file) {
  return new Promise((resolve, reject) => {
    // Größe prüfen, BEVOR die Datei gelesen wird
    if (file.size > MAX_JSON_FILE_SIZE) {
      reject(
        new Error(
          `Die Datei ist mit ${formatFileSize(file.size)} zu groß. ` +
            `Erlaubt sind bis zu ${formatFileSize(MAX_JSON_FILE_SIZE)}.`,
        ),
      )
      return
    }

    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Die Datei konnte nicht gelesen werden.'))

    reader.onload = () => {
      let data

      try {
        data = JSON.parse(reader.result)
      } catch {
        reject(new Error('Die Datei ist keine gültige RankRoom-Tierlist (JSON).'))
        return
      }

      try {
        resolve(extractTierList(data))
      } catch (error) {
        // Die Meldungen aus extractTierList sind bereits für Nutzer formuliert
        // und verraten keine technischen Interna, deshalb werden sie
        // unverändert weitergereicht.
        reject(error)
      }
    }

    reader.readAsText(file)
  })
}
