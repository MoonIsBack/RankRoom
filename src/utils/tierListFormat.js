// Gemeinsame Kennung, die in jede exportierte JSON-Datei geschrieben wird.
// Beim Import prüfen wir daran, dass es wirklich eine RankRoom-Datei ist
// (und keine beliebige andere JSON-Datei).
//
// Liegt bewusst in einer eigenen kleinen Datei, damit sowohl der Export als
// auch der Import darauf zugreifen können, ohne dass eine der beiden Dateien
// von der anderen abhängt.
export const EXPORT_FORMAT = 'rankroom-tierlist'
