# RankRoom

RankRoom ist eine Tierlist-App für den Browser — für alle, die ohne Anmeldung
schnell eine Rangliste bauen wollen: Du legst Items an (Wörter oder Bilder) und
ziehst sie per Drag & Drop in Reihen von S (Spitze) bis D (Rest). Es gibt keinen
Server und kein Konto — alle Daten bleiben im `localStorage` (einem kleinen
Speicher im Browser) deines Geräts.

## Was die App kann

- Items per Namenseingabe, Dateiauswahl („Bilder auswählen") oder Bild-Drop
  hinzufügen — Bilder als PNG oder JPG, höchstens 50 auf einmal und 15 MB je Bild
- Drag & Drop mit Maus **und** Touch (Handy/Tablet), inklusive Umsortieren
  innerhalb einer Reihe
- Tier-Reihen umbenennen, einfärben, hinzufügen (bis 20), löschen (eine bleibt
  immer) und umsortieren
- Mehrere Tierlisten parallel verwalten (Seitenmenü → „Gespeicherte Tierlists")
- Als JSON exportieren/importieren und als JPG/PNG-Bild speichern — auf dem
  Handy über das Teilen-Menü
- Im Fußbereich: Datenschutzerklärung und „Lokale Daten" (ansehen und löschen);
  weitere Rechtsseiten je nach Schalter in `src/config/legalConfig.js`

## Stand

| Punkt | Wert |
|---|---|
| Stand dieser README | 20.10.2026 |
| Letzte große Änderung | 08.08.2026 — Aufräumen: `components/` nach Zuständigkeit gegliedert, Geometrie-Helfer nach `src/utils/dragGeometry.js`, Vitest-Tests für `src/utils/` |
| Letzter Commit vor dieser README | 13.10.2026 — verwundbare Abhängigkeiten aktualisiert, `.env` aus Git ausgeschlossen |
| Version | `0.0.0` in `package.json`; es gibt keine Versionsnummern und kein CHANGELOG — den Verlauf zeigt `git log` |

Weitere Doku: siehe [Doku-Wegweiser](#doku-wegweiser).

## Voraussetzungen

| Was | Hinweis |
|---|---|
| Node.js | `^22.18.0 \|\| >=24.12.0` (Feld `engines` in `package.json`): Node 22 ab 22.18 oder Node 24.12 und neuer. Node 23 ist nicht vorgesehen. Eine `.nvmrc` (Datei, mit der Werkzeuge wie nvm die Node-Version automatisch wählen) gibt es nicht |
| npm | kommt mit Node |
| Git | zum Holen des Codes und zum Veröffentlichen |
| Browser | ein aktueller Browser; für Drag & Drop am besten zusätzlich ein Handy |
| GitHub-Konto | nur zum Veröffentlichen: Schreibrechte am Repo `MoonIsBack/RankRoom` |

Node-Version prüfen:

```bash
node --version
```

## Installation

1. Code holen (ist das Repo privat, brauchst du Zugriff darauf):

   ```bash
   git clone https://github.com/MoonIsBack/RankRoom.git
   ```

2. In den Projektordner wechseln:

   ```bash
   cd RankRoom
   ```

3. Pakete installieren (beim ersten Mal und wenn sich `package.json` geändert hat):

   ```bash
   npm install
   ```

## Entwicklung

Alle Befehle stehen in `package.json` unter `scripts`.

Entwicklungsserver starten. Die Adresse steht danach im Terminal (meist
`http://localhost:5173/RankRoom/`), gespeicherte Änderungen erscheinen sofort.
Beenden mit `Strg + C`:

```bash
npm run dev
```

Fertige Fassung nach `dist/` bauen. Das findet auch Fehler, die `dev` nicht zeigt:

```bash
npm run build
```

Den gebauten Stand aus `dist/` ansehen (vorher `npm run build`; meist
`http://localhost:4173/RankRoom/`). Nur hier ist die CSP aktiv — die
Sicherheitsregel, was der Browser laden darf:

```bash
npm run preview
```

Tests einmal ausführen (mit Vitest, dem Test-Werkzeug):

```bash
npm test
```

Tests bei jedem Speichern automatisch neu ausführen (bleibt offen, beenden mit `Strg + C`):

```bash
npm run test:watch
```

Code prüfen: erst oxlint, dann ESLint (zwei „Linter" — Programme, die typische
Fehler suchen). ⚠ Beide laufen mit `--fix` und **ändern Dateien**, wenn sie etwas
automatisch beheben können:

```bash
npm run lint
```

Den Code in `src/` mit Prettier einheitlich formatieren (schreibt die Dateien um):

```bash
npm run format
```

## Aufbau

```text
RankRoom/
├── index.html            Einstiegspunkt (fast leer, Vue füllt ihn); viewport- und Referrer-Angabe
├── vite.config.js        base-Pfad, @-Kürzel für src/, CSP-Plugin
├── package.json          Abhängigkeiten, Befehle, Node-Version
├── RECHTLICHES.md        Anleitung für alles Rechtliche
├── .github/workflows/    deploy.yml — Test, Build, Veröffentlichung
├── public/               rankroom-icon.svg (wird 1:1 mitkopiert)
├── docs/lernheft/        das Lernheft
└── src/
    ├── main.js           startet Vue
    ├── App.vue           der „Dirigent": setzt alle Bausteine zusammen
    ├── assets/           main.css — Farbvariablen und Grundstile
    ├── components/
    │   ├── layout/       Rahmen der Seite: Kopfzeile, Begrüßung, Fußzeile
    │   ├── tierlist/     die Tierlist selbst: Reihen, Karten, Vorrat, Formular
    │   ├── modals/       Popups, alle auf Basis von BaseModal.vue
    │   └── legal/        Rechtsseiten, alle im Rahmen LegalModal.vue
    ├── composables/      Logik MIT Vue (ref, watch) — heißen alle useXxx.js
    ├── utils/            Funktionen OHNE Vue (Export, Import, Prüfungen) + Tests
    ├── storage/          tierLists.js — der einzige Zugriff auf den localStorage
    ├── config/           legalConfig.js — Schalter fürs Rechtliche
    └── data/             feste Vorgaben (Standard-Reihen, Farbpalette)
```

Die Trennung zwischen `composables/` und `utils/` folgt genau einer Regel:
Kommt in der Datei `ref`, `reactive`, `computed` oder `watch` vor, gehört sie
nach `composables/` — sonst nach `utils/`.

Die wichtigsten Dateien:

| Datei | Aufgabe |
|---|---|
| `src/App.vue` | ruft jedes Composable genau einmal auf und reicht Daten an die Komponenten weiter |
| `src/composables/useTierLists.js` | alles rund um die Tierlisten: laden, Items, Reihen, Listen, Export, Import — und automatisches Speichern |
| `src/composables/usePointerDrag.js` | Drag & Drop der Item-Karten mit Maus und Finger |
| `src/composables/useRowPointerDrag.js` | Reihen umsortieren |
| `src/composables/useLegalPages.js` | welche Rechtsseite offen ist, verbunden mit der Adresse (`#/datenschutz` …) |
| `src/storage/tierLists.js` | Lesen und Schreiben im localStorage; fängt jeden Fehler ab, statt abzustürzen |
| `src/utils/validation.js` | alle Grenzwerte und Prüfungen |
| `src/utils/imageImport.js` | Bilder einlesen, verkleinern, Metadaten entfernen |
| `src/config/legalConfig.js` | Rechts-Schalter und Betreiberangaben |

`usePointerDrag.js` und `useTierLists.js` sind ausführlich kommentiert — vor
allem `usePointerDrag.js` erklärt, warum die Zielberechnung mit einer beim
Anfassen **eingefrorenen** Geometrie arbeitet statt live zu messen.

**Datenfluss:** `main.js` startet Vue, und `App.vue` holt sich über
`useTierLists()` die gespeicherten Listen aus `storage/tierLists.js`. Daten
fließen als Props (Eingabewerte einer Komponente) nach unten; Komponenten
melden Klicks per Event nach oben und ändern selbst nichts. `App.vue` ruft dann
die passende Funktion auf — zum Beispiel `addItem()` aus `useTierLists.js` oder
beim Anfassen einer Karte `startPointerDrag()` aus `usePointerDrag.js`. Das
Loslassen erledigt `usePointerDrag.js` danach selbst: Es verschiebt die Karte
intern mit `moveItemTo()`. Ein `watch`
mit `deep: true` in `useTierLists.js` bemerkt jede Änderung und speichert sie
automatisch mit `saveTierLists()` im localStorage.

## Konfiguration

| Stelle | Wofür | Hinweis |
|---|---|---|
| `vite.config.js` → `base: '/RankRoom/'` | Unterordner, unter dem die Seite auf GitHub Pages liegt | Bei einer eigenen Domain auf `'/'` ändern — sonst lädt keine Datei |
| `vite.config.js` → `CONTENT_SECURITY_POLICY` | was der Browser laden darf | siehe [Sicherheit und Datenschutz](#sicherheit-und-datenschutz) |
| `vite.config.js` → `alias` `@` | `@/…` steht für `src/…` | `jsconfig.json` erklärt das dem Editor |
| `src/config/legalConfig.js` | alle Schalter und Angaben fürs Rechtliche | Tabelle unten, ausführlich in `RECHTLICHES.md` |
| `src/utils/validation.js` | Grenzwerte (Namenslängen, max. 500 Items, Dateigrößen, 1600 px Bildkante) | Zahlen darfst du anpassen, die Funktionen besser nicht |
| `src/assets/main.css` | Farbvariablen der ganzen App | `--accent-rgb` ist derselbe Farbton wie `--accent-strong` — beide zusammen ändern |
| `src/data/tierColors.js`, `src/data/defaultTiers.js` | Farbpalette und Standard-Reihen S–D | Bestehende Listen behalten ihre gespeicherten Werte; neue Listen, neue Reihen und die Farbauswahl am Zahnrad nutzen die neuen Werte sofort |

Die Rechts-Schalter in `src/config/legalConfig.js` (Stand 20.10.2026):

| Schalter | Wert | Wirkung |
|---|---|---|
| `previewMode` | `false` | `true` zeigt alle Rechtsbereiche mit Platzhaltern — nur zum Anschauen, nie so veröffentlichen |
| `showPrivacyPolicy` | `true` | Datenschutzerklärung im Footer |
| `showImprint` | `false` | Impressum; erscheint nur, wenn zusätzlich Name, Straße, PLZ und Ort in `operatorInfo` ausgefüllt sind |
| `showContact` | `true` | Kontakt; erscheint erst, wenn `operatorInfo.contactEmail` ausgefüllt ist |
| `showTerms` | `false` | Nutzungsbedingungen (fertig vorbereitet) |
| `showLocalDataManager` | `true` | Knopf „Lokale Daten" im Footer |
| `showCookieSettings` | `false` | Cookie-Demo; bleibt aus, weil RankRoom keine Cookies setzt |

Die Betreiberangaben `operatorInfo` (`name`, `street`, `postalCode`, `city`,
`contactEmail`, `privacyPolicyDate`) und `commercialInfo` sind leer (Stand
20.10.2026).

RankRoom braucht keine Umgebungsvariablen und keine `.env`-Datei. `.gitignore`
schließt `.env`, `.env.production`, `*.local`, `*.pem` und `*.key` vorsorglich aus.

## Tests und Prüfkette

- Getestet werden die reinen Rechenfunktionen in `src/utils/`: `validation.js`,
  `dragGeometry.js`, `fileName.js` und `tierListFormat.js` (Stand 20.10.2026:
  39 Tests). Die Testdatei liegt jeweils daneben (`validation.js` →
  `validation.test.js`).
- Die Browser-Helfer in `src/utils/` (Export, Import, Bilder, Auto-Scroll) haben
  keine Tests — sie bräuchten einen echten Browser.
- In der GitHub-Action laufen die Tests vor dem Build — ein roter Test
  verhindert die Veröffentlichung.
- Alles mit Bildern oder Export zusätzlich mit `npm run build` und danach
  `npm run preview` prüfen, weil die CSP nur im Build gilt.

## Veröffentlichen

Die Seite liegt auf GitHub Pages (kostenloser Hoster für statische Seiten). Ein
Push auf `main` genügt — der Workflow `.github/workflows/deploy.yml`
(„Deploy RankRoom to GitHub Pages") erledigt den Rest:

1. Code auschecken, Node 22 einrichten
2. `npm ci` — Pakete exakt nach `package-lock.json` installieren
3. `npm test` — schlägt ein Test fehl, bricht der Lauf hier ab
4. `npm run build`
5. `dist/` hochladen und auf GitHub Pages veröffentlichen

Der übliche Ablauf im Terminal:

```bash
git status
```

```bash
git add -A
```

```bash
git commit -m "Was geändert wurde"
```

```bash
git push
```

Gut zu wissen:

- Den Fortschritt siehst du auf GitHub im Repo unter **Actions**.
- Der Workflow hat keinen Start von Hand (`workflow_dispatch` fehlt). Neu
  veröffentlichen ohne Änderung: unter Actions den letzten Lauf öffnen →
  „Re-run all jobs".
- Auf GitHub muss einmalig **Settings → Pages → Source** auf „GitHub Actions"
  stehen. Lokal lässt sich das nicht prüfen; laut GitHub-API ist es so
  eingestellt (Abfrage am 21.10.2026).
- Live-Adresse: `https://moonisback.github.io/RankRoom/` (folgt aus `base` in
  `vite.config.js`, steht auch in Lernheft 01). Ein Abruf am 20.10.2026 ergab
  HTTP 200 — die Seite wird also ausgeliefert. Der Kommentar in der
  TrapHouse-Website (`src/data/navigation.js`), das RankRoom-Repo stehe auf
  privat und die Adresse sei deshalb nicht erreichbar, ist damit überholt.

## Fehlersuche

| Problem | Wo suchen |
|---|---|
| Mit `dev` alles gut, nach dem Deploy Bilder unsichtbar oder Bild-Export kaputt | CSP in `vite.config.js` — mit `npm run build` und `npm run preview` nachstellen |
| Seite lädt ohne Dateien oder bleibt weiß (z. B. nach Domain-Umzug) | `base` in `vite.config.js` |
| Sieht falsch aus | die Komponente |
| Falscher Wert | `src/composables/useTierLists.js` |
| Nach dem Neuladen weg | `src/storage/tierLists.js` — bei vollem, gesperrtem oder beschädigtem Speicher zeigt die App ein Hinweis-Popup |
| Karte landet falsch | `src/composables/usePointerDrag.js` |
| Impressum erscheint nicht | `showImprint` steht auf `false`, oder es fehlen Pflichtangaben in `operatorInfo` — im zweiten Fall steht im Dev-Modus eine Warnung in der Browser-Konsole |
| Actions ist rot | Lauf öffnen, roten Schritt aufklappen — oft ein fehlgeschlagener Test |

Logdateien gibt es nicht (kein Server). Fehler zur Laufzeit zeigt die
Browser-Konsole (F12 → „Console"), Build- und Testfehler das Terminal oder der
Lauf unter Actions.

## Sicherheit und Datenschutz

- **Keine Daten verlassen das Gerät:** kein Server, keine Konten, keine Cookies,
  kein Tracking, keine fremden Dienste. Einzige Bibliothek zur Laufzeit ist Vue.
- **Datenschutzerklärung ist an**, weil GitHub Pages beim Ausliefern
  Server-Logs mit IP-Adressen verarbeitet.
- **CSP** (Content Security Policy — Liste dessen, was der Browser für die Seite
  laden darf): wird als `<meta>`-Angabe **nur beim Build** in die `index.html`
  geschrieben (`cspPlugin` mit `apply: 'build'`), weil sie im Dev-Server das
  automatische Neuladen blockieren würde. Regeln: `default-src 'self'`,
  `script-src 'self'`, `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`, `font-src 'self'`, `connect-src 'self'`,
  `object-src 'none'`, `frame-src 'none'`, `worker-src 'none'`,
  `base-uri 'self'`, `form-action 'none'`.
- `frame-ancestors`, `Permissions-Policy` und HSTS wirken nur als HTTP-Header,
  die GitHub Pages nicht erlaubt — deshalb bewusst weggelassen.
- **Referrer:** `<meta name="referrer" content="no-referrer">` in `index.html`
  — der Browser verrät beim Klick nach außen nicht, woher der Besucher kam.
- **Zoom bleibt erlaubt:** die `viewport`-Angabe steht bewusst ohne
  `maximum-scale` und `user-scalable=no` (Barrierefreiheit, WCAG 1.4.4).
- **Bild-Metadaten (EXIF):** `src/utils/imageImport.js` zeichnet jedes Bild neu
  und begrenzt es auf 1600 px — GPS-Daten, Aufnahmezeit und Kameramodell fallen
  dabei weg. HEIC/HEIF-Dateien werden abgelehnt.
- **JSON-Import wird geprüft:** Formatkennung und Version
  (`src/utils/tierListFormat.js`), `hasForbiddenKeys()` und
  `isAllowedImageDataUrl()` in `src/utils/validation.js`, höchstens 25 MB.
- **Kein `v-html`, kein `innerHTML`, kein `eval`** im Code (per Suche am
  20.10.2026 geprüft) — Vue gibt Nutzertexte als harmlosen Text aus.

Ausführlich: `RECHTLICHES.md`, Abschnitt 10.

## Doku-Wegweiser

| Dokument | Inhalt |
|---|---|
| [`docs/lernheft/00-START-Inhaltsverzeichnis.md`](docs/lernheft/00-START-Inhaltsverzeichnis.md) | Lernheft: 15 Seiten geschrieben, weitere geplant (Stand 20.10.2026). Mit wenig Zeit: 01, 03, 05 und 06 |
| [`RECHTLICHES.md`](RECHTLICHES.md) | Schalter, Pflichtangaben, Checkliste vor öffentlicher Bewerbung, was sich bei Werbung/Konten/Bezahlung ändert, Textbausteine |
| Kommentare im Code | erklären das Warum — vor allem `usePointerDrag.js`, `vite.config.js`, `legalConfig.js`, `storage/tierLists.js` |

## Offene Punkte

Stand 20.10.2026:

- **Impressum:** In `src/config/legalConfig.js` Name und ladungsfähige
  Anschrift in `operatorInfo` eintragen und `showImprint: true` setzen — laut
  `RECHTLICHES.md` spätestens nötig, bevor RankRoom öffentlich beworben wird
  (Checkliste in Abschnitt 6; keine Rechtsberatung). Bis dahin zeigt die
  Datenschutzerklärung statt des Verantwortlichen nur einen Hinweis.
- `privacyPolicyDate` ist leer — unter der Datenschutzerklärung steht deshalb
  kein „Stand".
- **Knöpfe ohne Funktion** in `src/components/layout/AppHeader.vue`: „Dashboard"
  und „Vorlagen" in der Desktop-Leiste, „Einstellungen" im Seitenmenü. Der
  Logo-Knopf meldet `go-home`, aber `App.vue` reagiert nicht darauf.
- Der Deploy-Workflow lässt sich nicht von Hand starten (`workflow_dispatch` fehlt).
- Lernheft: die meisten Seiten sind noch geplant (Bilder, Drag & Drop,
  Rechtliches, Sicherheit, Oberfläche, Animationen, Anhang) — Liste in
  `docs/lernheft/00-START-Inhaltsverzeichnis.md`.
- Fernziel aus der TrapHouse-Website (dort Lernheft-Kapitel 30): RankRoom
  später als Unterseite dort aufnehmen. Noch nicht begonnen — bisher verlinkt
  die TrapHouse-Website RankRoom nur über einen Menüpunkt.
