<template>
  <!--
    dragenter/dragleave/dragover/drop hier auf der obersten Ebene erlauben es,
    Bilder von IRGENDWO auf der Seite reinzuziehen, nicht nur in einem
    bestimmten Kasten (siehe useFileDropZone.js)
  -->
  <div
    class="page"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <AppHeader
      @open-saved-lists="openSavedListsModal"
      @new-tier-list="openNewTierListModal"
      @export="exportActiveTierList"
      @export-image="openExportImageModal"
      @import-file="handleImportFile"
    />

    <main class="app">
      <HeroSection :tier-list-name="tierListName" :total-items="totalItemCount" />

      <StatsGrid
        :total-items="totalItemCount"
        :ranked-items="rankedItemCount"
        :unranked-items="unrankedItemCount"
      />

      <!-- Eine TierRow pro Tier (S, A, B, C, D) der aktiven Tierlist -->
      <section class="tierlist">
        <TierRow
          v-for="tier in tiers"
          :key="tier.name"
          :name="tier.name"
          :color="tier.color"
          :items="tier.items"
          :dragged-item="draggedItem"
          @drop-item="dropItem(tier.name)"
          @drag-start="startDragFromTier($event, tier.name)"
        />
      </section>

      <section class="control-panel">
        <AddItemForm @add-item="addItem" @add-files="handleImageFiles" />
        <button class="reset-button" @click="openResetModal">Zurücksetzen</button>
      </section>

      <ItemPool
        :items="items"
        @delete-item="deleteItem"
        @drag-start="startDrag"
        @drop-to-pool="dropItemToPool"
        @rename-item="renameItem"
      />

      <ResetModal v-if="showResetModal" @cancel="closeResetModal" @confirm="confirmReset" />
      <SavedListsModal
        v-if="showSavedListsModal"
        :saved-lists="savedLists"
        @close="closeSavedListsModal"
        @open-list="openTierList"
        @delete-list="deleteTierList"
      />
      <NewTierListModal
        v-if="showNewTierListModal"
        @close="closeNewTierListModal"
        @create="createNewTierList"
      />
      <FileNoticeModal
        v-if="fileNoticeGroups.length > 0"
        :groups="fileNoticeGroups"
        @close="closeFileNotice"
      />
      <InfoModal
        v-if="infoMessage"
        :title="infoMessage.title"
        :message="infoMessage.text"
        @close="infoMessage = null"
      />
      <ExportImageModal
        v-if="showExportImageModal"
        :tier-list="activeTierList"
        @close="showExportImageModal = false"
      />
    </main>

    <!-- Overlay, das erscheint, während man ein Bild über die Seite zieht -->
    <div v-if="isDraggingFile" class="file-drop-overlay">
      <div class="file-drop-message">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        Bilder hier ablegen, um sie hinzuzufügen
      </div>
    </div>
  </div>
</template>

<script setup>
// App.vue steckt hier nur noch die Bausteine zusammen: Sie holt sich den
// kompletten Tierlisten-Zustand aus useTierLists() und die Drag & Drop-Logik
// aus useDragAndDrop() und reicht beides an die Komponenten weiter.
import { ref } from 'vue'

import AppHeader from './components/AppHeader.vue'
import HeroSection from './components/HeroSection.vue'
import TierRow from './components/TierRow.vue'
import StatsGrid from './components/StatsGrid.vue'
import AddItemForm from './components/AddItemForm.vue'
import ItemPool from './components/ItemPool.vue'
import ResetModal from './components/modals/ResetModal.vue'
import SavedListsModal from './components/modals/SavedListsModal.vue'
import NewTierListModal from './components/modals/NewTierListModal.vue'
import FileNoticeModal from './components/modals/FileNoticeModal.vue'
import InfoModal from './components/modals/InfoModal.vue'
import ExportImageModal from './components/modals/ExportImageModal.vue'

