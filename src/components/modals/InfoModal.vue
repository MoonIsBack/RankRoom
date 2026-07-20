<script setup>
// Einfaches Hinweis-Popup mit Titel + Nachricht + "Verstanden"-Knopf.
// Wird z. B. genutzt, wenn eine importierte JSON-Datei ungültig ist.
import BaseModal from './BaseModal.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
})

defineEmits(['close'])
</script>

<template>
  <BaseModal :title="title" :show-close="false" max-width="420px" @close="$emit('close')">
    <p>{{ message }}</p>

    <div class="modal-actions">
      <button class="confirm-button" @click="$emit('close')">Verstanden</button>
    </div>
  </BaseModal>
</template>

<style scoped>
p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 26px;
}

.confirm-button {
  border: 0;
  border-radius: 14px;
  padding: 12px 20px;
  color: white;
  font-weight: 800;
  cursor: pointer;
  background: var(--accent-gradient);
}
</style>
