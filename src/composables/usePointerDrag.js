// Einheitliches Drag & Drop für Item-Karten (Pool <-> Tier-Reihen <-> Tier-Reihen),
// gebaut auf Pointer Events statt dem alten nativen HTML5-Drag&Drop. Der Grund
// für den Umbau: natives Drag&Drop funktioniert auf Touch-Geräten (Handy/Tablet)
// gar nicht — Pointer Events (pointerdown/move/up/cancel) decken Maus UND Touch
// im selben Code ab.
//
// "items" und "tiers" werden von außen übergeben (kommen aus useTierLists),
// damit dieses Composable nicht selbst wissen muss, woher die Daten kommen.
import { reactive, ref } from 'vue'

// Ab wie viel Bewegung (in Pixel) ein Maus-Drag "scharf" geschaltet wird
const MOUSE_ARM_DISTANCE = 6
// Ab wie viel Bewegung ein beginnender Touch-Long-Press wieder verworfen wird
// (dann war es vermutlich ein Scroll-Versuch, kein Drag)
const TOUCH_WOBBLE_DISTANCE = 10
// Wie lange (in ms) ein Finger ruhig auf einer Karte liegen muss, bevor daraus
// ein Drag wird. Vorher greifen wir nie in die Standard-Touch-Behandlung ein,
// damit normales Scrollen der Seite mit dem Finger die ganze Zeit funktioniert.
const TOUCH_ARM_DELAY = 200

