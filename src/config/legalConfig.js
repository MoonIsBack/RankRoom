// ZENTRALE STELLE für alles Rechtliche.
//
// Hier — und NUR hier — wird entschieden, welche rechtlichen Bereiche in der
// App sichtbar sind und welche Angaben darin stehen. Wer etwas ein- oder
// ausschalten will, ändert eine Zeile in dieser Datei; niemand muss dafür in
// Komponenten herumsuchen.
//
// Ausführliche Anleitung dazu: LEGAL_AND_PRIVACY_SETUP.md im Projektordner.

// =============================================================================
// ⚠️  VORSCHAU-MODUS  ⚠️
// =============================================================================
//
// Dieser Schalter ist NUR zum Anschauen gedacht. Er schaltet ALLE rechtlichen
// Bereiche gleichzeitig sichtbar — auch solche, deren Pflichtangaben noch gar
// nicht ausgefüllt sind — damit man das komplette Erscheinungsbild einmal im
// Browser beurteilen kann.
//
// Solange er an ist, gilt:
//   - jede rechtliche Seite trägt oben ein deutliches VORSCHAU-Band
//   - unten rechts schwebt dauerhaft ein "Vorschau-Modus"-Hinweis
//   - im Impressum stehen erkennbare Platzhalter in eckigen Klammern
//   - die Cookie-Einstellungen sind eine reine Anschauungsoberfläche ohne
//     jede Wirkung (es gibt in RankRoom weiterhin KEINE Cookies)
//
// >>> VOR DEM VERÖFFENTLICHEN AUF false SETZEN. <<<
//
// Danach greifen wieder die normalen Regeln weiter unten: Das Impressum
// erscheint nur mit vollständigen echten Angaben, der Kontakt nur mit echter
// E-Mail-Adresse, und die Cookie-Einstellungen bleiben aus, solange es nichts
// einzuwilligen gibt.
export const previewMode = true

// --- Was ist sichtbar? -------------------------------------------------------
//
// true  = der Bereich erscheint im Footer und ist über seine Adresse erreichbar
// false = der Bereich erscheint NIRGENDS. Kein Link, kein leerer Eintrag, und
//         auch der direkte Aufruf der Adresse (z. B. #/impressum) tut nichts.
//
// HINWEIS: Solange previewMode oben true ist, werden diese Schalter übergangen
// und alles wird angezeigt. Die Werte hier sind trotzdem die, die nach dem
// Ausschalten des Vorschau-Modus gelten — sie sind also schon richtig gesetzt.
export const legalConfig = {
  // Datenschutzerklärung. Standardmäßig AN, weil sie schon heute greift:
  // GitHub Pages verarbeitet beim Ausliefern der Seite Server-Logdaten
  // (u. a. IP-Adressen), unabhängig davon, was die App selbst tut.
  showPrivacyPolicy: true,

  // Impressum. Standardmäßig AUS.
  //
  // Achtung: Dieser Schalter allein genügt nicht. Das Impressum erscheint erst,
  // wenn zusätzlich die Pflichtangaben in operatorInfo vollständig ausgefüllt
  // sind (siehe canShowImprint() unten). Damit kann kein halbfertiges Impressum
  // versehentlich online gehen.
  showImprint: false,

  // Kontaktbereich. Erscheint nur, wenn in operatorInfo auch wirklich eine
  // E-Mail-Adresse eingetragen ist — sonst bliebe ein Link ohne Ziel übrig.
  showContact: true,

  // Nutzungsbedingungen. Standardmäßig AUS: Sie sind fertig vorbereitet, aber
  // ob man sie veröffentlichen möchte, ist eine Entscheidung des Betreibers
  // und keine Pflicht.
  showTerms: false,

  // "Lokale Daten löschen". Reine Komfort- und Transparenzfunktion, darf immer an sein.
  showLocalDataManager: true,

  // Cookie-Einstellungen. AUS — und das ist hier die RICHTIGE Einstellung:
  // RankRoom setzt keine Cookies und bindet keine Drittanbieter ein. Ein
  // Cookie-Banner ohne einwilligungspflichtige Dienste wäre nicht nur unnötig,
  // sondern irreführend. Erst einschalten, wenn tatsächlich einmal ein
  // optionaler Dienst dazukommt (Analyse, Werbung, eingebettete Videos …) —
  // und dann muss vorher auch wirklich ein Einwilligungssystem gebaut werden.
  showCookieSettings: false,
}

