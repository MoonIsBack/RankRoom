<script setup>
// Formular, um ein neues Item zum Item-Pool hinzuzufügen.
// Hauptweg: Bild(er) über den Datei-Dialog auswählen (Name kommt automatisch
// vom Dateinamen). Textfeld darunter ist die kleine Alternative für Items,
// die kein Bild brauchen.
import { ref } from 'vue'

import { ALLOWED_IMAGE_ACCEPT } from '../composables/useImageUpload'

const emit = defineEmits(['add-item', 'add-files'])

// Merkt sich, was gerade im Eingabefeld steht (per v-model verbunden)
const itemName = ref('')

// Referenz auf das versteckte <input type="file">, damit wir es per
// Button-Klick "programmatisch" öffnen können
const fileInputRef = ref(null)

// --- Info-Popover neben "Bilder auswählen" ---
//
// Steuert, ob der Hinweis zu Speicherort und Bildrechten gerade sichtbar ist.
const showInfo = ref(false)

// Hat das Gerät überhaupt einen Mauszeiger, mit dem man "darüberfahren" kann?
//
// Das muss unterschieden werden, sonst hebt sich die Bedienung auf dem Handy
// selbst auf: Beim Antippen feuert der Browser zuerst mouseenter (öffnet) und
// direkt danach click (schließt wieder) — das Popover ließe sich per Finger
// gar nicht öffnen. Deshalb:
//
//   Gerät mit Maus  -> Darüberfahren öffnet und schließt, Klick tut nichts
//   Gerät mit Finger -> Antippen öffnet und schließt
const supportsHover = window.matchMedia?.('(hover: hover)').matches ?? false

function handleInfoEnter() {
  if (supportsHover) {
    showInfo.value = true
  }
}

function handleInfoLeave() {
  if (supportsHover) {
    showInfo.value = false
  }
}

function handleInfoClick() {
  // Auf Geräten mit Maus übernimmt das Darüberfahren — ein Klick würde den
  // gerade sichtbaren Hinweis sonst wieder wegschalten.
  if (!supportsHover) {
    showInfo.value = !showInfo.value
  }
}

// Beim Ansteuern per Tastatur öffnen.
//
// :focus-visible trifft genau dann zu, wenn der Fokus über die Tastatur kam
// und nicht über einen Klick oder Fingertipp. Ohne diese Prüfung würde beim
// Antippen erst der Fokus öffnen und der Klick danach wieder schließen.
function handleInfoFocus(event) {
  if (event.target.matches(':focus-visible')) {
    showInfo.value = true
  }
}

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

// Wird aufgerufen, sobald der Nutzer im Datei-Dialog Bilder ausgewählt hat.
// Die eigentliche Verarbeitung (Format-Check, Duplikate, Hinzufügen) macht
// App.vue zentral — hier reichen wir nur die ausgewählten Dateien weiter.
function handleFilesSelected(event) {
  const files = event.target.files

  if (!files || files.length === 0) {
    return
  }

  emit('add-files', files)

  // Auswahl zurücksetzen, damit man dieselbe(n) Datei(en) danach erneut auswählen kann
  event.target.value = ''
}
</script>

<template>
  <div class="add-item-form">
    <!-- Hauptweg: Bilder auswählen, Name kommt automatisch vom Dateinamen.
         Der Knopf und das Info-Symbol sitzen zusammen in einer Gruppe, damit
         das Symbol beim Umbruch auf schmalen Bildschirmen nicht allein in
         einer eigenen Zeile landet. -->
    <div class="picker-group">
      <button type="button" class="image-picker-button" @click="openFilePicker">
        Bilder auswählen
      </button>

      <!-- Der Hinweis zu Speicherort und Bildrechten steckt hier drin, statt
           dauerhaft unter dem Formular zu stehen. Er ist damit jederzeit
           erreichbar, drängt sich aber nicht auf.

           Auf dem Rechner öffnet er sich beim Darüberfahren, überall beim
           Anklicken und beim Fokussieren per Tastatur — reines CSS-Hover
           allein wäre auf dem Handy nicht bedienbar. -->
      <div class="info-wrapper" @mouseenter="handleInfoEnter" @mouseleave="handleInfoLeave">
        <button
          type="button"
          class="info-button"
          :aria-expanded="showInfo"
          aria-label="Hinweise zu Bildern anzeigen"
          @click="handleInfoClick"
          @focus="handleInfoFocus"
          @blur="showInfo = false"
          @keydown.esc="showInfo = false"
        >
          i
        </button>

        <div v-if="showInfo" class="info-popover" role="tooltip">
          <p><strong>Bilder bleiben auf deinem Gerät.</strong></p>
          <p>
            Sie werden nicht hochgeladen. Beim Hinzufügen werden versteckte Metadaten wie
            GPS-Standort und Aufnahmezeit automatisch entfernt.
          </p>
          <p class="info-rights">Bitte nur Bilder verwenden, für die du die nötigen Rechte hast.</p>
        </div>
      </div>
    </div>

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

  background: var(--accent-gradient);
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
  filter: brightness(1.08);
  box-shadow: 0 8px 18px rgba(var(--accent-rgb), 0.1);
}

