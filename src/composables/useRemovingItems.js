// Gegenstück zu useRecentlyAdded.js: lässt ein gelöschtes Item erst kurz
// rötlich verblassen, bevor es wirklich aus den Daten verschwindet.
//
// Der Grund für den Umweg: wird ein Item sofort aus der Liste entfernt, ist
// auch sein HTML-Element sofort weg — es gibt dann nichts mehr, woran eine
// Animation laufen könnte. Das Item bleibt deshalb noch für die Dauer der
// Animation in den Daten und wird nur als "verschwindet gerade" markiert.
//
// Bewusst kein <TransitionGroup> von Vue, obwohl das der übliche Weg wäre:
// dessen Elemente bleiben während des Ausblendens im DOM stehen und tauchen
// dadurch in der eingefrorenen Geometrie des Drag & Drop auf (siehe
// captureLayout in usePointerDrag.js). Genau solche Geister-Elemente haben in
// diesem Projekt schon einmal für schwer auffindbare Fehler gesorgt. Hier
// behalten wir die Kontrolle darüber, wann etwas verschwindet.
import { reactive } from 'vue'

// Muss zur Dauer der CSS-Animation in ItemCard.vue passen.
const REMOVE_DURATION = 320

export function useRemovingItems(removeItem) {
  const removing = reactive(new Set())

  function startRemoving(itemId) {
    // Zweimal schnell auf × geklickt: nicht zweimal starten, sonst liefe der
    // zweite Timer ins Leere und löschte womöglich ein inzwischen anderes Item
    if (removing.has(itemId)) {
      return
    }

    removing.add(itemId)

    setTimeout(() => {
      removing.delete(itemId)
      removeItem(itemId)
    }, REMOVE_DURATION)
  }

  function isRemoving(itemId) {
    return removing.has(itemId)
  }

  return { startRemoving, isRemoving }
}
