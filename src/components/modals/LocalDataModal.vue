<script setup>
// "Lokale Daten löschen" — erklärt, was RankRoom auf diesem Gerät gespeichert
// hat, und bietet an, alles zu löschen.
//
// Zwei bewusste Entscheidungen:
//
// 1. Vor dem Löschen wird der Export angeboten. Gelöschte Listen sind
//    unwiederbringlich weg — es gibt keinen Server, von dem man sie
//    zurückholen könnte. Ein Export-Knopf an genau dieser Stelle kostet nichts
//    und verhindert den ärgerlichsten Fehler.
//
// 2. Es wird NICHT behauptet, dass "auch Serverdaten gelöscht" werden. Es gibt
//    keine. Solche Formulierungen stehen in vielen Vorlagen, wären hier aber
//    schlicht falsch.
import { ref } from 'vue'

import BaseModal from './BaseModal.vue'
import { isStorageAvailable } from '../../storage/tierListStorage'

const props = defineProps({
  // Anzahl gespeicherter Tierlisten
  listCount: {
    type: Number,
    required: true,
  },
  // Anzahl Items in der aktiven Tierlist
  itemCount: {
    type: Number,
    required: true,
  },
})

defineEmits(['close', 'export', 'confirm'])

// Zweistufig: erst Übersicht, dann die eigentliche Sicherheitsabfrage.
// Löschen ist endgültig, deshalb soll es keinen einzelnen Klick weit weg sein.
const isConfirming = ref(false)

// Gibt es überhaupt etwas zu löschen?
const hasData = props.listCount > 0

// Im privaten Modus oder bei gesperrtem Speicher kann RankRoom gar nichts
// ablegen — dann wäre ein Löschen-Knopf sinnlos und verwirrend.
const storageWorks = isStorageAvailable()
</script>

<template>
  <BaseModal
    label="RankRoom"
    :title="isConfirming ? 'Wirklich alles löschen?' : 'Lokale Daten'"
    max-width="520px"
    @close="$emit('close')"
  >
    <!-- Schritt 1: Übersicht -->
    <template v-if="!isConfirming">
      <p>
        RankRoom speichert deine Tierlisten ausschließlich
        <strong>im Speicher deines Browsers</strong> auf diesem Gerät. Es gibt keinen Server und
        keine Datenbank — niemand außer dir hat Zugriff darauf.
      </p>

      <div v-if="!storageWorks" class="notice">
        Dieser Browser lässt derzeit keine Speicherung zu (das passiert zum Beispiel im privaten
        Modus). Es ist deshalb nichts dauerhaft gespeichert, was gelöscht werden könnte.
      </div>

      <div v-else-if="!hasData" class="notice">Aktuell ist nichts gespeichert.</div>

      <ul v-else class="data-summary">
        <li>
          <strong>{{ listCount }}</strong>
          {{ listCount === 1 ? 'gespeicherte Tierlist' : 'gespeicherte Tierlists' }}
        </li>
        <li>
          <strong>{{ itemCount }}</strong>
          {{ itemCount === 1 ? 'Item' : 'Items' }} in der aktuell geöffneten Liste
        </li>
      </ul>

      <p v-if="storageWorks && hasData">
        Beim Löschen werden alle Tierlisten von diesem Gerät entfernt und RankRoom startet mit einer
        leeren Liste neu. <strong>Das lässt sich nicht rückgängig machen.</strong> Sichere dir
        vorher am besten eine Kopie.
      </p>

      <div class="modal-actions">
        <button type="button" class="secondary-button" @click="$emit('close')">Schließen</button>

        <button
          v-if="storageWorks && hasData"
          type="button"
          class="export-button"
          @click="$emit('export')"
        >
          Vorher exportieren
        </button>

        <button
          v-if="storageWorks && hasData"
          type="button"
          class="danger-button"
          @click="isConfirming = true"
        >
          Alle Daten löschen
        </button>
      </div>
    </template>

    <!-- Schritt 2: Sicherheitsabfrage -->
    <template v-else>
      <p>
        Alle <strong>{{ listCount }}</strong>
        {{ listCount === 1 ? 'gespeicherte Tierlist' : 'gespeicherten Tierlists' }} werden endgültig
        von diesem Gerät entfernt — einschließlich aller hinzugefügten Bilder.
      </p>
      <p>Eine Wiederherstellung ist danach nicht möglich.</p>

      <div class="modal-actions">
        <button type="button" class="secondary-button" @click="isConfirming = false">Zurück</button>

        <button type="button" class="danger-button" @click="$emit('confirm')">
          Endgültig löschen
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
p {
  margin: 0 0 14px;
  color: var(--text-secondary);
  line-height: 1.65;
}

strong {
  color: var(--text);
}

.notice {
  margin-bottom: 14px;
  padding: 12px 14px;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;

  background: rgba(255, 255, 255, 0.04);
  color: var(--text-muted);
  font-size: 0.9rem;
}

.data-summary {
  margin: 0 0 16px;
  padding: 14px 16px 14px 32px;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;

  background: rgba(255, 255, 255, 0.04);
  color: var(--text-secondary);
  line-height: 1.8;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;

  margin-top: 24px;
}

.secondary-button,
.export-button,
.danger-button {
  border: 0;
  border-radius: 14px;
  padding: 12px 16px;

  color: white;
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;

  transition: filter 0.15s ease;
}

.secondary-button {
  background: rgba(255, 255, 255, 0.1);
}

.export-button {
  background: rgba(var(--accent-rgb), 0.28);
}

.danger-button {
  background: linear-gradient(135deg, #ff5c5c, #ff2f6d);
}

.secondary-button:hover,
.export-button:hover,
.danger-button:hover {
  filter: brightness(1.12);
}

.secondary-button:focus-visible,
.export-button:focus-visible,
.danger-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@media (max-width: 600px) {
  /* Auf schmalen Bildschirmen untereinander, damit die Beschriftungen nicht
     umbrechen und die Knöpfe gut treffbar bleiben */
  .modal-actions {
    flex-direction: column-reverse;
  }

  .secondary-button,
  .export-button,
  .danger-button {
    width: 100%;
    padding: 14px 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .secondary-button,
  .export-button,
  .danger-button {
    transition: none;
  }
}
</style>
