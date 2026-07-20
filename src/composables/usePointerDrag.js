// Einheitliches Drag & Drop für Item-Karten (Pool <-> Tier-Reihen <-> Tier-Reihen),
// gebaut auf Pointer Events statt dem alten nativen HTML5-Drag&Drop. Der Grund
// für den Umbau: natives Drag&Drop funktioniert auf Touch-Geräten (Handy/Tablet)
// gar nicht — Pointer Events (pointerdown/move/up/cancel) decken Maus UND Touch
// im selben Code ab.
//
// Damit der Browser bei Touch nicht selbst zu scrollen versucht, während man
// eine Karte zieht, bekommen Karten in ItemCard.vue "touch-action: none".
// Dadurch kann hier für Maus UND Touch dieselbe einfache Schwelle genutzt
// werden (kein Long-Press-Timer nötig) — das war in einer früheren Version
// anders gelöst, hat sich auf echten Handys aber als unzuverlässig
// herausgestellt (Browser haben teils schon vor Ablauf des Timers eigene
// Scroll-/Kontextmenü-Gesten gestartet).
//
// "items" und "tiers" werden von außen übergeben (kommen aus useTierLists),
// damit dieses Composable nicht selbst wissen muss, woher die Daten kommen.
import { reactive, ref } from 'vue'

import { createAutoScroll } from './useAutoScroll'

// Ab wie viel Bewegung (in Pixel) ein Drag "scharf" geschaltet wird. Bei
// Touch etwas großzügiger, weil Finger weniger präzise sind als eine Maus.
const MOUSE_ARM_DISTANCE = 6
const TOUCH_ARM_DISTANCE = 8

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
  let lastClientX = 0
  let lastClientY = 0
  let pendingItem = null
  let pendingFromZone = null
  // Position der gezogenen Karte in ihrer Ursprungs-Zone beim Start des Drags
  // (siehe updateDropTarget: verhindert, dass sofort beim Anfassen einer
  // Karte eine Platzhalter-Vorschau direkt daneben erscheint)
  let originIndex = -1

  // Läuft während eines aktiven Drags nah am Bildschirmrand automatisch
  // weiter, damit man auch über den sichtbaren Bereich hinaus verschieben
  // kann. onTick berechnet das Drop-Ziel anhand der letzten bekannten
  // Zeiger-Position neu, weil sich der Inhalt unter dem Finger verschiebt.
  const autoScroll = createAutoScroll(() => updateDropTarget(lastClientX, lastClientY))

  // Findet das Array (Pool-Items oder die Items einer bestimmten Tier-Reihe),
  // das zu einer "Zone" (siehe data-drop-zone im Template) gehört
  function findZoneItems(zone) {
    if (zone === 'pool') {
      return items.value
    }

    const tier = tiers.value.find((tier) => tier.id === zone)
    return tier ? tier.items : null
  }

  // Schaltet den Drag "scharf": ab jetzt gilt es als echtes Ziehen, nicht mehr
  // als potenzieller Klick/Tap. user-select:none verhindert, dass beim
  // Ziehen mit der Maus aus Versehen Text auf der Seite markiert wird.
  function armDrag() {
    draggedItem.value = pendingItem
    draggedFromZone.value = pendingFromZone
    document.body.style.userSelect = 'none'

    const originItems = findZoneItems(pendingFromZone)
    originIndex = originItems ? originItems.findIndex((entry) => entry.id === pendingItem.id) : -1
  }

  // Wird beim Antippen/Klicken einer Karte aufgerufen (aus ItemCard, über
  // ItemPool/TierRow nach oben gereicht). Startet noch KEINEN Drag — erst
  // wenn sich der Zeiger genug bewegt (siehe handlePointerMove).
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
    lastClientX = event.clientX
    lastClientY = event.clientY
    pointerPosition.x = event.clientX
    pointerPosition.y = event.clientY
    pendingItem = item
    pendingFromZone = fromZone

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)
  }

  function handlePointerMove(event) {
    if (event.pointerId !== activePointerId) {
      return
    }

    lastClientX = event.clientX
    lastClientY = event.clientY
    pointerPosition.x = event.clientX
    pointerPosition.y = event.clientY

    if (!draggedItem.value) {
      const distance = Math.hypot(event.clientX - startX, event.clientY - startY)
      const armDistance = event.pointerType === 'mouse' ? MOUSE_ARM_DISTANCE : TOUCH_ARM_DISTANCE

      if (distance < armDistance) {
        return
      }

      armDrag()
    }

    // Ab hier läuft ein echter Drag: Scrollen/Standardverhalten für diese
    // eine Geste unterbinden (die betroffenen Elemente haben zusätzlich
    // touch-action: none, siehe ItemCard.vue)
    event.preventDefault()
    updateDropTarget(event.clientX, event.clientY)
    autoScroll.update(event.clientY)
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

    const index = computeInsertIndex(zoneEl, targetItems, x, y)

    // Würde die Karte dadurch exakt wieder an ihrer ursprünglichen Position
    // landen (man hat gerade erst angefasst oder ist wieder dorthin zurück),
    // zeigen wir KEINE Platzhalter-Vorschau — sonst erscheint sofort beim
    // Anfassen einer Karte ein "Geist" direkt daneben, obwohl man noch gar
    // nicht wirklich irgendwohin zieht.
    if (zone === draggedFromZone.value && (index === originIndex || index === originIndex + 1)) {
      dropTarget.value = null
      return
    }

    dropTarget.value = { zone, index }
  }

  // Bestimmt die Einfüge-Position nicht per pixelgenauer linker/rechter
  // Kartenhälfte (das kippt bei jedem kleinen Zittern der Hand/des Fingers
  // um und macht das Zielen mühsam), sondern anhand der Lücke zwischen zwei
  // Karten, die dem Zeiger am nächsten ist. Jede mögliche Position bekommt
  // dadurch einen spürbar größeren, robusteren Trefferbereich.
  function computeInsertIndex(zoneEl, targetItems, x, y) {
    const cardEls = [...zoneEl.querySelectorAll('[data-item-id]')].filter(
      (el) => el.dataset.itemId !== '__placeholder__',
    )

    // Reihenfolge der DOM-Elemente an die Reihenfolge der Daten angleichen
    const orderedRects = targetItems
      .map((entry) => cardEls.find((el) => el.dataset.itemId === entry.id))
      .filter(Boolean)
      .map((el) => el.getBoundingClientRect())

    if (orderedRects.length === 0) {
      return 0
    }

    // Für jede mögliche Position (vor der ersten Karte, zwischen je zwei,
    // nach der letzten) einen Punkt in der Mitte der jeweiligen Lücke bilden
    const gapPoints = [
      { x: orderedRects[0].left, y: orderedRects[0].top + orderedRects[0].height / 2 },
    ]

    for (let i = 0; i < orderedRects.length - 1; i++) {
      const a = orderedRects[i]
      const b = orderedRects[i + 1]
      gapPoints.push({
        x: (a.right + b.left) / 2,
        y: (a.top + a.height / 2 + b.top + b.height / 2) / 2,
      })
    }

    const last = orderedRects[orderedRects.length - 1]
    gapPoints.push({ x: last.right, y: last.top + last.height / 2 })

    // Welche Lücke liegt dem Zeiger am nächsten?
    let closestIndex = 0
    let closestDistance = Infinity

    gapPoints.forEach((point, index) => {
      const distance = Math.hypot(x - point.x, y - point.y)

      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })

    return closestIndex
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
    autoScroll.stop()
    document.body.style.userSelect = ''

    activePointerId = null
    pendingItem = null
    pendingFromZone = null
    originIndex = -1

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
