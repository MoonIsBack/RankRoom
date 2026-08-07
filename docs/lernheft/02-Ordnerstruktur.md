# Ordnerstruktur

## Wofür ist das?

Damit du weißt, wo du suchen musst.

## Die Ordner

```
RankRoom/
├── index.html            Einstiegspunkt (fast leer, Vue füllt ihn)
├── package.json          Abhängigkeiten + Befehle (npm run ...)
├── vite.config.js        Build-Einstellungen + Sicherheitsregel (CSP)
├── LEGAL_AND_PRIVACY_SETUP.md   Anleitung für alles Rechtliche
│
├── public/               Dateien, die 1:1 mitkopiert werden
│   └── rankroom-icon.svg      Das Logo
│
├── docs/lernheft/        ← dieses Lernheft
│
└── src/                  Der eigentliche Code
    ├── main.js           Startet Vue
    ├── App.vue           Setzt alle Bausteine zusammen
    │
    ├── assets/           main.css — Farben und Grundstile
    ├── components/       Sichtbare Bausteine (Vue-Dateien)
    │   ├── layout/       Rahmen der Seite: Kopf, Fuß, Begrüßung
    │   ├── tierlist/     Die Tierlist selbst: Reihen, Karten, Vorrat
    │   ├── legal/        Rechtliche Seiten
    │   └── modals/       Popups
    ├── composables/      Wiederverwendbare Logik ohne Aussehen
    ├── config/           legalConfig.js — Schalter fürs Rechtliche
    ├── data/             Feste Vorgaben (Standard-Reihen, Farben)
    ├── storage/          Zugriff auf den Browser-Speicher
    └── utils/            Reine Hilfsfunktionen
```

## Was gehört wohin?

| Ordner | Faustregel |
|---|---|
| `components/` | Alles, was man **sehen** kann |
| `composables/` | Logik, die **mehrere** Komponenten brauchen — z. B. Drag & Drop |
| `utils/` | Reine Funktionen: rein → raus, ohne Zustand |
| `storage/` | Nur der Browser-Speicher, sonst nichts |
| `config/` | Schalter zum Umstellen, kein Code der etwas tut |
| `data/` | Feste Listen und Werte |

## Drei Regeln, damit es aufgeräumt bleibt

**1. Neue Komponenten kommen in einen Unterordner, nie flach in `components/`.**
Frag dich: Gehört das zum Rahmen der Seite (`layout/`), zur Tierlist selbst
(`tierlist/`), ist es ein Popup (`modals/`) oder rechtlich (`legal/`)? Passt
nichts davon, ist das ein Zeichen, dass ein neuer Unterordner fällig ist.

**2. Reine Rechenfunktionen gehören nach `utils/`, nicht in ein Composable.**
Der Test dafür ist einfach: Braucht die Funktion `ref`, `watch` oder sonst
etwas aus Vue? Nein → sie gehört nach `utils/`. So entstand `dragGeometry.js`:
Die Rechnerei mit Rechtecken lag mitten in `usePointerDrag.js`, obwohl sie von
Vue nichts weiß.

**3. Was in `utils/` liegt, bekommt einen Test.**
Genau weil diese Funktionen zustandslos sind, kosten Tests dort fast nichts —
und sie sind die Stellen, an denen ein stiller Fehler am längsten unbemerkt
bliebe. Die Testdatei liegt direkt daneben: `validation.js` → `validation.test.js`.

## 💡 Merken

**Der Unterschied Composable vs. Utility:**

- **Composable** merkt sich etwas (Zustand) und heißt deshalb `useIrgendwas.js`
- **Utility** merkt sich nichts — rein, rechnen, raus

Beispiel:
`useTierLists.js` merkt sich deine Listen → Composable.
`fileName.js` macht aus einem Text einen Dateinamen → Utility.

## ⚠ Vorsicht

Der Ordner `dist/` taucht auf, sobald du `npm run build` ausführst. Der ist
**generiert** — da niemals von Hand etwas ändern, beim nächsten Build ist es weg.
Er liegt auch nicht in Git (steht in `.gitignore`).

## Was darf ich ändern?

Alles in `src/`. Das ist dein Code.

## Was sollte ich lieber nicht ändern?

- `dist/` (wird überschrieben)
- `node_modules/` (fremde Pakete, wird von npm verwaltet)
- `package-lock.json` (verwaltet npm für dich)
