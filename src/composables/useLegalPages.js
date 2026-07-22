// Steuert, welche rechtliche Seite gerade offen ist (Datenschutz, Impressum,
// Nutzungsbedingungen, Kontakt) — und verbindet das mit der Adresszeile.
//
// WARUM ÜBER DIE ADRESSE (#/datenschutz)?
// Ein Popup allein hat keine eigene Adresse: Man kann den Link zur
// Datenschutzerklärung niemandem schicken, und nach dem Neuladen der Seite ist
// sie wieder zu. Genau das erwartet man bei rechtlichen Seiten aber.
//
// WARUM MIT RAUTE (#) STATT ECHTER UNTERSEITEN?
// RankRoom liegt auf GitHub Pages und besteht aus einer einzigen HTML-Datei.
// Ruft jemand /RankRoom/datenschutz auf, sucht GitHub dort nach einer Datei,
// findet keine und zeigt eine 404-Seite. Alles nach der Raute wird dagegen gar
// nicht erst an den Server geschickt — es funktioniert also ohne Umwege,
// ohne zusätzliche Bibliothek und ohne 404-Trickserei.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import {
  canShowContact,
  canShowCookieSettings,
  canShowImprint,
  canShowTerms,
  legalConfig,
} from '../config/legalConfig'

// Adresse -> interner Name der Seite
const HASH_TO_PAGE = {
  '#/datenschutz': 'privacy',
  '#/impressum': 'imprint',
  '#/nutzungsbedingungen': 'terms',
  '#/kontakt': 'contact',
  '#/cookie-einstellungen': 'cookies',
}

// Und dieselbe Zuordnung andersherum, damit beim Öffnen die passende Adresse
// gesetzt werden kann
const PAGE_TO_HASH = Object.fromEntries(
  Object.entries(HASH_TO_PAGE).map(([hash, page]) => [page, hash]),
)

// Darf diese Seite überhaupt angezeigt werden?
//
// Das ist die entscheidende Stelle für die Anforderung "deaktivierte Bereiche
// dürfen nicht als leere Links erscheinen": Sowohl die Links im Footer als
// auch der direkte Aufruf einer Adresse gehen durch diese eine Prüfung.
// Wer #/impressum aufruft, obwohl das Impressum aus ist, bekommt schlicht
// nichts — keine leere Seite, kein Fehler.
function isPageAvailable(page) {
  if (page === 'privacy') {
    return legalConfig.showPrivacyPolicy
  }

  if (page === 'imprint') {
    // Nicht nur der Schalter, sondern auch die Vollständigkeit der Angaben
    return canShowImprint()
  }

  if (page === 'terms') {
    return canShowTerms()
  }

  if (page === 'contact') {
    return canShowContact()
  }

  if (page === 'cookies') {
    return canShowCookieSettings()
  }

  return false
}

export function useLegalPages() {
  // Name der gerade offenen Seite, oder null wenn keine offen ist
  const openPage = ref(null)

  // Liest die aktuelle Adresse und öffnet die passende Seite — sofern es sie
  // gibt und sie freigeschaltet ist.
  function syncFromHash() {
    const page = HASH_TO_PAGE[window.location.hash]

    if (page && isPageAvailable(page)) {
      openPage.value = page
      return
    }

    openPage.value = null

    // Zeigt die Adresse auf etwas, das es nicht (mehr) gibt, räumen wir sie
    // auf. Sonst bliebe z. B. #/impressum in der Adresszeile stehen, obwohl
    // nichts passiert — das sähe nach einem Fehler aus.
    if (window.location.hash && window.location.hash !== '#') {
      clearHash()
    }
  }

  // Entfernt die Raute aus der Adresse, ohne einen neuen Eintrag im Verlauf
  // anzulegen. replaceState statt pushState, damit der Zurück-Knopf des
  // Browsers nicht mit Popup-Zuständen vollläuft.
  function clearHash() {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  function openLegalPage(page) {
    if (!isPageAvailable(page)) {
      return
    }

    openPage.value = page

    const hash = PAGE_TO_HASH[page]

    if (hash && window.location.hash !== hash) {
      window.history.pushState(null, '', hash)
    }
  }

  function closeLegalPage() {
    openPage.value = null
    clearHash()
  }

  // Reagiert auf Vor/Zurück im Browser und auf von Hand eingetippte Adressen
  onMounted(() => {
    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    window.addEventListener('popstate', syncFromHash)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('hashchange', syncFromHash)
    window.removeEventListener('popstate', syncFromHash)
  })

  // Fertige Liste für den Footer: nur freigeschaltete Einträge, jeweils mit
  // Beschriftung und Adresse. Der Footer muss dadurch selbst nichts über die
  // Konfiguration wissen.
  const availableLinks = computed(() => {
    const links = [
      { page: 'privacy', label: 'Datenschutz' },
      { page: 'imprint', label: 'Impressum' },
      { page: 'terms', label: 'Nutzungsbedingungen' },
      { page: 'contact', label: 'Kontakt' },
      { page: 'cookies', label: 'Cookie-Einstellungen' },
    ]

    return links
      .filter((link) => isPageAvailable(link.page))
      .map((link) => ({ ...link, href: PAGE_TO_HASH[link.page] }))
  })

  return {
    openPage,
    openLegalPage,
    closeLegalPage,
    availableLinks,
  }
}
