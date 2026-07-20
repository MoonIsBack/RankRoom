// Macht aus einem Tierlist-Namen einen für Dateisysteme sicheren Dateinamen
// (ohne Endung), z. B. "Meine Liste!" -> "Meine-Liste".
// Wird sowohl vom JSON-Export als auch vom Bild-Export genutzt.
export function sanitizeFileBaseName(name) {
  return (
    (name || 'tierlist')
      .trim()
      .replace(/[^a-z0-9-_]+/gi, '-') // alles außer Buchstaben/Zahlen/-/_ zu "-"
      .replace(/^-+|-+$/g, '') || 'tierlist' // führende/abschließende "-" weg
  )
}
