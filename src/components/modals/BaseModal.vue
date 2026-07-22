<script setup>
// Gemeinsames Grundgerüst für alle Popups (Modals): der abgedunkelte
// Hintergrund, das zentrierte Panel und die optionale Kopfzeile mit Titel
// und Schließen-Knopf. Der eigentliche Inhalt kommt per <slot> von außen.
//
// Hier steckt außerdem die komplette Tastatur- und Screenreader-Unterstützung
// für ALLE Popups der App — sie muss deshalb nur einmal gebaut werden und
// wirkt überall gleich:
//
//  - Escape schließt das Popup
//  - der Tastaturfokus bleibt im Popup gefangen ("Fokusfalle"), man tabbt sich
//    also nicht aus Versehen in die Seite dahinter
//  - beim Schließen kehrt der Fokus zu dem Knopf zurück, der das Popup geöffnet hat
//  - Screenreader kündigen es als Dialog samt Titel an
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'

defineProps({
  // Kleine Beschriftung über dem Titel (z. B. "RankRoom"), optional
  label: {
    type: String,
    default: '',
  },
  // Überschrift des Popups. Ist sie gesetzt, wird die Kopfzeile angezeigt.
  title: {
    type: String,
    default: '',
  },
  // Ob rechts oben ein ✕-Knopf zum Schließen erscheint
  showClose: {
    type: Boolean,
    default: true,
  },
  // Maximale Breite des Panels (unterschiedlich je Popup)
  maxWidth: {
    type: String,
    default: '460px',
  },
})

const emit = defineEmits(['close'])

// Eindeutige id für die Überschrift. Screenreader lesen über aria-labelledby
// genau diesen Text vor, wenn das Popup aufgeht. useId() vergibt pro
// Komponenten-Instanz eine eigene id — wichtig, weil mehrere Popups
// gleichzeitig im Dokument stehen können.
const titleId = useId()

// Das Panel selbst, damit wir darin nach fokussierbaren Elementen suchen können
const modalRef = ref(null)

// Element, das den Fokus hatte, BEVOR das Popup aufging. Dorthin geben wir
// ihn beim Schließen zurück — sonst landet der Fokus am Seitenanfang und man
// muss sich mühsam zurücktabben.
let previouslyFocused = null

// Alles, was man per Tab erreichen kann. :not([disabled]) blendet ausgegraute
// Knöpfe aus, tabindex="-1" schließt bewusst übersprungene Elemente aus.
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function getFocusableElements() {
  if (!modalRef.value) {
    return []
  }

  // offsetParent === null heißt: das Element ist gerade nicht sichtbar
  // (z. B. display: none). Solche Elemente darf der Fokus nicht anspringen.
  return Array.from(modalRef.value.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
    return element.offsetParent !== null
  })
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  const focusable = getFocusableElements()

  if (focusable.length === 0) {
    // Nichts zum Anspringen da — dann darf der Fokus das Popup auch nicht
    // verlassen, sonst steht man plötzlich in der Seite dahinter
    event.preventDefault()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  // Am Ende der Liste vorwärts weiter → zurück zum Anfang, und umgekehrt.
  // Genau das macht die Fokusfalle aus.
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
    return
  }

  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(async () => {
  previouslyFocused = document.activeElement

  // Warten, bis der Inhalt des Popups wirklich im Dokument steht — vorher
  // gäbe es noch nichts zu fokussieren
  await nextTick()

  const focusable = getFocusableElements()

  // Wohin der Fokus beim Öffnen springt, hängt davon ab, worum es im Popup geht:
  //
  // Gibt es ein Eingabefeld (z. B. "Neue Tierlist" oder das Umbenennen), soll
  // man sofort lostippen können — dorthin.
  //
  // Sonst (reine Textseiten wie Datenschutz oder Impressum) bekommt das Panel
  // selbst den Fokus. Auf das erste Bedienelement zu springen hieße dort, auf
  // dem Schließen-Knopf zu landen: Screenreader läsen "Schließen" statt des
  // Titels vor, und für Sehende blitzte ein Fokusrahmen genau auf dem ✕ auf.
  // Vom Panel aus wird der Titel angesagt und man tabbt sich in Ruhe hinein.
  const firstInput = focusable.find((element) => {
    return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA'
  })

  if (firstInput) {
    firstInput.focus()
  } else {
    modalRef.value?.focus()
  }

  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)

  // Fokus zurückgeben. Der Knopf kann inzwischen verschwunden sein (z. B. wenn
  // das Popup ihn selbst entfernt hat), deshalb die vorsichtige Prüfung.
  //
  // document.body wird bewusst ausgenommen: Safari setzt beim MAUSKLICK auf
  // einen Link oder Knopf keinen Fokus — dort ist vor dem Öffnen also gar
  // nichts fokussiert. Dann gibt es auch nichts zurückzugeben, und ein
  // body.focus() wäre nur ein wirkungsloser Aufruf. Bei Tastaturbedienung
  // (Tab + Enter) ist das auslösende Element sehr wohl fokussiert — genau
  // dort greift die Rückgabe, und genau dafür ist sie gedacht.
  const canRestore =
    previouslyFocused &&
    previouslyFocused !== document.body &&
    typeof previouslyFocused.focus === 'function'

  if (canRestore) {
    previouslyFocused.focus()
  }
})
</script>

