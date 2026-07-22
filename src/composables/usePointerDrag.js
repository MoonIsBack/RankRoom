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
import { nextTick, reactive, ref } from 'vue'

import { createAutoScroll } from './useAutoScroll'

// Ab wie viel Bewegung (in Pixel) ein Drag "scharf" geschaltet wird. Bei
// Touch etwas großzügiger, weil Finger weniger präzise sind als eine Maus.
const MOUSE_ARM_DISTANCE = 6
const TOUCH_ARM_DISTANCE = 8

// Innerhalb dieses Radius' (in Pixel) um den Greifpunkt wird noch keine
// Platzhalter-Vorschau gezeigt (siehe updateDropTarget)
const ORIGIN_SUPPRESS_DISTANCE = 20

// Ab wie viel Gegenbewegung (in Pixel) die erkannte Zieh-Richtung umschlägt.
// Klein genug, um echte Richtungswechsel sofort mitzubekommen, groß genug,
// dass Hand-/Finger-Zittern die Richtung nicht ständig umkippen lässt.
const DIRECTION_FLIP_DISTANCE = 8

// Wie weit (als Anteil der Kartenbreite) der Wechselpunkt IN Zieh-Richtung
// vorverlegt wird. Ohne das läge er exakt auf der Kartenmitte — man müsste
// also immer bis über die Mitte der Nachbarkarte ziehen, bevor der neue
// Platz erscheint. Mit 0.3 kippt die Vorschau schon nach rund einem Fünftel
// der Nachbarkarte um, fühlt sich also deutlich direkter an.
const DIRECTION_LEAD_RATIO = 0.3

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
  // Schnappschuss der Kartenpositionen in der URSPRUNGS-Zone (Map von
  // item-id auf Rect) — siehe computeInsertIndexFromSnapshot weiter unten
  // für die Begründung, und updateDropTarget dafür, wann er (neu) eingefangen wird.
  let originRectsSnapshot = null
  // Für welchen Index der Schnappschuss zuletzt (neu) eingefangen wurde —
  // verhindert wiederholtes Neu-Einfangen, solange sich die Zielposition
  // nicht wirklich ändert.
  let lastRecapturedIndex = null
  // Zuletzt erkannte horizontale Zieh-Richtung (-1 = nach links, 1 = nach
  // rechts, 0 = noch keine) und der Bezugspunkt, gegen den die nächste
  // Richtungsänderung gemessen wird — siehe updateHorizontalDirection.
  let horizontalDirection = 0
  let directionAnchorX = 0

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
    originRectsSnapshot = captureZoneRects(pendingFromZone, pendingItem.id)
  }

  // Merkt sich die aktuellen Positionen aller Karten einer Zone. Wird nur
  // für die URSPRUNGS-Zone gebraucht: Sobald man dort innerhalb derselben
  // Reihe umsortiert, verschwindet die Original-Karte per display:none und
  // die Nachbarkarten rutschen zusammen (siehe TierRow.vue) — würden wir
  // die Positionen für die Zielberechnung dabei jedes Mal live neu messen,
  // würde sich der Boden unter dem unbewegten Finger ständig verschieben:
  // Platzhalter erscheint -> Karten rutschen zusammen -> an der (jetzt
  // anderen) Zeiger-Position steht auf einmal eine andere Karte -> neue
  // Zielposition -> Karten rutschen wieder um -> usw. Der Schnappschuss
  // bleibt für die ganze Geste stabil und durchbricht dieses Hin-und-Her.
  function captureZoneRects(zone, excludeItemId) {
    const zoneEl = [...document.querySelectorAll('[data-drop-zone]')].find(
      (el) => el.dataset.dropZone === zone,
    )

    const snapshot = new Map()

    if (!zoneEl) {
      return snapshot
    }

    // Vertikal DOKUMENT-relativ speichern (Rect-Werte + aktuelle Scroll-
    // Position), nicht fenster-relativ: Scrollt die Seite währenddessen
    // (z. B. durch den Auto-Scroll beim Ziehen an den Bildschirmrand, siehe
    // useAutoScroll.js), bliebe ein fenster-relativer Schnappschuss sonst an
    // der alten Position "hängen", obwohl sich der Inhalt unter ihm bewegt
    // hat. Beim Vergleich in computeInsertIndexFromSnapshot wird die
    // Zeiger-Y-Position genauso umgerechnet, damit beide Seiten wieder
    // zueinander passen.
    //
    // Die gezogene Karte selbst (excludeItemId) wird NICHT mit eingefangen:
    // sie ist visuell längst ausgeblendet und soll deshalb auch beim
    // Zielen keine Rolle mehr spielen — sonst müsste man erst durch ihr
    // komplettes "Phantom"-Rechteck hindurchziehen, bevor die eigentliche
    // Nachbarkarte überhaupt als Ziel erkannt wird.
    zoneEl.querySelectorAll('[data-item-id]').forEach((el) => {
      if (el.dataset.itemId !== '__placeholder__' && el.dataset.itemId !== excludeItemId) {
        const rect = el.getBoundingClientRect()
        snapshot.set(el.dataset.itemId, {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height,
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
        })
      }
    })

    return snapshot
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
    horizontalDirection = 0
    directionAnchorX = event.clientX
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
    updateHorizontalDirection(event.clientX)

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

    // Liegt der Zeiger noch sehr nah an der Stelle, an der die Karte
    // gegriffen wurde, zeigen wir KEINE Platzhalter-Vorschau — sonst
    // erscheint sofort beim Anfassen einer Karte ein "Geist" direkt daneben,
    // obwohl man noch gar nicht wirklich irgendwohin zieht. Bewusst rein
    // über die zurückgelegte Strecke entschieden (nicht darüber, ob die
    // berechnete Zielposition "zufällig" der ursprünglichen entspricht) —
    // sonst müsste man bei Nachbar-Positionen viel zu weit in die
    // Nachbarkarte hineinziehen, bevor überhaupt etwas reagiert.
    const distanceFromStart = Math.hypot(x - startX, y - startY)

    if (zone === draggedFromZone.value && distanceFromStart < ORIGIN_SUPPRESS_DISTANCE) {
      dropTarget.value = null
      return
    }

    // In der Ursprungs-Zone rechnen wir auf dem stabilen Schnappschuss
    // (siehe captureZoneRects), in jeder anderen Zone live — dort verändert
    // unser eigenes Dragging das Layout nicht, es besteht also nicht die
    // Gefahr eines Rückkopplungs-Effekts.
    const index =
      zone === draggedFromZone.value
        ? computeInsertIndexFromSnapshot(x, y, targetItems)
        : computeInsertIndexLive(x, y, targetItems, zoneEl)

    dropTarget.value = { zone, index }

    // Sobald sich die Zielposition INNERHALB der Ursprungs-Zone wirklich
    // ändert, verschiebt sich live auch die Platzhalter-Karte — und damit
    // rutschen die ÜBRIGEN echten Karten in dieser Reihe (Original bleibt ja
    // per display:none entfernt) jedes Mal ein Stück weiter zusammen. Der
    // bisherige Schnappschuss spiegelt das noch nicht wider. Nach JEDER
    // echten Änderung (nicht bei jedem Pixel) einmal — sobald Vue das DOM
    // aktualisiert hat (nextTick) — neu einfangen, sonst müsste man beim
    // Weiterziehen zunehmend weiter greifen, als die optisch bereits näher
    // zusammengerückten Karten erwarten lassen. Bewusst über nextTick (statt
    // synchron im selben Zug), damit sich Neuberechnung und Neu-Einfangen
    // nicht gegenseitig eine Rückkopplungsschleife bescheren.
    if (zone === draggedFromZone.value && index !== lastRecapturedIndex) {
      lastRecapturedIndex = index
      const zoneAtCapture = zone
      const draggedIdAtCapture = draggedItem.value?.id

      nextTick(() => {
        if (draggedFromZone.value === zoneAtCapture) {
          originRectsSnapshot = captureZoneRects(zoneAtCapture, draggedIdAtCapture)
        }
      })
    }
  }

  // Hält fest, ob gerade nach links oder rechts gezogen wird. Der Anker
  // wandert mit der Bewegung mit, solange sie in dieselbe Richtung geht —
  // umgeschlagen wird erst nach DIRECTION_FLIP_DISTANCE Gegenbewegung.
  function updateHorizontalDirection(x) {
    if (x > directionAnchorX + DIRECTION_FLIP_DISTANCE) {
      horizontalDirection = 1
      directionAnchorX = x
      return
    }

    if (x < directionAnchorX - DIRECTION_FLIP_DISTANCE) {
      horizontalDirection = -1
      directionAnchorX = x
      return
    }

    if (horizontalDirection === 1 && x > directionAnchorX) {
      directionAnchorX = x
    } else if (horizontalDirection === -1 && x < directionAnchorX) {
      directionAnchorX = x
    }
  }

  // Winziger Puffer um die Kartenmitte für den Fall, dass noch gar keine
  // Richtung feststeht (rein senkrechte Bewegung) — dann greift wie früher
  // die Hysterese über den zuletzt gewählten Index.
  const DEAD_ZONE_RATIO = 0.06

  // Bestimmt die Vor-/Nach-Entscheidung für eine Karte an gegebener Position.
  //
  // Kernidee: der Wechselpunkt liegt NICHT starr auf der Kartenmitte, sondern
  // wird um DIRECTION_LEAD_RATIO in die aktuelle Zieh-Richtung vorverlegt.
  // Zieht man nach rechts, kippt die Vorschau also schon deutlich vor der
  // Mitte der Nachbarkarte um; zieht man nach links, entsprechend spiegelbildlich.
  // Das ersetzt gleichzeitig die alte tote Zone: weil der Wechselpunkt beim
  // Richtungswechsel auf die andere Seite der Mitte springt, muss man ein
  // ordentliches Stück zurückziehen, damit sich die Entscheidung wieder
  // dreht — Zittern kann sie nicht umkippen.
  function resolveSideOfCard(x, rect, cardIndex, zone) {
    const relativeX = (x - rect.left) / rect.width

    if (horizontalDirection !== 0) {
      const threshold = 0.5 - horizontalDirection * DIRECTION_LEAD_RATIO

      return relativeX < threshold ? cardIndex : cardIndex + 1
    }

    if (relativeX < 0.5 - DEAD_ZONE_RATIO / 2) {
      return cardIndex
    }

    if (relativeX > 0.5 + DEAD_ZONE_RATIO / 2) {
      return cardIndex + 1
    }

    const current = dropTarget.value

    if (
      current?.zone === zone &&
      (current.index === cardIndex || current.index === cardIndex + 1)
    ) {
      return current.index
    }

    return relativeX < 0.5 ? cardIndex : cardIndex + 1
  }

  // Einfüge-Position INNERHALB der Ursprungs-Zone: rechnet ausschließlich
  // mit dem stabilen Schnappschuss von armDrag() — keine einzige live
  // gemessene Position —, damit das Ergebnis unabhängig davon ist, wie die
  // Karten sich durch das Ausblenden der Original-Karte und die
  // Platzhalter-Karte gerade visuell anordnen.
  function computeInsertIndexFromSnapshot(x, y, targetItems) {
    if (!originRectsSnapshot || originRectsSnapshot.size === 0) {
      return 0
    }

    // Der Schnappschuss speichert die Y-Werte dokument-relativ (siehe
    // captureZoneRects) — die eingehende Zeiger-Position genauso umrechnen
    const docY = y + window.scrollY

    let containingId = null
    let nearestId = null
    let nearestDistance = Infinity

    for (const [id, rect] of originRectsSnapshot) {
      if (x >= rect.left && x <= rect.right && docY >= rect.top && docY <= rect.bottom) {
        containingId = id
      }

      const distance = Math.hypot(
        x - (rect.left + rect.width / 2),
        docY - (rect.top + rect.height / 2),
      )

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestId = id
      }
    }

    const matchedId = containingId ?? nearestId

    if (!matchedId) {
      return 0
    }

    const cardIndex = targetItems.findIndex((entry) => entry.id === matchedId)

    if (cardIndex === -1) {
      return targetItems.length
    }

    return resolveSideOfCard(
      x,
      originRectsSnapshot.get(matchedId),
      cardIndex,
      draggedFromZone.value,
    )
  }

  // Einfüge-Position in JEDER ANDEREN Zone: rechnet live per Hit-Test
  // (elementFromPoint — das behandelt umgebrochene Reihen automatisch
  // richtig, weil es die tatsächliche visuelle Position nutzt). Unbedenklich
  // live zu messen, weil unser eigenes Dragging das Layout dieser Zone
  // nicht verändert (nur die Ursprungs-Zone bekommt die ausgeblendete
  // Original-Karte).
  function computeInsertIndexLive(x, y, targetItems, zoneEl) {
    const hit = document.elementFromPoint(x, y)
    let cardEl = hit ? hit.closest('[data-item-id]') : null

    if (cardEl?.dataset.itemId === '__placeholder__') {
      cardEl = null
    }

    // Kein direkter Treffer auf einer Karte (z. B. Innenabstand am Rand der
    // Reihe, oder eine Lücke zwischen zwei Karten) -> die räumlich
    // nächstgelegene Karte in dieser Zone suchen, statt pauschal ans Ende zu
    // springen. Reine Punkt-zu-Karte-Distanz, keine Mittelung zwischen zwei
    // Karten — das bleibt dadurch auch bei umgebrochenen (mehrzeiligen)
    // Reihen korrekt.
    if (!cardEl) {
      cardEl = findNearestCard(zoneEl, x, y)
    }

    if (!cardEl) {
      return 0
    }

    const cardIndex = targetItems.findIndex((entry) => entry.id === cardEl.dataset.itemId)

    if (cardIndex === -1) {
      return targetItems.length
    }

    return resolveSideOfCard(x, cardEl.getBoundingClientRect(), cardIndex, zoneEl.dataset.dropZone)
  }

  // Fallback für computeInsertIndexLive: die Karte, deren Mittelpunkt dem
  // Zeiger am nächsten liegt (reine 2D-Distanz zu jeder einzelnen Karte,
  // nicht gemittelt zwischen zwei Karten — bleibt dadurch auch bei
  // umgebrochenen Reihen korrekt).
  function findNearestCard(zoneEl, x, y) {
    if (!zoneEl) {
      return null
    }

    const cardEls = [...zoneEl.querySelectorAll('[data-item-id]')].filter(
      (el) => el.dataset.itemId !== '__placeholder__',
    )

    let nearest = null
    let nearestDistance = Infinity

    for (const el of cardEls) {
      const rect = el.getBoundingClientRect()
      const distance = Math.hypot(
        x - (rect.left + rect.width / 2),
        y - (rect.top + rect.height / 2),
      )

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearest = el
      }
    }

    return nearest
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
    originRectsSnapshot = null
    lastRecapturedIndex = null
    horizontalDirection = 0
    directionAnchorX = 0

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
    draggedFromZone,
    pointerPosition,
    dropTarget,
    startPointerDrag,
    resetDrag,
  }
}
