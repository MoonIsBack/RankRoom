// Gemeinsame Kennung, die in jede exportierte JSON-Datei geschrieben wird.
// Beim Import prüfen wir daran, dass es wirklich eine RankRoom-Datei ist
// (und keine beliebige andere JSON-Datei).
//
// Liegt bewusst in einer eigenen kleinen Datei, damit sowohl der Export als
// auch der Import darauf zugreifen können, ohne dass eine der beiden Dateien
// von der anderen abhängt.
export const EXPORT_FORMAT = 'rankroom-tierlist'

// Version des Dateiformats. Wird in jede exportierte Datei geschrieben und
// beim Import geprüft.
//
// Wozu das gut ist: Wenn das Format später einmal erweitert wird (neue Felder,
// andere Struktur), bekommt es die Version 2. Eine ältere RankRoom-Fassung
// erkennt dann, dass sie die Datei nicht versteht, und sagt das verständlich —
// statt sie halb einzulesen und dabei Daten zu verlieren.
export const CURRENT_FORMAT_VERSION = 1

// Welche Versionen diese Fassung von RankRoom lesen kann.
//
// Kommt später Version 2 dazu, wird sie hier ergänzt und im Import eine
// Umwandlungsfunktion ("Migration") von 1 nach 2 eingebaut. Dann lassen sich
// alte Dateien weiterhin öffnen.
export const SUPPORTED_FORMAT_VERSIONS = [1]
