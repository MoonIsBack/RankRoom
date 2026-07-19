<script setup>
// Popup, das erscheint, wenn beim Hinzufügen von Bildern eine Datei dabei war,
// die kein PNG oder JPG ist (z. B. beim Drag & Drop, wo es keine automatische
// Sperre wie im Datei-Auswahl-Fenster gibt).
defineProps({
  fileNames: {
    type: Array,
    required: true,
  },
})

defineEmits(['close'])
</script>

<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h2>Falsches Dateiformat</h2>

      <p>
        Es werden nur PNG- und JPG-Bilder unterstützt. Diese Datei(en) wurden deshalb nicht
        hinzugefügt:
      </p>

      <ul class="file-list">
        <li v-for="fileName in fileNames" :key="fileName">{{ fileName }}</li>
      </ul>

      <div class="modal-actions">
        <button class="confirm-button" @click="$emit('close')">Verstanden</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
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

.file-list {
  margin: 14px 0 0;
  padding: 12px 16px;

  max-height: 160px;
  overflow-y: auto;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);

  list-style: none;
}

.file-list li {
  color: #ffb4b4;
  font-size: 0.9rem;
  font-weight: 700;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-list li + li {
  margin-top: 6px;
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
  background: linear-gradient(135deg, #7f9cff, #8b5cf6);
}
</style>
