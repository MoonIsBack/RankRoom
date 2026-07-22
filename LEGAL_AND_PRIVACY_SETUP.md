# Rechtliches und Datenschutz in RankRoom

Diese Datei erklärt, wie die rechtlichen Bereiche von RankRoom aufgebaut sind, was
gerade aktiv ist, und was du tun musst, bevor du die Seite öffentlich bewirbst.

> **Keine Rechtsberatung.** Die Texte sind nach bestem Wissen und mit Quellenbelegen
> formuliert, ersetzen aber keine anwaltliche Prüfung. Niemand kann dir garantieren,
> dass eine Website „abmahnsicher" ist — das gibt es rechtlich nicht.

---

## 0. ⚠️ Vorschau-Modus ist derzeit EINGESCHALTET

Ganz oben in `src/config/legalConfig.js` steht:

```js
export const previewMode = true
```

Solange das so ist, sind **alle** rechtlichen Bereiche sichtbar — auch die, deren
Angaben noch gar nicht ausgefüllt sind. Das ist eine Ansichtssache zum Beurteilen des
Erscheinungsbildes, **kein veröffentlichungsfähiger Zustand**.

Erkennbar ist er an drei Stellen:
- ein oranges **Vorschau-Band** oben in jeder rechtlichen Seite
- ein schwebendes **Vorschau-Abzeichen** unten rechts auf der Seite
- **Platzhalter in eckigen Klammern** statt echter Angaben, z. B.
  `[HIER DEINEN VOLLSTÄNDIGEN NAMEN EINTRAGEN]`

**Zum Abschalten genau eine Zeile ändern:** `previewMode = false`.

Danach gelten wieder die normalen Regeln aus Abschnitt 1 — nachgeprüft: Mit
`previewMode: false` verschwinden Impressum, Kontakt und Nutzungsbedingungen wieder
vollständig aus dem Footer, und `#/impressum` tut nichts mehr.

Was im Vorschau-Modus zusätzlich gilt:
- die Platzhalter-E-Mail wird **nicht** als anklickbarer `mailto:`-Link dargestellt
- die Cookie-Einstellungen sind eine reine Anschauungsoberfläche (siehe Abschnitt 8a)
- es werden weiterhin **keine** Cookies gesetzt und **nichts** gespeichert

---

## 1. Der einzige Ort, an dem du etwas einstellst

**`src/config/legalConfig.js`** — alles andere richtet sich danach.

```js
export const legalConfig = {
  showPrivacyPolicy: true,     // AN  — greift schon heute
  showImprint: false,          // AUS — bis Name + Anschrift eingetragen sind
  showContact: true,           // erscheint erst mit echter E-Mail-Adresse
  showTerms: false,            // vorbereitet, Anzeige ist deine Entscheidung
  showLocalDataManager: true,  // AN
  showCookieSettings: false,   // AUS — RankRoom hat keine Cookies
}
```

**Wichtig:** `false` bedeutet wirklich unsichtbar. Es entsteht kein leerer Link, und
auch der direkte Aufruf der Adresse (z. B. `#/impressum`) tut dann nichts — die
Adresse wird still aufgeräumt. Getestet.

---

## 2. Was du selbst ausfüllen musst

Ebenfalls in `src/config/legalConfig.js`, im Objekt `operatorInfo`.
**Es wurde nichts automatisch übernommen** — alle Felder sind leer.

| Feld | Wofür | Wann nötig |
|---|---|---|
| `name` | Vollständiger Vor- und Nachname, **kein Pseudonym** | fürs Impressum |
| `street` | Straße und Hausnummer | fürs Impressum |
| `postalCode` | Postleitzahl | fürs Impressum |
| `city` | Ort | fürs Impressum |
| `contactEmail` | E-Mail-Adresse | freiwillig; Pflicht erst nach § 5 DDG |
| `privacyPolicyDate` | z. B. `'22. Juli 2026'` | erscheint als „Stand" |

Die Anschrift muss **ladungsfähig** sein — also eine Adresse, unter der dir förmliche
Post wirklich zugestellt werden kann. **Ein Postfach genügt ausdrücklich nicht.**

Für spätere geschäftliche Nutzung gibt es zusätzlich `commercialInfo` (Rechtsform,
Register, USt-IdNr. usw.). Alle Felder leer und optional — im Impressum wird jede
Zeile nur gerendert, wenn sie ausgefüllt ist.

