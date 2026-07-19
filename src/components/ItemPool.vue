<script setup>
// Der Pool unten mit allen Items, die noch keiner Tier-Reihe zugeordnet sind.
import { ref } from 'vue'

import ItemCard from './ItemCard.vue'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['delete-item', 'drag-start', 'drop-to-pool', 'rename-item'])

// Hebt den Pool optisch hervor, solange etwas darüber gezogen wird
// (egal ob eine Item-Karte oder eine Bilddatei von außerhalb)
const isDragOver = ref(false)
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
  emit('drop-to-pool')
}
</script>

<template>
  <!-- Wird eine Karte aus einer Tier-Reihe hierher zurückgezogen, landet sie wieder im Pool -->
  <section
    class="item-pool"
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
      @delete="$emit('delete-item', item.id)"
      @drag-start="$emit('drag-start', item)"
      @rename="$emit('rename-item', item.id, $event)"
    />
  </section>
</template>

<style scoped>
.item-pool {
  width: 100%;
  max-width: 1100px;
  min-height: 120px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 22px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.035);

  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.item-pool.is-drag-over {
  background: rgba(127, 156, 255, 0.08);
  border-color: rgba(127, 156, 255, 0.5);
}
</style>
