<template>
  <div
    class="tier-row"
    :data-row-index="rowIndex"
    :class="{ 'is-row-dragging': draggedRowIndex === rowIndex }"
  >
    <!-- Erscheint über der Reihe, während eine andere Reihe genau hierhin
         gezogen wird (siehe useRowPointerDrag.js) -->
    <div v-if="rowDropIndex === rowIndex" class="row-insert-line" />

    <!-- Sehr schmaler Griff zum Verschieben ganzer Reihen. Die sichtbare
         Linie ist bewusst kaum zu erkennen, der Button selbst aber breiter,
         damit er auf dem Handy trotzdem gut zu treffen ist. -->
    <button
      type="button"
      class="row-handle"
      aria-label="Reihe verschieben"
      @pointerdown="$emit('row-pointer-down', $event)"
    >
      <span class="row-handle-bar"></span>
    </button>

    <div class="tier-label" :style="{ backgroundColor: color }">
      {{ name }}
    </div>

    <!--
      data-drop-zone identifiziert diese Reihe fürs Item-Drag-Hit-Testing
      (siehe usePointerDrag.js). Die eigentliche Drop-Logik läuft komplett
      dort — hier wird nur noch angezeigt, WAS gerade berechnet wurde.
    -->
    <div class="tier-content" :class="{ 'is-drag-over': isDropZone }" :data-drop-zone="tierId">
      <template v-for="(item, index) in items" :key="item.id">
        <Transition name="gap">
          <div v-if="showGapAt(index)" class="insert-gap" />
        </Transition>

        <ItemCard
          :item-id="item.id"
          :name="item.name"
          :image="item.image"
          :show-delete="false"
          :dimmed="draggedItemId === item.id"
          @pointer-down="$emit('pointer-down-item', { item, event: $event })"
        />
      </template>

      <Transition name="gap">
        <div v-if="showGapAt(items.length)" class="insert-gap" />
      </Transition>
    </div>

    <button
      ref="settingsButtonRef"
      type="button"
      class="row-settings-button"
      aria-label="Reihen-Einstellungen"
      @click="openSettings"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        />
      </svg>
    </button>

    <TierRowSettingsPopover
      v-if="isSettingsOpen"
      :tier-name="name"
      :tier-color="color"
      :can-delete="canDeleteTierRow"
      :anchor-rect="settingsAnchorRect"
      @close="isSettingsOpen = false"
      @rename="$emit('rename-tier', $event)"
      @change-color="$emit('change-tier-color', $event)"
      @delete="$emit('delete-tier')"
    />
  </div>
</template>

<script setup>
// Eine einzelne Reihe der Tierlist (z. B. die "S"-Reihe) mit allen
// Items, die dort bereits einsortiert wurden, plus Griff zum Verschieben
// der ganzen Reihe und Zahnrad für Name/Farbe/Löschen.
import { computed, ref } from 'vue'

import ItemCard from './ItemCard.vue'
import TierRowSettingsPopover from './TierRowSettingsPopover.vue'

const props = defineProps({
  tierId: String,
  name: String,
  color: String,
  items: Array,
  // Position dieser Reihe in tiers[] — fürs Reihen-Reorder (data-row-index)
  rowIndex: Number,
  // id des Items, das gerade irgendwo auf der Seite gezogen wird (oder null)
  draggedItemId: {
    type: String,
    default: null,
  },
  // Wo ein gezogenes Item gerade landen würde: { zone, index } oder null
  dropTarget: {
    type: Object,
    default: null,
  },
  // Index der Reihe, die gerade verschoben wird (oder null)
  draggedRowIndex: {
    type: Number,
    default: null,
  },
  // Index, an dem eine verschobene Reihe gerade landen würde (oder null)
  rowDropIndex: {
    type: Number,
    default: null,
  },
  // Ob die Reihe gelöscht werden darf (mind. eine Reihe muss übrig bleiben)
  canDeleteTierRow: Boolean,
})

defineEmits([
  'pointer-down-item',
  'row-pointer-down',
  'rename-tier',
  'change-tier-color',
  'delete-tier',
])

// Steuert, ob das Reihen-Einstellungen-Popover gerade offen ist
const isSettingsOpen = ref(false)
// Referenz auf den Zahnrad-Button, um das Popover in seiner Nähe zu positionieren
const settingsButtonRef = ref(null)
// Position des Zahnrad-Buttons im Moment des Öffnens (das Popover wird per
// Teleport an <body> gehängt, damit es nicht vom overflow:hidden des
// Tierlist-Kastens abgeschnitten wird — dafür braucht es diese Koordinaten)
const settingsAnchorRect = ref(null)

function openSettings() {
  settingsAnchorRect.value = settingsButtonRef.value.getBoundingClientRect()
  isSettingsOpen.value = true
}

// Wird die ganze Reihe optisch hervorgehoben, weil gerade ein Item hierher
// gezogen wird?
const isDropZone = computed(() => props.dropTarget?.zone === props.tierId)

// Soll an dieser Stelle (vor Karte "index", oder nach der letzten bei
// index === items.length) die Einfüge-Lücke angezeigt werden?
function showGapAt(index) {
  return props.dropTarget?.zone === props.tierId && props.dropTarget?.index === index
}
</script>

<style scoped>
.tier-row {
  position: relative;
  display: flex;
  min-height: 96px;
}

.tier-row + .tier-row {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.tier-row.is-row-dragging {
  opacity: 0.45;
}

.row-insert-line {
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  z-index: 5;

  height: 3px;
  border-radius: 999px;
  background: var(--accent);
}

/* Griff zum Verschieben der ganzen Reihe: der Button ist breit genug, um ihn
   auch mit dem Finger gut zu treffen, die sichtbare Linie darin bleibt aber
   bewusst sehr schmal und dezent (kaum erkennbar, bis man genau hinschaut). */
.row-handle {
  flex-shrink: 0;
  width: 22px;

  border: none;
  background: transparent;
  cursor: grab;

  display: flex;
  align-items: center;
  justify-content: center;

  touch-action: none;
}

.row-handle:active {
  cursor: grabbing;
}

.row-handle-bar {
  width: 3px;
  height: 28px;
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.14);
  transition: background 0.15s ease;
}

.row-handle:hover .row-handle-bar {
  background: rgba(255, 255, 255, 0.32);
}

.tier-label {
  width: 100px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: inset -12px 0 24px rgba(0, 0, 0, 0.12);

  color: rgba(0, 0, 0, 0.75);
  font-size: 26px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.tier-content {
  flex: 1;
  min-width: 0;

  background: rgba(255, 255, 255, 0.015);

  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px;

  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.tier-content.is-drag-over {
  background: rgba(var(--accent-rgb), 0.1);
  box-shadow: inset 0 0 0 2px rgba(var(--accent-rgb), 0.45);
}

.insert-gap {
  width: 6px;
  align-self: stretch;
  flex-shrink: 0;

  border-radius: 999px;
  background: var(--accent);
}

.gap-enter-active,
.gap-leave-active {
  transition: opacity 0.12s ease;
}

.gap-enter-from,
.gap-leave-to {
  opacity: 0;
}

.row-settings-button {
  flex-shrink: 0;
  width: 40px;

  border: none;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.row-settings-button svg {
  width: 17px;
  height: 17px;
}

.row-settings-button:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 600px) {
  .tier-label {
    width: 64px;
    font-size: 20px;
  }

  .row-handle {
    width: 18px;
  }

  .row-settings-button {
    width: 34px;
  }
}
</style>
