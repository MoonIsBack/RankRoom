// Zugriff auf den localStorage des Browsers — die einzige Stelle im Projekt,
// die dauerhaft etwas auf dem Gerät speichert.
//
// Der localStorage ist überraschend zerbrechlich: Er kann voll sein, im
// privaten Modus gesperrt werden, oder die gespeicherten Daten sind beschädigt
// (z. B. weil ein Speichervorgang mittendrin abgebrochen wurde). Passiert
// eines davon ungebremst, startet die App gar nicht mehr — man sieht nur eine
// weiße Seite und kommt an seine Listen nicht mehr heran.
//
// Deshalb fängt hier JEDER Zugriff seine Fehler selbst ab und meldet dem
// Aufrufer verständlich, was los ist, statt die App abstürzen zu lassen.

// Schlüssel, unter dem wir alle Tierlisten im localStorage des Browsers speichern
const STORAGE_KEY = 'rankroom-tierlists'

// Alter Schlüsselname von früher (Singular statt Plural). Wurde umbenannt,
// aber bei Nutzern, die die App vorher schon offen hatten, kann darunter
// noch ungenutzter Datenmüll liegen. Wird beim Laden einmalig aufgeräumt.
const LEGACY_STORAGE_KEY = 'rankroom-tierlist'

// Ist der localStorage überhaupt benutzbar?
//
// Es genügt nicht zu prüfen, ob es ihn gibt: In manchen Browsern (u. a. Safari
// im privaten Modus, oder wenn der Nutzer Website-Daten komplett gesperrt hat)
// ist das Objekt vorhanden, wirft beim Schreiben aber sofort einen Fehler.
// Deshalb probieren wir es einmal richtig aus.
export function isStorageAvailable() {
  try {
    const testKey = '__rankroom_test__'
    localStorage.setItem(testKey, '1')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

// Speichert alle Tierlisten + welche davon gerade aktiv (ausgewählt) ist.
// localStorage kann nur Text speichern, deshalb wandeln wir das Objekt mit
// JSON.stringify in einen String um.
//
// Rückgabe: { ok: true } bei Erfolg, sonst { ok: false, reason: '...' }.
// Der Aufrufer entscheidet, ob und wie er den Nutzer darauf hinweist.
export function saveTierLists(activeTierListId, tierLists) {
  const data = {
    activeTierListId,
    tierLists,
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { ok: true }
  } catch (error) {
    // QuotaExceededError = der Speicher ist voll. Das ist der mit Abstand
    // häufigste Fall, weil Bilder als Text kodiert sehr viel Platz brauchen.
    // Die Namen unterscheiden sich je nach Browser, deshalb prüfen wir mehrere.
    const isQuotaError =
      error?.name === 'QuotaExceededError' ||
      error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error?.code === 22

    return {
      ok: false,
      reason: isQuotaError ? 'quota' : 'unavailable',
    }
  }
}

// Grobe Plausibilitätsprüfung der geladenen Daten.
//
// Ohne diese Prüfung würde eine beschädigte oder fremde Struktur ungeprüft in
// den Zustand der App fließen und dort später an ganz anderer Stelle einen
// Folgefehler auslösen — der dann sehr schwer zu finden wäre. Besser hier
// einmal sauber ablehnen.
function looksLikeValidData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false
  }

  if (!Array.isArray(data.tierLists) || data.tierLists.length === 0) {
    return false
  }

  return data.tierLists.every((tierList) => {
    return (
      Boolean(tierList) &&
      typeof tierList === 'object' &&
      typeof tierList.name === 'string' &&
      Array.isArray(tierList.items) &&
      Array.isArray(tierList.tiers)
    )
  })
}

// Lädt die gespeicherten Tierlisten wieder aus dem localStorage.
//
// Rückgabe:
//   { data: null,  recovered: false } — es war noch nie etwas gespeichert
//   { data: {...}, recovered: false } — alles in Ordnung
//   { data: null,  recovered: true  } — es lagen kaputte Daten dort, die
//                                       verworfen wurden. Der Aufrufer startet
//                                       dann mit einer frischen Liste und kann
//                                       einen Hinweis anzeigen.
export function loadTierLists() {
  try {
    // Alten, nicht mehr genutzten Schlüssel entfernen, falls noch vorhanden
    localStorage.removeItem(LEGACY_STORAGE_KEY)

    const savedData = localStorage.getItem(STORAGE_KEY)

    if (!savedData) {
      return { data: null, recovered: false }
    }

    const parsed = JSON.parse(savedData)

    if (!looksLikeValidData(parsed)) {
      return { data: null, recovered: true }
    }

    return { data: parsed, recovered: false }
  } catch {
    // Hier landen wir bei beschädigtem JSON (JSON.parse wirft) und bei
    // gesperrtem Speicher. In beiden Fällen ist die einzig sinnvolle Reaktion,
    // ohne gespeicherte Daten weiterzumachen, statt die App abstürzen zu lassen.
    //
    // Die kaputten Daten werden bewusst NICHT gelöscht: Vielleicht lassen sie
    // sich von Hand noch retten. Der nächste normale Speichervorgang
    // überschreibt sie ohnehin.
    return { data: null, recovered: true }
  }
}

// Löscht alle von RankRoom gespeicherten Daten von diesem Gerät.
// Wird von der "Lokale Daten löschen"-Funktion im Footer benutzt.
export function clearTierLists() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
