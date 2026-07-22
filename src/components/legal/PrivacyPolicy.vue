<script setup>
// DATENSCHUTZERKLÄRUNG.
//
// Der Text beschreibt ausschließlich das, was RankRoom heute tatsächlich tut.
// Er nennt bewusst KEINE Dienste, die nicht eingebunden sind — eine
// Datenschutzerklärung, die Google Analytics oder Zahlungsdienste erwähnt,
// obwohl es sie nicht gibt, ist genauso falsch wie eine, die etwas verschweigt.
//
// Kommt später eine Funktion dazu (Werbung, Analyse, Konten …), gehören die
// passenden Abschnitte ergänzt. Fertige Textbausteine dafür stehen in
// LEGAL_AND_PRIVACY_SETUP.md.
import LegalModal from './LegalModal.vue'
import { hasOperatorAddress, displayOperatorInfo } from '../../config/legalConfig'

defineEmits(['close'])
</script>

<template>
  <LegalModal title="Datenschutzerklärung" @close="$emit('close')">
    <h3>Kurz gesagt</h3>
    <p>
      RankRoom läuft vollständig in deinem Browser. Deine Tierlisten, Namen und Bilder werden
      <strong>ausschließlich auf deinem Gerät</strong> gespeichert und niemals an uns oder an Dritte
      übertragen. Es gibt keinen Server, keine Datenbank, keine Nutzerkonten, kein Tracking und
      keine Cookies.
    </p>

    <h3>1. Verantwortlicher</h3>
    <template v-if="hasOperatorAddress()">
      <p>
        {{ displayOperatorInfo.name }}<br />
        {{ displayOperatorInfo.street }}<br />
        {{ displayOperatorInfo.postalCode }} {{ displayOperatorInfo.city }}
        <template v-if="displayOperatorInfo.contactEmail">
          <br />
          E-Mail: {{ displayOperatorInfo.contactEmail }}
        </template>
      </p>
    </template>
    <p v-else class="legal-note">
      Die Angaben zum Verantwortlichen sind noch nicht hinterlegt. RankRoom befindet sich derzeit in
      Entwicklung und wird nicht öffentlich beworben.
    </p>

    <h3>2. Hosting über GitHub Pages</h3>
    <p>
      Diese Seite wird über GitHub Pages ausgeliefert, einen Dienst der GitHub, Inc. (USA). Beim
      Aufruf der Seite verarbeitet GitHub technisch notwendige Zugriffsdaten in sogenannten
      Server-Logdateien. Dazu gehören üblicherweise:
    </p>
    <ul>
      <li>IP-Adresse des anfragenden Geräts</li>
      <li>Datum und Uhrzeit des Zugriffs</li>
      <li>Name der abgerufenen Datei und übertragene Datenmenge</li>
      <li>Browsertyp und Browserversion sowie das Betriebssystem</li>
      <li>gegebenenfalls die zuvor besuchte Seite (Referrer)</li>
    </ul>
    <p>
      Diese Verarbeitung erfolgt durch GitHub und ist technisch notwendig, damit die Seite überhaupt
      ausgeliefert werden kann. Auf Umfang, Speicherdauer und Verwendung dieser Logdaten haben wir
      keinen Einfluss und keinen Zugriff. Rechtsgrundlage ist das berechtigte Interesse an einer
      technisch fehlerfreien Bereitstellung (Art. 6 Abs. 1 lit. f DSGVO).
    </p>
    <p>
      Da GitHub seinen Sitz in den USA hat, ist eine Übermittlung von Daten in die USA nicht
      auszuschließen. Einzelheiten zur Datenverarbeitung durch GitHub finden sich in deren eigenen
      Datenschutzhinweisen.
    </p>

    <h3>3. Speicherung auf deinem Gerät (localStorage)</h3>
    <p>
      Damit deine Tierlisten nach dem Schließen des Browsers erhalten bleiben, speichert RankRoom
      sie im sogenannten <strong>localStorage</strong> deines Browsers — einem Speicher, der dein
      Gerät nicht verlässt.
    </p>
    <ul>
      <li><strong>Gespeicherter Eintrag:</strong> <code>rankroom-tierlists</code></li>
      <li>
        <strong>Inhalt:</strong> die Namen deiner Tierlisten, die Namen deiner Items, deine
        hinzugefügten Bilder, die Namen und Farben der Tier-Reihen sowie rein technische
        Zuordnungsnummern
      </li>
      <li><strong>Zweck:</strong> deine Listen beim nächsten Besuch wieder anzuzeigen</li>
      <li>
        <strong>Speicherdauer:</strong> unbegrenzt, bis du die Daten selbst löschst. Der
        localStorage läuft nicht automatisch ab.
      </li>
      <li>
        <strong>Löschen:</strong> jederzeit über „Lokale Daten löschen“ im Fußbereich dieser Seite
        oder über die Einstellungen deines Browsers
      </li>
    </ul>
    <p>
      Diese Speicherung ist für die Grundfunktion von RankRoom unbedingt erforderlich — ohne sie
      wäre deine Liste bei jedem Neuladen verloren. Es handelt sich <strong>nicht</strong> um
      Analyse-, Werbe- oder Wiedererkennungstechnik.
    </p>

    <h3>4. Bilder, die du hinzufügst</h3>
    <p>
      Bilder, die du über „Bilder auswählen“ oder per Ziehen und Ablegen hinzufügst, werden
      ausschließlich <strong>lokal in deinem Browser</strong> verarbeitet und gespeichert. Sie
      werden zu keinem Zeitpunkt hochgeladen oder übertragen.
    </p>
    <p>
      Beim Hinzufügen wird jedes Bild neu gezeichnet und dabei auf eine maximale Kantenlänge von
      1600 Pixeln begrenzt. Dieser Schritt entfernt gleichzeitig
      <strong>alle in der Bilddatei enthaltenen Metadaten</strong> — insbesondere GPS-Koordinaten
      des Aufnahmeorts, Aufnahmezeitpunkt und Kameramodell. Diese Angaben werden also gar nicht erst
      gespeichert und können folglich auch nicht in Exporten auftauchen.
    </p>

    <h3>5. Export und Import</h3>
    <p>
      RankRoom kann deine Liste als JSON-Datei oder als Bild (PNG/JPG) speichern. Beides geschieht
      vollständig in deinem Browser; die Datei wird direkt auf deinem Gerät erzeugt und dort
      abgelegt. Ebenso werden importierte JSON-Dateien nur lokal eingelesen.
    </p>
    <p>
      Auf Mobilgeräten kann das Bild statt über einen Download über das System-Teilen-Menü
      gespeichert werden. In diesem Fall übergibt RankRoom die fertige Bilddatei an dein
      Betriebssystem. Wohin sie von dort aus geht — etwa in deine Fotos oder in eine Messenger-App —
      entscheidest allein du im Teilen-Menü.
    </p>

    <h3>6. Was RankRoom ausdrücklich nicht tut</h3>
    <ul>
      <li>keine Nutzerkonten, keine Registrierung, keine Anmeldung</li>
      <li>kein eigener Server und keine eigene Datenbank</li>
      <li>keine Cookies</li>
      <li>keine Analyse-, Statistik- oder Trackingdienste</li>
      <li>keine Werbung und keine Affiliate-Links</li>
      <li>keine Zahlungsdienste</li>
      <li>keine externen Schriftarten, Skripte oder Inhalte von fremden Servern</li>
      <li>keine Veröffentlichung deiner Inhalte — was du erstellst, sieht nur dein Gerät</li>
      <li>kein Newsletter und kein Kontaktformular mit Serverübertragung</li>
    </ul>

    <h3>7. Deine Rechte</h3>
    <p>
      Nach der Datenschutz-Grundverordnung stehen dir gegenüber dem Verantwortlichen unter anderem
      das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung
      der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21) zu.
    </p>
    <p>
      In der Praxis gilt hier eine Besonderheit: Da RankRoom keine Daten an uns überträgt, liegen
      bei uns auch keine Daten über dich vor, auf die sich diese Rechte beziehen könnten. Die in
      deinem Browser gespeicherten Inhalte hast ausschließlich du in der Hand — du kannst sie
      jederzeit selbst einsehen, exportieren und löschen.
    </p>

    <h3>8. Beschwerderecht</h3>
    <p>
      Unabhängig davon steht dir das Recht zu, dich bei einer Datenschutz-Aufsichtsbehörde zu
      beschweren (Art. 77 DSGVO). Zuständig ist in der Regel die Aufsichtsbehörde deines
      Bundeslandes oder die des Verantwortlichen.
    </p>

    <p v-if="displayOperatorInfo.privacyPolicyDate" class="legal-date">
      Stand: {{ displayOperatorInfo.privacyPolicyDate }}
    </p>
  </LegalModal>
</template>

<style scoped>
code {
  padding: 2px 6px;

  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);

  font-size: 0.85em;
}
</style>
