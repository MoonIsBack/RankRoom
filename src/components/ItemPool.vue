<script setup>
// Der Pool unten mit allen Items, die noch keiner Tier-Reihe zugeordnet sind.
import ItemCard from "./ItemCard.vue";

defineProps({
  items: {
    type: Array,
    required: true,
  },
});

defineEmits(["delete-item", "drag-start", "drop-to-pool"]);
</script>

<template>
  <!-- Wird eine Karte aus einer Tier-Reihe hierher zurückgezogen, landet sie wieder im Pool -->
  <section class="item-pool" @dragover.prevent @drop="$emit('drop-to-pool')">
    <ItemCard
      v-for="item in items"
      :key="item.id"
      :name="item.name"
      @delete="$emit('delete-item', item.id)"
      @drag-start="$emit('drag-start', item)"
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
}
</style>