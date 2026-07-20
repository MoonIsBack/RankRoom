<template>
  <header class="top-header">
    <div class="header-shell">
      <button class="brand" @click="$emit('go-home')">
        <img class="brand-logo" src="/rankroom-icon.svg" alt="RankRoom Logo" />

        <strong class="brand-name">RankRoom</strong>
      </button>

      <nav class="desktop-nav">
        <button class="nav-link active">Dashboard</button>
        <button class="nav-link">Vorlagen</button>
        <button class="nav-link">Community</button>
      </nav>

      <div class="header-actions">
        <button class="create-button" @click="openNewTierList">Neue Tierlist</button>

        <button class="menu-button" aria-label="Menü öffnen" @click="openMenu">
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>

  <!-- Abgedunkelter Hintergrund hinter dem Seitenmenü, Klick darauf schließt das Menü -->
  <div v-if="isMenuOpen" class="menu-overlay" @click="closeMenu"></div>

  <!-- "open"-Klasse schiebt das Menü per CSS-Transition von rechts ins Bild -->
  <aside :class="['side-menu', { open: isMenuOpen }]">
    <div class="side-menu-header">
      <div>
        <p class="menu-label">RankRoom</p>
        <h2>Menü</h2>
      </div>

      <button class="close-button" aria-label="Menü schließen" @click="closeMenu">✕</button>
    </div>

    <div class="side-menu-content">
      <button class="side-menu-item" @click="openSavedLists">
        <span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </span>
        Gespeicherte Tierlists
      </button>

      <button class="side-menu-item" @click="exportTierList">
        <span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </span>
        Exportieren (JSON)
      </button>

      <button class="side-menu-item" @click="openJsonPicker">
        <span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </span>
        Importieren (JSON)
      </button>

      <!-- Unsichtbares Datei-Feld für den Import einer JSON-Tierlist -->
      <input
        ref="jsonInputRef"
        type="file"
        accept="application/json,.json"
        class="hidden-file-input"
        @change="handleJsonSelected"
      />

      <button class="side-menu-item">
        <span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            />
          </svg>
        </span>
        Einstellungen
      </button>
    </div>
  </aside>
</template>

<script setup>
// Die Kopfzeile der App: Logo, Navigation, "Neue Tierlist"-Button und
// das ausklappbare Seitenmenü (Hamburger-Menü) rechts.
import { ref } from 'vue'

const emit = defineEmits(['go-home', 'open-saved-lists', 'new-tier-list', 'export', 'import-file'])

// Steuert, ob das Seitenmenü (rechts eingeblendet) gerade offen ist
const isMenuOpen = ref(false)

// Referenz auf das versteckte Datei-Feld für den JSON-Import
const jsonInputRef = ref(null)

function openMenu() {
  isMenuOpen.value = true
}

function closeMenu() {
  isMenuOpen.value = false
}

function openSavedLists() {
  // Menü zuerst schließen, dann App.vue Bescheid geben, dass das
  // "Gespeicherte Tierlists"-Modal geöffnet werden soll
  closeMenu()
  emit('open-saved-lists')
}

function openNewTierList() {
  closeMenu()
  emit('new-tier-list')
}

// Export: Menü schließen und App.vue Bescheid geben (dort wird die JSON erzeugt)
function exportTierList() {
  closeMenu()
  emit('export')
}

// Import: den versteckten Datei-Dialog öffnen
function openJsonPicker() {
  jsonInputRef.value.click()
}

// Wurde eine JSON-Datei gewählt, geben wir sie an App.vue weiter (dort wird
// sie eingelesen und geprüft) und schließen das Menü.
function handleJsonSelected(event) {
  const file = event.target.files[0]

  if (!file) {
    return
  }

  emit('import-file', file)
  closeMenu()

  // Auswahl zurücksetzen, damit man dieselbe Datei danach erneut wählen kann
  event.target.value = ''
}
</script>

<style scoped>
/* Das echte Datei-Feld für den Import bleibt unsichtbar, geöffnet wird es
   nur per Klick auf den "Importieren"-Knopf */