// --- Angaben des Betreibers --------------------------------------------------
//
// ALLE Felder sind absichtlich leer. Hier trägt der Betreiber selbst ein, was
// er veröffentlichen möchte. Es werden bewusst keine Daten aus Git, aus dem
// Betriebssystem oder von irgendwoher automatisch übernommen.
//
// Was hier hineingehört, erklärt LEGAL_AND_PRIVACY_SETUP.md.
// Für den Vorschau-Modus: erkennbare Platzhalter statt echter Angaben.
//
// Bewusst in eckigen Klammern und in Großbuchstaben, damit sie auf keinem
// Bildschirmfoto und in keinem Browser versehentlich wie echte Daten wirken.
// Sie werden AUSSCHLIESSLICH benutzt, solange previewMode true ist.
const PREVIEW_PLACEHOLDERS = {
  name: '[HIER DEINEN VOLLSTÄNDIGEN NAMEN EINTRAGEN]',
  street: '[STRASSE UND HAUSNUMMER EINTRAGEN]',
  postalCode: '[PLZ]',
  city: '[ORT EINTRAGEN]',
  contactEmail: '[DEINE-EMAIL@BEISPIEL.DE]',
  privacyPolicyDate: '[DATUM EINTRAGEN]',
}

export const operatorInfo = {
  // PFLICHT fürs Impressum: vollständiger Vor- und Nachname, kein Pseudonym.
  name: '',

  // PFLICHT fürs Impressum: ladungsfähige Anschrift. Ein Postfach genügt
  // ausdrücklich NICHT — es muss eine Adresse sein, unter der man auch
  // förmliche Post zugestellt bekommen kann.
  street: '',
  postalCode: '',
  city: '',

  // Optional. Solange das Feld leer ist, wird der komplette Kontaktbereich
  // nicht angezeigt — es entsteht also kein toter Link.
  //
  // Für ein Impressum nach § 18 MStV (Name + Anschrift) ist eine E-Mail-Adresse
  // nicht vorgeschrieben. Sobald die Seite geschäftsmäßig betrieben wird
  // (Werbung, Affiliate, Premium …), verlangt § 5 DDG allerdings eine.
  contactEmail: '',

  // Datum, das unter der Datenschutzerklärung als "Stand" erscheint,
  // z. B. '22. Juli 2026'. Bleibt es leer, wird kein Stand angezeigt.
  privacyPolicyDate: '',
}

// --- Zusatzangaben, die erst bei geschäftlicher Nutzung nötig werden ---------
//
// Alle leer, alle optional. Im Impressum wird jede Zeile nur dann gerendert,
// wenn sie auch ausgefüllt ist — es entstehen also keine leeren Überschriften.
//
// WICHTIG: Hier NIEMALS etwas eintragen, was nicht wirklich existiert. Eine
// erfundene Handelsregister- oder Umsatzsteuernummer ist schlimmer als gar
// keine Angabe.
export const commercialInfo = {
  legalForm: '', // z. B. 'Einzelunternehmen'
  representative: '', // Vertretungsberechtigte Person (bei Gesellschaften)
  register: '', // z. B. 'Amtsgericht Musterstadt, HRB 12345'
  vatId: '', // Umsatzsteuer-Identifikationsnummer (§ 27a UStG)
  economicId: '', // Wirtschafts-Identifikationsnummer
  supervisoryAuthority: '', // Zuständige Aufsichtsbehörde, falls erlaubnispflichtig
  professionalInfo: '', // Berufsrechtliche Angaben bei reglementierten Berufen
}

// Demo-Zusatzangaben, damit im Vorschau-Modus auch der Abschnitt "Weitere
// Angaben" im Impressum zu sehen ist. Ebenfalls nur Platzhalter — hier stehen
// bewusst KEINE erfundenen Register- oder Steuernummern, weil eine erfundene
// Nummer schlimmer wäre als gar keine Angabe.
const PREVIEW_COMMERCIAL = {
  legalForm: '[RECHTSFORM, z. B. Einzelunternehmen]',
  representative: '',
  register: '[REGISTERGERICHT UND NUMMER, falls vorhanden]',
  vatId: '[UMSATZSTEUER-ID, falls vorhanden]',
  economicId: '',
  supervisoryAuthority: '',
  professionalInfo: '',
}

// --- Was die Oberfläche tatsächlich anzeigt ----------------------------------
//
// Die rechtlichen Seiten lesen NICHT direkt operatorInfo, sondern diese beiden
// Objekte. Dadurch gibt es genau eine Stelle, an der zwischen echten Angaben
// und Vorschau-Platzhaltern umgeschaltet wird — und keine Komponente muss
// wissen, dass es einen Vorschau-Modus überhaupt gibt.
export const displayOperatorInfo = previewMode ? { ...PREVIEW_PLACEHOLDERS } : operatorInfo
export const displayCommercialInfo = previewMode ? { ...PREVIEW_COMMERCIAL } : commercialInfo

