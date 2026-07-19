// Composable = eine Funktion, die wiederverwendbare Vue-Logik (State + Funktionen)
// bündelt. Dieses Composable kümmert sich um ALLES rund um die Tierlisten:
// Laden/Speichern, welche Liste gerade aktiv ist, und das Erstellen/Löschen
// von Listen und Items.
import { computed, ref, watch } from 'vue'

import { defaultTiers } from '../data/defaultTiers'
import { loadTierLists, saveTierLists } from '../storage/tierListStorage'

export function useTierLists() {
  // Beim Start versuchen, gespeicherte Daten aus dem localStorage zu laden.
  // Ist noch nichts gespeichert (erster Besuch), ist savedData null.
  const savedData = loadTierLists()

  // Die Standard-Tierlist, die genutzt wird, wenn noch nichts gespeichert wurde.
  // Startet leer, damit man direkt seine eigenen Items hinzufügen kann.
  const defaultTierList = {
    id: 'default',
    name: 'RankRoom Default',
    items: [],
    tiers: structuredClone(defaultTiers),
  }

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
  const rankedItemCount = computed(() => {
    return tiers.value.reduce((total, tier) => {
      return total + tier.items.length
    }, 0)
  })

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
      const rankedItems = tierList.tiers.reduce((total, tier) => {
        return total + tier.items.length
      }, 0)

      const totalItems = rankedItems + tierList.items.length

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

  // Neues Item zum Item-Pool hinzufügen (kommt aus dem AddItemForm)
  function addItem(itemName) {
    const trimmedName = itemName.trim()

    if (!trimmedName) {
      return
    }

    const newItem = {
      id: crypto.randomUUID(),
      name: trimmedName,
      image: null,
    }

    items.value.push(newItem)
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

    return { addedCount: itemsToAdd.length, duplicateNames }
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

  // Erstellt eine neue, leere Tierlist mit dem angegebenen Namen und
  // macht sie sofort zur aktiven Tierlist
  function createNewTierList(newName) {
    const newTierList = {
      id: Date.now().toString(),
      name: newName,
      items: [],
      tiers: structuredClone(defaultTiers),
    }

    tierLists.value.push(newTierList)
    activeTierListId.value = newTierList.id
  }

  // Leert die aktive Tierlist komplett: keine Items mehr im Pool und
  // alle Tier-Reihen (S, A, B, C, D) wieder leer.
  function confirmReset() {
    items.value = []
    tiers.value = structuredClone(defaultTiers)
  }

  // Löscht eine gespeicherte Tierlist komplett
  function deleteTierList(tierListId) {
    tierLists.value = tierLists.value.filter((tierList) => tierList.id !== tierListId)

    // Wurde gerade die letzte verbleibende Tierlist gelöscht, legen wir eine
    // frische Default-Liste an, damit die App nie komplett leer dasteht
    if (tierLists.value.length === 0) {
      const freshTierList = {
        id: Date.now().toString(),
        name: 'RankRoom Default',
        items: [],
        tiers: structuredClone(defaultTiers),
      }

      tierLists.value.push(freshTierList)
      activeTierListId.value = freshTierList.id

      return
    }

    // Wurde die gerade aktive Liste gelöscht, zur ersten verbleibenden Liste wechseln
    if (activeTierListId.value === tierListId) {
      activeTierListId.value = tierLists.value[0].id
    }
  }

  // Wechselt zu einer anderen gespeicherten Tierlist (Klick auf "Öffnen")
  function openTierList(tierListId) {
    activeTierListId.value = tierListId
  }

  // Alles, was App.vue (oder andere Komponenten) von diesem Composable
  // benutzen dürfen, wird hier zurückgegeben
  return {
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
    createNewTierList,
    confirmReset,
    deleteTierList,
    openTierList,
  }
}
