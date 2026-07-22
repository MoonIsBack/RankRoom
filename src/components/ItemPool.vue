<script setup>
// Der Pool unten mit allen Items, die noch keiner Tier-Reihe zugeordnet sind.
import { computed } from 'vue'

import ItemCard from './ItemCard.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  // Das Item, das gerade irgendwo auf der Seite gezogen wird (oder null)
  draggedItem: {
    type: Object,
    default: null,
  },
  // Wo ein gezogenes Item gerade landen würde: { zone, index } oder null
  dropTarget: {
    type: Object,
    default: null,
  },
  // Funktion, die für eine item-id die Start-Verzögerung der "neu"-Animation
  // liefert (oder null, wenn das Item nicht frisch hinzugekommen ist).
  // Siehe useRecentlyAdded.js.
  highlightDelayFor: {
    type: Function,
    default: () => null,
  },
})

defineEmits(['delete-item', 'pointer-down-item', 'rename-item'])

// Hebt den Pool optisch hervor, solange eine Item-Karte darüber gezogen wird
const isDragOver = computed(() => props.dropTarget?.zone === 'pool')
</script>

<template>
  <!--
    data-drop-zone="pool" identifiziert den Pool fürs Item-Drag-Hit-Testing
    (siehe usePointerDrag.js). Die eigentliche Drop-Logik läuft komplett
    dort — hier wird nur noch angezeigt, WAS gerade berechnet wurde.
  -->
  <section class="item-pool" :class="{ 'is-drag-over': isDragOver }" data-drop-zone="pool">
    <ItemCard
      v-for="item in items"
      :key="item.id"
      :item-id="item.id"
      :name="item.name"
      :image="item.image"
      :dimmed="draggedItem?.id === item.id"
      :highlight-delay="highlightDelayFor(item.id)"
      @delete="$emit('delete-item', item.id)"
      @pointer-down="$emit('pointer-down-item', { item, event: $event })"
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
