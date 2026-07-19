// Dieses Composable kümmert sich nur um das Drag & Drop von Items
// zwischen dem Item-Pool und den Tier-Reihen.
//
// "items" und "tiers" werden von außen übergeben (kommen aus useTierLists),
// damit dieses Composable nicht selbst wissen muss, woher die Daten kommen.
import { ref } from 'vue'

export function useDragAndDrop(items, tiers) {
  // Merkt sich während des Drag & Drop, welches Item gerade gezogen wird
  const draggedItem = ref(null)
  // Merkt sich, aus welcher Tier-Reihe das Item kommt (null = kommt aus dem Pool)
  const draggedFromTier = ref(null)

  // Setzt den Drag-Zustand zurück, z. B. nachdem ein Drop fertig ist
  // oder wenn woanders die Tierlist gewechselt/zurückgesetzt wird
  function resetDrag() {
    draggedItem.value = null
    draggedFromTier.value = null
  }

  // Wird aufgerufen, wenn im Item-Pool ein Drag gestartet wird
  function startDrag(item) {
    draggedItem.value = item
    draggedFromTier.value = null
  }

  // Wird aufgerufen, wenn in einer Tier-Reihe ein Drag gestartet wird
  function startDragFromTier(item, tierName) {
    draggedItem.value = item
    draggedFromTier.value = tierName
  }

  // Ein Item wird auf einer Tier-Reihe (z. B. "S") abgelegt
  function dropItem(tierName) {
    // Kein Item im "Gepäck" -> nichts zu tun (z. B. normaler Drop von außerhalb)
    if (!draggedItem.value) {
      return
    }

    const targetTier = tiers.value.find((tier) => tier.name === tierName)

    if (!targetTier) {
      return
    }

    if (draggedFromTier.value) {
      // Item kam aus einer anderen Tier-Reihe -> dort zuerst entfernen
      const oldTier = tiers.value.find((tier) => tier.name === draggedFromTier.value)

      if (oldTier) {
        oldTier.items = oldTier.items.filter((item) => item.id !== draggedItem.value.id)
      }
    } else {
      // Item kam aus dem Pool -> dort entfernen
      items.value = items.value.filter((item) => item.id !== draggedItem.value.id)
    }

    // Item in die Ziel-Reihe einfügen
    targetTier.items.push(draggedItem.value)

    resetDrag()
  }

  // Ein Item wird aus einer Tier-Reihe zurück in den Pool gezogen
  function dropItemToPool() {
    if (!draggedItem.value) {
      return
    }

    // Kommt das Item schon aus dem Pool, muss nichts gemacht werden
    if (!draggedFromTier.value) {
      return
    }

    const oldTier = tiers.value.find((tier) => tier.name === draggedFromTier.value)

    if (!oldTier) {
      return
    }

    oldTier.items = oldTier.items.filter((item) => item.id !== draggedItem.value.id)

    items.value.push(draggedItem.value)

    resetDrag()
  }

  return {
    draggedItem,
    draggedFromTier,
    startDrag,
    startDragFromTier,
    dropItem,
    dropItemToPool,
    resetDrag,
  }
}
