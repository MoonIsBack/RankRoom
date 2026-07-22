# RankRoom

Eine Tierlist-App: Items (Wörter oder Bilder) per Drag & Drop in Reihen von S
bis D einsortieren. Läuft komplett im Browser — es gibt keinen Server, alle
Daten bleiben im `localStorage` des Geräts.

## Was die App kann

- Items per Namenseingabe, Dateiauswahl oder Bild-Drop hinzufügen
- Drag & Drop mit Maus **und** Touch (Handy/Tablet), inklusive Umsortieren
  innerhalb einer Reihe
- Tier-Reihen umbenennen, einfärben, hinzufügen, löschen und umsortieren
- Mehrere Tierlisten parallel verwalten
- Als JSON exportieren/importieren und als PNG/JPG-Bild speichern

## Entwicklung

```sh
npm install
npm run dev      # Entwicklungsserver
npm run build    # Produktionsbuild nach dist/
npm run lint     # oxlint + ESLint
npm run format   # Prettier
```

Erfordert Node 22.18+ oder 24.12+.

## Aufbau

```
src/
  components/    Vue-Komponenten (Reihen, Karten, Kopfzeile)
    modals/      Popups, alle auf Basis von BaseModal.vue
  composables/   Wiederverwendbare Logik ohne eigenes Aussehen
  utils/         Reine Hilfsfunktionen (Export, Import, Dateinamen)
  storage/       Zugriff auf den localStorage
  data/          Feste Vorgaben (Standard-Reihen, Farbpalette)
```

Die beiden wichtigsten Bausteine sind `composables/usePointerDrag.js`
(Drag & Drop der Item-Karten) und `composables/useTierLists.js` (alles rund
um die Tierlisten selbst). Beide sind ausführlich kommentiert — vor allem
`usePointerDrag.js` erklärt, warum die Zielberechnung mit einer beim
Anfassen **eingefrorenen** Geometrie arbeitet statt live zu messen.
