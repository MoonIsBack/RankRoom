# ⭐ Wie RankRoom aufgebaut ist

## Wofür ist das?

Das ist die wichtigste Seite im ganzen Heft. Wenn du **nur eine** liest, dann diese.

## Die Grundidee in drei Sätzen

1. **`App.vue` ist der Dirigent.** Sie hält alle Daten und reicht sie nach unten weiter.
2. **Komponenten zeigen nur an.** Sie haben fast keine eigene Logik.
3. **Composables machen die Arbeit.** Speichern, Drag & Drop, Animationen.

## Bild im Kopf

```
        useTierLists.js  ←→  tierListStorage.js  ←→  localStorage
               ↓
            App.vue   ←── usePointerDrag.js (Drag & Drop)
          /    |    \  ←── useLegalPages.js (Rechtsseiten)
         /     |     \
   Header   TierRow  Footer   ← zeigen nur an, melden Klicks nach oben
```

## Die eine Regel, die überall gilt

**Daten fließen nach unten. Ereignisse fließen nach oben.**

- `App.vue` gibt einer Komponente Daten mit (`:items="items"`)
- Die Komponente meldet zurück, wenn was passiert (`@delete-item="..."`)
- Die Komponente ändert die Daten **nicht selbst**

### Beispiel

Du klickst auf das ✕ einer Item-Karte:

1. `ItemCard.vue` sagt nur: „bei mir wurde auf Löschen geklickt" (`emit('delete')`)
2. `ItemPool.vue` gibt das weiter nach oben
3. `App.vue` fängt es und ruft `startRemoving(id)` auf
4. `useRemovingItems.js` lässt die Karte 320 ms rot verblassen
5. Danach ruft es `deleteItem(id)` aus `useTierLists.js`
6. Dort verschwindet das Item aus den Daten
7. Ein `watch` speichert automatisch in den `localStorage`
8. Vue zeichnet die Oberfläche neu — die Karte ist weg

**Sieben Schritte, aber jeder einzelne ist winzig.** Genau das ist der Trick.

## Warum ist das so gebaut?

Weil du dann bei einem Fehler **weißt, wo du suchen musst**:

| Problem | Suchen in |
|---|---|
| Sieht falsch aus | Der Komponente |
| Falscher Wert | `useTierLists.js` |
| Nach Neuladen weg | `tierListStorage.js` |
| Karte landet falsch | `usePointerDrag.js` |
| Rechtsseite fehlt | `legalConfig.js` |

## 💡 Merken

**`App.vue` weiß alles, kann aber nichts.**
**Composables können alles, wissen aber nichts von der Oberfläche.**

## ⚠ Vorsicht

Die Versuchung ist groß, in einer Komponente „schnell mal" direkt Daten zu ändern.
Mach das nicht. Dann hast du plötzlich zwei Stellen, an denen dasselbe passiert,
und wenn eine davon einen Fehler hat, findest du ihn nie.

## Siehe auch

- `04-Datenfluss` — genauer, mit mehr Beispielen
- `60-App-vue` — die Zentrale im Detail
