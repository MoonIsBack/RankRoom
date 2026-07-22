// Merkt sich für kurze Zeit, welche Items gerade neu hinzugekommen sind —
// damit ItemCard sie hervorheben kann (siehe .is-new dort).
//
// Bewusst NICHT als Feld am Item selbst (also kein item.isNew): die Items
// werden per deep-watch komplett in den Browser-Speicher geschrieben (siehe
// useTierLists.js). Ein Feld am Item landete dort mit und wäre nach einem
// Neuladen der Seite immer noch gesetzt — dann blitzten beim Öffnen auf
// einmal alte Items als "neu" auf. Diese Information gehört der Oberfläche,
// nicht den Daten.
import { reactive } from 'vue'

// Wie lange die Hervorhebung insgesamt sichtbar bleibt. Muss zur Dauer der
// CSS-Animation in ItemCard.vue passen.
const HIGHLIGHT_DURATION = 1200

// Werden mehrere Bilder auf einmal hinzugefügt, starten sie leicht versetzt
// nacheinander statt alle im selben Moment — das wirkt deutlich ruhiger und
// man sieht, wie viele es waren.
const STAGGER_STEP = 40

// Ab wie vielen Items nicht weiter gestaffelt wird. Bei 40 Bildern auf einmal
// würde das letzte sonst erst nach über anderthalb Sekunden anfangen; die
// Hervorhebung des ersten wäre da längst vorbei.
const MAX_STAGGER = 400

export function useRecentlyAdded() {
  // item-id -> Verzögerung in Millisekunden, mit der die Animation startet
  const highlights = reactive(new Map())

  // Wird nach dem Hinzufügen mit den neuen ids aufgerufen
  function markAsNew(itemIds) {
    itemIds.forEach((id, position) => {
      const delay = Math.min(position * STAGGER_STEP, MAX_STAGGER)

      highlights.set(id, delay)

      // Nach Ablauf wieder aufräumen, sonst wüchse die Map über die ganze
      // Sitzung immer weiter — und ein Item, das gelöscht und später wieder
      // hinzugefügt wird, bekäme sonst keine neue Animation.
      setTimeout(() => highlights.delete(id), delay + HIGHLIGHT_DURATION)
    })
  }

  function highlightDelayFor(itemId) {
    return highlights.get(itemId) ?? null
  }

  return { markAsNew, highlightDelayFor }
}
