<template>
  <header class="app-header">
    <button class="brand" @click="$emit('go-home')">
      <div class="brand-logo">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div class="brand-text">
        <strong>RankRoom</strong>
        <small>Tierlist App</small>
      </div>
    </button>

    <nav class="header-actions">
      <button class="header-button primary">
        Neue Tierlist
      </button>

      <div class="menu-wrapper">
        <button
          class="menu-button"
          aria-label="Menü öffnen"
          @click="toggleMenu"
        >
          ☰
        </button>

        <div v-if="isMenuOpen" class="dropdown-menu">
          <button>Neue Tierlist</button>
          <button>Gespeicherte Tierlists</button>
          <button>Exportieren</button>
          <button>Importieren</button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref } from "vue";

defineEmits(["go-home"]);

const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}
</script>

<style scoped>
.app-header {
  width: 100%;
  min-height: 72px;
  padding: 0 32px;
  background: rgba(10, 10, 14, 0.92);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  display: flex;
  align-items: center;
  justify-content: space-between;

  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(14px);
}

.brand {
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: 14px;

  padding: 0;
}

.brand-logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #22c55e);

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  padding: 8px;
}

.brand-logo span {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}

.brand-text strong {
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.brand-text small {
  margin-top: 4px;
  color: #9ca3af;
  font-size: 0.78rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-button,
.menu-button {
  border: none;
  cursor: pointer;
  color: white;
  font-weight: 800;

  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.header-button {
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
}

.header-button.primary {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
}

.menu-wrapper {
  position: relative;
}

.menu-button {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 1.4rem;
}

.header-button:hover,
.menu-button:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.14);
}

.header-button.primary:hover {
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
}

.dropdown-menu {
  position: absolute;
  top: 56px;
  right: 0;

  width: 230px;
  padding: 10px;

  background: rgba(18, 18, 24, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);

  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dropdown-menu button {
  width: 100%;
  padding: 12px 14px;

  border: none;
  border-radius: 12px;
  background: transparent;
  color: #e5e7eb;

  text-align: left;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.dropdown-menu button:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

@media (max-width: 700px) {
  .app-header {
    padding: 0 18px;
  }

  .brand-text small {
    display: none;
  }

  .header-button {
    display: none;
  }

  .dropdown-menu {
    width: 220px;
  }
}
</style>