> ⚠️ **Trage dort niemals etwas ein, das nicht wirklich existiert.** Eine erfundene
> Handelsregister- oder Steuernummer ist schlimmer als gar keine Angabe.

### Die eingebaute Absicherung

Selbst wenn du `showImprint: true` setzt, aber die Angaben vergisst, bleibt das
Impressum **ausgeblendet** und du bekommst im Entwicklungsmodus eine Warnung in der
Konsole. Das ist Absicht: Ein unvollständiges Impressum ist rechtlich schlechter als
ein bewusst noch nicht veröffentlichtes. Beide Richtungen sind getestet.

---

## 3. Was gerade aktiv ist

| Bereich | Zustand | Warum |
|---|---|---|
| **Datenschutzerklärung** | ✅ AN | Greift schon heute: GitHub Pages verarbeitet beim Ausliefern IP-Adressen in Server-Logs — unabhängig davon, was die App selbst tut. |
| **Lokale Daten löschen** | ✅ AN | Reine Transparenz- und Komfortfunktion. |
| **Footer** | ✅ AN | Zeigt nur freigeschaltete Einträge. |
| **Hinweis beim Bild-Upload** | ✅ AN | Beantwortet die zwei Fragen, die beim Hochladen wirklich aufkommen. |
| **EXIF-Entfernung** | ✅ AN | Läuft automatisch bei jedem Bild, nichts einzustellen. |

## 4. Was vorbereitet, aber ausgeschaltet ist

| Bereich | Warum aus | Wann einschalten |
|---|---|---|
| **Impressum** | Keine Anschrift eingetragen | Vor öffentlicher Bewerbung — siehe Abschnitt 6 |
| **Kontakt** | `contactEmail` ist leer | Sobald du eine Adresse zeigen willst |
| **Nutzungsbedingungen** | Keine Pflicht bei einem kostenlosen Werkzeug | Wann immer du magst |
| **Cookie-Einstellungen** | **Es gibt keine Cookies** | Erst wenn wirklich ein einwilligungspflichtiger Dienst dazukommt |

### Warum kein Cookie-Banner gebaut wurde

RankRoom setzt **null Cookies** und bindet **null Drittanbieter** ein. Ein
Einwilligungs-Banner ohne einwilligungspflichtige Dienste wäre nicht nur überflüssig,
sondern **irreführend** — er würde eine Datenverarbeitung suggerieren, die es nicht
gibt. Der `localStorage` ist etwas anderes als ein Tracking-Cookie: Er ist die
Kernfunktion (ohne ihn wäre deine Liste bei jedem Neuladen weg) und fällt damit unter
die Ausnahme „unbedingt erforderlich" in § 25 Abs. 2 TDDDG.

Wenn du später doch eines brauchst, steht die Anleitung in Abschnitt 8.

---

## 5. Wie du etwas ein- oder ausschaltest

**Bestehenden Bereich einschalten:** In `legalConfig.js` den Wert auf `true` setzen.
Fertig. Beim Impressum zusätzlich `operatorInfo` ausfüllen.

**Eine neue Rechtsseite hinzufügen:**

1. Komponente in `src/components/legal/` anlegen, nach dem Muster von
   `TermsOfUse.vue` (Rahmen kommt von `LegalModal.vue`).
   Der Dateiname muss **zwei Wörter** haben — der Linter verlangt das (`vue/multi-word-component-names`).
2. In `src/composables/useLegalPages.js`:
   - Eintrag in `HASH_TO_PAGE` ergänzen (z. B. `'#/agb': 'terms2'`)
   - Fall in `isPageAvailable()` ergänzen
   - Eintrag in `availableLinks` ergänzen
3. In `src/App.vue` importieren und im Template mit `v-if="openPage === '…'"` einhängen.

---

## 6. Checkliste vor öffentlicher Bewerbung

Das ist der Punkt, an dem aus einer Grauzone eine Pflicht wird — spätestens wenn du
den Link auf TikTok, Instagram oder einem größeren Discord-Server teilst.

- [ ] `operatorInfo.name` ausfüllen (voller Name)
- [ ] `operatorInfo.street` / `postalCode` / `city` ausfüllen (**ladungsfähig**)
- [ ] `legalConfig.showImprint` auf `true` setzen
- [ ] `operatorInfo.privacyPolicyDate` setzen
- [ ] Optional: `contactEmail` eintragen
- [ ] Datenschutzerklärung einmal komplett durchlesen — stimmt jede Aussage noch?
- [ ] Prüfen, ob inzwischen etwas dazugekommen ist, das dort fehlt
- [ ] Falls du die Wohnanschrift nicht zeigen willst: Alternative organisieren
      (c/o mit **Namensschild am Briefkasten**, oder Geschäftsadresse mit
      ausdrücklichem **Zustellungsempfang** — eine reine Briefkastenadresse
      reicht nicht)
