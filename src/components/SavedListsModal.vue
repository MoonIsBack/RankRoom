<template>
  <div class="modal-backdrop" @click="$emit('close')">
    <div class="saved-lists-modal" @click.stop>
      <div class="modal-header">
        <div>
          <p class="modal-label">RankRoom</p>
          <h2>Gespeicherte Tierlists</h2>
        </div>

        <button class="close-button" @click="$emit('close')">✕</button>
      </div>

      <div class="saved-list">
        <div v-for="list in savedLists" :key="list.id" class="saved-list-item">
          <!-- Solange diese Liste zum Löschen ausgewählt ist, zeigen wir
                         statt "Öffnen"/"Löschen" eine Rückfrage an -->
          <template v-if="pendingDeleteId === list.id">
            <div class="delete-confirm">
              <span>„{{ list.name }}“ wirklich löschen?</span>

              <div class="delete-confirm-actions">
                <button class="cancel-delete-button" @click="pendingDeleteId = null">
                  Abbrechen
                </button>

                <button class="confirm-delete-button" @click="confirmDelete(list.id)">
                  Löschen
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <button class="saved-list-open" @click="$emit('open-list', list.id)">
              <div>
                <strong>{{ list.name }}</strong>
                <small>{{ list.description }}</small>
              </div>

              <span>Öffnen</span>
            </button>

            <!-- Klick setzt nur pendingDeleteId, löscht aber noch nichts
                             (erst nach Bestätigung oben) -->
            <button
              class="delete-button"
              aria-label="Liste löschen"
              @click="pendingDeleteId = list.id"
            >
              🗑
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Zeigt alle gespeicherten Tierlisten an. Man kann eine Liste öffnen
// (aktiv schalten) oder mit Bestätigung löschen.
import { ref } from 'vue'

defineProps({
  savedLists: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['close', 'open-list', 'delete-list'])

// Speichert die id der Liste, für die gerade "Wirklich löschen?" angezeigt wird.
// null bedeutet: aktuell wird keine Liste zum Löschen bestätigt.
const pendingDeleteId = ref(null)

function confirmDelete(listId) {
  // Erst hier, nach der Bestätigung, wird das Löschen an App.vue gemeldet
  emit('delete-list', listId)
  pendingDeleteId.value = null
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

.saved-lists-modal {
  width: 100%;
  max-width: 540px;
  padding: 24px;

  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 28px;

  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)), #101016;

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

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.13);
  transform: rotate(6deg);
}

.saved-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.saved-list-item {
  width: 100%;
  padding: 8px;

  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 20px;

  background: rgba(255, 255, 255, 0.045);
  color: white;

  display: flex;
  align-items: center;
  gap: 8px;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.saved-list-item:hover {
  background: rgba(255, 255, 255, 0.085);
  border-color: rgba(255, 255, 255, 0.14);
}

.saved-list-open {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;

  border: none;
  border-radius: 14px;

  background: transparent;
  color: white;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  text-align: left;
  cursor: pointer;
}

.saved-list-open strong {
  display: block;

  font-size: 1rem;
  letter-spacing: -0.03em;
}

.saved-list-open small {
  display: block;
  margin-top: 5px;

  color: #9ca3af;
  font-size: 0.85rem;
  font-weight: 700;
}

.saved-list-open span {
  color: #c4b5fd;
  font-size: 0.85rem;
  font-weight: 900;
  white-space: nowrap;
}

.delete-button {
  flex-shrink: 0;
  width: 40px;
  height: 40px;

  border: 1px solid rgba(255, 92, 92, 0.28);
  border-radius: 14px;

  background: rgba(255, 92, 92, 0.12);
  color: #ff9b9b;

  font-size: 1rem;
  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.delete-button:hover {
  background: rgba(255, 92, 92, 0.2);
  transform: translateY(-1px);
}

.delete-confirm {
  flex: 1;
  padding: 8px 10px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.delete-confirm span {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffcaca;
}

.delete-confirm-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.cancel-delete-button,
.confirm-delete-button {
  border: none;
  border-radius: 12px;
  padding: 10px 14px;

  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.cancel-delete-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.cancel-delete-button:hover {
  background: rgba(255, 255, 255, 0.16);
}

.confirm-delete-button {
  background: linear-gradient(135deg, #ff5c5c, #ff2f6d);
  color: white;
}

.confirm-delete-button:hover {
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .saved-lists-modal {
    padding: 20px;
  }

  .modal-header h2 {
    font-size: 1.55rem;
  }

  .saved-list-open {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
