<template>
  <!-- data-item-id wird für das Pointer-Drag-Hit-Testing gebraucht (siehe
       usePointerDrag.js: darüber wird erkannt, über welcher Karte gerade
       gezogen wird). Während der Name bearbeitet wird, lösen wir keinen Drag
       aus, damit man im Textfeld mit der Maus Text markieren kann. -->
  <div
    class="item-card"
    :class="{
      'is-dimmed': dimmed,
      'is-floating': floating,
      'is-placeholder': placeholder,
      'is-new': highlightDelay !== null,
      'is-leaving': removing,
    }"
    :style="highlightDelay !== null ? { '--new-delay': highlightDelay + 'ms' } : null"
    :data-item-id="removing ? null : itemId"
    @pointerdown="handlePointerDown"
  >
    <!-- Stift-Button (Namen bearbeiten) und Löschen-Button (×) werden nur im
         Item-Pool angezeigt, nicht in den Tier-Reihen -->
    <button
      v-if="showActions"
      class="edit-button"
      title="Namen bearbeiten"
      @pointerdown.stop
      @click="startEditing"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    </button>
    <button v-if="showActions" class="delete-button" @pointerdown.stop @click="$emit('delete')">
      ×
    </button>

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
      @pointerdown.stop
    />
    <span v-else :class="{ 'item-caption': image }">{{ name }}</span>
  </div>
</template>

<script setup>
// Eine einzelne Item-Karte (z. B. "Waves"), die sowohl im Item-Pool
// als auch in den Tier-Reihen (S, A, B, ...) verwendet wird.
import { computed, nextTick, ref } from 'vue'

const props = defineProps({
  // Eindeutige id des Items — wird als data-item-id fürs Drag-Hit-Testing
  // gebraucht (siehe usePointerDrag.js)
  itemId: {
    type: String,
    required: true,
  },
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
  // dimmed = dies ist das Original einer Karte, die gerade irgendwo hin
  // gezogen wird (die schwebende Kopie zeigt currently, wohin). Abgedunkelt,
  // damit klar ist: "diese Karte ist gerade unterwegs".
  dimmed: {
    type: Boolean,
    default: false,
  },
  // floating = dies ist die schwebende Kopie, die während eines Drags der
  // Zeiger-/Fingerposition folgt (siehe App.vue, per Teleport gerendert).
  // Nicht klickbar, nimmt keine Zeiger-Events entgegen.
  floating: {
    type: Boolean,
    default: false,
  },
  // placeholder = gestrichelte "Hier landet die Karte"-Vorschau an der
  // berechneten Einfüge-Position (siehe TierRow.vue/ItemPool.vue). Zeigt
  // Bild/Name der gezogenen Karte, ist aber selbst nicht interaktiv.
  placeholder: {
    type: Boolean,
    default: false,
  },
  // Ist gesetzt (Zahl in Millisekunden), wenn dieses Item gerade frisch
  // hinzugekommen ist — dann wird die Karte kurz grün hervorgehoben. Der Wert
  // ist die Start-Verzögerung: kommen mehrere Bilder auf einmal, laufen sie
  // dadurch versetzt nacheinander an. Siehe useRecentlyAdded.js.
  highlightDelay: {
    type: Number,
    default: null,
  },
  // Dieses Item wurde gelöscht und blendet gerade rötlich aus. Es liegt noch
  // ein paar hundert Millisekunden in den Daten, damit die Animation
  // überhaupt laufen kann. Siehe useRemovingItems.js.
  removing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['delete', 'pointer-down', 'rename'])

// Stift- und ×-Button gehören nur auf die "echte" Karte an ihrem Platz.
// Die schwebende Kopie unter dem Finger und die gestrichelte Vorschau sind
// reine Anzeige — dort würden die Buttons nur stören, weil sie ohnehin nicht
// bedienbar sind (siehe handlePointerDown unten).
const showActions = computed(() => props.showDelete && !props.floating && !props.placeholder)

function handlePointerDown(event) {
  // Während der Name bearbeitet wird oder bei einer der Sonder-Varianten
  // (dimmed/floating/placeholder) soll kein neuer Drag starten
  if (isEditingName.value || props.dimmed || props.floating || props.placeholder) {
    return
  }

  emit('pointer-down', event)
}

// Steuert, ob gerade der Name bearbeitet wird (Eingabefeld statt Text sichtbar)
const isEditingName = ref(false)
// Der Text im Eingabefeld, solange bearbeitet wird
const editedName = ref('')
// Referenz auf das Eingabefeld, um es beim Öffnen automatisch zu fokussieren
const editInputRef = ref(null)

async function startEditing() {
  editedName.value = props.name
  isEditingName.value = true

  // nextTick wartet, bis Vue das Eingabefeld wirklich ins HTML eingefügt hat,
  // erst danach können wir es fokussieren
  await nextTick()
  editInputRef.value?.focus()
  editInputRef.value?.select()
}

function saveEditing() {
  // Verhindert doppeltes Speichern, falls sowohl Enter als auch danach
  // "blur" (Fokus verlassen) ausgelöst werden
  if (!isEditingName.value) {
    return
  }

  isEditingName.value = false

  const trimmedName = editedName.value.trim()

  if (trimmedName && trimmedName !== props.name) {
    emit('rename', trimmedName)
  }
}

function cancelEditing() {
  isEditingName.value = false
}
</script>

<style scoped>
.item-card {
  position: relative;
  width: 100px;
  height: 100px;
  overflow: hidden;

  background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);

  display: flex;
  align-items: center;
  justify-content: center;

  color: white;
  font-weight: 800;
  font-size: 0.85rem;
  text-align: center;
  padding: 10px;

  cursor: grab;
  /* Wichtig fürs Touch-Dragging: der Browser soll auf dieser Karte selbst
     NIE scrollen/zoomen wollen, sonst liefert er sich beim Ziehen auf dem
     Handy ein Wettrennen mit unserer eigenen Pointer-Event-Logik. Man
     scrollt stattdessen einfach über die Fläche daneben. */
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-drag: none;
  user-select: none;

  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  /* Kurzes Einblenden, wenn eine Karte neu erscheint (z. B. nach dem Ablegen
     in einer Tier-Reihe oder beim Hinzufügen) */
  animation: card-place-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes card-place-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.item-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.34);
}