import { useTierLists } from './composables/useTierLists'
import { useDragAndDrop } from './composables/useDragAndDrop'
import { useFileDropZone } from './composables/useFileDropZone'
import { readImageFiles } from './composables/useImageUpload'
import { parseTierListFile } from './utils/importTierList'

// Alles rund um Tierlisten (laden, speichern, erstellen, löschen, Items verwalten).
// Die Funktionen mit "as ...Store" werden gleich noch um Drag-Reset und
// Modal-Schließen ergänzt, deshalb bekommen sie hier interne Namen.
const {
  activeTierList,
  tierListName,
  items,
  tiers,
  rankedItemCount,
  unrankedItemCount,
  totalItemCount,
  savedLists,
  addItem,
  addItemsFromImages,
  deleteItem,
  renameItem,
  deleteTierList,
  exportActiveTierList,
  importTierList,
  createNewTierList: createTierListInStore,
  confirmReset: resetTierListInStore,
  openTierList: openTierListInStore,
} = useTierLists()

// Drag & Drop braucht Zugriff auf items/tiers der aktiven Tierlist von oben.
// draggedItem wird an die Tier-Reihen weitergereicht, damit sie beim
// Drüberziehen eine Vorschau des Items anzeigen können.
const { draggedItem, startDrag, startDragFromTier, dropItem, dropItemToPool, resetDrag } =
  useDragAndDrop(items, tiers)

// Zentrale Verarbeitung für Bilddateien — egal ob sie über den Datei-Dialog
// ("Bilder auswählen") oder per Drag & Drop auf die Seite kommen.
// Schritt 1: Dateien einlesen und falsche Formate aussortieren.
// Schritt 2: gültige Bilder hinzufügen, dabei Duplikate herausfiltern.
// Schritt 3: falls etwas übersprungen wurde, ein Hinweis-Popup zeigen.
async function handleImageFiles(fileList) {
  const { items: imageItems, rejectedFileNames } = await readImageFiles(fileList)

  const { duplicateNames } = addItemsFromImages(imageItems)

  const groups = []

  if (rejectedFileNames.length > 0) {
    groups.push({
      heading: 'Es werden nur PNG- und JPG-Bilder unterstützt:',
      files: rejectedFileNames,
    })
  }

  if (duplicateNames.length > 0) {
    groups.push({
      heading: 'Diese Bilder sind bereits in der Liste vorhanden:',
      files: duplicateNames,
    })
  }

  if (groups.length > 0) {
    fileNoticeGroups.value = groups
  }
}

// Erlaubt es, Bilder von überall auf der Seite reinzuziehen (siehe Vorlage oben)
const { isDraggingFile, handleDragEnter, handleDragLeave, handleDragOver, handleDrop } =
  useFileDropZone(handleImageFiles)

// Steuert, welches Modal (Popup) gerade sichtbar ist
const showResetModal = ref(false)
const showSavedListsModal = ref(false)
const showNewTierListModal = ref(false)
const showExportImageModal = ref(false)

function openExportImageModal() {
  showExportImageModal.value = true
}

// Hinweis-Gruppen für das FileNoticeModal (übersprungene Bilder: falsches
// Format und/oder doppelt). Ist die Liste leer, wird das Popup nicht angezeigt.
const fileNoticeGroups = ref([])

function closeFileNotice() {
  fileNoticeGroups.value = []
}

// Einfaches Hinweis-Popup ({ title, text }) — z. B. wenn ein Import fehlschlägt.
// null bedeutet: kein Popup sichtbar.
const infoMessage = ref(null)

// Liest eine ausgewählte JSON-Datei ein und fügt sie als neue Tierlist hinzu.
// Schlägt das Einlesen fehl (kaputte/fremde Datei), zeigen wir einen Hinweis.
async function handleImportFile(file) {
  try {
    const parsedTierList = await parseTierListFile(file)
    importTierList(parsedTierList)
    resetDrag()
  } catch (error) {
    infoMessage.value = {
      title: 'Import fehlgeschlagen',
      text: error.message,
    }
  }
}

