<script setup>
// Formular, um ein neues Item zum Item-Pool hinzuzufügen.
// Hauptweg: Bild(er) über den Datei-Dialog auswählen (Name kommt automatisch
// vom Dateinamen). Textfeld darunter ist die kleine Alternative für Items,
// die kein Bild brauchen.
import { ref } from 'vue'

import { readImageFiles, ALLOWED_IMAGE_ACCEPT } from '../composables/useImageUpload'

const emit = defineEmits(['add-item', 'add-images', 'invalid-image-types'])

// Merkt sich, was gerade im Eingabefeld steht (per v-model verbunden)
const itemName = ref('')

// Referenz auf das versteckte <input type="file">, damit wir es per
// Button-Klick "programmatisch" öffnen können
const fileInputRef = ref(null)

function submitItem() {
  // trim() entfernt Leerzeichen am Anfang/Ende, z. B. aus "  Test  " wird "Test"
  const trimmedName = itemName.value.trim()

  // Leere Eingabe (nur Leerzeichen oder gar nichts) wird ignoriert
  if (!trimmedName) {
    return
  }

  // Neuen Namen an App.vue melden, dort wird das Item wirklich erstellt
  emit('add-item', trimmedName)
  // Eingabefeld danach wieder leeren
  itemName.value = ''
}

// Öffnet den normalen Datei-Auswahl-Dialog des Betriebssystems
function openFilePicker() {
  fileInputRef.value.click()
}

// Wird aufgerufen, sobald der Nutzer im Datei-Dialog Bilder ausgewählt hat
async function handleFilesSelected(event) {
  const files = event.target.files

  if (!files || files.length === 0) {
    return
  }

  const { items, rejectedFileNames } = await readImageFiles(files)

  if (items.length > 0) {
    emit('add-images', items)
  }

  // Eigentlich verhindert das accept-Attribut unten schon die Auswahl falscher
  // Dateitypen im Dialog, aber manche Betriebssysteme erlauben trotzdem
  // "Alle Dateien" auszuwählen — deshalb hier sicherheitshalber nochmal prüfen
  if (rejectedFileNames.length > 0) {
    emit('invalid-image-types', rejectedFileNames)
  }

  // Auswahl zurücksetzen, damit man dieselbe(n) Datei(en) danach erneut auswählen kann
  event.target.value = ''
}
</script>

<template>
  <div class="add-item-form">
    <!-- Hauptweg: Bilder auswählen, Name kommt automatisch vom Dateinamen -->
    <button type="button" class="image-picker-button" @click="openFilePicker">
      Bilder auswählen
    </button>

    <!-- Unsichtbares Datei-Feld, das den echten Betriebssystem-Dialog öffnet.
             multiple erlaubt die Auswahl mehrerer Bilder auf einmal.
             accept sorgt dafür, dass im Dialog selbst nur PNG/JPG auswählbar
             sind (andere Dateien werden vom Betriebssystem ausgegraut). -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="ALLOWED_IMAGE_ACCEPT"
      multiple
      class="hidden-file-input"
      @change="handleFilesSelected"
    />

    <!-- Kleine Alternative: Item ganz ohne Bild anlegen -->
    <span class="or-label">oder</span>

    <div class="text-add-row">
      <input v-model="itemName" type="text" placeholder="Name eingeben" @keyup.enter="submitItem" />

      <button type="button" class="add-button" title="Item hinzufügen" @click="submitItem">
        +
      </button>
    </div>
  </div>
</template>

<style scoped>
.add-item-form {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.image-picker-button {
  flex-shrink: 0;

  border: 0;
  border-radius: 18px;
  padding: 18px 24px;

  background: linear-gradient(135deg, #7f9cff, #8b5cf6);
  color: white;

  font-size: 1rem;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.image-picker-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 32px rgba(127, 156, 255, 0.28);
}

/* Das echte Datei-Feld bleibt komplett unsichtbar, wir nutzen nur den eigenen Button */
.hidden-file-input {
  display: none;
}

.or-label {
  flex-shrink: 0;
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 700;
}

.text-add-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 160px;
}

.text-add-row input[type='text'] {
  flex: 1;
  min-width: 0;
  height: 44px;

  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 0 14px;

  background: rgba(255, 255, 255, 0.03);
  color: #c8cad4;
  font-size: 0.85rem;
  outline: none;

  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.text-add-row input[type='text']::placeholder {
  color: #6b7280;
}

.text-add-row input[type='text']:focus {
  border-color: rgba(127, 156, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.add-button {
  flex-shrink: 0;
  width: 44px;
  height: 44px;

  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;

  background: rgba(255, 255, 255, 0.08);
  color: white;

  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;

  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.add-button:hover {
  background: rgba(127, 156, 255, 0.25);
  transform: translateY(-1px);
}

@media (max-width: 850px) {
  .add-item-form {
    flex-direction: column;
    align-items: stretch;
  }

  .image-picker-button {
    width: 100%;
  }

  .text-add-row {
    width: 100%;
  }
}
</style>
