<script setup>
// NUTZUNGSBEDINGUNGEN.
//
// Standardmäßig ausgeschaltet (legalConfig.showTerms). Sie sind keine Pflicht
// für ein kostenloses Werkzeug ohne Konten und ohne Bezahlfunktion — ob man
// sie veröffentlicht, ist eine Entscheidung des Betreibers.
//
// Bewusst kurz und ohne überzogene Haftungsausschlüsse: Klauseln, die die
// Haftung für Vorsatz, grobe Fahrlässigkeit oder Schäden an Leben, Körper und
// Gesundheit ausschließen wollen, sind ohnehin unwirksam und schaden dem
// Eindruck mehr, als sie nützen.
import LegalModal from './LegalModal.vue'
import { displayOperatorInfo } from '../../config/legalConfig'

defineEmits(['close'])
</script>

<template>
  <LegalModal title="Nutzungsbedingungen" @close="$emit('close')">
    <h3>1. Was RankRoom ist</h3>
    <p>
      RankRoom ist ein kostenloses Werkzeug, mit dem sich eigene Ranglisten („Tierlists“) erstellen
      lassen. Es läuft vollständig im Browser. Es gibt keine Anmeldung, kein Nutzerkonto und keine
      Übertragung deiner Inhalte an uns.
    </p>

    <h3>2. Kostenlose Nutzung</h3>
    <p>
      Die Nutzung ist kostenlos. Es entstehen keine Gebühren, es gibt keine kostenpflichtigen
      Zusatzfunktionen und keine Abonnements.
    </p>

    <h3>3. Deine Inhalte bleiben bei dir</h3>
    <p>
      Alles, was du in RankRoom erstellst — Namen, Listen und Bilder — wird ausschließlich auf
      deinem Gerät gespeichert. Du räumst uns
      <strong>keinerlei Nutzungsrechte an deinen Inhalten ein</strong>, weil wir sie schlicht nie
      erhalten.
    </p>

    <h3>4. Verantwortung für hinzugefügte Bilder</h3>
    <p>
      Du bist dafür verantwortlich, dass du die Bilder, die du hinzufügst, auch verwenden darfst.
      Verwende bitte nur Bilder, an denen du die erforderlichen Rechte besitzt oder deren Nutzung
      dir erlaubt ist.
    </p>
    <p>
      Die Verarbeitung erfolgt zwar rein lokal — sobald du eine Liste aber als Bild oder als Datei
      weitergibst oder veröffentlichst, gelten dafür die üblichen urheber- und
      persönlichkeitsrechtlichen Regeln. Rechtswidrige Inhalte dürfen nicht verwendet werden.
    </p>

    <h3>5. Verfügbarkeit</h3>
    <p>
      RankRoom wird ohne Zusicherung einer bestimmten Verfügbarkeit bereitgestellt. Der Dienst kann
      jederzeit geändert, eingeschränkt oder eingestellt werden. Ein Anspruch auf dauerhafte
      Bereitstellung besteht nicht.
    </p>

    <h3>6. Sicherung deiner Daten</h3>
    <p>
      Deine Listen liegen im Speicher deines Browsers. Dieser Speicher kann verloren gehen — etwa
      wenn du deine Browserdaten löschst, den privaten Modus verwendest, das Gerät wechselst oder
      der Speicherplatz erschöpft ist.
    </p>
    <p>
      <strong>Bitte exportiere wichtige Listen regelmäßig als Datei.</strong> Eine Wiederherstellung
      durch uns ist technisch ausgeschlossen, da uns deine Daten nie erreichen.
    </p>

    <h3>7. Haftung</h3>
    <p>
      Wir haften nach den gesetzlichen Bestimmungen. Für Schäden, die durch Datenverlust im
      Browserspeicher entstehen, wird nicht gehaftet, soweit dies gesetzlich zulässig ist und der
      Verlust nicht auf Vorsatz oder grober Fahrlässigkeit beruht. Die Haftung bei Verletzung von
      Leben, Körper oder Gesundheit sowie nach dem Produkthaftungsgesetz bleibt hiervon unberührt.
    </p>

    <h3>8. Änderungen</h3>
    <p>
      Diese Nutzungsbedingungen können angepasst werden, etwa wenn sich der Funktionsumfang von
      RankRoom ändert. Es gilt die jeweils auf dieser Seite veröffentlichte Fassung.
    </p>

    <p v-if="displayOperatorInfo.privacyPolicyDate" class="legal-date">
      Stand: {{ displayOperatorInfo.privacyPolicyDate }}
    </p>
  </LegalModal>
</template>
