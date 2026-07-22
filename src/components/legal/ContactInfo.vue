<script setup>
// KONTAKT.
//
// Bewusst KEIN Kontaktformular: RankRoom hat keinen Server, an den ein Formular
// etwas schicken könnte. Ein Formular, das nur so aussieht, als würde es etwas
// senden, wäre irreführend — und die Nachricht lokal zu speichern wäre
// datenschutzrechtlich schlechter als der einfache mailto:-Link hier.
//
// Was für ein echtes Formular nötig wäre (Server, Spam-Schutz, Löschfristen,
// Auftragsverarbeitungsvertrag), steht in LEGAL_AND_PRIVACY_SETUP.md.
//
// Diese Komponente wird nur angezeigt, wenn in legalConfig.js tatsächlich eine
// E-Mail-Adresse eingetragen ist (siehe canShowContact()).
import LegalModal from './LegalModal.vue'
import { displayOperatorInfo, isContactEmailUsable } from '../../config/legalConfig'

defineEmits(['close'])
</script>

<template>
  <LegalModal title="Kontakt" @close="$emit('close')">
    <h3>So erreichst du uns</h3>
    <p>
      Bei Fragen, Fehlermeldungen oder Anregungen zu RankRoom kannst du eine E-Mail schreiben an:
    </p>
    <p>
      <!-- Im Vorschau-Modus steht hier nur ein Platzhalter — der wird bewusst
           NICHT verlinkt, sonst öffnete ein Klick das E-Mail-Programm mit einer
           unsinnigen Adresse. -->
      <a
        v-if="isContactEmailUsable()"
        class="contact-mail"
        :href="`mailto:${displayOperatorInfo.contactEmail}`"
      >
        {{ displayOperatorInfo.contactEmail }}
      </a>
      <span v-else class="contact-mail contact-mail-placeholder">
        {{ displayOperatorInfo.contactEmail }}
      </span>
    </p>

    <p class="legal-note">
      Ein Klick auf die Adresse öffnet dein eigenes E-Mail-Programm. RankRoom verschickt selbst
      keine Nachrichten, speichert nichts davon und überträgt auch nichts an einen Server.
    </p>

    <h3>Was RankRoom nicht sehen kann</h3>
    <p>
      Deine Tierlisten liegen ausschließlich auf deinem Gerät. Bei einer Frage zu einer bestimmten
      Liste hilft es deshalb, sie vorher über „Exportieren“ als Datei zu sichern und der E-Mail
      beizulegen — von hier aus ist sie nicht einsehbar.
    </p>
  </LegalModal>
</template>

<style scoped>
.contact-mail {
  font-size: 1.05rem;
  font-weight: 700;
}

/* Platzhalter sieht bewusst anders aus als eine echte Adresse: gedämpft,
   nicht unterstrichen, nicht anklickbar */
.contact-mail-placeholder {
  color: var(--text-subtle);
  text-decoration: none;
}
</style>
