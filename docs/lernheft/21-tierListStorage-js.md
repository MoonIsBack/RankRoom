# 📌 tierListStorage.js

`src/storage/tierListStorage.js` — 144 Zeilen

## Aufgabe

Die **einzige** Datei im Projekt, die den `localStorage` anfasst. Lesen, schreiben,
löschen.

## Warum existiert sie?

Zwei Gründe:

1. **Ein Ort statt viele.** Würde jede Komponente selbst speichern, hättest du
   Speicher-Code überall verstreut.
2. **Fehler abfangen.** Der localStorage ist überraschend zerbrechlich — und jeder
   Fehler dort legte früher die ganze App lahm.

## Wer benutzt sie?

Nur **`useTierLists.js`**. Sonst niemand.

Ausnahme: `LocalDataModal.vue` importiert `isStorageAvailable()`, um zu prüfen, ob
überhaupt gespeichert werden kann.

## Die Funktionen

### `saveTierLists(activeTierListId, tierLists)`

Speichert alles. Gibt zurück:

```js
{ ok: true }                        // hat geklappt
{ ok: false, reason: 'quota' }      // Speicher voll
{ ok: false, reason: 'unavailable' } // gesperrt
```

⭐ **Wichtig:** Die Funktion wirft **keinen Fehler**. Sie meldet zurück. Der
Aufrufer entscheidet, was er damit macht.

---

### `loadTierLists()`

Lädt alles. Gibt zurück:

```js
{ data: null,  recovered: false }  // noch nie etwas gespeichert
{ data: {…},   recovered: false }  // alles gut
{ data: null,  recovered: true }   // es lag Müll da, verworfen
```

**Der Unterschied zwischen den beiden `null`-Fällen ist entscheidend:**
Beim ersten Besuch soll keine Meldung kommen. Bei kaputten Daten schon — da hat der
Nutzer wirklich etwas verloren.

---

### `isStorageAvailable()`

Probiert einmal richtig aus, ob Schreiben geht.

⭐ **Warum nicht einfach prüfen, ob `localStorage` existiert?**
Weil es im privaten Modus mancher Browser **existiert**, aber beim Schreiben einen
Fehler wirft. Nur der echte Versuch verrät die Wahrheit.

---

### `clearTierLists()`

Löscht beide Schlüssel. Für „Lokale Daten löschen" im Footer.

---

### `looksLikeValidData(data)` (intern)

Prüft grob, ob die geladenen Daten überhaupt nach einer Tierlist aussehen.

**Warum:** Ohne diese Prüfung würde eine kaputte Struktur ungeprüft in die App
fließen und irgendwo ganz woanders einen Folgefehler auslösen — der dann sehr schwer
zu finden wäre.

## ⭐ Die zwei Bugs, die hier behoben wurden

**Vorher stand da einfach:**
```js
return JSON.parse(savedData)          // ohne Absicherung
localStorage.setItem(KEY, JSON.stringify(data))   // ohne Absicherung
```

**Folge 1:** Beschädigte Daten → `JSON.parse` warf einen Fehler → die App startete
**komplett weiß**, ohne jede Möglichkeit ranzukommen.

**Folge 2:** Voller Speicher → Fehler wurde verschluckt → die Änderung war auf dem
Bildschirm zu sehen, nach dem Neuladen aber **weg**. Stiller Datenverlust.

Beides ist jetzt abgefangen.

## Was passiert, wenn ich etwas ändere?

| Änderung | Folge |
|---|---|
| `STORAGE_KEY` umbenennen | **Alle Nutzer verlieren ihre Listen** |
| `try/catch` entfernen | Die zwei alten Bugs kommen zurück |
| `looksLikeValidData` lockern | Kaputte Daten kommen wieder durch |

## ⚠ Worauf achten

Die kaputten Daten werden **absichtlich nicht gelöscht**, wenn sie verworfen werden.
Vielleicht lassen sie sich von Hand noch retten. Der nächste normale Speichervorgang
überschreibt sie ohnehin.

## 💡 Merken

**Diese Datei stürzt nie ab.** Sie meldet Probleme zurück, statt sie zu werfen.
Genau deshalb läuft RankRoom auch im privaten Modus und mit vollem Speicher weiter.
