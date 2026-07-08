const STORAGE_KEY = "rankroom-tierlists";

export function saveTierLists(activeTierListId, tierLists) {
  const data = {
    activeTierListId,
    tierLists,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadTierLists() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return null;
  }

  return JSON.parse(savedData);
}

export function clearTierListStorage() {
  localStorage.removeItem(STORAGE_KEY);
}