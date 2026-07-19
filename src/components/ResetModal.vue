<script setup>
// Sicherheitsabfrage, die erscheint, bevor die aktuelle Tierlist zurückgesetzt wird.
// "cancel" = Abbrechen-Button, "confirm" = wirklich zurücksetzen
defineEmits(['cancel', 'confirm'])
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Alles zurücksetzen?</h2>

      <p>Bist du sicher, dass du deine Tierlist zurücksetzen willst?</p>

      <div class="modal-actions">
        <button class="cancel-button" @click="$emit('cancel')">Abbrechen</button>

        <button class="confirm-button" @click="$emit('confirm')">Zurücksetzen</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(6px);
}

.modal {
  width: 100%;
  max-width: 430px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  background: linear-gradient(180deg, #1a1b25, #11121a);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
}

.modal h2 {
  margin: 0 0 10px;
  font-size: 1.65rem;
}

.modal p {
  margin: 0;
  color: #a8adbd;
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
