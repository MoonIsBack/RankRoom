<script setup>
import { ref } from "vue";

const emit = defineEmits(["add-item"]);

const itemName = ref("");

function submitItem() {
    const trimmedName = itemName.value.trim();

    if (!trimmedName) {
        return;
    }

    emit("add-item", trimmedName);
    itemName.value = "";
}
</script>

<template>
    <div class="add-item-form">
        <input v-model="itemName" type="text" placeholder="Neues Item eingeben..." @keyup.enter="submitItem" />

        <button @click="submitItem">Hinzufügen</button>
    </div>
</template>

<style scoped>
.add-item-form {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.add-item-form input {
  width: 100%;
  min-width: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.06);
  color: white;
  font-size: 1rem;
  outline: none;
}

.add-item-form input::placeholder {
  color: #777d91;
}

.add-item-form input:focus {
  border-color: rgba(127, 156, 255, 0.55);
  box-shadow: 0 0 0 4px rgba(127, 156, 255, 0.12);
}

.add-item-form button {
  border: 0;
  border-radius: 18px;
  padding: 18px 24px;
  background: linear-gradient(135deg, #7f9cff, #8b5cf6);
  color: white;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.add-item-form button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 32px rgba(127, 156, 255, 0.28);
}
</style>