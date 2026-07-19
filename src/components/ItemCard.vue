<template>
  <!-- draggable="true" macht die Karte per Maus ziehbar (Drag & Drop) -->
  <div class="item-card" draggable="true" @dragstart="$emit('drag-start')">
    <!-- Der Löschen-Button (×) wird nur im Item-Pool angezeigt, nicht in den Tier-Reihen -->
    <button v-if="showDelete" class="delete-button" @click="$emit('delete')">×</button>

    <span>{{ name }}</span>
  </div>
</template>

<script setup>
// Eine einzelne Item-Karte (z. B. "Waves"), die sowohl im Item-Pool
// als auch in den Tier-Reihen (S, A, B, ...) verwendet wird.
defineProps({
  name: String,
  // showDelete steuert, ob der ×-Button angezeigt wird.
  // Im Pool: true (löschbar), in Tier-Reihen: false (nur verschiebbar)
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
