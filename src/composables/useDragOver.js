// Kleiner Helfer für die "wird gerade etwas hierüber gezogen?"-Anzeige.
//
// Das Problem: dragenter/dragleave feuern für JEDES Kind-Element einzeln,
// über das die Maus beim Ziehen fährt. Würde man einfach an/aus schalten,
// flackert die Hervorhebung beim Überqueren von Kind-Elementen. Deshalb
// zählen wir mit: erst wenn der Zähler wieder bei 0 ist, ist die Maus wirklich
// draußen.
//
// isDragOver = true, solange etwas über dem Element hängt.
//
// Option ignoreFiles: Wenn true, reagiert die Anzeige NICHT auf Dateien, die
// von außerhalb (z. B. aus dem Finder) reingezogen werden — nur auf das interne
// Verschieben von Item-Karten. So bleibt beim Datei-Drag allein das große
// Seiten-Overlay sichtbar, statt zusätzlich jede Tier-Reihe blau zu markieren.
import { ref } from 'vue'

export function useDragOver(options = {}) {
  const { ignoreFiles = false } = options

  const isDragOver = ref(false)
  let counter = 0

  // Erkennt einen echten Datei-Drag von außerhalb (z. B. aus dem Finder)
  function isFileDrag(event) {
    return Boolean(event?.dataTransfer) && Array.from(event.dataTransfer.types).includes('Files')
  }

  function onDragEnter(event) {
    if (ignoreFiles && isFileDrag(event)) {
      return
    }

    counter++
    isDragOver.value = true
  }

  function onDragLeave(event) {
    if (ignoreFiles && isFileDrag(event)) {
      return
    }

    counter = Math.max(0, counter - 1)

    if (counter === 0) {
      isDragOver.value = false
    }
  }

  // Sofort zurücksetzen, z. B. direkt nach einem Drop
  function reset() {
    counter = 0
    isDragOver.value = false
  }

  return { isDragOver, onDragEnter, onDragLeave, reset }
}
