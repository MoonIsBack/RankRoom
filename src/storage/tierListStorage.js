const STORAGE_KEY = "rankroom-tierlist";

export function saveTierList(items, tiers) {
  const data = {
    items,
    tiers,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadTierList() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return null;
  }

  return JSON.parse(savedData);
}

export function clearTierListStorage() {
  localStorage.removeItem(STORAGE_KEY);
}