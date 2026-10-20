# ⭐ Dateien, die ich häufig ändere

## Wofür ist das?

Diese Dateien sind deine Werkstatt. Hier passiert das meiste, wenn du etwas
verbessern oder umstellen willst.

---

## 1. `src/config/legalConfig.js`

**Was:** Schalter für alles Rechtliche.

**Typische Änderung:** `showImprint: false` → `true`, oder deinen Namen eintragen.

**Risiko:** Sehr gering. Es ist reine Konfiguration, kein Code der etwas tut.

**Beachte:** Das Impressum erscheint erst, wenn Name **und** Anschrift ausgefüllt
sind — der Schalter allein reicht nicht.

→ `40-legalConfig-js` (geplant) — bis dahin: `RECHTLICHES.md`

---

## 2. `src/assets/main.css`

**Was:** Die Farbvariablen der ganzen App.

**Typische Änderung:** Akzentfarbe umstellen, Hintergrund dunkler machen.

**Risiko:** Gering, aber die Wirkung ist überall gleichzeitig zu sehen.

**Beachte:** Änderst du `--accent-strong` (`#818cf8`), musst du auch `--accent-rgb`
(`129, 140, 248`) anpassen — das ist derselbe Farbton, nur als Zahlen für
halbtransparente Stellen. Der Verlauf `--accent-gradient` beginnt ebenfalls mit
`#818cf8`. Für das hellere `--accent` gibt es keine Zahlen-Fassung.

---

## 3. `src/data/tierColors.js`

**Was:** Die zehn Farben, die Reihen haben können.

**Typische Änderung:** Farben austauschen.

**Risiko:** Gering.

**Beachte:** Die ersten fünf Farben sind gleichzeitig die Standardfarben für
S/A/B/C/D (siehe `defaultTiers.js`). Änderst du Farbe 1, ändert sich also auch S.

---

## 4. Die Textseiten in `src/components/legal/`

**Was:** Datenschutz, Impressum, Nutzungsbedingungen, Kontakt.

**Typische Änderung:** Formulierungen anpassen, Abschnitt ergänzen.

**Risiko:** Gering technisch — **aber inhaltlich hoch.**

**⚠ Beachte:** Diese Texte sind rechtlich relevant. Wenn du eine Funktion einbaust
(Werbung, Analyse …), **musst** du den Text anpassen. Eine Datenschutzerklärung, die
etwas verschweigt, ist ein Problem.

→ `42-Datenschutzerklaerung` (geplant)

---

## 5. `src/components/layout/AppFooter.vue`

**Was:** Der Fußbereich.

**Typische Änderung:** Aussehen, Abstände, ein zusätzlicher Eintrag.

**Risiko:** Gering.

**Beachte:** Welche Rechtslinks erscheinen, entscheidet **nicht** diese Datei, sondern
`useLegalPages.js`. Der Footer bekommt eine fertige Liste geliefert. Nur der Knopf
„Lokale Daten" hängt direkt am Schalter `showLocalDataManager` in `legalConfig.js`.

---

## 6. `src/utils/validation.js` — die Zahlen darin

**Was:** Grenzwerte (Namenslängen, max. Items, Dateigrößen).

**Typische Änderung:** Eine Zahl hochsetzen.

**Risiko:** Mittel — siehe Warnung.

**⚠ Beachte:** Die Zahlen sind nicht willkürlich. `MAX_ITEMS_PER_LIST = 500` schützt
davor, dass der Browser-Speicher überläuft. Setzt du das auf 5000, riskierst du,
dass Nutzer plötzlich Daten verlieren.

Die **Funktionen** in dieser Datei fasst du dagegen fast nie an → `06-Dateien-die-ich-fast-nie-anfasse`

---

## 7. `src/components/layout/AppHeader.vue`

**Was:** Kopfzeile und Burger-Menü.

**Typische Änderung:** Menüeintrag hinzufügen.

**Risiko:** Mittel — die Datei ist mit 672 Zeilen (Stand 20.10.2026) groß, das
meiste davon CSS.

**Beachte:** Ein neuer Menüeintrag braucht drei Dinge: Button im Template,
`emit(...)` hier, und ein `@...` in `App.vue`. Vergisst du das Letzte, passiert
beim Klick einfach nichts.

Genau so stehen derzeit (20.10.2026) Knöpfe ohne Wirkung in der Datei: „Dashboard"
und „Vorlagen" in der Desktop-Leiste und „Einstellungen" im Seitenmenü haben keinen
Klick-Handler, und der Logo-Knopf meldet `go-home`, auf das `App.vue` nicht hört.

→ `63-AppHeader-und-Burger-Menue` (geplant)

---

## 💡 Merken

**Faustregel:** Je weiter oben in dieser Liste, desto ungefährlicher.

Die ersten drei kannst du ohne Nachdenken anfassen. Ab Punkt 6 lies vorher die
Kommentare in der Datei — die zugehörigen Heftseiten (50, 63) sind noch geplant.
