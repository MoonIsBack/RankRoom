# ⚠ Dateien, die ich fast nie anfasse

## Wofür ist das?

Manche Dateien funktionieren einfach. Sie haben oft mehr Aufwand gekostet, als man
ihnen ansieht, und eine kleine Änderung kann viel kaputtmachen.

**Nicht weil sie heilig sind — sondern weil der Nutzen selten den Aufwand lohnt.**

---

## 1. `usePointerDrag.js` 🔴 Am gefährlichsten

**Warum nicht anfassen:**
Das ist das Herzstück. 656 Zeilen, die in vielen Durchgängen entstanden sind, weil
Drag & Drop erstaunlich schwierig ist.

Die Datei arbeitet mit **eingefrorener Geometrie**: Beim Anfassen wird einmal
gemessen, wo alles liegt — danach wird nicht mehr gemessen. Das klingt umständlich,
löst aber ein echtes Problem: Wenn man live misst, verändert die Vorschau selbst das
Layout, das man gerade misst. Ergebnis war früher wildes Flackern.

**Wenn du doch musst:** Lies die Kommentare in der Datei. Sie erklären ausführlich,
*warum* etwas so ist. Ändere immer nur **eine** Konstante und teste danach sofort
mit Maus **und** Finger.

→ `36-usePointerDrag-js`

---

## 2. `validation.js` — die Funktionen

**Warum nicht anfassen:**
`hasForbiddenKeys()` und `isAllowedImageDataUrl()` sind Sicherheitsprüfungen für
importierte Dateien. Sie sehen unscheinbar aus, verhindern aber, dass eine
manipulierte JSON-Datei Unsinn in die App schleust.

**Ausnahme:** Die **Zahlen** oben in der Datei darfst du anpassen. Nur die Logik
darunter nicht.

→ `50-validation-js`

---

## 3. `tierListFormat.js`

**Warum nicht anfassen:**
Winzige Datei (16 Zeilen), aber sie ist die Vereinbarung zwischen Export und Import.

Änderst du `EXPORT_FORMAT`, kann RankRoom **alle bisher exportierten Dateien nicht
mehr lesen**. Und die Dateien deiner Nutzer auch nicht.

`CURRENT_FORMAT_VERSION` erhöhst du nur, wenn du das Dateiformat wirklich änderst —
und dann musst du gleichzeitig eine Umwandlung für alte Dateien einbauen.

→ `25-Versionierung`

---

## 4. `tierListStorage.js`

**Warum nicht anfassen:**
Jede Zeile fängt einen Fehlerfall ab, der vorher zum Absturz führte:

- beschädigte Daten → App startete weiß, ohne Ausweg
- voller Speicher → Daten gingen still verloren
- privater Modus → Absturz beim Start

Das sieht nach viel `try/catch` aus, aber jedes einzelne hat einen Grund.

→ `21-tierListStorage-js`

---

## 5. `BaseModal.vue` — der Skript-Teil

**Warum nicht anfassen:**
Darin steckt die komplette Tastaturbedienung für **alle sieben Popups** gleichzeitig:
Escape, Fokusfalle, Fokusrückgabe.

Eine Änderung hier wirkt überall. Das CSS darunter darfst du dagegen gern anpassen.

→ `61-BaseModal-vue`

---

## 6. `vite.config.js` — die CSP

**Warum nicht anfassen:**
Zwei Zeilen sind lebenswichtig:

- `img-src 'self' data: blob:` — ohne `data:` sind **alle Bilder unsichtbar**,
  ohne `blob:` ist der **Bild-Export kaputt**
- `style-src 'self' 'unsafe-inline'` — ohne das klebt die gezogene Karte an der
  falschen Stelle

→ `51-Content-Security-Policy`

---

## 7. `useAutoScroll.js`

**Warum nicht anfassen:**
Sehr kleine Datei, aber die Zahlen sind eingestellt, bis es sich gut anfühlte.
`MAX_SPEED = 850` und `RAMP_EXPONENT = 2` wirken zusammen — änderst du eines,
fühlt sich das Scrollen sofort falsch an.

---

## 💡 Merken

**Merksatz:** Wenn eine Datei viele Kommentare hat, die mit „Warum" oder „Grund:"
anfangen — dann hat sie schon mal wehgetan. Lies die Kommentare, bevor du etwas
änderst.

## 📌 Wenn du doch ranmusst

1. Vorher committen (dann kannst du zurück)
2. Nur **eine** Sache auf einmal ändern
3. `npm run build` danach
4. Im Browser testen — bei Drag & Drop mit Maus **und** Handy
