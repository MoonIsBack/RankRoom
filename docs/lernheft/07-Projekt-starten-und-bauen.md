# Projekt starten und bauen

## Wofür ist das?

Die Befehle aus `package.json`, die du brauchst — und was sie tun.

## Voraussetzung

Node.js **22.18+** oder **24.12+**. In `package.json` steht unter `engines` genau
`^22.18.0 || >=24.12.0` — also Node 22 ab 22.18 oder Node 24.12 und neuer.
Node 23 ist damit nicht abgedeckt.

Prüfen:

```bash
node --version
```

## Die Befehle

### `npm install`

Holt alle Pakete. Nur nötig beim ersten Mal oder nach `git pull`, wenn sich
`package.json` geändert hat.

Die GitHub-Action benutzt stattdessen `npm ci` — das installiert exakt die
Versionen aus `package-lock.json`.

---

### `npm run dev` ← der wichtigste

Startet den Entwicklungsserver. Adresse steht danach im Terminal
(meist `http://localhost:5173/RankRoom/`).

**Der Clou:** Änderst du eine Datei und speicherst, aktualisiert sich der Browser
**sofort von selbst**. Du musst nichts neu laden.

Beenden mit `Strg + C`.

---

### `npm run build`

Baut die fertige Fassung nach `dist/`. Das ist genau das, was später auf GitHub
Pages landet.

**Mach das nach jeder größeren Änderung.** Nicht weil du das Ergebnis brauchst,
sondern weil der Build dir sagt, ob du irgendwo einen Fehler hast.

---

### `npm run preview`

Zeigt den **gebauten** Stand aus `dist/` an. Braucht vorher ein `npm run build`.
Die Adresse steht im Terminal (meist `http://localhost:4173/RankRoom/`).

**Wann brauchst du das?** Wenn du prüfen willst, wie es wirklich online aussieht.
Ein Unterschied zu `npm run dev`: Nur hier ist die Sicherheitsregel (CSP) aktiv.

---

### `npm test`

Führt die Tests einmal aus und sagt dir, ob noch alles funktioniert.

Getestet werden die **reinen Rechenfunktionen** in `src/utils/` — also die,
die nichts von Vue oder vom Browser wissen: aus Eingabe wird Ausgabe, immer
gleich. Genau die lassen sich ohne Aufwand prüfen.

Es gibt außerdem `npm run test:watch`. Das bleibt offen und führt die Tests
bei jedem Speichern automatisch neu aus — praktisch, während du an einer
dieser Funktionen arbeitest.

**Wann brauchst du das?** Immer, wenn du an `utils/` etwas änderst. Und immer
vor einem Commit, denn seit die Tests in der GitHub-Action laufen, blockiert
ein roter Test die Veröffentlichung.

---

### `npm run format` und `npm run lint`

- **format** — bringt den Code in `src/` mit Prettier in einheitliche Form
  (Einrückung, Anführungszeichen) und schreibt die Dateien dabei um
- **lint** — sucht erst mit oxlint, dann mit ESLint nach typischen Fehlern und
  **behebt automatisch**, was sich beheben lässt (beide laufen mit `--fix`). Danach
  mit `git status` schauen, welche Dateien sich geändert haben

**Wie oft?** Nicht nach jeder Kleinigkeit. Einmal gesammelt, bevor du committest,
reicht völlig.

## Der übliche Ablauf

```text
npm run dev          ← läuft nebenher, während du arbeitest
... Änderungen machen, im Browser schauen ...
npm run build        ← prüft, ob alles heil ist
npm test             ← prüft, ob die Rechenfunktionen noch stimmen
npm run format
npm run lint
git add -A && git commit
```

## ⚠ Vorsicht

**Die Sicherheitsregel (CSP) gilt nur im Build, nicht in `npm run dev`.**

Das ist Absicht: Der Entwicklungsserver braucht eine WebSocket-Verbindung für das
automatische Neuladen, die CSP würde die blockieren.

**Folge für dich:** Wenn du etwas mit Bildern oder Export baust, teste es **auch**
mit `npm run build && npm run preview`. Sonst merkst du erst nach dem Hochladen,
dass die CSP es blockiert.

→ `51-Content-Security-Policy` (geplant)

## 💡 Merken

- **`npm run dev`** = arbeiten
- **`npm run build`** = prüfen
- **`npm test`** = stimmt es noch?
- **`npm run preview`** = so sieht es wirklich aus