- [ ] Bei Unsicherheit: anwaltliche Kurzprüfung, vor allem zur Adressfrage

### Rechtlicher Hintergrund in zwei Sätzen

**§ 18 Abs. 1 MStV** ist für dich die entscheidende Norm — sie verlangt Name und
Anschrift, sobald das Angebot *nicht mehr ausschließlich persönlichen oder familiären
Zwecken* dient, ganz ohne Geld und ohne „geschäftsmäßig". **§ 5 DDG** verlangt
zusätzlich E-Mail und eine zweite schnelle Kontaktmöglichkeit, greift aber erst bei
geschäftsmäßigen, in der Regel entgeltlichen Angeboten — also erst mit Werbung,
Affiliate, Premium oder monetarisierten Inhalten.

---

## 7. Vor Monetarisierung prüfen

Für jede mögliche Erweiterung: was zu tun wäre. **Noch ist nichts davon eingebaut.**

### Werbung
- **Dateien:** `index.html` (Skript), `vite.config.js` (**CSP muss erweitert werden**), neuer Datenschutz-Abschnitt, Consent-System nötig
- **Einwilligung:** ✅ **ja, zwingend vorher** — Werbenetzwerke setzen Cookies
- **AV-Vertrag:** meist ja
- **Daten:** IP, Gerätekennungen, Nutzungsverhalten, oft Profilbildung
- **Löschfristen:** vom Anbieter vorgegeben, in die Erklärung übernehmen
- **Impressum:** ✅ § 5 DDG greift dann voll (E-Mail + zweiter Kontaktweg)
- **Gewerbe/Steuer:** ✅ relevant, sobald Einnahmen fließen
- **Sicherheit:** Fremdcode auf der Seite; die strenge CSP müsste aufgeweicht werden
- **Zusätzlich:** § 6 DDG — Werbung muss als solche erkennbar sein

### Affiliate-Links
- **Dateien:** die Komponente mit dem Link, Datenschutz-Abschnitt
- **Einwilligung:** meist ja (Tracking-Cookies beim Partner)
- **Impressum:** ✅ ja
- **Gewerbe/Steuer:** ✅ ja
- **Zusätzlich:** ⚠️ **Kennzeichnungspflicht als Werbung** — nicht gekennzeichnete
  Affiliate-Links sind ein eigenständiger, häufig abgemahnter Verstoß

### Spenden (freiwillig, ohne Gegenleistung)
- **Dateien:** neue Komponente, `legalConfig.js`, Datenschutz-Abschnitt zum Zahlungsdienst
- **Einwilligung:** für den Link selbst nein; beim eingebetteten Widget ja
- **AV-Vertrag:** je nach Anbieter
- **Daten:** beim Zahlungsdienst, nicht bei dir
- **Impressum:** wahrscheinlich ja — Grauzone
- **Gewerbe/Steuer:** ⚠️ ungeklärt, steuerlich prüfen lassen
- **Tipp:** Ein reiner Link nach außen ist deutlich einfacher als ein eingebettetes Widget

### Premium-Funktionen (Bezahlung)
- **Dateien:** viele — Zahlungsanbindung, Freischaltlogik, AGB, Widerruf
- **Einwilligung:** ja für alles Optionale
- **AV-Vertrag:** ✅ ja
- **Daten:** Zahlungsdaten, Kaufhistorie, ggf. Konto
- **Löschfristen:** ⚠️ **10 Jahre steuerliche Aufbewahrung** für Rechnungen
- **Impressum:** ✅ voll nach § 5 DDG
- **Gewerbe/Steuer:** ✅ **zwingend** — Gewerbeanmeldung, Umsatzsteuer/Kleinunternehmer
- **Zusätzlich:** Widerrufsbelehrung, AGB, Preisangaben, Button-Lösung (§ 312j BGB)

