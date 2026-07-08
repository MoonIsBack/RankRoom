<template>
  <div class="page">
    <AppHeader />

    <main class="app">
      <HeroSection :total-items="totalItemCount" />

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
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

import AppHeader from "./components/AppHeader.vue";
import HeroSection from "./components/HeroSection.vue";
import TierRow from "./components/TierRow.vue";
import StatsGrid from "./components/StatsGrid.vue";
import AddItemForm from "./components/AddItemForm.vue";
import ResetModal from "./components/ResetModal.vue";
import ItemPool from "./components/ItemPool.vue";

import { defaultItems } from "./data/defaultItems";
import { defaultTiers } from "./data/defaultTiers";

import {
  saveTierList,
  loadTierList,
  clearTierListStorage,
} from "./storage/tierListStorage";

const savedTierList = loadTierList();

const tiers = ref(
  savedTierList ? savedTierList.tiers : structuredClone(defaultTiers)
);

const items = ref(
  savedTierList ? savedTierList.items : structuredClone(defaultItems)
);

const draggedItem = ref(null);
const draggedFromTier = ref(null);
const showResetModal = ref(false);

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

watch(
  [items, tiers],
  () => {
    saveTierList(items.value, tiers.value);
  },
  { deep: true }
);

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
  items.value = items.value.filter((item) => item.id !== itemId);
}

function startDrag(item) {
  draggedItem.value = item;
  draggedFromTier.value = null;
}

function startDragFromTier(item, tierName) {
  draggedItem.value = item;
  draggedFromTier.value = tierName;
}

function dropItem(tierName) {
  if (!draggedItem.value) {
    return;
  }

  const targetTier = tiers.value.find((tier) => tier.name === tierName);

  if (!targetTier) {
    return;
  }

  if (draggedFromTier.value) {
    const oldTier = tiers.value.find((tier) => tier.name === draggedFromTier.value);

    if (oldTier) {
      oldTier.items = oldTier.items.filter((item) => item.id !== draggedItem.value.id);
    }
  } else {
    items.value = items.value.filter((item) => item.id !== draggedItem.value.id);
  }

  targetTier.items.push(draggedItem.value);

  draggedItem.value = null;
  draggedFromTier.value = null;
}

function dropItemToPool() {
  if (!draggedItem.value) {
    return;
  }

  if (!draggedFromTier.value) {
    return;
  }

  const oldTier = tiers.value.find((tier) => tier.name === draggedFromTier.value);

  if (!oldTier) {
    return;
  }

  oldTier.items = oldTier.items.filter((item) => item.id !== draggedItem.value.id);

  items.value.push(draggedItem.value);

  draggedItem.value = null;
  draggedFromTier.value = null;
}

function openResetModal() {
  showResetModal.value = true;
}

function closeResetModal() {
  showResetModal.value = false;
}

function confirmReset() {
  clearTierListStorage();

  items.value = structuredClone(defaultItems);
  tiers.value = structuredClone(defaultTiers);

  draggedItem.value = null;
  draggedFromTier.value = null;

  showResetModal.value = false;
}
</script>

<style scoped>
.page {
  min-height: 100vh;

  background: radial-gradient(circle at top left,
      rgba(124, 58, 237, 0.2),
      transparent 34%),
    radial-gradient(circle at bottom right, rgba(37, 99, 235, 0.16), transparent 32%),
    #0b0b0f;

  color: white;
}

.app {
  min-height: 100vh;
  padding: 25px 40px 50px;
  color: white;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.tierlist {
  width: 100%;
  max-width: 1100px;
  overflow: hidden;

  margin-bottom: 24px;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 22px;

  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
}

.control-panel {
  width: 100%;
  max-width: 1100px;
  margin-bottom: 24px;
  padding: 18px;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 26px;

  background: rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(10px);

  display: flex;
  align-items: center;
  gap: 16px;
}

.reset-button {
  padding: 18px 22px;

  border: 1px solid rgba(255, 92, 92, 0.28);
  border-radius: 18px;

  background: rgba(255, 92, 92, 0.12);
  color: #ff9b9b;

  font-size: 1rem;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;

  transition: transform 0.15s ease, background 0.15s ease;
}

.reset-button:hover {
  transform: translateY(-1px);
  background: rgba(255, 92, 92, 0.18);
}

@media (max-width: 850px) {
  .app {
    padding: 30px 18px 50px;
  }

  .control-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .reset-button {
    width: 100%;
  }
}
</style>
