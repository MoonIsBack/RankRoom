// Erzeugt die Standard-Tier-Reihen, die jede neue Tierlist am Anfang hat.
// "items" ist immer leer, weil dort noch keine Items einsortiert wurden.
//
// Bewusst eine FUNKTION statt eines festen Arrays: jede Reihe braucht eine
// eigene, einzigartige id (siehe useTierLists.js). Wäre defaultTiers ein
// fixes Array mit fest eingetragenen ids, würden alle neuen Tierlisten
// (und ein Zurücksetzen) exakt dieselben Tier-ids bekommen — das würde die
// Zuordnung beim Drag & Drop durcheinanderbringen, sobald mehr als eine
// Tierlist existiert.
export function createDefaultTiers() {
  return [
    { id: crypto.randomUUID(), name: 'S', color: '#ff7f7f', items: [] },
    { id: crypto.randomUUID(), name: 'A', color: '#ffbf7f', items: [] },
    { id: crypto.randomUUID(), name: 'B', color: '#ffdf7f', items: [] },
    { id: crypto.randomUUID(), name: 'C', color: '#ffff7f', items: [] },
    { id: crypto.randomUUID(), name: 'D', color: '#bfff7f', items: [] },
  ]
}
