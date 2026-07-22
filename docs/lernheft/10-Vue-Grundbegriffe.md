# Vue-Grundbegriffe (nur die, die hier vorkommen)

## Wofür ist das?

Kein Vue-Kurs — nur die Begriffe, die in **deinem** Code auftauchen.

---

## `ref()`

Ein Wert, den Vue beobachtet. Ändert er sich, zeichnet Vue die Oberfläche neu.

```js
const showResetModal = ref(false)
```

**Im Skript** brauchst du `.value`:
```js
showResetModal.value = true
```

**Im Template** nicht:
```html
<ResetModal v-if="showResetModal" />
```

💡 **Merken:** Das `.value` ist der häufigste Anfängerfehler. Skript = mit,
Template = ohne.

---

## `computed()`

Ein Wert, der sich aus anderen Werten **berechnet**. Vue rechnet ihn nur neu, wenn
sich etwas ändert.

```js
const rankedItemCount = computed(() => countRankedItems(tiers.value))
```

### Computed mit `get` und `set`

Kann auch beschrieben werden. Nutzt du in `useTierLists.js`:

```js
const items = computed({
  get() { return activeTierList.value.items },
  set(newItems) { activeTierList.value.items = newItems },
})
```

Dadurch kannst du `items.value` lesen **und** setzen, obwohl die Daten eigentlich
tief in `tierLists` stecken.

---

## `watch()`

Reagiert auf Änderungen.

```js
watch([tierLists, activeTierListId], () => {
  saveTierLists(...)
}, { deep: true })
```

`deep: true` heißt: auch Änderungen **tief drinnen** zählen — z. B. wenn ein Item
in einer Reihe umbenannt wird.

⚠ **Vorsicht:** `deep` kostet Rechenzeit. Deshalb die Item-Obergrenze.

---

## `defineProps()` — Daten rein

Was eine Komponente von oben bekommt.

```js
defineProps({
  name: { type: String, default: '' },
  items: { type: Array, required: true },
})
```

---

## `defineEmits()` — Ereignisse raus

Was eine Komponente nach oben melden kann.

```js
const emit = defineEmits(['delete', 'pointer-down'])
emit('delete')
```

---

## `<script setup>`

Die kurze Schreibweise. Alles, was du darin anlegst, ist im Template automatisch
verfügbar. Nutzt du in **jeder** Vue-Datei.

---

## Template-Kürzel

| Schreibweise | Bedeutung |
|---|---|
| `v-if="x"` | nur anzeigen wenn x wahr |
| `v-for="a in liste"` | für jeden Eintrag einmal |
| `:key="a.id"` | eindeutige Kennung bei v-for — **immer angeben** |
| `:name="wert"` | Daten runtergeben |
| `@click="tuWas"` | auf Klick reagieren |
| `{{ wert }}` | Wert anzeigen |
| `@click.stop` | Klick nicht weiter nach oben geben |
| `@click.prevent` | Standardverhalten unterdrücken |

---

## `<Teleport>`

Hängt etwas woandershin im Dokument. Nutzt du in `App.vue` für die schwebende Karte
beim Ziehen:

```html
<Teleport to="body">
  <ItemCard v-if="draggedItem" floating ... />
</Teleport>
```

**Warum:** Damit die Karte über allem liegt und nicht vom `overflow: hidden` der
Tierlist abgeschnitten wird.

---

## `<slot>`

Ein Platzhalter für Inhalt von außen. `BaseModal.vue` nutzt das:

```html
<div class="modal-body"><slot /></div>
```

Jedes Popup füllt diesen Platz mit eigenem Inhalt.

---

## 💡 Merken

Vue kümmert sich um die Oberfläche. **Du änderst nur Daten** — was auf dem
Bildschirm passiert, macht Vue von allein.
