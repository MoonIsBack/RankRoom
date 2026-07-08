<template>
  <div class="modal-backdrop" @click="$emit('close')">
    <form class="new-tierlist-modal" @click.stop @submit.prevent="createTierList">
      <div class="modal-header">
        <div>
          <p class="modal-label">RankRoom</p>
          <h2>Neue Tierlist</h2>
        </div>

        <button type="button" class="close-button" @click="$emit('close')">
          ✕
        </button>
      </div>

      <label class="input-label" for="tierlist-name">
        Name der Tierlist
      </label>

      <input
        id="tierlist-name"
        v-model="tierListName"
        class="name-input"
        type="text"
        placeholder="z. B. Lieblingsgames"
        autofocus
      />

      <div class="modal-actions">
        <button type="button" class="cancel-button" @click="$emit('close')">
          Abbrechen
        </button>

        <button type="submit" class="create-button">
          Erstellen
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["close", "create"]);

const tierListName = ref("");

function createTierList() {
  const trimmedName = tierListName.value.trim();

  if (!trimmedName) {
    return;
  }

  emit("create", trimmedName);
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;

  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(8px);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;
}

.new-tierlist-modal {
  width: 100%;
  max-width: 500px;
  padding: 24px;

  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 28px;

  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)),
    #101016;

  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
  color: white;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  margin-bottom: 22px;
}

.modal-label {
  margin: 0 0 6px;

  color: #9ca3af;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.modal-header h2 {
  margin: 0;

  font-size: 2rem;
  letter-spacing: -0.06em;
}

.close-button {
  width: 44px;
  height: 44px;

  border: none;
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.075);
  color: white;

  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
}

.input-label {
  display: block;
  margin-bottom: 9px;

  color: #cbd5e1;
  font-size: 0.9rem;
  font-weight: 800;
}

.name-input {
  width: 100%;
  padding: 16px 18px;

  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 18px;

  background: rgba(255, 255, 255, 0.055);
  color: white;

  font-size: 1rem;
  font-weight: 700;
  outline: none;
}

.name-input::placeholder {
  color: #6b7280;
}

.name-input:focus {
  border-color: rgba(167, 139, 250, 0.45);
  background: rgba(255, 255, 255, 0.075);
}

.modal-actions {
  margin-top: 22px;

  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button,
.create-button {
  padding: 13px 18px;

  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(255, 255, 255, 0.055);
  color: #d1d5db;
}

.create-button {
  border: none;
  background: white;
  color: #0b0b0f;
}

@media (max-width: 600px) {
  .new-tierlist-modal {
    padding: 20px;
  }

  .modal-header h2 {
    font-size: 1.55rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .cancel-button,
  .create-button {
    width: 100%;
  }
}
</style>