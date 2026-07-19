<template>
  <div class="tier-row">
    <!-- Das farbige Label links, z. B. "S", "A", "B" -->
    <div class="tier-label" :style="{ backgroundColor: color }">
      {{ name }}
    </div>

    <!--
      @dragover.prevent ist nötig, damit der Browser hier überhaupt ein
      "drop" erlaubt (sonst wird der Drop automatisch abgelehnt).
      @drop feuert, wenn eine Karte hier abgelegt wird.
    -->
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
// Eine einzelne Reihe der Tierlist (z. B. die "S"-Reihe) mit allen
// Items, die dort bereits einsortiert wurden.
import ItemCard from './ItemCard.vue'

defineProps({
  name: String,
  color: String,
  items: Array,
})

// drop-item: eine Karte wurde in diese Reihe gezogen
// drag-start: eine Karte aus dieser Reihe wird gerade gezogen (weg von hier)
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