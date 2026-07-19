<template>
  <div class="tier-row">
    <!-- Das farbige Label links, z. B. "S", "A", "B" -->
    <div class="tier-label" :style="{ backgroundColor: color }">
      {{ name }}
    </div>

    <!--
      @dragover.prevent ist nötig, damit der Browser hier überhaupt ein
      "drop" erlaubt (sonst wird der Drop automatisch abgelehnt).
      @dragenter/@dragleave steuern die Hervorhebung, während man etwas
      darüber hält, @drop feuert, wenn eine Karte hier abgelegt wird.
    -->
    <div
      class="tier-content"
      :class="{ 'is-drag-over': isDragOver }"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover.prevent
      @drop="handleDrop"
    >
      <ItemCard
        v-for="item in items"
        :key="item.id"
        :name="item.name"
        :image="item.image"
        :show-delete="false"
        @drag-start="$emit('drag-start', item)"
      />

      <!-- Abgedunkelte Vorschau: zeigt genau, wo das gezogene Item landen
           würde, solange man es über dieser Reihe hält -->
      <ItemCard
        v-if="showGhost"
        :name="draggedItem.name"
        :image="draggedItem.image"
        :show-delete="false"
        ghost
      />
    </div>
  </div>
</template>

<script setup>
// Eine einzelne Reihe der Tierlist (z. B. die "S"-Reihe) mit allen
// Items, die dort bereits einsortiert wurden.
import { computed, ref } from 'vue'

import ItemCard from './ItemCard.vue'

const props = defineProps({
  name: String,
  color: String,
  items: Array,
  // Das Item, das gerade irgendwo auf der Seite gezogen wird (oder null,
  // wenn gerade nichts gezogen wird) — kommt von App.vue
  draggedItem: {
    type: Object,
    default: null,
  },
})

// drop-item: eine Karte wurde in diese Reihe gezogen
// drag-start: eine Karte aus dieser Reihe wird gerade gezogen (weg von hier)
const emit = defineEmits(['drop-item', 'drag-start'])

// Hebt die Reihe optisch hervor, solange etwas darüber gezogen wird
const isDragOver = ref(false)

// dragenter/dragleave feuern für jedes Kind-Element einzeln, deshalb zählen
// wir mit statt nur an/aus zu schalten (sonst flackert die Hervorhebung)
let dragCounter = 0

function handleDragEnter() {
  dragCounter++
  isDragOver.value = true
}

function handleDragLeave() {
  dragCounter = Math.max(0, dragCounter - 1)

  if (dragCounter === 0) {
    isDragOver.value = false
  }
}

function handleDrop() {
  dragCounter = 0
  isDragOver.value = false
  emit('drop-item')
}

// Vorschau nur zeigen, wenn wirklich etwas über dieser Reihe hängt UND das
// Item nicht schon hier drin ist (sonst gäbe es beim Drüberziehen über die
// eigene Reihe eine verwirrende doppelte Karte)
const showGhost = computed(() => {
  if (!isDragOver.value || !props.draggedItem) {
    return false
  }

  return !props.items.some((item) => item.id === props.draggedItem.id)
})
</script>

<style scoped>
.tier-row {
  display: flex;
  min-height: 96px;
}

.tier-row + .tier-row {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
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
  background: rgba(127, 156, 255, 0.1);
  box-shadow: inset 0 0 0 2px rgba(127, 156, 255, 0.45);
}

@media (max-width: 600px) {
  .tier-label {
    width: 64px;
    font-size: 20px;
  }
}
</style>
