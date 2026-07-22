<script setup>
// Fußbereich mit den rechtlichen Links und der lokalen Datenverwaltung.
//
// Der Footer weiß selbst NICHTS darüber, was gerade freigeschaltet ist: Er
// bekommt mit "links" eine fertige Liste, die bereits nur die aktiven Einträge
// enthält (siehe useLegalPages.js). Dadurch kann hier gar kein Link zu einer
// abgeschalteten Seite entstehen.
//
// Die Einträge sind echte <a href="#/...">-Links und keine Knöpfe: So kann man
// sie kopieren, in einem neuen Tab öffnen und weitergeben — genau das erwartet
// man bei Datenschutz und Impressum. Der Klick wird trotzdem abgefangen, damit
// sich das Popup ohne Seitensprung öffnet.
import { legalConfig } from '../config/legalConfig'

defineProps({
  // [{ page, label, href }] — bereits gefiltert
  links: {
    type: Array,
    required: true,
  },
})

defineEmits(['open-page', 'open-local-data'])

// Automatisch das laufende Jahr, damit hier nie eine veraltete Zahl steht
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <p class="footer-copyright">© {{ currentYear }} RankRoom</p>

      <nav class="footer-nav" aria-label="Rechtliche Hinweise">
        <a
          v-for="link in links"
          :key="link.page"
          :href="link.href"
          class="footer-link"
          @click.prevent="$emit('open-page', link.page)"
        >
          {{ link.label }}
        </a>

        <button
          v-if="legalConfig.showLocalDataManager"
          type="button"
          class="footer-link footer-button"
          @click="$emit('open-local-data')"
        >
          Lokale Daten
        </button>
      </nav>
    </div>

    <p class="footer-hint">Alle Daten bleiben auf deinem Gerät.</p>
  </footer>
</template>

<style scoped>
.app-footer {
  width: 100%;
  max-width: 1100px;

  /* Der Innenabstand der Seite endet über dem Footer, deshalb hier selbst
     genug Luft nach oben und unten */
  margin: 8px auto 0;
  padding: 28px 24px 40px;

  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
}

.footer-copyright {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 700;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 4px;
}

/* Link und Knopf sehen absichtlich identisch aus — für die Bedienung ist der
   Unterschied unerheblich, technisch ist "Lokale Daten" aber kein Ziel, das
   man verlinken kann, sondern eine Aktion. */
.footer-link {
  /* Großzügige Fläche, damit die Einträge auch mit dem Finger gut treffbar
     sind, ohne dass der Footer optisch schwer wird */
  padding: 8px 10px;

  border: 0;
  border-radius: 10px;
  background: transparent;

  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;

  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.footer-link:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.05);
}

.footer-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  color: var(--text);
}

.footer-hint {
  margin: 14px 0 0;
  color: var(--text-subtle);
  font-size: 0.78rem;
}

@media (max-width: 700px) {
  .app-footer {
    padding: 24px 16px 36px;
  }

  /* Untereinander statt nebeneinander: nebeneinander wären Copyright und
     Links auf schmalen Geräten unruhig umgebrochen */
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .footer-nav {
    /* Etwas nach links ausgleichen, damit der erste Link mit dem
       Copyright-Text bündig steht statt um den Innenabstand versetzt */
    margin-left: -10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer-link {
    transition: none;
  }
}
</style>
