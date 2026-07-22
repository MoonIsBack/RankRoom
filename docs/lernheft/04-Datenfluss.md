# Datenfluss

## Wofür ist das?

Damit du bei jedem Fehler weißt, an welcher Station du nachschauen musst.

## Die drei Wege, die es gibt

### Weg 1 — Etwas hinzufügen

```
Nutzer tippt Namen ein
   → AddItemForm.vue meldet 'add-item'
   → App.vue: handleAddItem()
   → useTierLists.js: addItem()
        • sanitizeItemName()   (Text säubern, max. 80 Zeichen)
        • Grenze prüfen        (max. 500 Items)
        • ins Array schieben
   → watch bemerkt die Änderung
   → tierListStorage.js: saveTierLists()
   → localStorage
```

### Weg 2 — Etwas ziehen

```
Finger/Maus drückt auf Karte
   → ItemCard.vue meldet 'pointer-down'
   → App.vue: startPointerDrag()
   → usePointerDrag.js
        • Geometrie einfrieren (captureLayout)
        • bei Bewegung: Ziel berechnen
        • beim Loslassen: moveItemTo()
   → Daten in useTierLists.js ändern sich
   → watch → speichern
```

### Weg 3 — Seite neu laden

```
Browser lädt die Seite
   → main.js startet Vue
   → App.vue ruft useTierLists() auf
   → tierListStorage.js: loadTierLists()
        • Daten lesen
        • prüfen ob sie plausibel sind
        • bei Müll: null + recovered: true
   → Oberfläche wird aufgebaut
```

## Wo Daten überall liegen

| Ort | Was liegt da? | Überlebt Neuladen? |
|---|---|---|
| `localStorage` | Alle Tierlisten + Bilder | ✅ ja |
| `useTierLists.js` | Dieselben Daten, als Vue-Zustand | ❌ nein |
| `useRecentlyAdded.js` | Welche Items grün blinken | ❌ nein — **absichtlich** |
| `useRemovingItems.js` | Welche Items gerade verblassen | ❌ nein — absichtlich |
| `usePointerDrag.js` | Was gerade gezogen wird | ❌ nein — absichtlich |

## ⭐ Besonders wichtig

Die drei „absichtlich nicht" sind eine bewusste Entscheidung.

**Beispiel warum:** Wenn „ist neu" am Item selbst gespeichert wäre, würde es
mitgespeichert. Beim nächsten Öffnen würden alte Items plötzlich als „neu"
aufblinken. Deshalb liegt diese Information **außerhalb** der Daten.

Steht auch so als Kommentar in `useRecentlyAdded.js`.

## Das automatische Speichern

In `useTierLists.js` steht ein `watch` mit `{ deep: true }`.

Das heißt: **Jede** Änderung — egal wie tief verschachtelt — löst automatisch das
Speichern aus. Du musst nie selbst „speichern" aufrufen.

```js
watch([tierLists, activeTierListId], () => {
  const result = saveTierLists(...)
  if (!result.ok) { /* Meldung anzeigen */ }
}, { deep: true })
```

## ⚠ Vorsicht

`deep: true` ist bequem, aber nicht gratis. Vue muss bei jeder Änderung das ganze
Objekt durchgehen. Bei 500 Items mit Bildern ist das spürbar.

Deshalb gibt es die Obergrenze von 500 Items (`validation.js`).

## 💡 Merken

**Du speicherst nie von Hand.** Ändere die Daten — der Rest passiert automatisch.

Wenn etwas nach dem Neuladen weg ist, liegt der Fehler fast nie am Speichern,
sondern daran, dass die Daten gar nicht erst richtig geändert wurden.
