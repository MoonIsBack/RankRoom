// Schlüssel, unter dem wir alle Tierlisten im localStorage des Browsers speichern
const STORAGE_KEY = "rankroom-tierlists";

// Speichert alle Tierlisten + welche davon gerade aktiv (ausgewählt) ist.
// localStorage kann nur Text speichern, deshalb wandeln wir das Objekt mit
// JSON.stringify in einen String um.
export function saveTierLists(activeTierListId, tierLists) {
  const data = {
    activeTierListId,
    tierLists,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Lädt die gespeicherten Tierlisten wieder aus dem localStorage.
// Gibt "null" zurück, wenn noch nie etwas gespeichert wurde (z. B. beim allerersten Besuch).
export function loadTierLists() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return null;
  }

  return JSON.parse(savedData);
}

// Löscht alle gespeicherten Tierlisten wieder aus dem localStorage
export function clearTierListStorage() {
  localStorage.removeItem(STORAGE_KEY);
}
