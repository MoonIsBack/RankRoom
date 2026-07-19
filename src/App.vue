<template>
  <div class="page">
    <AppHeader @open-saved-lists="openSavedListsModal" @new-tier-list="openNewTierListModal" />

    <main class="app">
      <HeroSection :total-items="totalItemCount" />

      <StatsGrid :total-items="totalItemCount" :ranked-items="rankedItemCount" :unranked-items="unrankedItemCount" />

      <!-- Eine TierRow pro Tier (S, A, B, C, D) der aktiven Tierlist -->
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
      <SavedListsModal v-if="showSavedListsModal" :saved-lists="savedLists" @close="closeSavedListsModal"
        @open-list="openTierList" @delete-list="deleteTierList" />
      <NewTierListModal v-if="showNewTierListModal" @close="closeNewTierListModal" @create="createNewTierList" />
    </main>
  </div>
</template>

<script setup>
// App.vue steckt hier nur noch die Bausteine zusammen: Sie holt sich den
// kompletten Tierlisten-Zustand aus useTierLists() und die Drag & Drop-Logik
// aus useDragAndDrop() und reicht beides an die Komponenten weiter.
import { ref } from "vue";

import AppHeader from "./components/AppHeader.vue";
import HeroSection from "./components/HeroSection.vue";
import TierRow from "./components/TierRow.vue";
import StatsGrid from "./components/StatsGrid.vue";
import AddItemForm from "./components/AddItemForm.vue";
import ResetModal from "./components/ResetModal.vue";
import SavedListsModal from "./components/SavedListsModal.vue";
import NewTierListModal from "./components/NewTierListModal.vue";
import ItemPool from "./components/ItemPool.vue";

import { useTierLists } from "./composables/useTierLists";
import { useDragAndDrop } from "./composables/useDragAndDrop";

// Alles rund um Tierlisten (laden, speichern, erstellen, löschen, Items verwalten).
// Die Funktionen mit "as ...Store" werden gleich noch um Drag-Reset und
// Modal-Schließen ergänzt, deshalb bekommen sie hier interne Namen.
const {
  items,
  tiers,
  rankedItemCount,
  unrankedItemCount,
  totalItemCount,
  savedLists,
  addItem,
  deleteItem,
  deleteTierList,
  createNewTierList: createTierListInStore,
  confirmReset: resetTierListInStore,
  openTierList: openTierListInStore,
} = useTierLists();

// Drag & Drop braucht Zugriff auf items/tiers der aktiven Tierlist von oben
const { startDrag, startDragFromTier, dropItem, dropItemToPool, resetDrag } =
  useDragAndDrop(items, tiers);

// Steuert, welches Modal (Popup) gerade sichtbar ist
const showResetModal = ref(false);
const showSavedListsModal = ref(false);
const showNewTierListModal = ref(false);

// --- Reset-Modal (Tierlist zurücksetzen) ---
function openResetModal() {
  showResetModal.value = true;
}

function closeResetModal() {
  showResetModal.value = false;
}

// --- "Gespeicherte Tierlists"-Modal ---
function openSavedListsModal() {
  showSavedListsModal.value = true;
}

function closeSavedListsModal() {
  showSavedListsModal.value = false;
}

// --- "Neue Tierlist"-Modal ---
function openNewTierListModal() {
  showNewTierListModal.value = true;
}

function closeNewTierListModal() {
  showNewTierListModal.value = false;
}

// Neue Tierlist erstellen, laufenden Drag abbrechen und Modal schließen
function createNewTierList(newName) {
  createTierListInStore(newName);
  resetDrag();
  showNewTierListModal.value = false;
}

// Aktive Tierlist zurücksetzen, laufenden Drag abbrechen und Modal schließen
function confirmReset() {
  resetTierListInStore();
  resetDrag();
  showResetModal.value = false;
}

// Zu einer anderen gespeicherten Tierlist wechseln, laufenden Drag abbrechen
// und das "Gespeicherte Tierlists"-Modal schließen
function openTierList(tierListId) {
  openTierListInStore(tierListId);
  resetDrag();
  showSavedListsModal.value = false;
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
