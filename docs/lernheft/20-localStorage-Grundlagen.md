# localStorage — Grundlagen

## Wofür ist das?

Der `localStorage` ist ein kleiner Speicher **im Browser des Nutzers**. RankRoom
legt dort alle Tierlisten ab.

**Das ist der einzige Ort, an dem RankRoom dauerhaft etwas speichert.**

## Wann brauche ich das?

Immer wenn es um „bleibt nach dem Neuladen erhalten" geht.

## Die Eckdaten

| Eigenschaft | Wert |
|---|---|
| Wo? | Auf dem Gerät des Nutzers |
| Wie viel Platz? | ca. **5–10 MB**, je nach Browser |
| Was kann rein? | Nur **Text** |
| Läuft es ab? | **Nein** — bleibt für immer |
| Kommt der Server ran? | **Nein** |
| Kommen andere Websites ran? | **Nein** |

## Der eine Schlüssel

RankRoom benutzt genau einen:

```
rankroom-tierlists
```

Darin steht (als Text):

```json
{
  "activeTierListId": "uuid…",
  "tierLists": [
    {
      "id": "uuid…",
      "name": "RankRoom Default",
      "items": [ { "id": "…", "name": "Pizza", "image": null } ],
      "tiers": [ { "id": "…", "name": "S", "color": "#ff7f7f", "items": [] } ]
    }
  ]
}
```

Es gibt noch `rankroom-tierlist` (ohne s) — ein alter Name von früher. Der wird bei
jedem Laden **gelöscht**, nie geschrieben.

## ⭐ Warum Bilder so viel Platz brauchen

Der localStorage kann nur Text speichern. Bilder werden deshalb in Text umgewandelt
— eine sogenannte **Data-URL**:

```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ…
```

Das ist etwa **33 % größer** als die Originaldatei.

**Rechenbeispiel:**
Ein Handyfoto mit 4 MB wird zu ca. 5,3 MB Text. Bei 6–8 MB Gesamtplatz passen also
**ein oder zwei Fotos**, dann ist Schluss.

**Genau deshalb** werden Bilder beim Einlesen auf 1600 px verkleinert.
→ `31-EXIF-Entfernung`

## Was schiefgehen kann

| Problem | Wann? | Was RankRoom tut |
|---|---|---|
| Speicher voll | Zu viele Bilder | Meldung „Speicher voll" |
| Daten beschädigt | Abbruch beim Schreiben | Startet mit leerer Liste + Hinweis |
| Speicher gesperrt | Privater Modus | Läuft weiter, speichert nur nicht |

Alle drei sind abgefangen → `21-tierListStorage-js`

## Selbst nachschauen

Im Browser: **Entwicklertools öffnen** (F12) → Reiter „Application" bzw. „Speicher"
→ Local Storage.

Da siehst du den Schlüssel und kannst den Inhalt lesen. Praktisch zum Debuggen.

## ⚠ Vorsicht

**Der Nutzer kann das jederzeit löschen** — Browserdaten löschen, anderes Gerät,
privater Modus. Und du kannst nichts wiederherstellen, weil du die Daten nie
bekommst.

Deshalb steht in den Nutzungsbedingungen ausdrücklich: wichtige Listen exportieren.

## 💡 Merken

**localStorage ist kein Backup.** Es ist Bequemlichkeit — „deine Liste ist beim
nächsten Mal noch da". Mehr nicht.
