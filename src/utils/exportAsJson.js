// EXPORT: Wandelt die aktive Tierlist in eine JSON-Datei um und lädt sie
// herunter (landet im Finder/Explorer).
//
// Die JSON enthält ALLES, was die Tierlist ausmacht: den Namen, alle Items
// (mit Wörtern UND Bildern) und alle Tier-Reihen mit ihren Items.
import { CURRENT_FORMAT_VERSION, EXPORT_FORMAT } from './tierListFormat'
import { sanitizeFileBaseName } from './fileName'

// Wandelt die übergebene Tierlist in JSON um und startet den Browser-Download.
export function downloadTierListAsJson(tierList) {
  const payload = {
    format: EXPORT_FORMAT,
    // Kommt aus tierListFormat.js, damit Export und Import beim Anheben der
    // Version nicht auseinanderlaufen können
    version: CURRENT_FORMAT_VERSION,
    tierList: {
      name: tierList.name,
      items: tierList.items,
      tiers: tierList.tiers,
    },
  }

  // JSON.stringify mit Einrückung 2 -> gut lesbare Datei
  const json = JSON.stringify(payload, null, 2)

  // Ein Blob ist ein "Datei-Inhalt im Speicher". Daraus erzeugen wir eine
  // temporäre URL und klicken einen unsichtbaren Download-Link an.
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeFileBaseName(tierList.name)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Temporäre URL wieder freigeben, damit kein Speicher belegt bleibt
  URL.revokeObjectURL(url)
}
