# Composables — Übersicht

## Wofür ist das?

Ein Composable ist **wiederverwendbare Logik ohne eigenes Aussehen**. Erkennbar am
Namen: fängt mit `use` an.

## Alle Composables

| Datei | Zeilen | Aufgabe |
|---|---|---|
| `useTierLists.js` | 549 | ⭐ Alles rund um Tierlisten |
| `usePointerDrag.js` | 656 | ⭐ Karten ziehen |
| `useRowPointerDrag.js` | 169 | Reihen umsortieren |
| `useAutoScroll.js` | 80 | Scrollen am Bildschirmrand |
| `useImageUpload.js` | 217 | Bilder einlesen + EXIF entfernen |
| `useFileDropZone.js` | 74 | Dateien auf die Seite ziehen |
| `useLegalPages.js` | 157 | Rechtsseiten + Adressen |
| `useRecentlyAdded.js` | 49 | Grüner Ring bei neuen Items |
| `useRemovingItems.js` | 43 | Rotes Verblassen beim Löschen |
| `useTextSelection.js` | 28 | Textmarkierung beim Ziehen unterdrücken |

## Wer benutzt was?

Fast alle werden in **`App.vue`** aufgerufen:

```js
const { items, tiers, addItem, ... } = useTierLists()
const { draggedItem, startPointerDrag, ... } = usePointerDrag(items, tiers)
const { draggedRowIndex, startRowDrag, ... } = useRowPointerDrag(tiers)
const { openPage, openLegalPage, ... } = useLegalPages()
const { markAsNew, highlightDelayFor } = useRecentlyAdded()
const { startRemoving, isRemoving } = useRemovingItems(deleteItem)
const { isDraggingFile, handleDrop, ... } = useFileDropZone(handleImageFiles)
```

**Ausnahmen:**
- `useAutoScroll.js` wird von den beiden Drag-Composables benutzt, nicht von App.vue
- `useTextSelection.js` ebenso
- `useImageUpload.js` exportiert nur Funktionen, kein `use...()`-Aufruf

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

## 💡 Merken

**Wenn Logik in zwei Komponenten gebraucht wird → Composable.**
**Wenn sie nur in einer gebraucht wird → darf in der Komponente bleiben.**

## Die Sonderrolle von `useAutoScroll.js`

Diese Datei heißt zwar `use...`, exportiert aber `createAutoScroll()` statt
`useAutoScroll()`. Das ist Absicht: Sowohl das Karten-Ziehen als auch das
Reihen-Ziehen brauchen **jeweils eigenes** Auto-Scrolling, unabhängig voneinander.

Deshalb wird es zweimal erzeugt — einmal in `usePointerDrag.js`, einmal in
`useRowPointerDrag.js`.
