<script setup>
// Sicherheitsabfrage, die erscheint, bevor die aktuelle Tierlist geleert wird.
// "cancel" = Abbrechen-Button, "confirm" = wirklich leeren
import BaseModal from './BaseModal.vue'

defineEmits(['cancel', 'confirm'])
</script>

<template>
  <BaseModal
    title="Alles zurücksetzen?"
    :show-close="false"
    max-width="430px"
    @close="$emit('cancel')"
  >
    <p>Bist du sicher, dass du deine Tierlist zurücksetzen willst?</p>

    <div class="modal-actions">
      <button class="cancel-button" @click="$emit('cancel')">Abbrechen</button>

      <button class="confirm-button" @click="$emit('confirm')">Zurücksetzen</button>
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
  gap: 12px;
  margin-top: 26px;
}

.cancel-button,
.confirm-button {
  border: 0;
  border-radius: 14px;
  padding: 12px 16px;
  color: white;
  font-weight: 800;
  cursor: pointer;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
}

.confirm-button {
  background: linear-gradient(135deg, #ff5c5c, #ff2f6d);
}
</style>
