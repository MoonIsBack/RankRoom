// Composable, um irgendwo auf der Seite Dateien per Drag & Drop entgegenzunehmen
// (z. B. Bilder, die man aus dem Finder/Explorer auf die App zieht).
// onFilesDropped wird mit den abgelegten Dateien aufgerufen.
import { ref } from 'vue'

// Erkennt einen echten Datei-Drag von außerhalb (z. B. aus dem Finder) und
// unterscheidet ihn damit vom internen Ziehen einer Item-Karte zwischen Pool
// und Tier-Reihen. Nur bei echten Dateien soll die App reagieren.
function isFileDrag(event) {
  return Boolean(event.dataTransfer) && Array.from(event.dataTransfer.types).includes('Files')
}

export function useFileDropZone(onFilesDropped) {
  // isDraggingFile ist true, während eine Datei über die Seite gezogen wird
  // (steuert die "Bilder hier ablegen"-Anzeige)
  const isDraggingFile = ref(false)

  // dragenter/dragleave feuern für JEDES Kind-Element einzeln, über das die
  // Maus beim Ziehen fährt. Würde man die Anzeige einfach an- und ausschalten,
  // flackerte sie beim Überqueren von Kind-Elementen. Deshalb wird mitgezählt:
  // erst wenn der Zähler wieder bei 0 ist, ist die Maus wirklich draußen.
  let enterCount = 0

  function handleDragEnter(event) {
    if (!isFileDrag(event)) {
      return
    }

    enterCount++
    isDraggingFile.value = true
  }

  function handleDragLeave(event) {
    if (!isFileDrag(event)) {
      return
    }

    enterCount = Math.max(0, enterCount - 1)

    if (enterCount === 0) {
      isDraggingFile.value = false
    }
  }

  function handleDragOver(event) {
    if (!isFileDrag(event)) {
      return
    }

    // preventDefault() ist nötig, sonst lehnt der Browser das Ablegen automatisch ab
    event.preventDefault()
  }

  function handleDrop(event) {
    if (!isFileDrag(event)) {
      return
    }

    event.preventDefault()

    enterCount = 0
    isDraggingFile.value = false

    onFilesDropped(event.dataTransfer.files)
  }

  return {
    isDraggingFile,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  }
}