// --- Prüffunktionen ----------------------------------------------------------

// Erkennt Platzhalter der Form "[NAME EINFÜGEN]". Falls jemand die Vorlage aus
// der Dokumentation kopiert, statt echte Daten einzutragen, soll das nicht
// als gültige Angabe durchgehen.
function isPlaceholder(value) {
  return value.trim().startsWith('[') && value.trim().endsWith(']')
}

function isFilledIn(value) {
  return typeof value === 'string' && value.trim().length > 0 && !isPlaceholder(value)
}

// Sind alle Pflichtangaben für ein Impressum wirklich vorhanden?
// Pflicht sind nach § 18 Abs. 1 MStV Name und (ladungsfähige) Anschrift.
export function isImprintComplete() {
  return (
    isFilledIn(operatorInfo.name) &&
    isFilledIn(operatorInfo.street) &&
    isFilledIn(operatorInfo.postalCode) &&
    isFilledIn(operatorInfo.city)
  )
}

// Merker, damit die Warnung unten nur EINMAL erscheint und nicht bei jedem
// Neuzeichnen der Oberfläche erneut in der Konsole steht.
let hasWarnedAboutImprint = false

// Die einzige Funktion, die über die Sichtbarkeit des Impressums entscheidet.
// Absichtlich strenger als der reine Schalter: Wer showImprint auf true stellt,
// aber die Angaben vergisst, veröffentlicht sonst ein Impressum, das seinen
// Zweck nicht erfüllt — und ein unvollständiges Impressum ist rechtlich
// schlechter als ein bewusst noch nicht veröffentlichtes.
export function canShowImprint() {
  // Im Vorschau-Modus immer zeigen — dort geht es ausdrücklich darum, das
  // Erscheinungsbild mit Platzhaltern zu beurteilen. Das VORSCHAU-Band oben
  // in der Seite macht unmissverständlich klar, dass das keine echten Daten
  // sind, und es ist genau EINE Zeile nötig, um wieder in den sicheren
  // Normalbetrieb zurückzukehren.
  if (previewMode) {
    return true
  }

  if (!legalConfig.showImprint) {
    return false
  }

  if (!isImprintComplete()) {
    // Nur während der Entwicklung warnen. import.meta.env.DEV ist im fertigen
    // Produktionsbundle false, der ganze Block fällt beim Bauen weg — es landet
    // also keine Konsolenausgabe auf der veröffentlichten Seite.
    if (import.meta.env.DEV && !hasWarnedAboutImprint) {
      hasWarnedAboutImprint = true
      console.warn(
        '[RankRoom] Das Impressum ist eingeschaltet (showImprint: true), aber es fehlen ' +
          'Pflichtangaben in operatorInfo (Name, Straße, PLZ, Ort). Das Impressum bleibt ' +
          'deshalb ausgeblendet. Siehe LEGAL_AND_PRIVACY_SETUP.md.',
      )
    }

    return false
  }

  return true
}

// Kontakt nur zeigen, wenn es auch etwas zu kontaktieren gibt
export function canShowContact() {
  if (previewMode) {
    return true
  }

  return legalConfig.showContact && isFilledIn(operatorInfo.contactEmail)
}

// Darf die E-Mail-Adresse als anklickbarer mailto:-Link dargestellt werden?
//
// Im Vorschau-Modus nicht: Dort steht nur ein Platzhalter, und ein Klick
// darauf würde das E-Mail-Programm mit einer unsinnigen Adresse öffnen.
// Der Platzhalter wird deshalb als reiner Text angezeigt.
export function isContactEmailUsable() {
  return !previewMode && isFilledIn(operatorInfo.contactEmail)
}

// Nutzungsbedingungen
export function canShowTerms() {
  return previewMode || legalConfig.showTerms
}

// Cookie-Einstellungen.
//
// Im Normalbetrieb bewusst aus: RankRoom setzt keine Cookies und bindet keine
// Drittanbieter ein. Eine Einwilligungsoberfläche ohne einwilligungspflichtige
// Dienste wäre irreführend, weil sie eine Datenverarbeitung suggeriert, die es
// nicht gibt. Im Vorschau-Modus wird sie nur zur Ansicht eingeblendet und ist
// dort ausdrücklich als Demo gekennzeichnet.
export function canShowCookieSettings() {
  return previewMode || legalConfig.showCookieSettings
}

// Ist überhaupt ein Verantwortlicher hinterlegt? Wird in der
// Datenschutzerklärung gebraucht: Solange nichts eingetragen ist, zeigen wir
// dort einen ehrlichen Hinweis statt einer leeren Zeile.
export function hasOperatorAddress() {
  return previewMode || isImprintComplete()
}
