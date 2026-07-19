// Schlüssel, unter dem wir alle Tierlisten im localStorage des Browsers speichern
const STORAGE_KEY = 'rankroom-tierlists'

// Alter Schlüsselname von früher (Singular statt Plural). Wurde umbenannt,
// aber bei Nutzern, die die App vorher schon offen hatten, kann darunter
// noch ungenutzter Datenmüll liegen. Wird beim Laden einmalig aufgeräumt.
const LEGACY_STORAGE_KEY = 'rankroom-tierlist'

// Speichert alle Tierlisten + welche davon gerade aktiv (ausgewählt) ist.
// localStorage kann nur Text speichern, deshalb wandeln wir das Objekt mit
// JSON.stringify in einen String um.
export function saveTierLists(activeTierListId, tierLists) {
  const data = {
    activeTierListId,
    tierLists,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Lädt die gespeicherten Tierlisten wieder aus dem localStorage.
// Gibt "null" zurück, wenn noch nie etwas gespeichert wurde (z. B. beim allerersten Besuch).
export function loadTierLists() {
  // Alten, nicht mehr genutzten Schlüssel entfernen, falls noch vorhanden
  localStorage.removeItem(LEGACY_STORAGE_KEY)

  const savedData = localStorage.getItem(STORAGE_KEY)

  if (!savedData) {
    return null
  }

  return JSON.parse(savedData)
}
