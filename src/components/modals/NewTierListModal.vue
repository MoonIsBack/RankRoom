<script setup>
// Modal (Popup-Fenster), um eine neue, leere Tierlist mit eigenem Namen zu erstellen.
import { onMounted, ref } from 'vue'

import BaseModal from './BaseModal.vue'

const emit = defineEmits(['close', 'create'])

// Der Name, den der Nutzer im Eingabefeld tippt
const tierListName = ref('')

// Referenz auf das Eingabefeld, um es beim Öffnen automatisch zu fokussieren
const nameInputRef = ref(null)

// Sobald das Modal erscheint, direkt den Cursor ins Textfeld setzen,
// damit man sofort lostippen kann (ohne erst reinklicken zu müssen)
onMounted(() => {
  nameInputRef.value?.focus()
})

function createTierList() {
  const trimmedName = tierListName.value.trim()

  // Ohne Namen wird keine Tierlist erstellt
  if (!trimmedName) {
    return
  }

  // App.vue erstellt die eigentliche neue Tierlist mit diesem Namen
  emit('create', trimmedName)
}
</script>

<template>
  <BaseModal label="RankRoom" title="Neue Tierlist" max-width="500px" @close="$emit('close')">
    <!-- @submit.prevent löst createTierList auch bei Enter im Eingabefeld aus -->
    <form @submit.prevent="createTierList">
      <label class="input-label" for="tierlist-name">Name der Tierlist</label>

      <input
        id="tierlist-name"
        ref="nameInputRef"
        v-model="tierListName"
        class="name-input"
        type="text"
        placeholder="z. B. Lieblingsgames"
      />

      <div class="modal-actions">
        <button type="button" class="cancel-button" @click="$emit('close')">Abbrechen</button>

        <button type="submit" class="create-button">Erstellen</button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.input-label {
  display: block;
  margin-bottom: 9px;

  color: var(--text-secondary);
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
  color: var(--text-subtle);
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
  color: var(--text-secondary);
}

.create-button {
  border: none;
  background: white;
  color: #0b0b0f;
}

@media (max-width: 600px) {
  .modal-actions {
    flex-direction: column;
  }

  .cancel-button,
  .create-button {
    width: 100%;
  }
}
</style>
