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

// Wie weit (in Pixel) der Zeiger über den Rand der aktuell anvisierten Zone
// hinaus muss, bevor eine ANDERE Zone übernimmt. Ohne diesen Puffer würde
// direkt auf der Grenze zwischen zwei Reihen schon ein Pixel Zittern die
// Zielreihe umschalten lassen.
const ZONE_HYSTERESIS = 12

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
  // Eingefrorene Geometrie ALLER Drop-Zonen zum Zeitpunkt des Anfassens:
  // Map von Zonen-Namen auf { rect, items: Map<item-id, rect> }.
  // Siehe captureLayout weiter unten für die ausführliche Begründung.
  let layoutSnapshot = null
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
    layoutSnapshot = captureLayout(pendingItem.id)
  }

  // Friert die Geometrie ALLER Drop-Zonen und aller Karten darin EINMAL ein,
  // in dem Moment, in dem der Drag scharf wird.
  //
  // Das ist das Herzstück der Stabilität. Sobald eine Zielposition angezeigt
  // wird, verändert das selbst das Layout: die Platzhalter-Karte schiebt sich
  // in eine Reihe, die Original-Karte verschwindet per display:none, Karten
  // rutschen zusammen oder auseinander (siehe TierRow.vue). Würde man für die
  // Zielberechnung live messen, entstünde eine Rückkopplungsschleife:
  //
  //   Platzhalter erscheint -> Karten rutschen -> unter dem UNBEWEGTEN Finger
  //   liegt auf einmal eine andere Karte -> andere Zielposition -> Karten
  //   rutschen zurück -> wieder die alte Zielposition -> ...
  //
  // Das ist das Flackern "links, rechts, links, rechts". Es kann prinzipiell
  // nicht auftreten, wenn ausschließlich mit eingefrorenen Werten gerechnet
  // wird: dann ist die Zeiger-Position die EINZIGE veränderliche Größe, und
  // gleiche Zeiger-Position bedeutet immer dasselbe Ergebnis.
  //
  // Der Preis: verschiebt sich das Layout während des Ziehens wirklich stark
  // (z. B. wenn eine volle Reihe durch den Platzhalter eine Zeile mehr
  // umbricht), liegen die eingefrorenen Grenzen etwas neben dem, was man
  // sieht. Das passiert selten und ist ein paar Pixel Versatz — deutlich
  // harmloser als das Flackern.
  //
  // Alle Y-Werte werden DOKUMENT-relativ gespeichert (Rect + window.scrollY):
  // scrollt die Seite während des Ziehens (Auto-Scroll am Bildschirmrand,
  // siehe useAutoScroll.js), bliebe ein fenster-relativer Schnappschuss sonst
  // an der alten Stelle hängen. Die Zeiger-Y-Position wird beim Vergleich
  // genauso umgerechnet.
  //
  // Die gezogene Karte selbst (excludeItemId) wird NICHT mit eingefangen: sie
  // ist visuell ausgeblendet und soll beim Zielen keine Rolle mehr spielen —
  // sonst müsste man erst durch ihr komplettes "Phantom"-Rechteck hindurch,
  // bevor die Nachbarkarte überhaupt als Ziel erkannt wird.
  function captureLayout(excludeItemId) {
    const snapshot = new Map()

    document.querySelectorAll('[data-drop-zone]').forEach((zoneEl) => {
      const items = new Map()

      zoneEl.querySelectorAll('[data-item-id]').forEach((el) => {
        if (el.dataset.itemId !== '__placeholder__' && el.dataset.itemId !== excludeItemId) {
          items.set(el.dataset.itemId, toDocRect(el.getBoundingClientRect()))
        }
      })

      snapshot.set(zoneEl.dataset.dropZone, {
        rect: toDocRect(zoneEl.getBoundingClientRect()),
        items,
      })
    })

    return snapshot
  }

  // Fenster-relatives Rect -> dokument-relativ (siehe captureLayout)
  function toDocRect(rect) {
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
    }
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
    if (!layoutSnapshot) {
      dropTarget.value = null
      return
    }

    // Zeiger genauso dokument-relativ rechnen wie den Schnappschuss
    const docY = y + window.scrollY
    const zone = resolveZone(x, docY)

    if (!zone) {
      dropTarget.value = null
      return
    }

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

    // Für JEDE Zone identisch und ausschließlich auf dem eingefrorenen
    // Schnappschuss — kein einziger Live-Messwert (siehe captureLayout).
    dropTarget.value = { zone, index: computeInsertIndex(zone, x, docY, targetItems) }
  }

  // Welche Zone der Zeiger anvisiert, anhand der eingefrorenen Zonen-Rechtecke.
  //
  // Die aktuell anvisierte Zone behält Vorrang, solange der Zeiger nicht
  // mindestens ZONE_HYSTERESIS über ihren Rand hinaus ist. Ohne diesen Puffer
  // säße man beim senkrechten Ziehen genau auf der Grenze zwischen zwei
  // Reihen und die Zielreihe würde bei kleinsten Bewegungen hin- und
  // herspringen.
  function resolveZone(x, docY) {
    const current = dropTarget.value?.zone
    const currentEntry = current ? layoutSnapshot.get(current) : null

    if (currentEntry && containsPoint(currentEntry.rect, x, docY, ZONE_HYSTERESIS)) {
      return current
    }

    for (const [zone, entry] of layoutSnapshot) {
      if (containsPoint(entry.rect, x, docY, 0)) {
        return zone
      }
    }

    // Zeiger seitlich NEBEN den Reihen — typischerweise, wenn man eine Karte
    // ganz nach links vor die erste Position zieht und dabei über dem
    // Tier-Buchstaben landet. Ohne diesen Fall würde die Vorschau dort
    // schlagartig verschwinden, obwohl man offensichtlich noch die Reihe
    // meint, auf deren Höhe man sich befindet. Deshalb zählt hier nur noch
    // die Höhe, nicht mehr die waagerechte Position.
    if (currentEntry && withinVerticalBand(currentEntry.rect, docY, ZONE_HYSTERESIS)) {
      return current
    }

    for (const [zone, entry] of layoutSnapshot) {
      if (withinVerticalBand(entry.rect, docY, 0)) {
        return zone
      }
    }

    return null
  }

  function containsPoint(rect, x, docY, margin) {
    return (
      x >= rect.left - margin && x <= rect.right + margin && withinVerticalBand(rect, docY, margin)
    )
  }

  function withinVerticalBand(rect, docY, margin) {
    return docY >= rect.top - margin && docY <= rect.bottom + margin
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

  // Einfüge-Position innerhalb einer Zone — für ALLE Zonen dieselbe Logik,
  // ausschließlich auf dem eingefrorenen Schnappschuss (siehe captureLayout).
  //
  // Ablauf: erst die Karte finden, auf die gezielt wird, dann über
  // resolveSideOfCard entscheiden, ob davor oder dahinter eingefügt wird.
  //
  // Beim Finden werden Reihen, die optisch umgebrochen sind (mehrzeilig),
  // bewusst zuerst über die Y-Achse eingegrenzt: liegt der Zeiger auf Höhe
  // einer bestimmten Zeile, kommen nur Karten AUS DIESER ZEILE in Frage.
  // Sonst könnte eine Karte aus der Zeile darüber "näher" sein und man würde
  // beim waagerechten Ziehen unvermittelt in die falsche Zeile springen.
  function computeInsertIndex(zone, x, docY, targetItems) {
    const entry = layoutSnapshot.get(zone)

    if (!entry || entry.items.size === 0) {
      return 0
    }

    // Karten auf Höhe des Zeigers (dieselbe optische Zeile)
    const sameLine = []

    for (const [id, rect] of entry.items) {
      if (docY >= rect.top && docY <= rect.bottom) {
        sameLine.push([id, rect])
      }
    }

    const candidates = sameLine.length > 0 ? sameLine : [...entry.items]

    let matchedId = null
    let matchedRect = null
    let bestDistance = Infinity

    for (const [id, rect] of candidates) {
      // Innerhalb einer Zeile zählt nur der waagerechte Abstand, sonst der
      // echte 2D-Abstand zum Kartenmittelpunkt.
      const distance =
        sameLine.length > 0
          ? Math.abs(x - (rect.left + rect.width / 2))
          : Math.hypot(x - (rect.left + rect.width / 2), docY - (rect.top + rect.height / 2))

      if (distance < bestDistance) {
        bestDistance = distance
        matchedId = id
        matchedRect = rect
      }
    }

    if (!matchedId) {
      return 0
    }

    const cardIndex = targetItems.findIndex((item) => item.id === matchedId)

    if (cardIndex === -1) {
      return targetItems.length
    }

    return resolveSideOfCard(x, matchedRect, cardIndex, zone)
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
    layoutSnapshot = null
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
