// Composable, um irgendwo auf der Seite Dateien per Drag & Drop entgegenzunehmen
// (z. B. Bilder, die man aus dem Finder/Explorer auf die App zieht).
// onFilesDropped wird mit den abgelegten Dateien aufgerufen.
import { ref } from 'vue'

export function useFileDropZone(onFilesDropped) {
  // true, während der Nutzer gerade eine Datei über die Seite zieht
  // (steuert die "Bilder hier ablegen"-Anzeige)
  const isDraggingFile = ref(false)

  // dragenter/dragleave feuern für JEDES Element einzeln, über das man
  // beim Ziehen fährt. Mit einem Zähler statt nur an/aus vermeiden wir,
  // dass die Anzeige beim Überqueren von Kind-Elementen kurz flackert.
  let dragCounter = 0

  // Nur auf echte Datei-Drags von außerhalb reagieren (z. B. aus dem Finder),
  // NICHT auf das interne Ziehen von Item-Karten zwischen Pool und Tier-Reihen
  function isRealFileDrag(event) {
    return Boolean(event.dataTransfer) && Array.from(event.dataTransfer.types).includes('Files')
  }

  function handleDragEnter(event) {
    if (!isRealFileDrag(event)) {
      return
    }

    dragCounter++
    isDraggingFile.value = true
  }

  function handleDragLeave(event) {
    if (!isRealFileDrag(event)) {
      return
    }

    dragCounter = Math.max(0, dragCounter - 1)

    if (dragCounter === 0) {
      isDraggingFile.value = false
    }
  }

  function handleDragOver(event) {
    if (!isRealFileDrag(event)) {
      return
    }

    // preventDefault() ist nötig, sonst lehnt der Browser das Ablegen automatisch ab
    event.preventDefault()
  }

  function handleDrop(event) {
    if (!isRealFileDrag(event)) {
      return
    }

    event.preventDefault()

    dragCounter = 0
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
