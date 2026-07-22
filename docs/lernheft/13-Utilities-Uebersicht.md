# Utilities — Übersicht

## Wofür ist das?

Utilities sind **reine Hilfsfunktionen**: Du steckst etwas rein, es kommt etwas
raus. Sie merken sich nichts und ändern nichts an der App.

## Alle Utilities (`src/utils/`)

| Datei | Zeilen | Aufgabe |
|---|---|---|
| `exportTierList.js` | 46 | Liste als JSON herunterladen |
| `importTierList.js` | 188 | JSON-Datei einlesen und **prüfen** |
| `exportTierListImage.js` | 281 | Liste als Bild zeichnen |
| `tierListFormat.js` | 16 | Format-Kennung und Version |
| `fileName.js` | 12 | Sicheren Dateinamen erzeugen |
| `validation.js` | 134 | Grenzwerte und Prüfungen |

## Kurz erklärt

### `fileName.js`

Macht aus „Meine Liste!" den Dateinamen „Meine-Liste".

```js
sanitizeFileBaseName('Meine Liste!')  →  'Meine-Liste'
```

Wird von **beiden** Exporten benutzt (JSON und Bild), damit Dateinamen einheitlich
sind.

---

### `tierListFormat.js`

Nur drei Werte, aber wichtig:

```js
EXPORT_FORMAT = 'rankroom-tierlist'
CURRENT_FORMAT_VERSION = 1
SUPPORTED_FORMAT_VERSIONS = [1]
```

Die Kennung landet in jeder exportierten Datei. Beim Import wird geprüft, ob sie
stimmt — so erkennt RankRoom eine fremde JSON-Datei.

⚠ **Nicht ändern** → `06-Dateien-die-ich-fast-nie-anfasse`

---

### `validation.js`

Alle Grenzwerte an einer Stelle. Die **Zahlen** darfst du anpassen, die
**Funktionen** besser nicht.

→ `50-validation-js`

---

### Die drei Export/Import-Dateien

Bekommen eigene Seiten:
- `23-Export-JSON`
- `24-Import-JSON`
- `32-Bild-Export`

## Warum überhaupt Utilities?

Weil man sie **überall benutzen kann, ohne Nebenwirkungen zu befürchten**.

`sanitizeFileBaseName()` kannst du hundertmal aufrufen — es passiert nichts weiter.
Bei `addItem()` aus `useTierLists.js` wäre das anders: Da ändern sich Daten.

## 💡 Merken

**Test für „ist das ein Utility?":**
Kannst du die Funktion zweimal hintereinander mit derselben Eingabe aufrufen und
bekommst zweimal dasselbe Ergebnis, ohne dass sich sonst etwas ändert?

→ Ja = Utility. Nein = gehört woanders hin.

## ⚠ Eine Ausnahme

`exportTierList.js` und `exportTierListImage.js` **lösen einen Download aus** —
das ist streng genommen eine Nebenwirkung.

Sie stehen trotzdem hier, weil sie nichts am Zustand der App ändern. Das ist eine
pragmatische Entscheidung, keine reine Lehre.
