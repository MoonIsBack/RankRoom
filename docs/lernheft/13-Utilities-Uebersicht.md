# Utilities — Übersicht

## Wofür ist das?

In `src/utils/` steht alles, was **kein Vue braucht**. Kein `ref`, kein `watch` —
darum sind es auch keine Composables (→ `12-Composables-Uebersicht`).

Innerhalb des Ordners gibt es zwei Sorten. Der Unterschied ist wichtig, weil nur
die erste Sorte sich einfach testen lässt.

## Sorte 1: reine Rechenfunktionen

Rein rein, raus raus. Keine Nebenwirkungen, kein Gedächtnis. **Diese haben Tests.**

| Datei | Zeilen | Aufgabe | Test |
|---|---|---|---|
| `validation.js` | 138 | Grenzwerte und Prüfungen | ✅ 17 Tests |
| `dragGeometry.js` | 69 | Rechteck-Rechnerei fürs Ziehen | ✅ 14 Tests |
| `fileName.js` | 11 | Sicheren Dateinamen erzeugen | ✅ 6 Tests |
| `tierListFormat.js` | 24 | Format-Kennung und Version | ✅ 3 Tests |

Die Testdatei liegt jeweils direkt daneben: `validation.js` → `validation.test.js`.
Ausführen mit `npm test`.

## Sorte 2: arbeiten mit Browser oder Dateien

Kein Vue, aber sie **bewirken etwas** — sie zeichnen, laden herunter oder fassen
das Dokument an. Deshalb keine Tests: Die bräuchten einen echten Browser.

| Datei | Zeilen | Aufgabe |
|---|---|---|
| `exportAsImage.js` | 281 | Liste als Bild zeichnen und speichern |
| `imageImport.js` | 217 | Bilder einlesen + EXIF entfernen |
| `importFromJson.js` | 188 | JSON-Datei einlesen und **prüfen** |
| `autoScroll.js` | 80 | Scrollen am Bildschirmrand beim Ziehen |
| `exportAsJson.js` | 40 | Liste als JSON herunterladen |
| `textSelection.js` | 28 | Textmarkierung beim Ziehen unterdrücken |

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

→ `50-validation-js` (geplant)

---

### `dragGeometry.js`

Die Rechnerei hinter dem Ziehen: Wo liegt ein Rechteck im Dokument, wenn die Seite
gescrollt ist? Liegt der Finger noch in dieser Reihe?

Lag früher mitten in `usePointerDrag.js`. Dort war sie schwer zu finden und gar
nicht zu testen — jetzt ist sie beides.

---

### Die Export/Import-Dateien

Bekommen eigene Seiten:
- `23-Export-JSON` (geplant)
- `24-Import-JSON` (geplant)
- `32-Bild-Export` (geplant)

Die Namen sind bewusst nach dem gleichen Muster gebaut, damit man sie beim
Überfliegen unterscheiden kann:

```
exportAsJson.js     raus als JSON
exportAsImage.js    raus als Bild
importFromJson.js   rein aus JSON
```

## 💡 Merken

**Der Test für „gehört das nach `utils/`?":**
Kommt in der Datei `ref`, `reactive`, `computed` oder `watch` vor?

→ Nein = `utils/`. Ja = `composables/`.

**Und danach:** Rechnet die Datei nur, oder fasst sie den Browser an? Nur rechnen
= Sorte 1 und sie sollte einen Test bekommen.