<template>
  <!-- Klick auf den Hintergrund schließt das Popup, Klick INS Panel nicht (@click.stop) -->
  <div class="modal-backdrop" @click="$emit('close')">
    <!-- role/aria-modal sagen Screenreadern, dass hier ein Dialog offen ist und
         alles dahinter währenddessen nicht bedient werden kann.
         aria-labelledby verweist auf die Überschrift, damit sie vorgelesen wird.
         tabindex="-1" macht das Panel per Programm fokussierbar (für Popups
         ohne eigenes Bedienelement), ohne es in die Tab-Reihenfolge zu hängen. -->
    <div
      ref="modalRef"
      class="modal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="title ? titleId : undefined"
      tabindex="-1"
      :style="{ maxWidth }"
      @click.stop
    >
      <div v-if="title" class="modal-header">
        <div>
          <p v-if="label" class="modal-label">{{ label }}</p>
          <h2 :id="titleId">{{ title }}</h2>
        </div>

        <button
          v-if="showClose"
          type="button"
          class="close-button"
          aria-label="Schließen"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Eigener Bereich, damit bei viel Inhalt NUR er scrollt und die
           Überschrift oben stehen bleibt (siehe .modal-body im Style) -->
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(8px);

  /* Hintergrund sanft einblenden, wenn das Popup erscheint */
  animation: modal-fade-in 0.18s ease;
}

.modal {
  width: 100%;
  padding: 24px;

  /* Das Popup darf nie höher werden als der Bildschirm — sonst laufen z. B.
     viele gespeicherte Listen unten aus dem Bild heraus und man kommt nicht
     mehr an sie heran. Die 48px sind der Innenabstand des Hintergrunds
     (24px oben + 24px unten).

     dvh statt vh: auf dem Handy ändert sich die sichtbare Höhe, wenn die
     Adressleiste beim Scrollen ein- und ausfährt. vh rechnet dort mit der
     GRÖSSTEN Höhe, das Popup wäre also zeitweise höher als das, was man
     wirklich sieht. dvh nimmt die tatsächlich sichtbare Höhe. Die vh-Zeile
     davor bleibt als Rückfall für ältere Browser stehen. */
  max-height: calc(100vh - 48px);
  max-height: calc(100dvh - 48px);

  /* Damit die Überschrift feststeht und nur der Inhalt darunter scrollt */
  display: flex;
  flex-direction: column;

  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 28px;

  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)), #101016;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);

  color: white;

  /* Panel leicht von unten hochschieben und einblenden */
  animation: modal-pop-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-pop-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* Der scrollbare Inhaltsbereich. min-height: 0 ist hier der entscheidende
   Punkt: ohne ihn weigert sich ein Flex-Kind zu schrumpfen und wächst über
   das Popup hinaus, statt zu scrollen. */
.modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  /* Etwas Luft rechts, damit der Inhalt nicht an der Bildlaufleiste klebt */
  padding-right: 4px;
  margin-right: -4px;
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

  color: var(--text-muted);
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
  flex-shrink: 0;
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

/* Sichtbarer Rahmen, sobald man per Tastatur hierher navigiert.
   :focus-visible statt :focus, damit der Rahmen nur bei Tastaturbedienung
   erscheint und nicht bei jedem Mausklick. */
.close-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Das Panel bekommt beim programmatischen Fokussieren keinen Rahmen —
   dort ist der Fokus nur ein technischer Zwischenschritt für Screenreader
   und für den Nutzer nicht als Bedienelement gemeint. */
.modal:focus {
  outline: none;
}

/* Wer im Betriebssystem "Bewegung reduzieren" eingestellt hat, bekommt die
   Popups ohne Auf- und Einblendbewegung. Sie erscheinen dann einfach. */
@media (prefers-reduced-motion: reduce) {
  .modal-backdrop,
  .modal {
    animation: none;
  }

  .close-button {
    transition: none;
  }

  .close-button:hover {
    transform: none;
  }
}

@media (max-width: 600px) {
  .modal {
    padding: 20px;

    /* Auf dem Handy ist der Hintergrund-Innenabstand kleiner (siehe unten) */
    max-height: calc(100vh - 32px);
    max-height: calc(100dvh - 32px);
  }

  .modal-backdrop {
    padding: 16px;
  }

  .modal-header h2 {
    font-size: 1.55rem;
  }
}
</style>