.hidden-file-input {
  display: none;
}

.top-header {
  width: 100%;
  padding: 18px 28px 0;

  background: transparent;

  color: white;
  position: relative;
  z-index: 20;

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.header-shell {
  width: 100%;
  min-height: 74px;
  padding: 0 18px 0 20px;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;

  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)),
    rgba(16, 16, 22, 0.68);

  box-shadow:
    0 20px 55px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);

  backdrop-filter: blur(18px);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.brand {
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: 13px;

  padding: 0;
}

.brand-logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  object-fit: cover;
}

.brand-name {
  font-size: 1.45rem;
  font-weight: 950;
  letter-spacing: -0.06em;
}

.desktop-nav {
  padding: 5px;

  border-radius: 999px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.065);

  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  border: none;
  border-radius: 999px;

  padding: 10px 15px;

  background: transparent;
  color: var(--text-muted);

  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.075);
}

.nav-link.active {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.create-button {
  border: 1px solid rgba(255, 255, 255, 0.09);
  cursor: pointer;

  padding: 13px 18px;
  border-radius: 999px;

  color: white;
  font-size: 0.92rem;
  font-weight: 900;

  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.055)),
    rgba(255, 255, 255, 0.06);

  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.create-button:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.16);
}

.menu-button {
  width: 48px;
  height: 48px;

  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.055);
  cursor: pointer;

  display: grid;
  place-items: center;

  position: relative;

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.menu-button span {
  position: absolute;

  width: 20px;
  height: 2px;

  border-radius: 999px;
  background: white;

  transition:
    transform 0.2s ease,
    width 0.2s ease;
}

.menu-button span:first-child {
  transform: translateY(-4px);
}

.menu-button span:last-child {
  width: 14px;
  transform: translateY(4px);
}

.menu-button:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.105);
  border-color: rgba(255, 255, 255, 0.16);
}

.menu-button:hover span:last-child {
  width: 20px;
}

.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;

  background: rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(6px);
}

.side-menu {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 50;

  width: 410px;
  max-width: 90vw;
  height: 100vh;

  background:
    radial-gradient(circle at top right, rgba(80, 88, 120, 0.16), transparent 34%), #101016;

  border-left: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: -30px 0 70px rgba(0, 0, 0, 0.55);

  transform: translateX(100%);
  transition: transform 0.28s ease;

  display: flex;
  flex-direction: column;

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.side-menu.open {
  transform: translateX(0);
}

.side-menu-header {
  padding: 30px;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.menu-label {
  margin: 0 0 6px;

  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.side-menu-header h2 {
  margin: 0;
  font-size: 2.15rem;
  letter-spacing: -0.06em;
}

.close-button {
  width: 44px;
  height: 44px;

  border: none;
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.075);
  color: white;

  font-size: 1.05rem;
  font-weight: 950;
  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.13);
  transform: rotate(6deg);
}

.side-menu-content {
  padding: 22px;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

.side-menu-item {
  width: 100%;
  padding: 17px 18px;

  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 20px;

  background: rgba(255, 255, 255, 0.045);
  color: white;

  display: flex;
  align-items: center;
  gap: 14px;

  text-align: left;
  font-size: 1rem;
  font-weight: 850;
  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}

.side-menu-item span {
  width: 32px;
  height: 32px;

  border-radius: 13px;

  display: grid;
  place-items: center;

  background: rgba(255, 255, 255, 0.085);
  color: var(--accent);
}

.side-menu-item span svg {
  width: 18px;
  height: 18px;
}

.side-menu-item:hover {
  background: rgba(255, 255, 255, 0.085);
  border-color: rgba(255, 255, 255, 0.14);
  transform: translateX(-4px);
}

@media (max-width: 900px) {
  .desktop-nav {
    display: none;
  }
}

@media (max-width: 700px) {
  .top-header {
    padding: 12px 14px 0;
  }

  .header-shell {
    padding: 0 12px;
    border-radius: 22px;
  }

  .create-button {
    display: none;
  }

  .side-menu {
    width: 100%;
    max-width: 100vw;
  }
}
</style>
