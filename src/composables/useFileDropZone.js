// Composable, um irgendwo auf der Seite Dateien per Drag & Drop entgegenzunehmen
// (z. B. Bilder, die man aus dem Finder/Explorer auf die App zieht).
// onFilesDropped wird mit den abgelegten Dateien aufgerufen.
//
// Die "wird gerade etwas hierüber gezogen?"-Zählerei kommt aus useDragOver,
// hier kümmern wir uns nur zusätzlich darum, echte Datei-Drags von außerhalb
// von normalem Item-Ziehen innerhalb der App zu unterscheiden.
import { useDragOver } from './useDragOver'

export function useFileDropZone(onFilesDropped) {
  // isDraggingFile ist true, während eine Datei über die Seite gezogen wird
  // (steuert die "Bilder hier ablegen"-Anzeige)
  const { isDragOver: isDraggingFile, onDragEnter, onDragLeave, reset } = useDragOver()

  // Nur auf echte Datei-Drags von außerhalb reagieren (z. B. aus dem Finder),
  // NICHT auf das interne Ziehen von Item-Karten zwischen Pool und Tier-Reihen
  function isRealFileDrag(event) {
    return Boolean(event.dataTransfer) && Array.from(event.dataTransfer.types).includes('Files')
  }

  function handleDragEnter(event) {
    if (!isRealFileDrag(event)) {
      return
    }

    onDragEnter()
  }

  function handleDragLeave(event) {
    if (!isRealFileDrag(event)) {
      return
    }

    onDragLeave()
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

    reset()

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
