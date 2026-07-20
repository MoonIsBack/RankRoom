<script setup>
// Hinweis-Popup, wenn beim Hinzufügen von Bildern etwas übersprungen wurde —
// z. B. falsches Dateiformat oder bereits vorhandene (doppelte) Bilder.
//
// groups ist eine Liste aus { heading, files }: pro Grund eine Überschrift
// und die Liste der betroffenen Dateinamen. So können auch beide Gründe
// gleichzeitig in einem Popup angezeigt werden.
import BaseModal from './BaseModal.vue'

defineProps({
  groups: {
    type: Array,
    required: true,
  },
})

defineEmits(['close'])
</script>

<template>
  <BaseModal
    title="Nicht alle Bilder hinzugefügt"
    :show-close="false"
    max-width="440px"
    @close="$emit('close')"
  >
    <div v-for="group in groups" :key="group.heading" class="notice-group">
      <p>{{ group.heading }}</p>

      <ul class="file-list">
        <li v-for="fileName in group.files" :key="fileName">{{ fileName }}</li>
      </ul>
    </div>

    <div class="modal-actions">
      <button class="confirm-button" @click="$emit('close')">Verstanden</button>
    </div>
  </BaseModal>
</template>

<style scoped>
.notice-group + .notice-group {
  margin-top: 18px;
}

.notice-group p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.file-list {
  margin: 12px 0 0;
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
  background: var(--accent-gradient);
}
</style>
