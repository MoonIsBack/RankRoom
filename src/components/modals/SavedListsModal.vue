<script setup>
// Zeigt alle gespeicherten Tierlisten an. Man kann eine Liste öffnen
// (aktiv schalten) oder mit Bestätigung löschen.
import { nextTick, ref } from 'vue'

import BaseModal from './BaseModal.vue'

defineProps({
  savedLists: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['close', 'open-list', 'rename-list', 'delete-list'])

// Speichert die id der Liste, für die gerade "Wirklich löschen?" angezeigt wird.
// null bedeutet: aktuell wird keine Liste zum Löschen bestätigt.
const pendingDeleteId = ref(null)

function confirmDelete(listId) {
  // Erst hier, nach der Bestätigung, wird das Löschen an App.vue gemeldet
  emit('delete-list', listId)
  pendingDeleteId.value = null
}

// id der Liste, deren Name gerade bearbeitet wird (null = keine)
const editingId = ref(null)
// Der Text im Eingabefeld, solange bearbeitet wird
const editedName = ref('')
const editInputRef = ref(null)

async function startEditing(list) {
  editingId.value = list.id
  editedName.value = list.name

  // nextTick wartet, bis Vue das Eingabefeld eingefügt hat — erst danach
  // lässt es sich fokussieren
  await nextTick()
  editInputRef.value?.[0]?.focus()
  editInputRef.value?.[0]?.select()
}

function saveEditing() {
  // Verhindert doppeltes Speichern, wenn sowohl Enter als auch danach
  // "blur" (Fokus verlassen) ausgelöst werden
  if (editingId.value === null) {
    return
  }

  const listId = editingId.value
  editingId.value = null

  const trimmedName = editedName.value.trim()

  if (trimmedName) {
    emit('rename-list', listId, trimmedName)
  }
}

function cancelEditing() {
  editingId.value = null
}
</script>

<template>
  <BaseModal
    label="RankRoom"
    title="Gespeicherte Tierlists"
    max-width="540px"
    @close="$emit('close')"
  >
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

              <button class="confirm-delete-button" @click="confirmDelete(list.id)">Löschen</button>
            </div>
          </div>
        </template>

        <!-- Umbenennen: das Eingabefeld ersetzt Name und Knöpfe -->
        <template v-else-if="editingId === list.id">
          <input
            ref="editInputRef"
            v-model="editedName"
            class="rename-input"
            aria-label="Listenname"
            @keyup.enter="saveEditing"
            @keyup.esc="cancelEditing"
            @blur="saveEditing"
          />
        </template>

        <template v-else>
          <button class="saved-list-open" @click="$emit('open-list', list.id)">
            <div>
              <strong>{{ list.name }}</strong>
              <small>{{ list.description }}</small>
            </div>

            <span>Öffnen</span>
          </button>

          <!-- Stift: Name der Liste ändern, ohne sie öffnen zu müssen -->
          <button class="edit-button" aria-label="Liste umbenennen" @click="startEditing(list)">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>

          <!-- Klick setzt nur pendingDeleteId, löscht aber noch nichts
               (erst nach Bestätigung oben) -->
          <button
            class="delete-button"
            aria-label="Liste löschen"
            @click="pendingDeleteId = list.id"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
        </template>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
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

  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 700;
}

.saved-list-open span {
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 900;
  white-space: nowrap;
}

/* Stift-Button: gleiche Größe und Form wie der Löschen-Button daneben,
   nur zurückhaltend statt rot — er ist die harmlosere der beiden Aktionen. */
.edit-button {
  flex-shrink: 0;
  width: 40px;
  height: 40px;

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;

  background: rgba(255, 255, 255, 0.055);
  color: var(--text-secondary);

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.edit-button svg {
  width: 17px;
  height: 17px;
}

.edit-button:hover {
  background: rgba(255, 255, 255, 0.11);
  transform: translateY(-1px);
}

/* Eingabefeld beim Umbenennen — nimmt die Stelle von Name und Knöpfen ein */
.rename-input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;

  border: 1px solid rgba(var(--accent-rgb), 0.45);
  border-radius: 14px;

  background: rgba(255, 255, 255, 0.075);
  color: white;

  font-size: 0.95rem;
  font-weight: 800;
  outline: none;
}

.delete-button {
  flex-shrink: 0;
  width: 40px;
  height: 40px;

  border: 1px solid rgba(255, 92, 92, 0.28);
  border-radius: 14px;

  background: rgba(255, 92, 92, 0.12);
  color: #ff9b9b;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.delete-button svg {
  width: 18px;
  height: 18px;
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
  .saved-list-open {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
