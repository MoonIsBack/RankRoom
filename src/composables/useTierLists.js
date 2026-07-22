// Composable = eine Funktion, die wiederverwendbare Vue-Logik (State + Funktionen)
// bündelt. Dieses Composable kümmert sich um ALLES rund um die Tierlisten:
// Laden/Speichern, welche Liste gerade aktiv ist, und das Erstellen/Löschen
// von Listen und Items.
import { computed, ref, watch } from 'vue'

import { createDefaultTiers } from '../data/defaultTiers'
import { TIER_COLOR_PALETTE } from '../data/tierColors'
import { loadTierLists, saveTierLists } from '../storage/tierListStorage'
import { downloadTierListAsJson } from '../utils/exportTierList'

// Grenzen für die Anzahl der Tier-Reihen einer Tierlist: mindestens eine
// Reihe muss immer übrig bleiben, mehr als 20 wird unübersichtlich.
const MIN_TIERS = 1
const MAX_TIERS = 20

// Baut eine frische, leere Tierlist. Wurde vorher an vier Stellen fast
// gleich zusammengesetzt.
//
// Die id kommt von crypto.randomUUID() statt wie früher von Date.now():
// Date.now() liefert Millisekunden, zwei Listen im selben Augenblick hätten
// also dieselbe id bekommen — und deleteTierList filtert nach id, hätte
// damit beide auf einmal gelöscht. Passt außerdem zu den ids von Items und
// Tier-Reihen, die schon immer randomUUID nutzen.
function createTierList(name) {
  return {
    id: crypto.randomUUID(),
    name,
    items: [],
    tiers: createDefaultTiers(),
  }
}

// Zählt, wie viele Items in den Tier-Reihen einer Tierlist einsortiert sind
function countRankedItems(tiers) {
  return tiers.reduce((total, tier) => total + tier.items.length, 0)
}

