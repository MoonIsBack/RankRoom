<script setup>
// Kleiner, dauerhaft sichtbarer Hinweis, solange der Vorschau-Modus läuft.
//
// Zweck: Man soll auf JEDEM Bildschirmfoto und in jedem Moment erkennen können,
// dass gerade Platzhalter statt echter Angaben angezeigt werden — auch dann,
// wenn keine rechtliche Seite offen ist.
//
// Er verschwindet vollständig (die Komponente wird gar nicht erst gerendert),
// sobald previewMode in src/config/legalConfig.js auf false steht.
import { ref } from 'vue'

import { previewMode } from '../config/legalConfig'

// Lässt sich wegklicken, damit er beim Beurteilen des Layouts nicht im Weg ist.
// Bewusst NICHT gespeichert: Nach dem nächsten Neuladen ist er wieder da —
// dieser Hinweis soll sich nicht dauerhaft abschalten lassen.
const isDismissed = ref(false)
</script>

<template>
  <div v-if="previewMode && !isDismissed" class="preview-badge" role="status">
    <span class="dot" aria-hidden="true" />

    <span class="text">
      <strong>Vorschau-Modus</strong>
      <span class="detail">Rechtliche Bereiche zeigen Platzhalter</span>
    </span>

    <button
      type="button"
      class="dismiss"
      aria-label="Hinweis ausblenden"
      @click="isDismissed = true"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.preview-badge {
  position: fixed;
  right: 16px;
  bottom: 16px;

  /* Bewusst UNTER der Ebene der Popups (deren Hintergrund liegt bei 80).
     Sonst legte sich das Abzeichen auf schmalen Geräten über den Inhalt eines
     offenen Popups. Nötig ist es dort ohnehin nicht — jede rechtliche Seite
     trägt oben ihr eigenes Vorschau-Band. */
  z-index: 70;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 12px 10px 14px;

  border: 1px solid rgba(255, 176, 32, 0.4);
  border-radius: 14px;

  background: rgba(38, 28, 10, 0.94);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);

  color: #ffd79a;
  font-family: inherit;

  animation: badge-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes badge-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;

  border-radius: 50%;
  background: #ffb020;
}

.text {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.text strong {
  color: #ffc266;
  font-size: 0.8rem;
  font-weight: 800;
}

.detail {
  color: rgba(255, 215, 154, 0.75);
  font-size: 0.72rem;
}

.dismiss {
  flex-shrink: 0;

  width: 26px;
  height: 26px;

  border: 0;
  border-radius: 8px;

  background: rgba(255, 255, 255, 0.08);
  color: #ffd79a;

  font-family: inherit;
  font-size: 0.7rem;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;

  transition: background 0.15s ease;
}

.dismiss:hover {
  background: rgba(255, 255, 255, 0.16);
}

.dismiss:focus-visible {
  outline: 2px solid #ffb020;
  outline-offset: 2px;
}

/* Auf schmalen Geräten mittig und flacher, damit er nicht über den
   Bild-Export-Knopf ragt */
@media (max-width: 560px) {
  .preview-badge {
    right: 12px;
    left: 12px;
    bottom: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-badge {
    animation: none;
  }

  .dismiss {
    transition: none;
  }
}
</style>
