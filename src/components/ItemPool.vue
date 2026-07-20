<script setup>
// Der Pool unten mit allen Items, die noch keiner Tier-Reihe zugeordnet sind.
import ItemCard from './ItemCard.vue'
import { useDragOver } from '../composables/useDragOver'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['delete-item', 'drag-start', 'drop-to-pool', 'rename-item'])

// Hebt den Pool optisch hervor, solange eine Item-Karte darüber gezogen wird.
// ignoreFiles: true -> beim Reinziehen von Dateien aus dem Ordner bleibt der
// Pool unmarkiert (dann zeigt nur das große Seiten-Overlay an, dass man ablegen kann).
const { isDragOver, onDragEnter, onDragLeave, reset } = useDragOver({ ignoreFiles: true })

function handleDrop() {
  reset()
  emit('drop-to-pool')
}
</script>

<template>
  <!-- Wird eine Karte aus einer Tier-Reihe hierher zurückgezogen, landet sie wieder im Pool -->
  <section
    class="item-pool"
    :class="{ 'is-drag-over': isDragOver }"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
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

    <!-- Hinweis, solange der Pool leer ist -->
    <p v-if="items.length === 0" class="empty-hint">
      Noch keine Items im Pool — füge welche hinzu oder ziehe Bilder hierher.
    </p>
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
  background: rgba(var(--accent-rgb), 0.08);
  border-color: rgba(var(--accent-rgb), 0.5);
}

.empty-hint {
  margin: auto;

  color: var(--text-subtle);
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;

  /* Der Hinweis soll das Ablegen von Karten/Bildern nicht abfangen */
  pointer-events: none;
}
</style>
