<script setup>
// Popup zum Speichern der Tierlist als Bild — mit Vorschau und Formatwahl
// (JPG als Standard, PNG optional), ähnlich wie ein "Exportieren als…"-Dialog.
import { onMounted, ref } from 'vue'

import BaseModal from './BaseModal.vue'
import { renderTierListToCanvas, downloadTierListImage } from '../../utils/exportTierListImage'

const props = defineProps({
  tierList: {
    type: Object,
    required: true,
  },
})

defineEmits(['close'])

// Gewähltes Format — Standard ist JPG
const format = ref('jpg')
// Data-URL der Vorschau (PNG, nur zum Anzeigen)
const previewUrl = ref('')
// true, solange das Bild noch gezeichnet wird
const isRendering = ref(true)

// Das gezeichnete Canvas merken wir uns, um beim Download nicht neu rendern
// zu müssen (einfache Variable, muss nicht reaktiv sein).
let renderedCanvas = null

onMounted(async () => {
  renderedCanvas = await renderTierListToCanvas(props.tierList)
  previewUrl.value = renderedCanvas.toDataURL('image/png')
  isRendering.value = false
})

function download() {
  if (!renderedCanvas) {
    return
  }

  downloadTierListImage(renderedCanvas, format.value, props.tierList.name)
}
</script>

<template>
  <BaseModal label="RankRoom" title="Als Bild speichern" max-width="640px" @close="$emit('close')">
    <div class="preview">
      <p v-if="isRendering" class="preview-hint">Bild wird erstellt…</p>
      <img v-else :src="previewUrl" alt="Vorschau der Tierlist" />
    </div>

    <div class="format-row">
      <span class="format-label">Format</span>

      <div class="format-options">
        <button type="button" :class="{ active: format === 'jpg' }" @click="format = 'jpg'">
          JPG
        </button>
        <button type="button" :class="{ active: format === 'png' }" @click="format = 'png'">
          PNG
        </button>
      </div>
    </div>

    <div class="modal-actions">
      <button type="button" class="cancel-button" @click="$emit('close')">Abbrechen</button>

      <button type="button" class="download-button" :disabled="isRendering" @click="download">
        Herunterladen
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.preview {
  min-height: 160px;
  padding: 12px;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.25);

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: auto;
  max-height: 46vh;
}

.preview img {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
}

.preview-hint {
  margin: 0;
  color: var(--text-muted);
  font-weight: 600;
}

.format-row {
  margin-top: 18px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.format-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 800;
}

.format-options {
  display: flex;
  gap: 8px;

  padding: 4px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.format-options button {
  border: none;
  border-radius: 10px;
  padding: 8px 16px;

  background: transparent;
  color: var(--text-muted);

  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;

  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.format-options button.active {
  background: rgba(var(--accent-rgb), 0.22);
  color: var(--text);
}

.modal-actions {
  margin-top: 22px;

  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button,
.download-button {
  padding: 13px 18px;

  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(255, 255, 255, 0.055);
  color: var(--text-secondary);
}

.download-button {
  border: none;
  background: var(--accent-gradient);
  color: white;
}

.download-button:disabled {
  opacity: 0.5;
  cursor: default;
}

@media (max-width: 600px) {
  .modal-actions {
    flex-direction: column;
  }

  .cancel-button,
  .download-button {
    width: 100%;
  }
}
</style>