export function usePointerDrag(items, tiers) {
  // Das gerade gezogene Item, oder null. Ist NUR gesetzt, wenn der Drag
  // wirklich "scharf" ist (siehe Schwellwerte oben) — ein einfacher Klick/Tap
  // auf eine Karte setzt das nie.
  const draggedItem = ref(null)
  // Woher das Item kommt: 'pool' oder die id einer Tier-Reihe
  const draggedFromZone = ref(null)
  // Aktuelle Zeiger-Position (Maus oder Finger), für die schwebende
  // Vorschau-Karte, die App.vue per Teleport anzeigt
  const pointerPosition = reactive({ x: 0, y: 0 })
  // Wo das Item gerade landen würde: { zone, index } oder null (kein gültiges Ziel)
  const dropTarget = ref(null)

  // Interner Zustand der laufenden Geste — bewusst NICHT reaktiv, das sind
  // reine Hilfsvariablen für die Berechnung, die niemand von außen braucht.
  let activePointerId = null
  let startX = 0
  let startY = 0
  let pendingItem = null
  let pendingFromZone = null
  let longPressTimer = null

  // Findet das Array (Pool-Items oder die Items einer bestimmten Tier-Reihe),
  // das zu einer "Zone" (siehe data-drop-zone im Template) gehört
  function findZoneItems(zone) {
    if (zone === 'pool') {
      return items.value
    }

    const tier = tiers.value.find((tier) => tier.id === zone)
    return tier ? tier.items : null
  }

  function clearLongPressTimer() {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  // Schaltet den Drag "scharf": ab jetzt gilt es als echtes Ziehen, nicht mehr
  // als potenzieller Klick/Tap. user-select:none verhindert, dass beim
  // Ziehen mit der Maus aus Versehen Text auf der Seite markiert wird.
  function armDrag() {
    draggedItem.value = pendingItem
    draggedFromZone.value = pendingFromZone
    document.body.style.userSelect = 'none'
  }

  // Wird beim Antippen/Klicken einer Karte aufgerufen (aus ItemCard, über
  // ItemPool/TierRow nach oben gereicht). Startet noch KEINEN Drag — erst
  // wenn sich der Zeiger genug bewegt (Maus) oder lang genug ruhig liegt
  // (Touch/Stift).
  function startPointerDrag(event, item, fromZone) {
    // Falls schon eine Geste läuft (sollte normalerweise nicht passieren),
    // vorher sauber aufräumen
    if (activePointerId !== null) {
      resetInternal()
    }

    // Nur auf den primären Maus-Knopf reagieren (kein Rechtsklick etc.)
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }

    activePointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    pointerPosition.x = event.clientX
    pointerPosition.y = event.clientY
    pendingItem = item
    pendingFromZone = fromZone

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

    pointerPosition.x = event.clientX
    pointerPosition.y = event.clientY

    if (!draggedItem.value) {
      const distance = Math.hypot(event.clientX - startX, event.clientY - startY)

      if (event.pointerType === 'mouse') {
        if (distance < MOUSE_ARM_DISTANCE) {
          return
        }
        armDrag()
      } else {
        // Wackelt der Finger vor Ablauf des Long-Press deutlich, war es
        // vermutlich ein Scroll-Versuch -> Drag verwerfen, Seite scrollt normal weiter
        if (distance > TOUCH_WOBBLE_DISTANCE) {
          resetInternal()
        }
        return
      }
    }

    // Ab hier läuft ein echter Drag: Scrollen/Standardverhalten für diese
    // eine Geste unterbinden (vorher wurde das bewusst nie aufgerufen)
    event.preventDefault()
    updateDropTarget(event.clientX, event.clientY)
  }

  // Ermittelt per Hit-Test (welches Element liegt gerade unter dem Zeiger),
  // wo das gezogene Item landen würde — Zone + genaue Einfüge-Position
  function updateDropTarget(x, y) {
    const hit = document.elementFromPoint(x, y)
    const zoneEl = hit ? hit.closest('[data-drop-zone]') : null

    if (!zoneEl) {
      dropTarget.value = null
      return
    }

    const zone = zoneEl.dataset.dropZone
    const targetItems = findZoneItems(zone)

    if (!targetItems) {
      dropTarget.value = null
      return
    }

    // Standard: ans Ende anhängen (leere Fläche innerhalb der Zone getroffen)
    let index = targetItems.length
    const cardEl = hit.closest('[data-item-id]')

    if (cardEl) {
      const cardIndex = targetItems.findIndex((entry) => entry.id === cardEl.dataset.itemId)

      if (cardIndex !== -1) {
        const rect = cardEl.getBoundingClientRect()
        const isBeforeHalf = x < rect.left + rect.width / 2
        index = cardIndex + (isBeforeHalf ? 0 : 1)
      }
    }

    dropTarget.value = { zone, index }
  }

  function handlePointerUp(event) {
    if (event.pointerId !== activePointerId) {
      return
    }

    if (draggedItem.value && dropTarget.value) {
      moveItemTo(
        draggedItem.value,
        draggedFromZone.value,
        dropTarget.value.zone,
        dropTarget.value.index,
      )
    }

    resetInternal()
  }

  // iOS/Android können eine Touch-Geste ohne pointerup abbrechen (z. B. bei
  // einer Systemgeste oder einem eingehenden Anruf) — ohne diesen Handler
  // würde draggedItem für immer "hängen bleiben"
  function handlePointerCancel(event) {
    if (event.pointerId !== activePointerId) {
      return
    }

    resetInternal()
  }

  // Verschiebt ein Item von einer Zone in eine andere (oder innerhalb
  // derselben Zone an eine neue Position). splice statt push, damit auch
  // mittendrin eingefügt werden kann, nicht nur ans Ende angehängt.
  function moveItemTo(item, fromZone, toZone, toIndex) {
    const fromItems = findZoneItems(fromZone)
    const toItems = findZoneItems(toZone)

    if (!fromItems || !toItems) {
      return
    }

    const fromIndex = fromItems.findIndex((entry) => entry.id === item.id)

    if (fromIndex === -1) {
      return
    }

    let insertIndex = toIndex

    // Verschieben innerhalb DESSELBEN Arrays: nach dem Entfernen rutschen
    // alle nachfolgenden Einträge eine Position nach vorne. Lag der
    // Zielindex dahinter, muss er deshalb um 1 verringert werden, sonst
    // landet die Karte eine Position zu weit rechts.
    if (fromItems === toItems && fromIndex < insertIndex) {
      insertIndex -= 1
    }

    fromItems.splice(fromIndex, 1)
    toItems.splice(insertIndex, 0, item)
  }

  function resetInternal() {
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('pointercancel', handlePointerCancel)
    clearLongPressTimer()
    document.body.style.userSelect = ''

    activePointerId = null
    pendingItem = null
    pendingFromZone = null

    draggedItem.value = null
    draggedFromZone.value = null
    dropTarget.value = null
  }

  // Von außen aufrufbar, z. B. wenn während eines laufenden Drags die
  // Tierlist gewechselt oder zurückgesetzt wird
  function resetDrag() {
    resetInternal()
  }

  return {
    draggedItem,
    pointerPosition,
    dropTarget,
    startPointerDrag,
    resetDrag,
  }
}
