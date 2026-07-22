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

→ `40-legalConfig-js`

---

## 2. `src/assets/main.css`

**Was:** Die Farbvariablen der ganzen App.

**Typische Änderung:** Akzentfarbe umstellen, Hintergrund dunkler machen.

**Risiko:** Gering, aber die Wirkung ist überall gleichzeitig zu sehen.

**Beachte:** Änderst du `--accent`, musst du auch `--accent-rgb` anpassen — das ist
derselbe Farbton, nur als Zahlen für halbtransparente Stellen.

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

→ `42-Datenschutzerklaerung`

---

## 5. `src/components/AppFooter.vue`

**Was:** Der Fußbereich.

**Typische Änderung:** Aussehen, Abstände, ein zusätzlicher Eintrag.

**Risiko:** Gering.

**Beachte:** Welche Links erscheinen, entscheidet **nicht** diese Datei, sondern
`useLegalPages.js`. Der Footer bekommt eine fertige Liste geliefert.

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

## 7. `src/components/AppHeader.vue`

**Was:** Kopfzeile und Burger-Menü.

**Typische Änderung:** Menüeintrag hinzufügen.

**Risiko:** Mittel — die Datei ist mit 672 Zeilen groß, das meiste davon CSS.

**Beachte:** Ein neuer Menüeintrag braucht drei Dinge: Button im Template,
`emit(...)` hier, und ein `@...` in `App.vue`. Vergisst du das Letzte, passiert
beim Klick einfach nichts.

→ `63-AppHeader-und-Burger-Menue`

---

## 💡 Merken

**Faustregel:** Je weiter oben in dieser Liste, desto ungefährlicher.

Die ersten drei kannst du ohne Nachdenken anfassen. Ab Punkt 6 lies vorher die
zugehörige Seite in diesem Heft.
