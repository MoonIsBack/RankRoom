import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// CONTENT SECURITY POLICY (CSP)
//
// Eine Liste dessen, was der Browser für diese Seite überhaupt laden darf.
// Alles, was nicht ausdrücklich erlaubt ist, wird blockiert — falls also
// jemals fremder Code auf die Seite gelangen sollte, könnte er nichts
// nachladen und nichts nach außen senden.
//
// Jede Zeile ist bewusst so eng wie möglich gewählt, aber genau so weit, dass
// RankRoom vollständig funktioniert:
const CONTENT_SECURITY_POLICY = [
  // Grundregel: nur eigene Dateien von dieser Adresse
  "default-src 'self'",

  // Skripte ausschließlich aus eigenen Dateien. Vite baut alles in eine
  // JS-Datei, es gibt keine Skripte direkt im HTML — deshalb reicht 'self'
  // ohne jede Ausnahme.
  "script-src 'self'",

  // 'unsafe-inline' ist hier NÖTIG und lässt sich nicht vermeiden:
  // Die schwebende Karte beim Ziehen wird über eine style-Angabe direkt am
  // Element positioniert (:style in App.vue). Ohne diese Erlaubnis würde die
  // Karte beim Ziehen an der falschen Stelle kleben.
  "style-src 'self' 'unsafe-inline'",

  // data: und blob: sind ZWINGEND erforderlich:
  //   data: — hinzugefügte Bilder werden als Data-URL gespeichert
  //   blob: — die Vorschau und der Bild-Export erzeugen blob:-Adressen
  // Ohne sie wären Bilder unsichtbar und der Export kaputt.
  "img-src 'self' data: blob:",

  // Keine externen Schriften — RankRoom nutzt ausschließlich Systemschriften
  "font-src 'self'",

  // Keine Netzwerkverbindungen nach außen. RankRoom hat keinen Server und
  // ruft nichts ab; 'self' deckt nur das Nachladen eigener Dateien ab.
  "connect-src 'self'",

  // Keine Flash-/Java-/Objekt-Einbettungen
  "object-src 'none'",

  // Verhindert, dass eine eingeschleuste <base>-Angabe alle relativen Pfade
  // auf einen fremden Server umbiegt
  "base-uri 'self'",

  // Es gibt kein Formular, das irgendwohin sendet
  "form-action 'none'",
].join('; ')

// Hängt die CSP als <meta>-Angabe in die fertige index.html.
//
// WARUM NUR IM PRODUKTIONSBUILD?
// Der Entwicklungsserver von Vite lädt Änderungen live nach und benutzt dafür
// eine WebSocket-Verbindung zu localhost. Die Zeile "connect-src 'self'" würde
// genau diese Verbindung blockieren — das automatische Neuladen beim
// Programmieren wäre kaputt. Deshalb greift der Hook über apply: 'build' nur
// beim Bauen; "npm run dev" bleibt völlig unberührt.
//
// WARUM ALS META-ANGABE UND NICHT ALS HTTP-HEADER?
// Ein HTTP-Header wäre die sauberere Lösung, aber GitHub Pages erlaubt keine
// eigenen Header. Die Meta-Angabe ist die einzige Möglichkeit, die dort
// überhaupt funktioniert.
//
// EINSCHRÄNKUNG, DIE MAN KENNEN MUSS:
// "frame-ancestors" (Schutz davor, dass jemand die Seite unsichtbar in seine
// eigene einbettet) wirkt AUSSCHLIESSLICH als HTTP-Header und wird in einer
// Meta-Angabe vom Browser ignoriert. Diese Absicherung ist auf GitHub Pages
// deshalb technisch nicht erreichbar. Die Zeile hier wegzulassen ist ehrlicher,
// als etwas einzubauen, das nachweislich nichts tut. Bei einem späteren Umzug
// auf einen eigenen Hoster gehört sie als echter Header nachgerüstet.
function cspPlugin() {
  return {
    name: 'rankroom-csp',
    apply: 'build',
    transformIndexHtml(html) {
      // Bewusst NACH der Zeichensatz-Angabe eingefügt: <meta charset> soll so
      // weit wie möglich am Anfang stehen, damit der Browser die Kodierung
      // sofort kennt und Umlaute nie kurz falsch darstellt.
      const charsetTag = '<meta charset="UTF-8">'

      return html.replace(
        charsetTag,
        `${charsetTag}\n    <meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}">`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/RankRoom/',
  plugins: [vue(), cspPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
