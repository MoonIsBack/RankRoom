# ⭐📌 useTierLists.js

`src/composables/useTierLists.js` — 549 Zeilen

## Aufgabe

**Alles rund um Tierlisten.** Laden, speichern, Items hinzufügen und löschen,
Reihen verwalten, Listen wechseln.

Das ist nach `usePointerDrag.js` die zweitwichtigste Datei im Projekt.

## Warum existiert sie?

Damit `App.vue` sich nicht um Datenverwaltung kümmern muss. `App.vue` sagt nur
„füge das hinzu" — wie und wo, entscheidet diese Datei.

## Wer benutzt sie?

Nur **`App.vue`**, genau einmal:

```js
const { items, tiers, addItem, ... } = useTierLists()
```

## Welche Dateien benutzt sie?

- `tierListStorage.js` — speichern und laden
- `defaultTiers.js` — Standard-Reihen erzeugen
- `tierColors.js` — Farbe für neue Reihen
- `exportTierList.js` — JSON-Download
- `validation.js` — Namen säubern, Grenzen prüfen

## Der Zustand

```js
const tierLists = ref([...])           // ALLE Listen
const activeTierListId = ref('uuid')   // welche ist offen
const storageNotice = ref(null)        // Speicher-Meldung oder null
```

Alles andere ist **berechnet** aus diesen dreien.

## Die wichtigsten Berechnungen

```js
activeTierList   // das komplette aktive Listen-Objekt
items            // Items im Pool (mit get UND set)
tiers            // die Reihen (mit get UND set)
totalItemCount   // Anzahl gesamt
savedLists       // Kurzübersicht fürs Listen-Modal
```

⭐ **Der Trick mit `get`/`set`:** Dadurch kannst du `items.value.push(...)`
schreiben, obwohl die Items eigentlich tief in `tierLists` stecken.

## Die wichtigsten Funktionen

### Items
| Funktion | Was |
|---|---|
| `addItem(name)` | Ein Item per Name. Gibt die neue id zurück (für den grünen Ring) oder `null` |
| `addItemsFromImages(liste)` | Mehrere Bilder. Filtert **Duplikate** und beachtet die 500er-Grenze |
| `deleteItem(id)` | Aus dem Pool entfernen |
| `renameItem(id, name)` | Umbenennen |

### Reihen
| Funktion | Was |
|---|---|
| `addTierRow()` | Neue Reihe, max. 20 |
| `deleteTierRow(id)` | Reihe weg — **Items wandern zurück in den Pool** |
| `renameTierRow(id, name)` | Umbenennen |
| `changeTierColor(id, farbe)` | Einfärben |

### Listen
| Funktion | Was |
|---|---|
| `createNewTierList(name)` | Neue Liste, wird sofort aktiv |
| `deleteTierList(id)` | Löschen — legt eine frische an, wenn es die letzte war |
| `renameTierList(id, name)` | Umbenennen |
| `openTierList(id)` | Zu einer anderen wechseln |
| `confirmReset()` | Aktive Liste leeren |
| `clearAllLocalData()` | **Alles** löschen |
| `exportActiveTierList()` | Als JSON herunterladen |
| `importTierList(daten)` | Geprüfte Liste einfügen |

## ⭐ Drei Details, die man kennen sollte

### 1. Duplikat-Erkennung bei Bildern

`addItemsFromImages()` vergleicht die **Bilddaten selbst**, nicht den Dateinamen.
Dasselbe Bild unter anderem Namen gilt also trotzdem als Duplikat.

### 2. `deleteTierRow` wirft keine Items weg

```js
items.value.push(...tier.items)   // erst retten
tiers.value = tiers.value.filter(...)  // dann Reihe weg
```

### 3. Die Migration beim Laden

Ganz oben in der Funktion:

```js
if (savedData) {
  savedData.tierLists.forEach((tierList) => {
    tierList.tiers.forEach((tier) => {
      if (!tier.id) { tier.id = crypto.randomUUID() }
    })
  })
}
```

**Warum:** Früher hatten Reihen keine eigene id. Seit man sie umbenennen kann,
braucht es eine. Diese Zeilen tragen sie bei alten Daten nach.

⚠ **Nicht entfernen** — sonst brechen Listen von Nutzern, die die App seit
längerem benutzen.

## Was passiert, wenn ich etwas ändere?

| Änderung | Folge |
|---|---|
| `MAX_TIERS` erhöhen | Mehr Reihen möglich, wird unübersichtlich |
| `MIN_TIERS` auf 0 | Man könnte alle Reihen löschen → leere Tierlist |
| `watch` entfernen | **Nichts wird mehr gespeichert** |
| Migration entfernen | Alte gespeicherte Listen brechen |

## 💡 Merken

**Wenn ein Wert falsch ist → hier suchen.**
**Wenn er nach dem Neuladen falsch ist → in `tierListStorage.js` suchen.**
