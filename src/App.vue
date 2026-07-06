<template>
  <main class="app">
    <header class="app-header">
      <div>
        <span class="app-badge">Tierlist Builder</span>
        <h1>RankRoom</h1>
        <p>Erstelle, sortiere und vergleiche deine eigenen Rankings.</p>
      </div>
    </header>

    <StatsGrid :total-items="totalItemCount" :ranked-items="rankedItemCount" :unranked-items="unrankedItemCount" />

    <section class="tierlist">
      <TierRow v-for="tier in tiers" :key="tier.name" :name="tier.name" :color="tier.color" :items="tier.items"
        @drop-item="dropItem(tier.name)" @drag-start="startDragFromTier($event, tier.name)" />
    </section>

    <section class="control-panel">
      <AddItemForm @add-item="addItem" />
      <button class="reset-button" @click="openResetModal">Zurücksetzen</button>
    </section>

    <ItemPool :items="items" @delete-item="deleteItem" @drag-start="startDrag" @drop-to-pool="dropItemToPool" />
    <ResetModal v-if="showResetModal" @cancel="closeResetModal" @confirm="confirmReset" />
  </main>
</template>

<script setup>
import { ref, computed } from "vue";
import TierRow from './components/TierRow.vue'
import StatsGrid from "./components/StatsGrid.vue";
import AddItemForm from "./components/AddItemForm.vue";
import ResetModal from "./components/ResetModal.vue";
import ItemPool from "./components/ItemPool.vue";

import { defaultItems } from "./data/defaultItems";
import { defaultTiers } from "./data/defaultTiers";

const tiers = ref(structuredClone(defaultTiers));
const items = ref(structuredClone(defaultItems));

const draggedItem = ref(null)
const draggedFromTier = ref(null)
const showResetModal = ref(false)

const rankedItemCount = computed(() => {
  return tiers.value.reduce((total, tier) => {
    return total + tier.items.length;
  }, 0);
});

const unrankedItemCount = computed(() => {
  return items.value.length;
});

const totalItemCount = computed(() => {
  return rankedItemCount.value + unrankedItemCount.value;
});

function addItem(itemName) {
  const trimmedName = itemName.trim();

  if (!trimmedName) {
    return;
  }

  const newItem = {
    id: Date.now(),
    name: trimmedName,
  };

  items.value.push(newItem);
}

function deleteItem(itemId) {
  items.value = items.value.filter((item) => item.id !== itemId)
}

function startDrag(item) {
  draggedItem.value = item
  draggedFromTier.value = null
}

function startDragFromTier(item, tierName) {
  draggedItem.value = item
  draggedFromTier.value = tierName
}

function dropItem(tierName) {
  if (!draggedItem.value) {
    return
  }

  const targetTier = tiers.value.find((tier) => tier.name === tierName)

  if (!targetTier) {
    return
  }

  if (draggedFromTier.value) {
    const oldTier = tiers.value.find((tier) => tier.name === draggedFromTier.value)

    if (oldTier) {
      oldTier.items = oldTier.items.filter((item) => item.id !== draggedItem.value.id)
    }
  } else {
    items.value = items.value.filter((item) => item.id !== draggedItem.value.id)
  }

  targetTier.items.push(draggedItem.value)

  draggedItem.value = null
  draggedFromTier.value = null
}

function dropItemToPool() {
  if (!draggedItem.value) {
    return
  }

  if (!draggedFromTier.value) {
    return
  }

  const oldTier = tiers.value.find((tier) => tier.name === draggedFromTier.value)

  if (!oldTier) {
    return
  }

  oldTier.items = oldTier.items.filter((item) => item.id !== draggedItem.value.id)

  items.value.push(draggedItem.value)

  draggedItem.value = null
  draggedFromTier.value = null
}

function openResetModal() {
  showResetModal.value = true
}

function closeResetModal() {
  showResetModal.value = false
}

function confirmReset() {
  items.value = structuredClone(defaultItems)
  tiers.value = structuredClone(defaultTiers)

  draggedItem.value = null
  draggedFromTier.value = null

  showResetModal.value = false
}

</script>

<style scoped>
.app {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(127, 156, 255, 0.18), transparent 35%),
    radial-gradient(circle at bottom right, rgba(255, 92, 92, 0.12), transparent 35%), #0b0b0f;
  color: white;
  padding: 40px;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-header {
  max-width: 1100px;
  margin-bottom: 30px;
  width: 100%;
}

.app-badge {
  display: inline-block;
  margin-bottom: 12px;
  padding: 7px 12px;
  border: 1px solid rgba(127, 156, 255, 0.35);
  border-radius: 999px;
  background: rgba(127, 156, 255, 0.12);
  color: #aebdff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

h1 {
  margin: 0;
  font-size: 56px;
  line-height: 1;
  letter-spacing: -2px;
}

p {
  margin-top: 12px;
  color: #a8a8b3;
  font-size: 18px;
}

.tierlist {
  width: 100%;
  max-width: 1100px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
  margin-bottom: 24px;
}

.control-panel {
  width: 100%;
  max-width: 1100px;
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(10px);

  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.input-group {
  display: flex;
  gap: 12px;
  flex: 1;
}

.reset-button {
  border: none;
  border-radius: 14px;
  padding: 14px 18px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;

  background: rgba(255, 92, 92, 0.12);
  color: #ff9b9b;
  border: 1px solid rgba(255, 92, 92, 0.28);
}

.reset-button:hover {
  transform: translateY(-1px);
  background: rgba(255, 92, 92, 0.18);
}

</style>