### Benutzerkonten / Cloud-Synchronisierung
- **Dateien:** Backend nötig — das ändert die Architektur grundlegend
- **Einwilligung:** Konto ja, Verarbeitung über Vertrag (Art. 6 Abs. 1 lit. b DSGVO)
- **AV-Vertrag:** ✅ mit dem Hoster
- **Daten:** E-Mail, Passwort-Hash, **alle Inhalte der Nutzer**
- **Löschfristen:** Konto-Löschfunktion **ist Pflicht** (Art. 17 DSGVO)
- **Sicherheit:** ⚠️ **die größte Änderung überhaupt** — Passwortsicherheit,
  Meldepflicht bei Datenpannen binnen 72 Stunden (Art. 33 DSGVO), Backups,
  Zugriffsschutz
- **Ehrliche Einschätzung:** Das ist der Punkt, an dem RankRoom seinen größten
  Vorzug verliert — die vollständige Datensparsamkeit. Gut überlegen.

### Newsletter
- **Einwilligung:** ✅ **Double-Opt-In zwingend**, Protokollierung der Anmeldung
- **AV-Vertrag:** ✅ ja
- **Löschfristen:** Abmeldung muss in jeder Mail möglich sein

### Kontaktformular mit Serverübertragung
- **Dateien:** Backend oder Formulardienst, `ContactInfo.vue` umbauen
- **Einwilligung:** nein, aber Hinweispflicht
- **AV-Vertrag:** ✅ beim Formulardienst
- **Löschfristen:** Anfragen löschen, sobald erledigt
- **Sicherheit:** Spam-Schutz nötig (bevorzugt ohne externes Captcha —
  ein „Honeypot"-Feld ist datenschutzfreundlicher als reCAPTCHA)

### Analyse / Fehler-Monitoring
- **Einwilligung:** je nach Ausgestaltung; cookiefreie Dienste mit IP-Anonymisierung
  sind der datenschutzfreundlichere Weg
- **AV-Vertrag:** ✅ ja
- **CSP:** muss erweitert werden

### Social-Media-Einbettungen / Videos
- **Einwilligung:** ✅ **ja, immer vorher** — solche Einbettungen übertragen schon
  beim Laden Daten
- **Alternative:** Zwei-Klick-Lösung oder einfach ein normaler Link nach außen
- **Zusätzlich:** ⚠️ Auch deine **Social-Media-Profile selbst** brauchen dann ein
  Impressum — darauf weisen die Landesmedienanstalten ausdrücklich hin

---

## 8a. Die Cookie-Einstellungen sind eine Demo

`src/components/legal/CookieSettings.vue` ist eine **reine Anschauungsoberfläche**. Sie
zeigt fünf Kategorien mit Schaltern, aber:

- sie **speichert nichts** (nachgeprüft: kein neuer localStorage-Eintrag)
- sie **setzt keine Cookies** (nachgeprüft: der Browser hat weiterhin null Cookies)
- sie **lädt und blockiert nichts** — es gibt schlicht nichts zu steuern
- „Notwendig" ist festgestellt, „Alle ablehnen" und „Alle annehmen" sind gleich groß —
  so muss es in einer echten Umsetzung auch sein

Sie ist im Normalbetrieb über `legalConfig.showCookieSettings: false` ausgeschaltet und
erscheint derzeit nur, weil der Vorschau-Modus läuft.

**Wenn wirklich einmal ein einwilligungspflichtiger Dienst dazukommt, muss diese Datei
durch eine echte Umsetzung ersetzt werden** — die Anforderungen dafür stehen direkt
darunter.

---

## 8. Consent-System später nachrüsten

**Erst bauen, wenn wirklich ein einwilligungspflichtiger Dienst dazukommt.** Vorher
wäre es Code, der nichts tut.

Anforderungen, wenn es soweit ist:

- Kategorien: `notwendig` (nicht abwählbar), `Einstellungen`, `Statistik`,
  `Marketing`, `externe Medien`
- **Optionale Dienste dürfen erst NACH der Einwilligung geladen werden** — nicht
  vorher und dann nachträglich abschalten
- **Ablehnen muss genauso einfach sein wie Zustimmen** — gleichrangige Knöpfe,
  keine versteckte Ablehnung, kein vorausgewähltes Häkchen
- Auswahl muss widerrufbar sein → dafür `showCookieSettings: true` setzen, der
  Footer-Eintrag ist bereits vorgesehen
- Entscheidung im `localStorage` ablegen (eigener Schlüssel, z. B. `rankroom-consent`)
- Kein externer Consent-Anbieter nötig — das wäre selbst wieder ein Drittanbieter

Empfohlener Aufbau: `src/composables/useConsent.js` (Zustand + Speicherung) plus
`src/components/modals/ConsentModal.vue` (auf `BaseModal.vue` aufbauen, dann sind
Tastaturbedienung und Fokusfalle schon dabei).

---

## 9. Textbausteine für später

Kopierfertige Abschnitte für die Datenschutzerklärung, wenn eine Funktion dazukommt.
Einfach als weiteren `<h3>`-Block in `PrivacyPolicy.vue` einfügen und **an die
Wirklichkeit anpassen** — Platzhalter in eckigen Klammern ersetzen.

> ⚠️ Diese Bausteine **erst einfügen, wenn der Dienst wirklich eingebaut ist.** Eine
> Datenschutzerklärung, die Dienste nennt, die es nicht gibt, ist genauso falsch wie
> eine, die etwas verschweigt.

**Analyse-Dienst**
> ### Reichweitenmessung
> Diese Website nutzt [NAME], einen Dienst der [ANBIETER, SITZ]. [NAME] verarbeitet
> beim Aufruf [DATENARTEN, z. B. anonymisierte IP-Adresse, aufgerufene Seiten,
> Verweildauer], um die Nutzung der Website statistisch auszuwerten. Rechtsgrundlage
> ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die du jederzeit über die
> Cookie-Einstellungen im Fußbereich widerrufen kannst. Die Daten werden nach
> [ZEITRAUM] gelöscht.

**Werbung**
> ### Werbung
> Auf dieser Website wird Werbung von [ANBIETER, SITZ] eingeblendet. Dabei werden
> [DATENARTEN] verarbeitet, um Werbung auszuspielen und deren Wirkung zu messen.
> Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), widerrufbar
> über die Cookie-Einstellungen. Einzelheiten in der Datenschutzerklärung von
> [ANBIETER]: [LINK]