// --- Reset-Modal (Tierlist zurücksetzen) ---
function openResetModal() {
  showResetModal.value = true
}

function closeResetModal() {
  showResetModal.value = false
}

// --- "Gespeicherte Tierlists"-Modal ---
function openSavedListsModal() {
  showSavedListsModal.value = true
}

function closeSavedListsModal() {
  showSavedListsModal.value = false
}

// --- "Neue Tierlist"-Modal ---
function openNewTierListModal() {
  showNewTierListModal.value = true
}

function closeNewTierListModal() {
  showNewTierListModal.value = false
}

// Neue Tierlist erstellen, laufenden Drag abbrechen und Modal schließen
function createNewTierList(newName) {
  createTierListInStore(newName)
  resetDrag()
  showNewTierListModal.value = false
}

// Aktive Tierlist zurücksetzen, laufenden Drag abbrechen und Modal schließen
function confirmReset() {
  resetTierListInStore()
  resetDrag()
  showResetModal.value = false
}

// Zu einer anderen gespeicherten Tierlist wechseln, laufenden Drag abbrechen
// und das "Gespeicherte Tierlists"-Modal schließen
function openTierList(tierListId) {
  openTierListInStore(tierListId)
  resetDrag()
  showSavedListsModal.value = false
}
</script>

<style scoped>
.page {
  position: relative;
  min-height: 100vh;

  /* Ruhiger Hintergrund: ein sehr sanfter Tiefen-Verlauf im leicht ins Indigo
     gehenden Dunkel, darüber EIN dezenter, weicher Schimmer oben in der
     Akzentfarbe. Ersetzt die zwei lauten Violett/Blau-Glows von früher. */
  background:
    radial-gradient(100% 60% at 50% -10%, rgba(129, 140, 248, 0.14), transparent 62%),
    linear-gradient(180deg, var(--bg-top), var(--bg-bottom));

  color: var(--text);
}

/* Sehr feine Körnung (Film-Grain) über der ganzen Seite — gibt dem flachen
   Dunkel Textur und einen "bewusst gestalteten" Eindruck. pointer-events: none,
   damit die Körnung keine Klicks abfängt. */
.page::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;

  pointer-events: none;
  opacity: 0.035;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.app {
  min-height: 100vh;
  padding: 25px 40px 50px;
  color: var(--text);
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.tierlist {
  width: 100%;
  max-width: 1100px;
  overflow: hidden;

  margin-bottom: 24px;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 22px;

  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
}

.control-panel {
  width: 100%;
  max-width: 1100px;
  margin-bottom: 24px;
  padding: 18px;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 26px;

  background: rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(10px);

  display: flex;
  align-items: center;
  gap: 16px;
}

.reset-button {
  padding: 18px 22px;

  border: 1px solid rgba(255, 92, 92, 0.28);
  border-radius: 18px;

  background: rgba(255, 92, 92, 0.12);
  color: #ff9b9b;

  font-size: 1rem;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;

  transition:
    transform 0.15s ease,
    background 0.15s ease;
}

.reset-button:hover {
  transform: translateY(-1px);
  background: rgba(255, 92, 92, 0.18);
}

@media (max-width: 850px) {
  .app {
    padding: 30px 18px 50px;
  }

  .control-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .reset-button {
    width: 100%;
  }
}

.file-drop-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(var(--accent-rgb), 0.18);
  backdrop-filter: blur(4px);

  /* Die Maus soll die Seite darunter "durchgreifen" können, damit der
     Drop weiterhin von .page selbst erkannt wird */
  pointer-events: none;
}

.file-drop-message {
  padding: 28px 40px;

  border: 2px dashed rgba(255, 255, 255, 0.5);
  border-radius: 24px;

  background: rgba(11, 11, 15, 0.85);
  color: white;

  font-size: 1.2rem;
  font-weight: 800;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.file-drop-message svg {
  width: 40px;
  height: 40px;
  color: var(--accent);
}
</style>
