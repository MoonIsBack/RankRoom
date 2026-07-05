<template>
  <div class="tier-row">
    <div class="tier-label" :style="{ backgroundColor: color }">
      {{ name }}
    </div>

    <div
      class="tier-content"
      @dragover.prevent
      @drop="$emit('drop-item')"
    >
      <ItemCard
        v-for="item in items"
        :key="item.id"
        :name="item.name"
        :show-delete="false"
        @drag-start="$emit('drag-start', item)"
      />
    </div>
  </div>
</template>

<script setup>
import ItemCard from './ItemCard.vue'

defineProps({
  name: String,
  color: String,
  items: Array,
})

defineEmits(['drop-item', 'drag-start'])
</script>

<style scoped>
.tier-row {
  display: flex;
  min-height: 90px;
  border-bottom: 2px solid #333;
}

.tier-label {
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111;
  font-size: 32px;
  font-weight: bold;
}

.tier-content {
  flex: 1;
  background: #1c1c1c;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
  flex-wrap: wrap;
}

.tier-content:hover {
  background: #252525;
}
</style>