.item-card:active {
  cursor: grabbing;
}

/* Original-Karte, während sie gerade irgendwohin gezogen wird */
.item-card.is-dimmed {
  opacity: 0.35;
}

.item-card.is-dimmed:hover {
  transform: none;
}

/* Schwebende Kopie, die während eines Drags dem Zeiger/Finger folgt
   (siehe Teleport in App.vue) */
/* Kurze Hervorhebung frisch hinzugefügter Items (siehe useRecentlyAdded.js):
   ein grüner Rahmen leuchtet auf und blendet weich aus. Bewusst OHNE
   Größenänderung — die soll allein von card-place-in oben kommen.

   Achtung, hier steckte ein fieser Fehler drin: "animation" ist eine
   Kurzschreibweise, die die GANZE Liste ersetzt. Nennt man hier nur den
   Rahmen, ist card-place-in für die Dauer der Hervorhebung abgeschaltet — und
   sobald die Klasse nach 1,2 s wieder verschwindet, taucht es zurück in der
   Liste auf und läuft ERNEUT. Genau das sah man am Ende: die Karte wurde
   kurz klein und wieder groß. Deshalb steht card-place-in hier mit drin, an
   derselben Stelle wie oben: dann bleibt es beim Entfernen der Klasse
   unangetastet und wird nicht neu gestartet.

   Die Verzögerung fürs versetzte Starten kommt über --new-delay und gilt
   dadurch NUR für den Rahmen — card-place-in soll ja sofort laufen.

   "backwards" sorgt dafür, dass der Rahmen während der Wartezeit schon grün
   ist, statt erst am Ende der Wartezeit dorthin zu springen. */
.item-card.is-new {
  animation:
    card-place-in 0.22s cubic-bezier(0.16, 1, 0.3, 1),
    item-new-ring 1.2s cubic-bezier(0.4, 0, 0.2, 1) var(--new-delay, 0ms) backwards;
}

/* Der Schlagschatten der Karte (0 10px 24px ...) steht bewusst in JEDEM
   Schritt mit drin, und der letzte Schritt endet exakt auf den normalen
   Werten der Karte. Sonst verschwände der Schatten während der Animation und
   die Karte würde am Ende sichtbar zurückspringen. */
