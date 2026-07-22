<script setup>
// IMPRESSUM (Anbieterkennzeichnung).
//
// ⚠️ WICHTIG FÜR DEN BETREIBER ⚠️
//
// Diese Komponente wird NUR angezeigt, wenn canShowImprint() in
// src/config/legalConfig.js true ergibt — das setzt voraus, dass dort sowohl
// showImprint eingeschaltet ist ALS AUCH Name, Straße, PLZ und Ort vollständig
// ausgefüllt sind. Ein unvollständiges Impressum ist rechtlich schlechter als
// ein bewusst noch nicht veröffentlichtes, deshalb die doppelte Absicherung.
//
// Trage die Angaben ausschließlich selbst in legalConfig.js ein und prüfe sie
// vorher. Es werden keinerlei Daten automatisch übernommen.
//
// Zur Einordnung, welche Angaben nötig sind:
//   - § 18 Abs. 1 MStV verlangt Name und (ladungsfähige) Anschrift, sobald das
//     Angebot nicht mehr ausschließlich persönlichen oder familiären Zwecken
//     dient. Eine E-Mail-Adresse ist dafür nicht vorgeschrieben.
//   - § 5 DDG verlangt zusätzlich eine E-Mail-Adresse und eine zweite schnelle
//     Kontaktmöglichkeit, greift aber erst bei geschäftsmäßigen, in der Regel
//     entgeltlichen Angeboten (z. B. sobald Werbung oder Premium dazukommt).
// Näheres in LEGAL_AND_PRIVACY_SETUP.md.
import LegalModal from './LegalModal.vue'
import {
  displayCommercialInfo,
  displayOperatorInfo,
  isContactEmailUsable,
} from '../../config/legalConfig'

defineEmits(['close'])

// Nur ausgefüllte Zusatzangaben anzeigen. Leere Felder werden gar nicht erst
// gerendert, damit keine leeren Überschriften wie "Umsatzsteuer-ID:" entstehen.
const commercialRows = [
  { label: 'Rechtsform', value: displayCommercialInfo.legalForm },
  { label: 'Vertretungsberechtigt', value: displayCommercialInfo.representative },
  { label: 'Registereintrag', value: displayCommercialInfo.register },
  { label: 'Umsatzsteuer-Identifikationsnummer', value: displayCommercialInfo.vatId },
  { label: 'Wirtschafts-Identifikationsnummer', value: displayCommercialInfo.economicId },
  { label: 'Zuständige Aufsichtsbehörde', value: displayCommercialInfo.supervisoryAuthority },
  { label: 'Berufsrechtliche Angaben', value: displayCommercialInfo.professionalInfo },
].filter((row) => row.value && row.value.trim().length > 0)
</script>

<template>
  <LegalModal title="Impressum" @close="$emit('close')">
    <h3>Angaben gemäß § 5 DDG und § 18 Abs. 1 MStV</h3>
    <p>
      {{ displayOperatorInfo.name }}<br />
      {{ displayOperatorInfo.street }}<br />
      {{ displayOperatorInfo.postalCode }} {{ displayOperatorInfo.city }}
    </p>

    <template v-if="displayOperatorInfo.contactEmail">
      <h3>Kontakt</h3>
      <p>
        E-Mail:
        <!-- Platzhalter im Vorschau-Modus bewusst nicht verlinken -->
        <a v-if="isContactEmailUsable()" :href="`mailto:${displayOperatorInfo.contactEmail}`">{{
          displayOperatorInfo.contactEmail
        }}</a>
        <span v-else>{{ displayOperatorInfo.contactEmail }}</span>
      </p>
    </template>

    <template v-if="commercialRows.length > 0">
      <h3>Weitere Angaben</h3>
      <ul>
        <li v-for="row in commercialRows" :key="row.label">
          <strong>{{ row.label }}:</strong> {{ row.value }}
        </li>
      </ul>
    </template>

    <h3>Verantwortlich für den Inhalt</h3>
    <p>
      {{ displayOperatorInfo.name }}, Anschrift wie oben. RankRoom ist ein Werkzeug ohne
      redaktionelle Inhalte: Alle Inhalte entstehen im Browser der Nutzerinnen und Nutzer und werden
      nicht veröffentlicht.
    </p>
  </LegalModal>
</template>
