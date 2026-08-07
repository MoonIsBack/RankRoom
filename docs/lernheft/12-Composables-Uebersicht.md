# Composables — Übersicht

## Wofür ist das?

Ein Composable ist **wiederverwendbare Logik, die Vue benutzt** — also `ref`,
`reactive`, `computed` oder `watch`. Erkennbar am Namen: fängt mit `use` an und
exportiert auch eine Funktion, die so heißt.

Das ist die einzige Regel für diesen Ordner. Wenn eine Datei kein Vue braucht,
gehört sie nach `utils/` — siehe unten.

## Alle Composables

| Datei | Zeilen | Aufgabe |
|---|---|---|
| `useTierLists.js` | 566 | ⭐ Alles rund um Tierlisten |
| `usePointerDrag.js` | 607 | ⭐ Karten ziehen |
| `useRowPointerDrag.js` | 169 | Reihen umsortieren |
| `useLegalPages.js` | 157 | Rechtsseiten + Adressen |
| `useFileDropZone.js` | 74 | Dateien auf die Seite ziehen |
| `useRecentlyAdded.js` | 49 | Grüner Ring bei neuen Items |
| `useRemovingItems.js` | 43 | Rotes Verblassen beim Löschen |

Sieben Stück — und alle sieben halten sich an die Regel.

## Wer benutzt was?

Alle werden in **`App.vue`** aufgerufen:

```js
const { items, tiers, addItem, ... } = useTierLists()
const { draggedItem, startPointerDrag, ... } = usePointerDrag(items, tiers)
const { draggedRowIndex, startRowDrag, ... } = useRowPointerDrag(tiers)
const { openPage, openLegalPage, ... } = useLegalPages()
const { markAsNew, highlightDelayFor } = useRecentlyAdded()
const { startRemoving, isRemoving } = useRemovingItems(deleteItem)
const { isDraggingFile, handleDrop, ... } = useFileDropZone(handleImageFiles)
```

## Das Grundmuster

```js
export function useIrgendwas(eingaben) {
  const zustand = ref(...)          // 1. Zustand
  function machWas() { ... }        // 2. Funktionen
  return { zustand, machWas }       // 3. herausgeben
}
```

**Nur was im `return` steht, ist von außen sichtbar.** Alles andere bleibt privat —
das ist gewollt.

## ⚠ Vorsicht

Ein Composable wird bei **jedem Aufruf neu erzeugt**. Rufst du `useTierLists()`
zweimal auf, hast du zwei getrennte Zustände, die nichts voneinander wissen.

**Deshalb wird jedes genau einmal in `App.vue` aufgerufen** und das Ergebnis nach
unten weitergereicht.

## Warum drei Dateien hier weggezogen sind

Früher lagen auch diese drei in `composables/`:

| Früher | Heute | Warum |
|---|---|---|
| `useAutoScroll.js` | `utils/autoScroll.js` | benutzt kein Vue |
| `useImageUpload.js` | `utils/imageImport.js` | benutzt kein Vue |
| `useTextSelection.js` | `utils/textSelection.js` | benutzt kein Vue |

Sie hießen `use...`, benutzten aber weder `ref` noch `watch` — und exportierten
teils gar keine `use`-Funktion. `useAutoScroll.js` exportierte zum Beispiel
`createAutoScroll()`. Wer beim Vue-Lernen darauf stößt, sucht nach einer Regel,
die es nicht gibt.

**Der Prüfsatz für neue Dateien:** Kommt in der Datei `ref`, `reactive`,
`computed` oder `watch` vor?

- **Ja** → `composables/`, Name `useXxx.js`
- **Nein** → `utils/`, Name sagt schlicht, was sie tut

## 💡 Merken

**`composables/` heißt: hier ist Vue drin.** Nichts anderes steht in diesem Ordner.
