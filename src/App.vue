<template>
  <main class="app">
    <header class="app-header">
      <div>
        <span class="app-badge">Tierlist Builder</span>
        <h1>RankRoom</h1>
        <p>Erstelle, sortiere und vergleiche deine eigenen Rankings.</p>
      </div>
    </header>

    <section class="tierlist">
      <TierRow
        v-for="tier in tiers"
        :key="tier.name"
        :name="tier.name"
        :color="tier.color"
        :items="tier.items"
        @drop-item="dropItem(tier.name)"
        @drag-start="startDragFromTier($event, tier.name)"
      />
    </section>

    <section class="control-panel">
      <div class="input-group">
        <input
          v-model="newItemName"
          @keyup.enter="addItem"
          type="text"
          placeholder="Neues Item eingeben..."
        />

        <button class="add-button" @click="addItem">+ Hinzufügen</button>
      </div>

      <button class="reset-button" @click="openResetModal">Zurücksetzen</button>
    </section>

    <section class="item-pool" @dragover.prevent @drop="dropItemToPool">
      <ItemCard
        v-for="item in items"
        :key="item.id"
        :name="item.name"
        @delete="deleteItem(item.id)"
        @drag-start="startDrag(item)"
      />
    </section>
    <div v-if="showResetModal" class="modal-overlay">
      <div class="modal">
        <h2>Alles zurücksetzen?</h2>
        <p>Bist du sicher, dass du deine Tierlist zurücksetzen willst?</p>

        <div class="modal-actions">
          <button class="cancel-button" @click="closeResetModal">Abbrechen</button>

          <button class="confirm-button" @click="confirmReset">Zurücksetzen</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import TierRow from "./components/TierRow.vue";
import ItemCard from "./components/ItemCard.vue";

const tiers = ref([
  { name: "S", color: "#ff7f7f", items: [] },
  { name: "A", color: "#ffbf7f", items: [] },
  { name: "B", color: "#ffdf7f", items: [] },
  { name: "C", color: "#ffff7f", items: [] },
  { name: "D", color: "#bfff7f", items: [] },
]);

const defaultItems = [
  { id: 1, name: "FabFilter" },
  { id: 2, name: "UAD" },
  { id: 3, name: "Waves" },
  { id: 4, name: "Soundtoys" },
  { id: 5, name: "Antares" },
];

const items = ref([...defaultItems]);

const newItemName = ref("");
const draggedItem = ref(null);
const draggedFromTier = ref(null);
const showResetModal = ref(false);

function addItem() {
  if (newItemName.value.trim() === "") {
    return;
  }

  const newItem = {
    id: Date.now(),
    name: newItemName.value,
  };

  items.value.push(newItem);

  newItemName.value = "";
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
  items.value = [...defaultItems];

  tiers.value.forEach((tier) => {
    tier.items = [];
  });

  newItemName.value = "";
  draggedItem.value = null;
  draggedFromTier.value = null;

  showResetModal.value = false;
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: radial-gradient(
      circle at top left,
      rgba(127, 156, 255, 0.18),
      transparent 35%
    ),
    radial-gradient(circle at bottom right, rgba(255, 92, 92, 0.12), transparent 35%),
    #0b0b0f;
  color: white;
  padding: 40px;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

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

.input-group input {
  width: 100%;
  max-width: 360px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.28);
  color: white;
  font-size: 15px;
  outline: none;
}

.input-group input:focus {
  border-color: rgba(127, 156, 255, 0.75);
  box-shadow: 0 0 0 4px rgba(127, 156, 255, 0.12);
}

.input-group input::placeholder {
  color: #777786;
}

.add-button,
.reset-button {
  border: none;
  border-radius: 14px;
  padding: 14px 18px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.add-button {
  background: linear-gradient(135deg, #7f9cff, #9d7fff);
  color: white;
  box-shadow: 0 10px 25px rgba(127, 156, 255, 0.25);
}

.add-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 32px rgba(127, 156, 255, 0.35);
}

.reset-button {
  background: rgba(255, 92, 92, 0.12);
  color: #ff9b9b;
  border: 1px solid rgba(255, 92, 92, 0.28);
}

.reset-button:hover {
  transform: translateY(-1px);
  background: rgba(255, 92, 92, 0.18);
}

.item-pool {
  max-width: 1100px;
  min-height: 130px;
  padding: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.035);

  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(6px);

  display: grid;
  place-items: center;
  z-index: 1000;
}

.modal {
  width: 420px;
  background: linear-gradient(180deg, #202020, #151515);
  border: 1px solid #3a3a3a;
  border-radius: 22px;
  padding: 32px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.75);
}

.modal h2 {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #ffffff;
}

.modal p {
  margin: 0 0 28px;
  color: #b8b8b8;
  font-size: 17px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal button {
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease, opacity 0.15s ease;
}

.modal button:hover {
  transform: translateY(-1px);
}

.cancel-button {
  background: #2d2d2d;
  color: #ffffff;
}

.cancel-button:hover {
  background: #3a3a3a;
}

.confirm-button {
  background: #ff4d4d;
  color: #ffffff;
}

.confirm-button:hover {
  background: #ff6868;
}
</style>
