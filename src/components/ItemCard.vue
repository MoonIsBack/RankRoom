<template>
  <!-- draggable="true" macht die Karte per Maus ziehbar (Drag & Drop).
       Während der Name bearbeitet wird, schalten wir es kurz aus, damit man
       im Textfeld mit der Maus Text markieren kann, statt die Karte zu ziehen. -->
  <div class="item-card" :draggable="!isEditingName" @dragstart="$emit('drag-start')">
    <!-- Stift-Button (Namen bearbeiten) und Löschen-Button (×) werden nur im
         Item-Pool angezeigt, nicht in den Tier-Reihen -->
    <button v-if="showDelete" class="edit-button" title="Namen bearbeiten" @click="startEditing">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    </button>
    <button v-if="showDelete" class="delete-button" @click="$emit('delete')">×</button>

    <!-- Hat das Item ein Bild, füllt es die ganze Karte aus -->
    <img v-if="image" :src="image" :alt="name" class="item-image" draggable="false" />

    <!-- Beim Bearbeiten ersetzt ein Eingabefeld den Namen, sonst wird er nur angezeigt -->
    <input
      v-if="isEditingName"
      ref="editInputRef"
      v-model="editedName"
      :class="['name-input', { 'item-caption': image }]"
      @keyup.enter="saveEditing"
      @keyup.esc="cancelEditing"
      @blur="saveEditing"
      @mousedown.stop
    />
    <span v-else :class="{ 'item-caption': image }">{{ name }}</span>
  </div>
</template>

<script setup>
// Eine einzelne Item-Karte (z. B. "Waves"), die sowohl im Item-Pool
// als auch in den Tier-Reihen (S, A, B, ...) verwendet wird.
import { nextTick, ref } from "vue";

const props = defineProps({
  name: String,
  // image = Data-URL des hochgeladenen Bildes, oder null/undefined bei
  // Items ohne Bild (dann wird nur der Name angezeigt)
  image: {
    type: String,
    default: null,
  },
  // showDelete steuert, ob Stift- und ×-Button angezeigt werden.
  // Im Pool: true (bearbeitbar/löschbar), in Tier-Reihen: false (nur verschiebbar)
  showDelete: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["delete", "drag-start", "rename"]);

// Steuert, ob gerade der Name bearbeitet wird (Eingabefeld statt Text sichtbar)
const isEditingName = ref(false);
// Der Text im Eingabefeld, solange bearbeitet wird
const editedName = ref("");
// Referenz auf das Eingabefeld, um es beim Öffnen automatisch zu fokussieren
const editInputRef = ref(null);

async function startEditing() {
  editedName.value = props.name;
  isEditingName.value = true;

  // nextTick wartet, bis Vue das Eingabefeld wirklich ins HTML eingefügt hat,
  // erst danach können wir es fokussieren
  await nextTick();
  editInputRef.value?.focus();
  editInputRef.value?.select();
}

function saveEditing() {
  // Verhindert doppeltes Speichern, falls sowohl Enter als auch danach
  // "blur" (Fokus verlassen) ausgelöst werden
  if (!isEditingName.value) {
    return;
  }

  isEditingName.value = false;

  const trimmedName = editedName.value.trim();

  if (trimmedName && trimmedName !== props.name) {
    emit("rename", trimmedName);
  }
}

function cancelEditing() {
  isEditingName.value = false;
}
</script>

<style scoped>
.item-card {
  position: relative;
  width: 100px;
  height: 100px;
  overflow: hidden;

  background: #2a2a2a;
  border: 2px solid #444;
  border-radius: 8px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: white;
  font-weight: bold;
  text-align: center;
  padding: 10px;
}

.item-image {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;

  padding: 4px 6px;

  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;

  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name-input {
  border: none;
  outline: none;
  background: transparent;

  width: 100%;
  color: white;
  font: inherit;
  text-align: center;
}

.edit-button {
  position: absolute;
  top: 4px;
  left: 6px;
  z-index: 2;

  background: rgba(127, 156, 255, 0.75);
  color: white;
  border: none;
  border-radius: 50%;

  width: 22px;
  height: 22px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-button svg {
  width: 12px;
  height: 12px;
}

.edit-button:hover {
  background: rgba(127, 156, 255, 0.95);
}

.delete-button {
  position: absolute;
  top: 4px;
  right: 6px;
  z-index: 2;

  background: #ff5c5c;
  color: white;
  border: none;
  border-radius: 50%;

  width: 22px;
  height: 22px;
  cursor: pointer;
  font-weight: bold;
}

.delete-button:hover {
  background: #ff2f2f;
}
</style>
