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

// Wie weit (als Anteil der Kartenbreite) man ÜBER die Mitte des Nachbarplatzes
// hinausziehen muss, bevor die Vorschau dorthin umspringt. Wirkt in beide
// Richtungen gleich, der nötige Weg ist also nach links und nach rechts
// identisch: 0.5 + 0.2 = 0.7 Kartenbreiten ab dem Greifpunkt, danach eine
// Kartenbreite pro weiterem Platz.
//
// Nebeneffekt und Grund, warum es überhaupt einen Widerstand gibt: beim
// Richtungswechsel springt der Umschaltpunkt auf die andere Seite der Mitte.
// Man muss also 2 x 0.2 Kartenbreiten zurückziehen, damit sich die
// Entscheidung wieder dreht — Zittern kann sie nicht umkippen.
const DIRECTION_RESISTANCE = 0.2

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
    layoutSnapshot = captureLayout()
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
  // Eingefroren werden PLÄTZE, nicht Karten. Ein Platz ist einfach "die
  // n-te Position in dieser Reihe" mit ihrem Rechteck. Das ist die
  // entscheidende Umstellung gegenüber einer früheren Fassung, die sich
  // gemerkt hat, welche KARTE wo liegt.
  //
  // Der Grund: sobald man zieht, verschwindet die Original-Karte per
  // display:none aus dem Fluss und der Platzhalter kommt dazu. In der
  // Ursprungs-Reihe sind also weiterhin genau so viele Elemente im Fluss wie
  // vorher — die Plätze bleiben exakt dieselben, nur wer auf welchem Platz
  // sitzt, ändert sich. Bei einer Reihe, die auf mehrere Zeilen umbricht,
  // rutscht eine Karte dadurch schnell mal eine GANZE ZEILE weiter. Merkt man
  // sich Karten statt Plätze, zeigt man rechts oben hin und trifft die Karte,
  // die dort vor dem Anfassen lag — die Vorschau erscheint dann links unten.
  // Merkt man sich Plätze, kann das nicht passieren.
  function captureLayout() {
    const snapshot = new Map()

    document.querySelectorAll('[data-drop-zone]').forEach((zoneEl) => {
      const slots = []

      zoneEl.querySelectorAll('[data-item-id]').forEach((el) => {
        if (el.dataset.itemId !== '__placeholder__') {
          slots.push(toDocRect(el.getBoundingClientRect()))
        }
      })

      snapshot.set(zoneEl.dataset.dropZone, {
        el: zoneEl,
        rect: toDocRect(zoneEl.getBoundingClientRect()),
        slots,
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
    //
    // Wie viele Plätze es überhaupt gibt, hängt davon ab, ob die gezogene
    // Karte aus dieser Reihe stammt: kommt sie von hier, ersetzt der
    // Platzhalter sie im Fluss (gleich viele Elemente wie vorher). Kommt sie
    // von woanders, kommt der Platzhalter zusätzlich dazu — dann gibt es
    // einen Platz mehr.
    const slotCount = layoutSnapshot.get(zone)?.slots.length ?? 0
    const maxSlot = zone === draggedFromZone.value ? Math.max(slotCount - 1, 0) : slotCount
    const slot = Math.min(Math.max(resolveSlot(zone, x, docY), 0), maxSlot)

    dropTarget.value = { zone, slot, index: slotToIndex(slot, zone, targetItems) }
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

    const currentBand = currentEntry ? grownRect(currentEntry) : null

    if (currentBand && containsPoint(currentBand, x, docY, ZONE_HYSTERESIS)) {
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
    if (currentBand && withinVerticalBand(currentBand, docY, ZONE_HYSTERESIS)) {
      return current
    }

    for (const [zone, entry] of layoutSnapshot) {
      if (withinVerticalBand(entry.rect, docY, 0)) {
        return zone
      }
    }

    return null
  }

  // Das eingefrorene Rechteck einer Zone, erweitert um das, was die Zone
  // inzwischen tatsächlich einnimmt.
  //
  // Der eine Fall, in dem das Einfrieren allein nicht reicht: schiebt man eine
  // Karte in eine Reihe, die bereits genau voll ist, bekommt diese Reihe durch
  // den Platzhalter eine ZWEITE ZEILE und wird dadurch höher. Die neue Zeile
  // liegt aber unterhalb des eingefrorenen Rechtecks — dort hätte nach den
  // alten Werten schon die nächste Reihe angefangen. Man konnte die Karte
  // deshalb nur in die obere Zeile legen, nicht in die neu entstandene.
  //
  // Gemessen wird nur für die Zone, die ohnehin schon anvisiert ist, und das
  // Rechteck kann dadurch ausschließlich WACHSEN. Ein Aufschaukeln ist damit
  // ausgeschlossen: die Messung kann die Zone nie wechseln, nur halten.
  function grownRect(entry) {
    if (!entry.el) {
      return entry.rect
    }

    const live = toDocRect(entry.el.getBoundingClientRect())

    return {
      left: Math.min(entry.rect.left, live.left),
      right: Math.max(entry.rect.right, live.right),
      top: Math.min(entry.rect.top, live.top),
      bottom: Math.max(entry.rect.bottom, live.bottom),
    }
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

  // Winziger Puffer für den Fall, dass noch gar keine Zieh-Richtung feststeht
  // (rein senkrechte Bewegung) — dann bleibt die zuletzt getroffene Wahl
  // bestehen, statt bei Zittern zu würfeln.
  const DEAD_ZONE_RATIO = 0.06

  // Auf welchem PLATZ der Reihe soll die Platzhalter-Karte erscheinen?
  //
  // Das ist bewusst die Frage, die hier beantwortet wird — nicht "welche Karte
  // liegt unter dem Zeiger". Der Nutzer sieht während des Ziehens ja nur
  // Plätze: er schiebt den Finger dorthin, wo die Karte landen soll, und
  // erwartet die Vorschau genau dort. Siehe captureLayout, warum die Plätze
  // dafür stabil sind.
  //
  // Mehrzeilig umgebrochene Reihen werden zuerst über die Y-Achse eingegrenzt:
  // liegt der Zeiger auf Höhe einer bestimmten Zeile, kommen nur Plätze AUS
  // DIESER ZEILE in Frage. Sonst könnte ein Platz aus der Zeile darüber
  // rechnerisch "näher" sein und man würde beim waagerechten Ziehen
  // unvermittelt in die falsche Zeile springen.
  function resolveSlot(zone, x, docY) {
    const entry = layoutSnapshot.get(zone)

    if (!entry || entry.slots.length === 0) {
      return 0
    }

    const sameLine = []

    entry.slots.forEach((rect, slotIndex) => {
      if (docY >= rect.top && docY <= rect.bottom) {
        sameLine.push([slotIndex, rect])
      }
    })

    // Zeiger UNTERHALB aller vorhandenen Plätze: das ist die Zeile, die durch
    // die neue Karte überhaupt erst entsteht. Dann ans Ende anhängen — genau
    // dadurch entsteht sie. Ohne diesen Fall würde stattdessen der räumlich
    // nächste Platz in der letzten vorhandenen Zeile gewählt, und man käme
    // nie in die neue Zeile hinein.
    if (sameLine.length === 0 && docY > Math.max(...entry.slots.map((rect) => rect.bottom))) {
      return entry.slots.length
    }

    const candidates =
      sameLine.length > 0 ? sameLine : entry.slots.map((rect, slotIndex) => [slotIndex, rect])

    let matchedIndex = null
    let matchedRect = null
    let bestDistance = Infinity

    // Der Zeiger wird GEGEN die Zieh-Richtung verschoben, bevor gesucht wird.
    // Dadurch muss man ein Stück über die Mitte des Nachbarplatzes hinaus,
    // bevor umgeschaltet wird — und zwar nach links und nach rechts exakt
    // gleich weit. Genau daran hakte eine frühere Fassung: die entschied
    // "vor oder hinter dem nächsten Platz", und weil der Finger beim Anfassen
    // schon in der Mitte eines Platzes sitzt, sprang die Vorschau nach rechts
    // sofort um, nach links dagegen erst nach einem Dreiviertel-Kartenweg.
    const slotWidth = entry.slots[0].width
    const probeX = x - horizontalDirection * DIRECTION_RESISTANCE * slotWidth

    for (const [slotIndex, rect] of candidates) {
      // Innerhalb einer Zeile zählt nur der waagerechte Abstand, sonst der
      // echte 2D-Abstand zur Platzmitte.
      const distance =
        sameLine.length > 0
          ? Math.abs(probeX - (rect.left + rect.width / 2))
          : Math.hypot(probeX - (rect.left + rect.width / 2), docY - (rect.top + rect.height / 2))

      if (distance < bestDistance) {
        bestDistance = distance
        matchedIndex = slotIndex
        matchedRect = rect
      }
    }

    if (matchedIndex === null) {
      return 0
    }

    // Steht noch keine Richtung fest, bei der zuletzt getroffenen Wahl bleiben,
    // solange sie fast genauso nah liegt — sonst kippt sie bei Zittern.
    if (horizontalDirection === 0) {
      const current = dropTarget.value

      if (current?.zone === zone && current.slot !== matchedIndex) {
        const currentRect = entry.slots[current.slot]

        if (
          currentRect &&
          Math.abs(probeX - (currentRect.left + currentRect.width / 2)) <=
            bestDistance + DEAD_ZONE_RATIO * slotWidth
        ) {
          matchedIndex = current.slot
          matchedRect = currentRect
        }
      }
    }

    // Der Zeiger liegt hinter dem LETZTEN Platz einer Zeile — dann dahinter
    // einfügen. Bewusst nur für den letzten Platz: zwischen zwei Karten liegt
    // ein Abstand von ein paar Pixeln, in dem der Zeiger schon hinter der
    // einen, aber noch nicht bei der nächsten Karte ist. Ohne diese
    // Einschränkung würde dort verfrüht umgeschaltet — und zwar nur beim
    // Ziehen nach rechts, was das Verhalten wieder unsymmetrisch machte.
    const lastCandidateIndex = candidates[candidates.length - 1][0]
    const slot =
      matchedIndex === lastCandidateIndex && probeX > matchedRect.right
        ? matchedIndex + 1
        : matchedIndex

    if (sameLine.length === 0) {
      return slot
    }

    // Der Zeiger ist auf Höhe einer bestimmten Zeile — dann soll die Vorschau
    // auch IN dieser Zeile bleiben.
    //
    // Ohne das passiert Folgendes: zielt man rechts neben die letzte Karte
    // einer vollen Zeile, ist der Platz "eins weiter" zwangsläufig der ERSTE
    // Platz der nächsten Zeile. Die Vorschau sprang dann nach links unten,
    // obwohl der Finger rechts oben war. Der Platz, den man eigentlich meint,
    // ist der letzte Platz DIESER Zeile: die Karte landet dort und schiebt
    // ihre Vorgängerin in die nächste Zeile — genau das, was man sieht und
    // erwartet.
    //
    // Nur in der letzten Zeile darf ein Platz dahinter gewählt werden, sonst
    // könnte man nichts mehr ans Ende der Reihe anhängen.
    const lineFirst = sameLine[0][0]
    const lineLast = sameLine[sameLine.length - 1][0]
    const upperBound = lineLast === entry.slots.length - 1 ? lineLast + 1 : lineLast

    return Math.min(Math.max(slot, lineFirst), upperBound)
  }

  // Rechnet den Platz in den Index um, den moveItemTo/TierRow brauchen.
  //
  // Beide Seiten zählen unterschiedlich: der Platz zählt nur das, was gerade
  // im Fluss liegt (die gezogene Karte ist ja ausgeblendet), der Index zählt
  // im Array MIT der gezogenen Karte. Zieht man innerhalb derselben Reihe um
  // und liegt der Zielplatz hinter der alten Position der Karte, verschiebt
  // sich deshalb alles um genau eins.
  function slotToIndex(slot, zone, targetItems) {
    if (zone !== draggedFromZone.value) {
      return slot
    }

    const draggedIndex = targetItems.findIndex((item) => item.id === draggedItem.value?.id)

    if (draggedIndex === -1) {
      return slot
    }

    return slot <= draggedIndex ? slot : slot + 1
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
