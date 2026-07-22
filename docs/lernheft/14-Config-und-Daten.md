# Config und Daten

## Wofür ist das?

Zwei kleine Ordner, die feste Werte enthalten — kein Code, der etwas tut.

---

## `src/config/legalConfig.js`

Der einzige Ort für alles Rechtliche. Bekommt eine eigene Seite:
→ `40-legalConfig-js`

---

## `src/data/defaultTiers.js`

**Aufgabe:** Erzeugt die Standard-Reihen S, A, B, C, D für jede neue Tierlist.

```js
const DEFAULT_TIER_NAMES = ['S', 'A', 'B', 'C', 'D']

export function createDefaultTiers() {
  return DEFAULT_TIER_NAMES.map((name, index) => ({
    id: crypto.randomUUID(),
    name,
    color: TIER_COLOR_PALETTE[index],
    items: [],
  }))
}
```

### ⭐ Warum ist das eine Funktion und keine feste Liste?

Weil jede Reihe eine **eigene, einmalige id** braucht.

Wäre es ein festes Array, bekämen alle neuen Tierlisten **dieselben** ids. Sobald du
dann zwei Listen hast, würde Drag & Drop durcheinandergeraten — die Zuordnung
erfolgt nämlich über die id.

Steht auch so als Kommentar in der Datei.

### Was darf ich ändern?

Die Namen. Willst du statt S/A/B/C/D lieber „Top/Gut/Okay/Naja" — nur zu.

⚠ **Aber:** Das gilt nur für **neue** Listen. Bereits gespeicherte Listen behalten
ihre alten Reihen.

---

## `src/data/tierColors.js`

**Aufgabe:** Zehn Pastellfarben zur Auswahl.

```js
export const TIER_COLOR_PALETTE = [
  '#ff7f7f',  // 1 — Standard für S
  '#ffbf7f',  // 2 — Standard für A
  '#ffdf7f',  // 3 — Standard für B
  '#ffff7f',  // 4 — Standard für C
  '#bfff7f',  // 5 — Standard für D
  '#7fffbf', '#7fdfff', '#7fbfff', '#bf7fff', '#ff7fdf',
]
```

### Wer benutzt das?

Drei Stellen:
1. `defaultTiers.js` — Farben für S bis D (die ersten fünf)
2. `useTierLists.js` in `addTierRow()` — neue Reihen bekommen reihum eine Farbe
3. `TierRowSettingsPopover.vue` — die Farbauswahl im Zahnrad-Menü

### 💡 Merken

**Weil alle drei dieselbe Liste benutzen, passen die Farben automatisch zusammen.**

Vorher standen dieselben fünf Farbwerte an zwei Stellen im Code und konnten
auseinanderlaufen. Das wurde beim Aufräumen zusammengeführt.

### Was passiert, wenn ich Farbe 1 ändere?

Zwei Dinge gleichzeitig:
- Die Farbauswahl im Zahnrad zeigt die neue Farbe
- **Neue** Listen bekommen für S die neue Farbe

Bestehende Listen bleiben unverändert — deren Farben stehen schon im Speicher.

---

## `src/assets/main.css`

**Aufgabe:** Die Farbvariablen der ganzen App.

```css
:root {
  --bg-top: #101019;
  --bg-bottom: #0a0a11;
  --text: #f1f2f7;
  --text-secondary: #c3c6d6;
  --text-muted: #898da1;
  --text-subtle: #5f6376;
  --accent: #a5b4fc;
  --accent-strong: #818cf8;
  --accent-rgb: 129, 140, 248;
  --accent-gradient: linear-gradient(135deg, #818cf8, #8b5cf6);
}
```

### Die Textfarben-Stufen

| Variable | Wofür |
|---|---|
| `--text` | Überschriften, wichtige Zahlen |
| `--text-secondary` | Normaler Fließtext |
| `--text-muted` | Beschriftungen, Nebeninfos |
| `--text-subtle` | Platzhalter, ganz dezent |

Von hell nach dunkel. Wenn du Text einbaust, wähl die passende Stufe — dann fügt es
sich automatisch ein.

### ⚠ Vorsicht bei `--accent-rgb`

Das ist **derselbe Farbton** wie `--accent-strong`, nur als Zahlen. Gebraucht für
halbtransparente Stellen:

```css
background: rgba(var(--accent-rgb), 0.12);
```

**Änderst du `--accent-strong`, musst du `--accent-rgb` mit ändern.** Sonst passen
die transparenten Stellen nicht mehr zu den vollen.
