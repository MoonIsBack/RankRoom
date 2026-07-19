// Globale CSS-Datei laden, damit die Styles in der ganzen App gelten
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Die Vue-App erstellen und in das <div id="app"> in index.html einhängen
createApp(App).mount('#app')