/* Das echte Datei-Feld bleibt komplett unsichtbar, wir nutzen nur den eigenen Button */
.hidden-file-input {
  display: none;
}

.or-label {
  flex-shrink: 0;
  color: var(--text-subtle);
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
  color: var(--text-secondary);
  font-size: 0.85rem;
  outline: none;

  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.text-add-row input[type='text']::placeholder {
  color: var(--text-subtle);
}

.text-add-row input[type='text']:focus {
  border-color: rgba(var(--accent-rgb), 0.4);
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
  background: rgba(var(--accent-rgb), 0.25);
  transform: translateY(-1px);
}

/* Knopf und Info-Symbol bleiben beim Umbrechen zusammen */
.picker-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Bezugspunkt für die Positionierung des Popovers */
.info-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.info-button {
  width: 26px;
  height: 26px;

  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;

  background: transparent;
  color: var(--text-subtle);

  /* Serifen-Schrift, weil ein "i" damit deutlich klarer als Info-Symbol
     lesbar ist als in der serifenlosen Grundschrift */
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.85rem;
  font-style: italic;
  font-weight: 700;
  line-height: 1;
  cursor: help;

  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}

.info-button:hover,
.info-button[aria-expanded='true'] {
  border-color: rgba(var(--accent-rgb), 0.5);
  background: rgba(var(--accent-rgb), 0.12);
  color: var(--accent);
}

.info-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Öffnet sich nach oben, weil das Bedienfeld im unteren Bereich der Seite
   sitzt — nach unten wäre das Popover oft außerhalb des Sichtbereichs. */
.info-popover {
  position: absolute;
  bottom: calc(100% + 10px);
  z-index: 60;

  /* Rechtsbündig am Info-Symbol statt mittig darunter.
     Grund: Das Symbol sitzt am rechten Rand des Bedienfelds. Mittig zentriert
     ragte das 270px breite Popover auf schmalen Geräten über den rechten
     Bildschirmrand hinaus (gemessen: bis 475px bei 390px Bildschirmbreite).
     Rechtsbündig wächst es nach links ins Bild hinein. */
  right: 0;

  /* Auf sehr schmalen Geräten zusätzlich begrenzen, damit es auch links
     nicht aus dem Bild läuft. 100vw statt 100% — der Bezugspunkt ist das
     Symbol, nicht der Bildschirm. */
  width: 270px;
  max-width: calc(100vw - 32px);
  padding: 14px 16px;

  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;

  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)), #101016;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);

  /* Klicks gehen durch — das Popover ist reine Information und soll nie
     versehentlich etwas abfangen */
  pointer-events: none;

  animation: info-pop-in 0.16s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes info-pop-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.info-popover p {
  margin: 0 0 8px;
  color: var(--text-secondary);
  font-size: 0.82rem;
  line-height: 1.55;
}

.info-popover p:last-child {
  margin-bottom: 0;
}

.info-popover strong {
  color: var(--text);
  font-weight: 800;
}

.info-rights {
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-subtle) !important;
}

/* Sichtbarer Fokusrahmen für die Tastaturbedienung — fehlte hier bisher */
.image-picker-button:focus-visible,
.add-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.text-add-row input[type='text']:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

@media (prefers-reduced-motion: reduce) {
  .image-picker-button,
  .add-button,
  .text-add-row input[type='text'] {
    transition: none;
  }

  .image-picker-button:hover,
  .add-button:hover {
    transform: none;
  }
}

@media (max-width: 850px) {
  .add-item-form {
    flex-direction: column;
    align-items: stretch;
  }

  /* Die Gruppe nimmt die volle Breite ein; der Knopf dehnt sich darin aus und
     das Info-Symbol bleibt rechts daneben stehen, statt darunter zu rutschen */
  .picker-group {
    width: 100%;
  }

  .image-picker-button {
    flex: 1;
    min-width: 0;
  }

  .text-add-row {
    width: 100%;
  }

  /* Mindestens 16px, sonst zoomt mobiles Safari/Chrome beim Fokussieren
     automatisch in die Seite hinein */
  .text-add-row input[type='text'] {
    font-size: 16px;
  }
}
</style>
