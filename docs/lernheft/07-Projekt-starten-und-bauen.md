# Projekt starten und bauen

## Wofür ist das?

Die vier Befehle, die du brauchst — und was sie tun.

## Voraussetzung

Node.js **22.18+** oder **24.12+** (steht in `package.json` unter `engines`).

Prüfen:
```
node --version
```

## Die Befehle

### `npm install`

Holt alle Pakete. Nur nötig beim ersten Mal oder nach `git pull`, wenn sich
`package.json` geändert hat.

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

**Wann brauchst du das?** Wenn du prüfen willst, wie es wirklich online aussieht.
Ein Unterschied zu `npm run dev`: Nur hier ist die Sicherheitsregel (CSP) aktiv.

---

### `npm run format` und `npm run lint`

- **format** — bringt den Code in einheitliche Form (Einrückung, Anführungszeichen)
- **lint** — sucht nach typischen Fehlern

**Wie oft?** Nicht nach jeder Kleinigkeit. Einmal gesammelt, bevor du committest,
reicht völlig.

## Der übliche Ablauf

```
npm run dev          ← läuft nebenher, während du arbeitest
... Änderungen machen, im Browser schauen ...
npm run build        ← prüft, ob alles heil ist
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

→ `51-Content-Security-Policy`

## 💡 Merken

- **`npm run dev`** = arbeiten
- **`npm run build`** = prüfen
- **`npm run preview`** = so sieht es wirklich aus
