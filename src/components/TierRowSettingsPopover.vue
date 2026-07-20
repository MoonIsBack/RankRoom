<script setup>
// Kleines, an das Zahnrad-Icon einer Tier-Reihe verankertes Popover
// (statt eines zentrierten Modals) zum Umbenennen, Farbe ändern und
// Löschen einer Reihe.
//
// Wird per Teleport direkt an <body> gehängt, damit es nicht vom
// overflow:hidden des Tierlist-Kastens abgeschnitten wird, und über
// anchorRect (die Position des Zahnrad-Buttons, von TierRow gemessen)
// in dessen Nähe positioniert.
import { computed, onMounted, ref } from 'vue'

import { TIER_COLOR_PALETTE } from '../data/tierColors'

const props = defineProps({
  tierName: {
    type: String,
    required: true,
  },
  tierColor: {
    type: String,
    required: true,
  },
  canDelete: {
    type: Boolean,
    default: true,
  },
  anchorRect: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'rename', 'change-color', 'delete'])

const editedName = ref(props.tierName)
const nameInputRef = ref(null)
// Solange true, wird statt "Reihe löschen" die Rückfrage angezeigt
const pendingDelete = ref(false)

onMounted(() => {
  nameInputRef.value?.focus()
  nameInputRef.value?.select()
})

function submitRename() {
  const trimmedName = editedName.value.trim()

  if (trimmedName && trimmedName !== props.tierName) {
    emit('rename', trimmedName)
  }
}

// Positioniert das Popover unterhalb (oder, wenn dort kein Platz ist,
// oberhalb) des Zahnrad-Buttons, immer innerhalb des sichtbaren Bereichs
const style = computed(() => {
  if (!props.anchorRect) {
    return {}
  }

  const POPOVER_WIDTH = 260
  const ESTIMATED_HEIGHT = 300
  const MARGIN = 12

  let left = props.anchorRect.right - POPOVER_WIDTH
  left = Math.max(MARGIN, Math.min(left, window.innerWidth - POPOVER_WIDTH - MARGIN))

  let top = props.anchorRect.bottom + 8
  if (top + ESTIMATED_HEIGHT > window.innerHeight - MARGIN) {
    top = props.anchorRect.top - ESTIMATED_HEIGHT - 8
  }
  top = Math.max(MARGIN, top)

  return { left: `${left}px`, top: `${top}px` }
})
</script>

<template>
  <Teleport to="body">
    <div class="popover-overlay" @click="$emit('close')" />

    <div class="row-settings-popover" :style="style" @click.stop>
      <label class="field-label" for="tier-name-input">Name</label>
      <input
        id="tier-name-input"
        ref="nameInputRef"
        v-model="editedName"
        type="text"
        class="name-input"
        @keyup.enter="submitRename"
        @blur="submitRename"
      />

      <p class="field-label">Farbe</p>
      <div class="color-swatches">
        <button
          v-for="swatch in TIER_COLOR_PALETTE"
          :key="swatch"
          type="button"
          class="color-swatch"
          :class="{ active: swatch.toLowerCase() === tierColor.toLowerCase() }"
          :style="{ backgroundColor: swatch }"
          :aria-label="`Farbe ${swatch}`"
          @click="$emit('change-color', swatch)"
        />

        <label class="color-swatch custom-swatch" :style="{ backgroundColor: tierColor }">
          <input
            type="color"
            :value="tierColor"
            @input="$emit('change-color', $event.target.value)"
          />
        </label>
      </div>

      <div class="popover-footer">
        <template v-if="pendingDelete">
          <span class="confirm-text">Reihe wirklich löschen?</span>
          <div class="confirm-actions">
            <button type="button" class="cancel-delete-button" @click="pendingDelete = false">
              Abbrechen
            </button>
            <button type="button" class="confirm-delete-button" @click="$emit('delete')">
              Löschen
            </button>
          </div>
        </template>

        <button
          v-else
          type="button"
          class="delete-row-button"
          :disabled="!canDelete"
          :title="canDelete ? '' : 'Mindestens eine Reihe muss übrig bleiben'"
          @click="pendingDelete = true"
        >
          Reihe löschen
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.popover-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
}

.row-settings-popover {
  position: fixed;
  z-index: 201;
  width: 260px;

  padding: 16px;

  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 20px;

  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)), #101016;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);

  color: white;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;

  animation: popover-pop-in 0.16s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popover-pop-in {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.field-label {
  margin: 0 0 8px;

  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.name-input {
  width: 100%;
  margin-bottom: 16px;
  padding: 10px 12px;

  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 12px;

  background: rgba(255, 255, 255, 0.055);
  color: white;

  font-size: 0.9rem;
  font-weight: 700;
  outline: none;
}

.name-input:focus {
  border-color: rgba(var(--accent-rgb), 0.45);
  background: rgba(255, 255, 255, 0.075);
}

.color-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.color-swatch {
  width: 24px;
  height: 24px;

  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: transform 0.12s ease;
}

.color-swatch:hover {
  transform: scale(1.12);
}

.color-swatch.active {
  border-color: white;
}

.custom-swatch {
  border: 2px dashed rgba(255, 255, 255, 0.4);
  overflow: hidden;
}

.custom-swatch input[type='color'] {
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  opacity: 0;
  cursor: pointer;
}

.popover-footer {
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.delete-row-button {
  width: 100%;
  padding: 10px 14px;

  border: 1px solid rgba(255, 92, 92, 0.28);
  border-radius: 12px;

  background: rgba(255, 92, 92, 0.12);
  color: #ff9b9b;

  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;

  transition: background 0.15s ease;
}

.delete-row-button:hover:not(:disabled) {
  background: rgba(255, 92, 92, 0.2);
}

.delete-row-button:disabled {
  opacity: 0.4;
  cursor: default;
}

.confirm-text {
  display: block;
  margin-bottom: 10px;

  color: #ffcaca;
  font-size: 0.85rem;
  font-weight: 700;
}

.confirm-actions {
  display: flex;
  gap: 8px;
}

.cancel-delete-button,
.confirm-delete-button {
  flex: 1;
  padding: 9px 10px;

  border: none;
  border-radius: 10px;

  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
}

.cancel-delete-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.cancel-delete-button:hover {
  background: rgba(255, 255, 255, 0.16);
}

.confirm-delete-button {
  background: linear-gradient(135deg, #ff5c5c, #ff2f6d);
  color: white;
}
</style>