@keyframes item-new-ring {
  0% {
    border-color: rgba(52, 211, 153, 0.95);
    box-shadow:
      0 0 0 3px rgba(52, 211, 153, 0.35),
      0 10px 24px rgba(0, 0, 0, 0.28);
  }

  35% {
    border-color: rgba(52, 211, 153, 0.95);
    box-shadow:
      0 0 0 3px rgba(52, 211, 153, 0.3),
      0 10px 24px rgba(0, 0, 0, 0.28);
  }

  100% {
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow:
      0 0 0 3px rgba(52, 211, 153, 0),
      0 10px 24px rgba(0, 0, 0, 0.28);
  }
}

/* Gegenstück zum grünen Aufleuchten: ein gelöschtes Item blitzt kurz rot auf
   und löst sich dann nach oben auf — leicht kleiner werdend, unscharf und
   durchsichtig, wie ein Geist. Erst danach fliegt es wirklich aus den Daten
   (siehe useRemovingItems.js).

   Steht bewusst NACH der is-new-Regel: löscht jemand ein Item, das gerade
   erst hinzugekommen ist, sollen beide Klassen gleichzeitig gelten und das
   Verschwinden gewinnen. Bei gleicher Spezifität entscheidet die Reihenfolge.

   "forwards" hält den Endzustand, sonst poppte die Karte für die letzten
   Millisekunden vor dem Entfernen noch einmal sichtbar zurück. */
.item-card.is-leaving {
  animation: item-fade-out 0.32s cubic-bezier(0.4, 0, 0.2, 1) forwards;

  /* Während des Ausblendens nicht mehr anfassbar — weder anklicken noch
     ziehen. Zusätzlich fällt data-item-id weg (siehe oben im Template),
     damit die Drag-Logik die Karte gar nicht erst als Ziel in Betracht
     zieht. */
  pointer-events: none;
}

@keyframes item-fade-out {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
    border-color: rgba(248, 113, 113, 0.95);
    box-shadow:
      0 0 0 3px rgba(248, 113, 113, 0.4),
      0 10px 24px rgba(0, 0, 0, 0.28);
  }

  25% {
    opacity: 0.95;
    transform: scale(1.02) translateY(0);
    border-color: rgba(248, 113, 113, 0.95);
    box-shadow:
      0 0 0 3px rgba(248, 113, 113, 0.35),
      0 10px 24px rgba(0, 0, 0, 0.28);
  }

  100% {
    opacity: 0;
    transform: scale(0.86) translateY(-10px);
    filter: blur(3px);
    border-color: rgba(248, 113, 113, 0);
    box-shadow:
      0 0 0 3px rgba(248, 113, 113, 0),
      0 10px 24px rgba(0, 0, 0, 0);
  }
}

/* Bei "Bewegung reduzieren" bleibt das rote Aufleuchten und das Ausblenden,
   aber ohne Schrumpfen, Aufsteigen und Unschärfe. */
@media (prefers-reduced-motion: reduce) {
  @keyframes item-fade-out {
    0% {
      opacity: 1;
      border-color: rgba(248, 113, 113, 0.95);
    }

    100% {
      opacity: 0;
      border-color: rgba(248, 113, 113, 0);
    }
  }
}

.item-card.is-floating {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000;

  cursor: grabbing;
  pointer-events: none;

  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.45);
  transform: translate(-50%, -50%) scale(1.06);

  /* Die Platzier-Einblend-Animation soll bei der schwebenden Kopie nicht laufen */
  animation: none;
}

.item-card.is-floating:hover {
  transform: translate(-50%, -50%) scale(1.06);
}

/* Gestrichelte "Hier landet die Karte"-Vorschau an der berechneten
   Einfüge-Position (ersetzt den früheren dünnen Trennstrich — eine
   kartenförmige Vorschau zeigt deutlicher, WAS wohin gezogen wird) */
.item-card.is-placeholder {
  border-style: dashed;
  border-color: rgba(var(--accent-rgb), 0.55);
  background: rgba(var(--accent-rgb), 0.08);
  box-shadow: none;
  opacity: 0.65;
  cursor: default;
  pointer-events: none;
  animation: none;
}

.item-card.is-placeholder:hover {
  transform: none;
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

  /* .item-card schaltet Text-Auswahl/Touch-Gesten global aus (fürs Dragging),
     im Bearbeiten-Modus muss das Feld selbst aber wieder normal nutzbar sein */
  touch-action: manipulation;
  user-select: text;
}

.edit-button {
  position: absolute;
  top: 4px;
  left: 6px;
  z-index: 2;

  background: rgba(var(--accent-rgb), 0.75);
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
  background: rgba(var(--accent-rgb), 0.95);
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
