<script setup>
// COOKIE-EINSTELLUNGEN — reine ANSCHAUUNGSOBERFLÄCHE.
//
// ⚠️ WICHTIG ⚠️
//
// Diese Oberfläche hat KEINE Wirkung. Sie lädt nichts, speichert nichts und
// schaltet nichts frei oder ab. Sie existiert ausschließlich, damit man sich
// ansehen kann, wie ein Einwilligungsdialog in RankRoom später einmal aussähe.
//
// Der Grund, warum sie nichts tut: RankRoom setzt derzeit KEINE Cookies und
// bindet KEINE Drittanbieter ein. Es gibt schlicht nichts, worin man
// einwilligen könnte. Ein Banner, das trotzdem Zustimmung einholt, wäre
// irreführend — er würde eine Datenverarbeitung suggerieren, die es nicht gibt.
//
// Sobald wirklich einmal ein einwilligungspflichtiger Dienst dazukommt (Werbung,
// Analyse, eingebettete Videos), muss das hier durch eine echte Umsetzung
// ersetzt werden. Die Anforderungen dafür stehen in Abschnitt 8 von
// LEGAL_AND_PRIVACY_SETUP.md — insbesondere: optionale Dienste dürfen erst NACH
// der Einwilligung geladen werden, und Ablehnen muss genauso einfach sein wie
// Zustimmen.
import { ref } from 'vue'

import LegalModal from './LegalModal.vue'

defineEmits(['close'])

// Die vier üblichen Kategorien. "notwendig" ist bewusst festgestellt — genau
// so muss es in einer echten Umsetzung auch sein.
const categories = ref([
  {
    id: 'necessary',
    label: 'Notwendig',
    locked: true,
    enabled: true,
    description:
      'Für den Betrieb erforderlich. Bei RankRoom ist das ausschließlich die Speicherung ' +
      'deiner Tierlisten im Browser — ohne sie wäre deine Liste bei jedem Neuladen weg.',
    status: 'Aktiv — das ist die einzige Speicherung, die RankRoom heute vornimmt.',
  },
  {
    id: 'preferences',
    label: 'Einstellungen',
    locked: false,
    enabled: false,
    description:
      'Würde Vorlieben wie ein Farbschema oder eine Sprachwahl speichern, die über die ' +
      'Grundfunktion hinausgehen.',
    status: 'Nicht vorhanden — RankRoom speichert derzeit keine solchen Einstellungen.',
  },
  {
    id: 'statistics',
    label: 'Statistik',
    locked: false,
    enabled: false,
    description: 'Würde anonymisiert messen, wie die Seite genutzt wird, um sie zu verbessern.',
    status: 'Nicht vorhanden — es ist kein Analysedienst eingebunden.',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    locked: false,
    enabled: false,
    description: 'Würde Werbung ausspielen und deren Wirkung messen.',
    status: 'Nicht vorhanden — es ist keine Werbung eingebunden.',
  },
  {
    id: 'media',
    label: 'Externe Medien',
    locked: false,
    enabled: false,
    description:
      'Würde Inhalte von fremden Servern nachladen, etwa eingebettete Videos oder Karten.',
    status: 'Nicht vorhanden — RankRoom lädt nichts von fremden Servern.',
  },
])

function toggle(category) {
  if (category.locked) {
    return
  }

  category.enabled = !category.enabled
}

function acceptAll() {
  categories.value.forEach((c) => {
    c.enabled = true
  })
}

function rejectAll() {
  categories.value.forEach((c) => {
    if (!c.locked) {
      c.enabled = false
    }
  })
}
</script>