export function useTierLists() {
  // Beim Start versuchen, gespeicherte Daten aus dem localStorage zu laden.
  // Ist noch nichts gespeichert (erster Besuch), ist savedData null.
  const savedData = loadTierLists()

  // Migration für älter gespeicherte Tierlisten: früher hatten Tier-Reihen
  // keine eigene id (sie wurden nur über ihren Namen erkannt). Da Reihen
  // jetzt umbenannt werden können, brauchen wir eine stabile id dafür.
  // Fehlt sie noch, wird sie hier einmalig nachgetragen.
  if (savedData) {
    savedData.tierLists.forEach((tierList) => {
      tierList.tiers.forEach((tier) => {
        if (!tier.id) {
          tier.id = crypto.randomUUID()
        }
      })
    })
  }

  // Die Standard-Tierlist, die genutzt wird, wenn noch nichts gespeichert wurde.
  // Startet leer, damit man direkt seine eigenen Items hinzufügen kann.
  const defaultTierList = createTierList('RankRoom Default')

  // tierLists = Liste ALLER Tierlisten, die der Nutzer angelegt hat
  const tierLists = ref(savedData ? savedData.tierLists : [defaultTierList])

  // activeTierListId = welche Tierlist gerade angezeigt/bearbeitet wird
  const activeTierListId = ref(savedData ? savedData.activeTierListId : defaultTierList.id)

  // Das komplette Tierlist-Objekt, das gerade aktiv ist (per id aus tierLists gesucht)
  const activeTierList = computed(() => {
    return tierLists.value.find((tierList) => {
      return tierList.id === activeTierListId.value
    })
  })

  // Ein "computed" mit get/set: liest den Namen der aktiven Tierlist,
  // kann aber auch (z. B. per v-model) neu gesetzt werden
  const tierListName = computed({
    get() {
      return activeTierList.value.name
    },
    set(newName) {
      activeTierList.value.name = newName
    },
  })

  // items = die noch nicht eingestuften Items der aktiven Tierlist (Item-Pool)
  const items = computed({
    get() {
      return activeTierList.value.items
    },
    set(newItems) {
      activeTierList.value.items = newItems
    },
  })

  // tiers = die S/A/B/C/D-Reihen der aktiven Tierlist, jede mit ihren eigenen Items
  const tiers = computed({
    get() {
      return activeTierList.value.tiers
    },
    set(newTiers) {
      activeTierList.value.tiers = newTiers
    },
  })

  // Anzahl der Items, die bereits in einer Tier-Reihe stecken
  const rankedItemCount = computed(() => countRankedItems(tiers.value))

  // Anzahl der Items, die noch im Pool liegen (nicht eingestuft)
  const unrankedItemCount = computed(() => {
    return items.value.length
  })

  // Gesamtzahl aller Items in der aktiven Tierlist
  const totalItemCount = computed(() => {
    return rankedItemCount.value + unrankedItemCount.value
  })

  // Baut aus allen Tierlisten eine kompakte Übersicht (id, Name, Beschreibung)
  // für das "Gespeicherte Tierlists"-Modal
  const savedLists = computed(() => {
    return tierLists.value.map((tierList) => {
      const totalItems = countRankedItems(tierList.tiers) + tierList.items.length

      return {
        id: tierList.id,
        name: tierList.name,
        description: `${totalItems} Items gespeichert`,
      }
    })
  })

  // Sobald sich tierLists oder die aktive Liste ändert, automatisch in den
  // localStorage speichern. { deep: true } sorgt dafür, dass auch Änderungen
  // TIEF in den Objekten (z. B. ein neues Item in einer Tier-Reihe) erkannt werden.
  watch(
    [tierLists, activeTierListId],
    () => {
      saveTierLists(activeTierListId.value, tierLists.value)
    },
    { deep: true },
  )

  // Neues Item zum Item-Pool hinzufügen (kommt aus dem AddItemForm).
  // Gibt die id des neuen Items zurück, damit App.vue es kurz hervorheben
  // kann (siehe useRecentlyAdded.js) — oder null, wenn nichts entstanden ist.
  function addItem(itemName) {
    const trimmedName = itemName.trim()

    if (!trimmedName) {
      return null
    }

    const newItem = {
      id: crypto.randomUUID(),
      name: trimmedName,
      image: null,
    }

    items.value.push(newItem)

    return newItem.id
  }

  // Fügt mehrere Items auf einmal hinzu, jeweils mit einem Bild.
  // newImageItems ist eine Liste aus { name, image } (kommt z. B. aus
  // useImageUpload.js, wenn mehrere Bilddateien per Drag & Drop oder
  // Dateiauswahl ausgewählt wurden).
  //
  // Bilder, die schon in der aktiven Tierlist vorhanden sind (im Pool ODER in
  // einer Tier-Reihe) oder die im selben Vorgang doppelt dabei sind, werden
  // NICHT hinzugefügt. Ihre Dateinamen werden als "duplicateNames" zurückgegeben,
  // damit App.vue darauf ein Hinweis-Popup zeigen kann.
  function addItemsFromImages(newImageItems) {
    // Alle bereits vorhandenen Bild-Daten einsammeln (Pool + alle Tier-Reihen).
    // Wir vergleichen die Bild-Daten selbst, nicht den Namen — so gilt dasselbe
    // Bild auch dann als Duplikat, wenn die Datei anders heißt.
    const existingImages = new Set()

    items.value.forEach((item) => {
      if (item.image) {
        existingImages.add(item.image)
      }
    })

    tiers.value.forEach((tier) => {
      tier.items.forEach((item) => {
        if (item.image) {
          existingImages.add(item.image)
        }
      })
    })

    const itemsToAdd = []
    const duplicateNames = []
    const seenInThisBatch = new Set()

    newImageItems.forEach((entry) => {
      if (existingImages.has(entry.image) || seenInThisBatch.has(entry.image)) {
        duplicateNames.push(entry.name)
        return
      }

      seenInThisBatch.add(entry.image)
      itemsToAdd.push({
        id: crypto.randomUUID(),
        name: entry.name,
        image: entry.image,
      })
    })

    items.value.push(...itemsToAdd)

    return {
      duplicateNames,
      // Für die kurze Hervorhebung der neuen Karten (siehe useRecentlyAdded.js)
      addedIds: itemsToAdd.map((item) => item.id),
    }
  }

  // Item komplett aus dem Pool entfernen (× -Button im ItemPool)
  function deleteItem(itemId) {
    items.value = items.value.filter((item) => item.id !== itemId)
  }

  // Benennt ein Item im Pool um (Stift-Button im ItemPool). Nützlich vor
  // allem bei Bildern, deren Name sonst einfach der Dateiname wäre.
  function renameItem(itemId, newName) {
    const trimmedName = newName.trim()

    if (!trimmedName) {
      return
    }

    const item = items.value.find((item) => item.id === itemId)

    if (!item) {
      return
    }

    item.name = trimmedName
  }

  // Sucht eine Tier-Reihe der aktiven Tierlist. Wird von allen Funktionen
  // gebraucht, die eine einzelne Reihe ändern.
  function findTier(tierId) {
    return tiers.value.find((tier) => tier.id === tierId)
  }

  // Ob aktuell noch eine weitere Tier-Reihe hinzugefügt werden darf
  const canAddTierRow = computed(() => tiers.value.length < MAX_TIERS)

  // Ob aktuell eine Tier-Reihe gelöscht werden darf — es muss immer
  // mindestens eine Reihe übrig bleiben
  const canDeleteTierRow = computed(() => tiers.value.length > MIN_TIERS)

  // Fügt der aktiven Tierlist eine neue, leere Tier-Reihe hinzu ("+"-Zeile
  // unterhalb der letzten Reihe). Die Farbe wird reihum aus der gemeinsamen
  // Palette gewählt, damit neue Reihen optisch zum Rest passen.
  function addTierRow() {
    if (!canAddTierRow.value) {
      return
    }

    const newTier = {
      id: crypto.randomUUID(),
      name: 'Neue Reihe',
      color: TIER_COLOR_PALETTE[tiers.value.length % TIER_COLOR_PALETTE.length],
      items: [],
    }

    tiers.value.push(newTier)
  }

  // Löscht eine Tier-Reihe aus der aktiven Tierlist (Reihen-Einstellungen-Popover).
  // Items, die noch in dieser Reihe eingestuft waren, wandern zurück in den
  // Pool statt verloren zu gehen.
  function deleteTierRow(tierId) {
    if (!canDeleteTierRow.value) {
      return
    }

    const tier = findTier(tierId)

    if (!tier) {
      return
    }

    items.value.push(...tier.items)
    tiers.value = tiers.value.filter((entry) => entry.id !== tierId)
  }

  // Benennt eine Tier-Reihe um (Reihen-Einstellungen-Popover)
  function renameTierRow(tierId, newName) {
    const trimmedName = newName.trim()

    if (!trimmedName) {
      return
    }

    const tier = findTier(tierId)

    if (!tier) {
      return
    }

    tier.name = trimmedName
  }

  // Ändert die Farbe einer Tier-Reihe (Reihen-Einstellungen-Popover)
  function changeTierColor(tierId, newColor) {
    const tier = findTier(tierId)

    if (!tier) {
      return
    }

    tier.color = newColor
  }

  // Erstellt eine neue, leere Tierlist mit dem angegebenen Namen und
  // macht sie sofort zur aktiven Tierlist
  function createNewTierList(newName) {
    const newTierList = createTierList(newName)

    tierLists.value.push(newTierList)
    activeTierListId.value = newTierList.id
  }

  // Leert die aktive Tierlist komplett: keine Items mehr im Pool und
  // alle Tier-Reihen (S, A, B, C, D) wieder leer.
  function confirmReset() {
    items.value = []
    tiers.value = createDefaultTiers()
  }

  // Löscht eine gespeicherte Tierlist komplett
  function deleteTierList(tierListId) {
    tierLists.value = tierLists.value.filter((tierList) => tierList.id !== tierListId)

    // Wurde gerade die letzte verbleibende Tierlist gelöscht, legen wir eine
    // frische Default-Liste an, damit die App nie komplett leer dasteht
    if (tierLists.value.length === 0) {
      const freshTierList = createTierList('RankRoom Default')

      tierLists.value.push(freshTierList)
      activeTierListId.value = freshTierList.id

      return
    }

    // Wurde die gerade aktive Liste gelöscht, zur ersten verbleibenden Liste wechseln
    if (activeTierListId.value === tierListId) {
      activeTierListId.value = tierLists.value[0].id
    }
  }

  // Benennt eine gespeicherte Tierlist um (Stift-Button im "Gespeicherte
  // Tierlists"-Modal). Betrifft nicht nur die aktive Liste, deshalb wird
  // hier in tierLists gesucht statt über activeTierList zu gehen.
  function renameTierList(tierListId, newName) {
    const trimmedName = newName.trim()

    if (!trimmedName) {
      return
    }

    const tierList = tierLists.value.find((entry) => entry.id === tierListId)

    if (!tierList) {
      return
    }

    tierList.name = trimmedName
  }

  // Wechselt zu einer anderen gespeicherten Tierlist (Klick auf "Öffnen")
  function openTierList(tierListId) {
    activeTierListId.value = tierListId
  }

  // Lädt die aktive Tierlist als JSON-Datei herunter (Export in Finder/Explorer)
  function exportActiveTierList() {
    downloadTierListAsJson(activeTierList.value)
  }

  // Fügt eine eingelesene Tierlist (aus einer JSON-Datei) als neue Liste hinzu
  // und macht sie sofort aktiv. Alle ids werden hier frisch vergeben, damit es
  // keine Kollision mit bereits vorhandenen Listen/Items gibt.
  function importTierList(parsedTierList) {
    const newTierList = {
      id: crypto.randomUUID(),
      name: parsedTierList.name,
      items: parsedTierList.items.map((item) => ({
        id: crypto.randomUUID(),
        name: item.name,
        image: item.image,
      })),
      tiers: parsedTierList.tiers.map((tier) => ({
        id: crypto.randomUUID(),
        name: tier.name,
        color: tier.color,
        items: tier.items.map((item) => ({
          id: crypto.randomUUID(),
          name: item.name,
          image: item.image,
        })),
      })),
    }

    tierLists.value.push(newTierList)
    activeTierListId.value = newTierList.id
  }

  // Alles, was App.vue (oder andere Komponenten) von diesem Composable
  // benutzen dürfen, wird hier zurückgegeben
  return {
    activeTierList,
    tierListName,
    items,
    tiers,
    rankedItemCount,
    unrankedItemCount,
    totalItemCount,
    savedLists,
    addItem,
    addItemsFromImages,
    deleteItem,
    renameItem,
    canAddTierRow,
    canDeleteTierRow,
    addTierRow,
    deleteTierRow,
    renameTierRow,
    changeTierColor,
    createNewTierList,
    confirmReset,
    deleteTierList,
    renameTierList,
    openTierList,
    exportActiveTierList,
    importTierList,
  }
}
