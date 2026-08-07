import { describe, expect, it } from 'vitest'

import { sanitizeFileBaseName } from './fileName'

describe('sanitizeFileBaseName', () => {
  it('ersetzt Zeichen, die in Dateinamen Ärger machen, durch Bindestriche', () => {
    expect(sanitizeFileBaseName('Meine Liste!')).toBe('Meine-Liste')
  })

  it('fasst mehrere unerlaubte Zeichen hintereinander zu EINEM Bindestrich zusammen', () => {
    expect(sanitizeFileBaseName('Beste   Filme 2026')).toBe('Beste-Filme-2026')
  })

  it('behält Buchstaben, Zahlen, Bindestrich und Unterstrich', () => {
    expect(sanitizeFileBaseName('Top_10-Liste')).toBe('Top_10-Liste')
  })

  it('entfernt Bindestriche am Anfang und am Ende', () => {
    expect(sanitizeFileBaseName('...Mitte...')).toBe('Mitte')
  })

  // Umlaute sind hier bewusst nicht erlaubt: Sie werden je nach Betriebssystem
  // unterschiedlich kodiert und führen beim Weitergeben von Dateien zu Ärger.
  it('ersetzt Umlaute, statt sie durchzulassen', () => {
    expect(sanitizeFileBaseName('Über Filme')).toBe('ber-Filme')
  })

  // Der wichtigste Fall: Es muss IMMER ein brauchbarer Name herauskommen,
  // sonst hieße die heruntergeladene Datei nur ".json".
  it('fällt auf "tierlist" zurück, wenn nichts Brauchbares übrig bleibt', () => {
    expect(sanitizeFileBaseName('')).toBe('tierlist')
    expect(sanitizeFileBaseName('!!!')).toBe('tierlist')
    expect(sanitizeFileBaseName(undefined)).toBe('tierlist')
    expect(sanitizeFileBaseName(null)).toBe('tierlist')
  })
})