**Affiliate**
> ### Partnerprogramme
> Diese Website enthält Links zu [PARTNER]. Wenn du über einen solchen Link etwas
> kaufst, erhalte ich eine Provision — für dich entstehen dadurch keine Mehrkosten.
> Solche Links sind als Werbung gekennzeichnet. Beim Klick verarbeitet [PARTNER]
> [DATENARTEN].

**Zahlungsdienst**
> ### Zahlungsabwicklung
> Für Zahlungen wird [ANBIETER, SITZ] eingesetzt. Dabei werden [DATENARTEN] direkt an
> [ANBIETER] übermittelt; ich selbst erhalte keine vollständigen Zahlungsdaten.
> Rechtsgrundlage ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO). Rechnungs-
> daten werden aufgrund steuerlicher Aufbewahrungspflichten 10 Jahre gespeichert.

**Benutzerkonten**
> ### Nutzerkonto
> Für ein Nutzerkonto werden [DATENARTEN] gespeichert. Rechtsgrundlage ist die
> Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO). Du kannst dein Konto jederzeit unter
> [WO] löschen; alle zugehörigen Daten werden dann innerhalb von [ZEITRAUM] entfernt.

**Kontaktformular**
> ### Kontaktformular
> Wenn du das Kontaktformular nutzt, werden die eingegebenen Daten ([FELDER]) an
> [WOHIN] übermittelt und dort gespeichert, um deine Anfrage zu bearbeiten.
> Rechtsgrundlage ist das berechtigte Interesse an der Beantwortung (Art. 6 Abs. 1
> lit. f DSGVO) bzw. die Vertragsanbahnung (lit. b). Die Anfragen werden gelöscht,
> sobald sie erledigt sind, spätestens nach [ZEITRAUM].

---

## 10. Technische Hinweise

### Content Security Policy

Steht in `vite.config.js` und wird **nur in den Produktionsbuild** eingefügt.

**Warum nicht in `index.html`:** Der Entwicklungsserver von Vite lädt Änderungen über
eine WebSocket-Verbindung zu `localhost` nach. `connect-src 'self'` würde genau die
blockieren — Hot-Reload wäre kaputt. Der Build-Hook umgeht das sauber; `npm run dev`
bleibt unberührt. Getestet.

**Zwei Zeilen, die man nicht ändern darf, ohne etwas kaputtzumachen:**
- `img-src 'self' data: blob:` — ohne `data:` sind alle Bilder unsichtbar, ohne
  `blob:` ist der Bild-Export kaputt
