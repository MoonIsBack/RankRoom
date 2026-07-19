<script setup>
// Gemeinsames Grundgerüst für alle Popups (Modals): der abgedunkelte
// Hintergrund, das zentrierte Panel und die optionale Kopfzeile mit Titel
// und Schließen-Knopf. Der eigentliche Inhalt kommt per <slot> von außen.
defineProps({
  // Kleine Beschriftung über dem Titel (z. B. "RankRoom"), optional
  label: {
    type: String,
    default: '',
  },
  // Überschrift des Popups. Ist sie gesetzt, wird die Kopfzeile angezeigt.
  title: {
    type: String,
    default: '',
  },
  // Ob rechts oben ein ✕-Knopf zum Schließen erscheint
  showClose: {
    type: Boolean,
    default: true,
  },
  // Maximale Breite des Panels (unterschiedlich je Popup)
  maxWidth: {
    type: String,
    default: '460px',
  },
})

defineEmits(['close'])
</script>

<template>
  <!-- Klick auf den Hintergrund schließt das Popup, Klick INS Panel nicht (@click.stop) -->
  <div class="modal-backdrop" @click="$emit('close')">
    <div class="modal" :style="{ maxWidth }" @click.stop>
      <div v-if="title" class="modal-header">
        <div>
          <p v-if="label" class="modal-label">{{ label }}</p>
          <h2>{{ title }}</h2>
        </div>

        <button
          v-if="showClose"
          type="button"
          class="close-button"
          aria-label="Schließen"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <slot />
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(8px);

  /* Hintergrund sanft einblenden, wenn das Popup erscheint */
  animation: modal-fade-in 0.18s ease;
}

.modal {
  width: 100%;
  padding: 24px;

  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 28px;

  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)), #101016;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);

  color: white;

  /* Panel leicht von unten hochschieben und einblenden */
  animation: modal-pop-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-pop-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  margin-bottom: 22px;
}

.modal-label {
  margin: 0 0 6px;

  color: #9ca3af;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.modal-header h2 {
  margin: 0;
  font-size: 2rem;
  letter-spacing: -0.06em;
}

.close-button {
  flex-shrink: 0;
  width: 44px;
  height: 44px;

  border: none;
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.075);
  color: white;

  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.13);
  transform: rotate(6deg);
}

@media (max-width: 600px) {
  .modal {
    padding: 20px;
  }

  .modal-header h2 {
    font-size: 1.55rem;
  }
}
</style>
