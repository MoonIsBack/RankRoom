<script setup>
// Gemeinsamer Rahmen für alle rechtlichen Texte (Datenschutz, Impressum,
// Nutzungsbedingungen, Kontakt).
//
// Setzt auf dem vorhandenen BaseModal auf und erbt damit automatisch die
// Tastaturbedienung, die Fokusfalle, das Escape-Schließen und das
// Scrollverhalten bei langen Texten. Hier kommen nur die Textstile dazu,
// die alle vier Seiten gemeinsam haben — so sehen sie garantiert gleich aus.
import BaseModal from '../modals/BaseModal.vue'
import { previewMode } from '../../config/legalConfig'

defineProps({
  title: {
    type: String,
    required: true,
  },
})

defineEmits(['close'])
</script>

<template>
  <BaseModal label="RankRoom" :title="title" max-width="720px" @close="$emit('close')">
    <!-- Deutliches Band, solange der Vorschau-Modus an ist. Es steht ganz oben
         in JEDER rechtlichen Seite, damit auf keinem Bildschirmfoto und in
         keiner Situation der Eindruck entstehen kann, hier stünden echte,
         veröffentlichte Angaben. -->
    <p v-if="previewMode" class="preview-banner">
      <strong>Vorschau-Modus</strong> — alle Angaben auf dieser Seite sind Platzhalter zur Ansicht.
      Zum Abschalten <code>previewMode</code> in <code>src/config/legalConfig.js</code> auf
      <code>false</code> setzen.
    </p>

    <div class="legal-text">
      <slot />
    </div>
  </BaseModal>
</template>

<style scoped>
/* Warnfarbe statt Akzentfarbe: Das Band soll sich bewusst NICHT ins Design
   einfügen, sondern auffallen — es ist ein Zustand, der wieder verschwinden
   soll, keine Gestaltung. */
.preview-banner {
  margin: 0 0 20px;
  padding: 12px 14px;

  border: 1px solid rgba(255, 176, 32, 0.35);
  border-radius: 14px;

  background: rgba(255, 176, 32, 0.1);
  color: #ffd79a;

  font-size: 0.85rem;
  line-height: 1.6;
}

.preview-banner strong {
  color: #ffc266;
  font-weight: 800;
}

.preview-banner code {
  padding: 1px 5px;

  border-radius: 5px;
  background: rgba(0, 0, 0, 0.3);

  font-size: 0.92em;
}

.legal-text {
  color: var(--text-secondary);
  font-size: 0.94rem;
  line-height: 1.7;
}

/* :deep() ist nötig, weil der Inhalt per <slot> aus einer anderen Komponente
   kommt. Ohne :deep() würden die Stile dort nicht greifen, da Vue sie sonst
   nur auf Elemente dieser Datei anwendet. */
.legal-text :deep(h3) {
  margin: 26px 0 8px;

  color: var(--text);
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* Die erste Überschrift braucht oben keinen Abstand — darüber steht schon
   die Kopfzeile des Popups */
.legal-text :deep(h3:first-child) {
  margin-top: 0;
}

.legal-text :deep(p) {
  margin: 0 0 12px;
}

.legal-text :deep(ul) {
  margin: 0 0 12px;
  padding-left: 20px;
}

.legal-text :deep(li) {
  margin-bottom: 6px;
}

.legal-text :deep(strong) {
  color: var(--text);
  font-weight: 700;
}

.legal-text :deep(a) {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.legal-text :deep(a:focus-visible) {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Kleiner Kasten für Hinweise, die keine reine Fließtext-Information sind
   (z. B. "hier fehlt noch eine Angabe") */
.legal-text :deep(.legal-note) {
  margin: 0 0 16px;
  padding: 12px 14px;

  border: 1px solid rgba(var(--accent-rgb), 0.25);
  border-radius: 14px;

  background: rgba(var(--accent-rgb), 0.08);
  color: var(--text-secondary);
  font-size: 0.88rem;
}

/* Datum ganz am Ende, bewusst zurückhaltend */
.legal-text :deep(.legal-date) {
  margin-top: 26px;
  padding-top: 16px;

  border-top: 1px solid rgba(255, 255, 255, 0.08);

  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
