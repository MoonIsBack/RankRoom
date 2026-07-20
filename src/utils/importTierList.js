// IMPORT: Liest eine vom Nutzer gewählte JSON-Datei ein und macht daraus
// wieder eine nutzbare Tierlist-Struktur (die dann in useTierLists eingefügt wird).
import { EXPORT_FORMAT } from './tierListFormat'

// Prüft, ob ein einzelnes Item die erwartete Form hat (mindestens ein Name)
function isValidItem(item) {
  return Boolean(item) && typeof item === 'object' && typeof item.name === 'string'
}

// Prüft, ob die eingelesenen Daten wirklich eine Tierlist beschreiben
function isValidTierList(raw) {
  if (!raw || typeof raw !== 'object') {
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

// Übernimmt aus einem Item nur die Felder, die wir kennen (Name + Bild) und
// wirft eventuellen Fremd-Ballast aus der Datei weg.
function cleanItem(item) {
  return {
    name: String(item.name),
    image: typeof item.image === 'string' ? item.image : null,
  }
}

// Holt aus den eingelesenen Daten eine saubere Tierlist-Struktur heraus.
// Akzeptiert sowohl unser Export-Format (mit Hülle) als auch eine "blanke"
// Tierlist. Wirft einen Fehler, wenn die Daten nicht passen.
function extractTierList(data) {
  const raw = data && data.format === EXPORT_FORMAT && data.tierList ? data.tierList : data

  if (!isValidTierList(raw)) {
    throw new Error('invalid-structure')
  }

  return {
    name: String(raw.name),
    items: raw.items.map(cleanItem),
    tiers: raw.tiers.map((tier) => ({
      name: String(tier.name),
      color: String(tier.color),
      items: tier.items.map(cleanItem),
    })),
  }
}

// Liest eine vom Nutzer ausgewählte JSON-Datei ein und gibt eine geprüfte,
// saubere Tierlist zurück (ohne ids — die vergibt useTierLists beim Einfügen).
// Bei einer ungültigen Datei wird das Promise mit einer Fehlermeldung abgelehnt.
export function parseTierListFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Die Datei konnte nicht gelesen werden.'))

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        resolve(extractTierList(data))
      } catch {
        reject(new Error('Die Datei ist keine gültige RankRoom-Tierlist (JSON).'))
      }
    }

    reader.readAsText(file)
  })
}
