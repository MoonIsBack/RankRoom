// Umsortieren der Tier-Reihen selbst (z. B. die S/A/B/C/D-Reihenfolge) per
// Drag am schmalen Handle links neben jeder Reihe.
//
// Bewusst ein eigenes, von usePointerDrag.js komplett getrenntes Composable:
// der Handle ist ein eigenes DOM-Element, physisch getrennt von den
// Item-Karten — ein pointerdown auf dem Handle kann dadurch nie
// versehentlich als Item-Drag interpretiert werden (und umgekehrt), weil
// beide einen eigenen State-Baum haben und nie denselben Code-Pfad teilen.
//
// Gleiches Grundprinzip wie usePointerDrag.js (Maus/Touch-Schwellwerte,
// Hit-Test per elementFromPoint), nur auf der Y-Achse statt X-Achse, weil
// Reihen strikt vertikal gestapelt sind.
import { ref } from 'vue'

const MOUSE_ARM_DISTANCE = 6
const TOUCH_WOBBLE_DISTANCE = 10
const TOUCH_ARM_DELAY = 200

export function useRowPointerDrag(tiers) {
  // Index der Reihe, die gerade gezogen wird (oder null)
  const draggedRowIndex = ref(null)
  // Index, an dem die Reihe gerade landen würde (oder null)
  const rowDropIndex = ref(null)

  let activePointerId = null
  let startY = 0
  let pendingIndex = null
  let longPressTimer = null

  function clearLongPressTimer() {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  function armDrag() {
    draggedRowIndex.value = pendingIndex
    document.body.style.userSelect = 'none'
  }

  // Wird beim Antippen/Klicken des Handles aufgerufen. Startet noch keinen
  // Drag — erst nach genug Bewegung (Maus) oder kurzem, ruhigem Halten (Touch).
  function startRowDrag(event, index) {
    if (activePointerId !== null) {
      resetInternal()
    }

    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }

    activePointerId = event.pointerId
    startY = event.clientY
    pendingIndex = index

    if (event.pointerType !== 'mouse') {
      longPressTimer = setTimeout(armDrag, TOUCH_ARM_DELAY)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)
  }

  function handlePointerMove(event) {
    if (event.pointerId !== activePointerId) {
      return
    }

    if (draggedRowIndex.value === null) {
      const distance = Math.abs(event.clientY - startY)

      if (event.pointerType === 'mouse') {
        if (distance < MOUSE_ARM_DISTANCE) {
          return
        }
        armDrag()
      } else {
        if (distance > TOUCH_WOBBLE_DISTANCE) {
          resetInternal()
        }
        return
      }
    }

    event.preventDefault()
    updateRowDropIndex(event.clientX, event.clientY)
  }

  function updateRowDropIndex(x, y) {
    const hit = document.elementFromPoint(x, y)
    const rowEl = hit ? hit.closest('[data-row-index]') : null

    if (!rowEl) {
      rowDropIndex.value = null
      return
    }

    const hoveredIndex = Number(rowEl.dataset.rowIndex)
    const rect = rowEl.getBoundingClientRect()
    const isBeforeHalf = y < rect.top + rect.height / 2

    rowDropIndex.value = hoveredIndex + (isBeforeHalf ? 0 : 1)
  }

  function handlePointerUp(event) {
    if (event.pointerId !== activePointerId) {
      return
    }

    if (draggedRowIndex.value !== null && rowDropIndex.value !== null) {
      moveRowTo(draggedRowIndex.value, rowDropIndex.value)
    }

    resetInternal()
  }

  // iOS/Android können eine Touch-Geste ohne pointerup abbrechen — ohne
  // diesen Handler würde draggedRowIndex für immer "hängen bleiben"
  function handlePointerCancel(event) {
    if (event.pointerId !== activePointerId) {
      return
    }

    resetInternal()
  }

  function moveRowTo(fromIndex, toIndex) {
    let insertIndex = toIndex

    // Gleicher Off-by-One-Fall wie beim Item-Reorder: nach dem Entfernen
    // rutschen nachfolgende Reihen eine Position nach vorne
    if (fromIndex < insertIndex) {
      insertIndex -= 1
    }

    if (insertIndex === fromIndex) {
      return
    }

    const [movedTier] = tiers.value.splice(fromIndex, 1)
    tiers.value.splice(insertIndex, 0, movedTier)
  }

  function resetInternal() {
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('pointercancel', handlePointerCancel)
    clearLongPressTimer()
    document.body.style.userSelect = ''

    activePointerId = null
    pendingIndex = null

    draggedRowIndex.value = null
    rowDropIndex.value = null
  }

  // Von außen aufrufbar, z. B. wenn während eines laufenden Drags die
  // Tierlist gewechselt oder zurückgesetzt wird
  function resetRowDrag() {
    resetInternal()
  }

  return {
    draggedRowIndex,
    rowDropIndex,
    startRowDrag,
    resetRowDrag,
  }
}
