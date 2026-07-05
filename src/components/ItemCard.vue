<template>
  <div class="item-card" draggable="true" @dragstart="$emit('drag-start')">
    <button v-if="showDelete" class="delete-button" @click="$emit('delete')">×</button>

    <span>{{ name }}</span>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  showDelete: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["delete", "drag-start"]);
</script>

<style scoped>
.item-card {
  position: relative;
  width: 100px;
  height: 100px;
  background: #2a2a2a;
  border: 2px solid #444;
  border-radius: 8px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: white;
  font-weight: bold;
  text-align: center;
  padding: 10px;
}

.delete-button {
  position: absolute;
  top: 4px;
  right: 6px;

  background: #ff5c5c;
  color: white;
  border: none;
  border-radius: 50%;

  width: 22px;
  height: 22px;
  cursor: pointer;
  font-weight: bold;
}

.delete-button:hover {
  background: #ff2f2f;
}
</style>