<template>
  <LegalModal title="Cookie-Einstellungen" @close="$emit('close')">
    <p class="demo-notice">
      <strong>Nur zur Ansicht.</strong> Diese Oberfläche hat keine Wirkung — sie lädt nichts,
      speichert nichts und schaltet nichts frei. RankRoom setzt derzeit
      <strong>keine Cookies</strong> und bindet <strong>keine Drittanbieter</strong> ein, es gibt
      also nichts, worin man einwilligen könnte.
    </p>

    <h3>Kategorien</h3>

    <ul class="category-list">
      <li v-for="category in categories" :key="category.id" class="category">
        <div class="category-head">
          <span class="category-label">
            {{ category.label }}
            <span v-if="category.locked" class="locked-badge">immer aktiv</span>
          </span>

          <!-- role="switch" statt einer Checkbox: Screenreader kündigen das
               dann als Schalter mit Ein/Aus-Zustand an, was hier genau passt. -->
          <button
            type="button"
            class="switch"
            role="switch"
            :aria-checked="category.enabled"
            :aria-label="`${category.label} ${category.enabled ? 'ausschalten' : 'einschalten'}`"
            :disabled="category.locked"
            :class="{ on: category.enabled, locked: category.locked }"
            @click="toggle(category)"
          >
            <span class="knob" />
          </button>
        </div>

        <p class="category-description">{{ category.description }}</p>
        <p class="category-status">{{ category.status }}</p>
      </li>
    </ul>

    <!-- Ablehnen und Zustimmen sind bewusst gleich groß und gleich auffällig.
         Genau das verlangt eine echte Einwilligungslösung: Ablehnen muss
         genauso einfach sein wie Zustimmen. -->
    <div class="consent-actions">
      <button type="button" class="consent-button" @click="rejectAll">Alle ablehnen</button>
      <button type="button" class="consent-button" @click="acceptAll">Alle annehmen</button>
      <button type="button" class="consent-button primary" @click="$emit('close')">
        Auswahl speichern
      </button>
    </div>

    <p class="demo-footnote">
      In einer echten Umsetzung würde „Auswahl speichern“ die Entscheidung im Browser ablegen und
      optionale Dienste erst danach laden. Hier passiert bewusst nichts.
    </p>
  </LegalModal>
</template>

<style scoped>
.demo-notice {
  margin: 0 0 24px;
  padding: 14px 16px;

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.045);
  color: var(--text-secondary);

  font-size: 0.88rem;
  line-height: 1.65;
}

.demo-notice strong {
  color: var(--text);
}

.category-list {
  margin: 0 0 24px;
  padding: 0;
  list-style: none;
}

.category {
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.category:last-child {
  border-bottom: 0;
}

.category-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  margin-bottom: 8px;
}

.category-label {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  color: var(--text);
  font-size: 0.98rem;
  font-weight: 800;
}

.locked-badge {
  padding: 3px 8px;

  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);

  color: var(--text-muted);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.category-description {
  margin: 0 0 4px;
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.6;
}

.category-status {
  margin: 0;
  color: var(--text-subtle);
  font-size: 0.8rem;
  line-height: 1.5;
}

/* --- Schalter --- */
.switch {
  flex-shrink: 0;
  position: relative;

  width: 46px;
  height: 27px;

  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.07);
  cursor: pointer;
  padding: 0;

  transition:
    background 0.18s ease,
    border-color 0.18s ease;
}

.switch.on {
  border-color: rgba(var(--accent-rgb), 0.5);
  background: rgba(var(--accent-rgb), 0.55);
}

.switch.locked {
  cursor: not-allowed;
  opacity: 0.65;
}

.switch:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.knob {
  position: absolute;
  top: 3px;
  left: 3px;

  width: 19px;
  height: 19px;

  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);

  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.switch.on .knob {
  transform: translateX(19px);
}

/* --- Knöpfe --- */
.consent-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  margin-bottom: 16px;
}

.consent-button {
  flex: 1;
  min-width: 130px;

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 13px 16px;

  background: rgba(255, 255, 255, 0.07);
  color: white;

  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;

  transition: filter 0.15s ease;
}

.consent-button.primary {
  border-color: transparent;
  background: var(--accent-gradient);
}

.consent-button:hover {
  filter: brightness(1.15);
}

.consent-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.demo-footnote {
  margin: 0;
  color: var(--text-subtle);
  font-size: 0.8rem;
  line-height: 1.55;
}

@media (max-width: 560px) {
  .consent-button {
    flex-basis: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .switch,
  .knob,
  .consent-button {
    transition: none;
  }
}
</style>
