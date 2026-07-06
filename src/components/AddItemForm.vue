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
        <input v-model="itemName" type="text" placeholder="Add new item..." @keyup.enter="submitItem" />

        <button @click="submitItem">Add Item</button>
    </div>
</template>

<style scoped>
.add-item-form {
    display: flex;
    align-items: center;
    gap: 12px;
}

.add-item-form input {
    flex: 1;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 14px 16px;
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
}

.add-item-form button {
    border: 0;
    border-radius: 16px;
    padding: 14px 18px;
    background: linear-gradient(135deg, #7f9cff, #8b5cf6);
    color: white;
    font-weight: 800;
    cursor: pointer;
}
</style>