- `style-src 'self' 'unsafe-inline'` — die schwebende Karte beim Ziehen wird über
  eine `:style`-Bindung positioniert

**Was auf GitHub Pages nicht geht:** `frame-ancestors` (Schutz davor, dass jemand die
Seite unsichtbar in seine eigene einbettet) wirkt **ausschließlich** als HTTP-Header
und wird in einem Meta-Tag ignoriert. GitHub Pages erlaubt keine eigenen Header.
Die Zeile wurde bewusst weggelassen, statt etwas einzubauen, das nachweislich nichts
tut. Bei einem Umzug auf einen eigenen Hoster als echten Header nachrüsten — dann
gleich zusammen mit `Referrer-Policy`, `Permissions-Policy` und HSTS.

### EXIF-Entfernung

`src/composables/useImageUpload.js`. Jedes eingelesene Bild wird über ein Canvas neu
gezeichnet und dabei auf **1600 Pixel** längste Kante begrenzt (`MAX_IMAGE_DIMENSION`
in `src/utils/validation.js`). Dabei bleiben nur die sichtbaren Bildpunkte übrig —
GPS-Koordinaten, Aufnahmezeit und Kameramodell fallen weg.

Nachgewiesen mit einem Testbild, in das eine erkennbare GPS-Zeichenkette eingebaut
wurde: nach der Verarbeitung ist sie nicht mehr enthalten. PNG bleibt PNG samt
Transparenz, JPG wird mit Qualität 0.9 neu kodiert.

**Ehrlicher Hinweis:** Der Browser schreibt beim Kodieren einen **eigenen, frischen**
EXIF-Block (74 Bytes, ein einziger Eintrag: Zeiger auf Bildabmessungen und Farbraum).
Der enthält nachweislich kein GPS, kein Kameramodell und kein Datum — nachgeprüft
durch Auslesen der TIFF-Tags.

### Grenzwerte

Alle in `src/utils/validation.js`, dort auch anpassbar:

| Grenze | Wert |
|---|---|
| Item-Name | 80 Zeichen |
| Reihen-Name | 24 Zeichen |
| Listen-Name | 60 Zeichen |
| Items pro Liste | 500 |
| Bilder pro Auswahl | 50 |
| Dateigröße je Bild | 15 MB |
| JSON-Import | 25 MB |
| Bildgröße nach Verarbeitung | 1600 px längste Kante |

### Zum Thema XSS

Es gibt im gesamten Projekt **kein** `v-html`, **kein** `innerHTML` und **kein**
`eval` — überprüft. Vue wandelt bei normaler Textausgabe Zeichen wie `<` und `>`
automatisch in harmlosen Text um. Die Grenzwerte oben dienen der **Stabilität und dem
Speicherplatz**, nicht der Abwehr von Angriffen. Wer das später ändert, sollte wissen,
dass `v-html` genau diesen Schutz aushebeln würde.

---

## 11. Hinweis zu deinen persönlichen Daten

In den **Git-Commit-Metadaten** dieses Repositories steht `moonsocialmail@gmail.com`
als Autor-Adresse aller Commits. Bei einem öffentlichen Repository ist die über die
GitHub-API einsehbar.

Das ist kein Fehler und wurde **nirgendwo in die App übernommen** — du solltest es nur
wissen, falls du davon ausgingst, dass die Adresse privat ist. Wenn du das ändern
willst, bietet GitHub eine „noreply"-Adresse an, die du in der Git-Konfiguration
hinterlegen kannst; die bereits vorhandenen Commits behalten die alte Adresse aber.

---

## 12. Noch offene Platzhalter

| Wo | Feld | Zustand |
|---|---|---|
| `src/config/legalConfig.js` | `operatorInfo.name` | leer |
| `src/config/legalConfig.js` | `operatorInfo.street` | leer |
| `src/config/legalConfig.js` | `operatorInfo.postalCode` | leer |
| `src/config/legalConfig.js` | `operatorInfo.city` | leer |
| `src/config/legalConfig.js` | `operatorInfo.contactEmail` | leer |
| `src/config/legalConfig.js` | `operatorInfo.privacyPolicyDate` | leer |
| `src/config/legalConfig.js` | alle Felder in `commercialInfo` | leer, erst bei geschäftlicher Nutzung |

Solange `operatorInfo` leer ist, zeigt die Datenschutzerklärung an der Stelle des
Verantwortlichen einen ehrlichen Hinweis statt einer leeren Zeile.
