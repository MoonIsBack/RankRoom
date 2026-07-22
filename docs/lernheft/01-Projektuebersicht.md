# Projektübersicht

## Wofür ist das?

RankRoom ist eine **Tierlist-App**: Du legst Items an (Wörter oder Bilder) und ziehst
sie per Drag & Drop in Reihen von S (Spitze) bis D (Rest).

Das Besondere: **Es gibt keinen Server.** Alles läuft im Browser des Nutzers.

## Wann brauche ich das?

Immer wenn du dich fragst „was kann das Ding eigentlich?" oder jemandem erklären
willst, was du gebaut hast.

## Die Kurzfassung

| Frage | Antwort |
|---|---|
| Womit gebaut? | Vue 3 + Vite |
| Programmiersprache | JavaScript (kein TypeScript) |
| Wo läuft es? | GitHub Pages: `moonisback.github.io/RankRoom/` |
| Wo liegen die Daten? | Nur im Browser des Nutzers (`localStorage`) |
| Backend? | **Nein** |
| Datenbank? | **Nein** |
| Nutzerkonten? | **Nein** |
| Externe Dienste? | **Keine** — kein Google, kein CDN, kein Tracking |
| Fremde Bibliotheken zur Laufzeit | **Nur Vue** |

## Was die App kann

- Items per Namenseingabe hinzufügen
- Bilder per Dateiauswahl oder per Ziehen auf die Seite hinzufügen
- Items per Drag & Drop in Reihen sortieren — mit **Maus und Finger**
- Reihen umbenennen, einfärben, hinzufügen, löschen, umsortieren
- Mehrere Tierlisten parallel verwalten
- Als JSON exportieren und wieder importieren
- Als PNG/JPG-Bild speichern
- Rechtliche Seiten (Datenschutz, Impressum usw.) über einen Footer

## ⭐ Besonders wichtig

Der wertvollste Teil von RankRoom ist, was es **nicht** tut:

- Keine Daten verlassen jemals das Gerät
- Kein Tracking, keine Cookies
- Nichts wird hochgeladen

Das ist kein Zufall, sondern eine bewusste Entscheidung. Wenn du später etwas
einbaust, das diese Eigenschaft kaputtmacht (Konten, Cloud, Werbung), dann wird
plötzlich vieles kompliziert: Datenschutzerklärung, Einwilligung, Serverkosten,
Sicherheit.

→ Details dazu: `48-Wann-aktiviere-ich-was`

## Größenordnung

Rund **9.400 Zeilen** in `src/`, verteilt auf etwa 45 Dateien.
Fertig gebaut sind das ca. 190 KB — sehr klein.

Die größten Dateien:

- `App.vue` (748 Zeilen)
- `AppHeader.vue` (672)
- `usePointerDrag.js` (656)
- `useTierLists.js` (549)

## 💡 Merken

**Ein Satz, der alles zusammenfasst:**
RankRoom ist eine reine Browser-App ohne Server — alles, was der Nutzer erstellt,
bleibt auf seinem Gerät.

Wenn du das im Kopf hast, erklären sich die meisten Entscheidungen im Code von selbst.
