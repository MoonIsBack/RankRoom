// Erzeugt die Standard-Tier-Reihen, die jede neue Tierlist am Anfang hat.
// "items" ist immer leer, weil dort noch keine Items einsortiert wurden.
//
// Bewusst eine FUNKTION statt eines festen Arrays: jede Reihe braucht eine
// eigene, einzigartige id (siehe useTierLists.js). Wäre defaultTiers ein
// fixes Array mit fest eingetragenen ids, würden alle neuen Tierlisten
// (und ein Zurücksetzen) exakt dieselben Tier-ids bekommen — das würde die
// Zuordnung beim Drag & Drop durcheinanderbringen, sobald mehr als eine
// Tierlist existiert.
//
// Die Farben kommen aus der gemeinsamen Palette statt noch einmal fest
// hier zu stehen: vorher waren dieselben fünf Farbwerte an zwei Stellen
// eingetragen und konnten auseinanderlaufen.
import { TIER_COLOR_PALETTE } from './tierColors'

const DEFAULT_TIER_NAMES = ['S', 'A', 'B', 'C', 'D']

export function createDefaultTiers() {
  return DEFAULT_TIER_NAMES.map((name, index) => ({
    id: crypto.randomUUID(),
    name,
    color: TIER_COLOR_PALETTE[index],
    items: [],
  }))
}
