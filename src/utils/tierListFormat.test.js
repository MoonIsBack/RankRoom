import { describe, expect, it } from 'vitest'

import { CURRENT_FORMAT_VERSION, EXPORT_FORMAT, SUPPORTED_FORMAT_VERSIONS } from './tierListFormat'

// Hier werden nicht einfach Konstanten nachgeplappert, sondern die eine Regel
// festgehalten, die zwischen ihnen gelten MUSS. Ohne sie könnte RankRoom eine
// Datei schreiben, die es selbst nicht mehr öffnen kann — und das würde man
// erst merken, wenn ein Nutzer seine Liste nicht mehr importieren kann.
describe('Dateiformat', () => {
  it('kann jede Datei lesen, die es selbst schreibt', () => {
    expect(SUPPORTED_FORMAT_VERSIONS).toContain(CURRENT_FORMAT_VERSION)
  })

  it('hat eine nicht-leere Kennung, an der Fremddateien erkannt werden', () => {
    expect(typeof EXPORT_FORMAT).toBe('string')
    expect(EXPORT_FORMAT.length).toBeGreaterThan(0)
  })

  it('führt die unterstützten Versionen als nicht-leere Liste von Zahlen', () => {
    expect(Array.isArray(SUPPORTED_FORMAT_VERSIONS)).toBe(true)
    expect(SUPPORTED_FORMAT_VERSIONS.length).toBeGreaterThan(0)
    SUPPORTED_FORMAT_VERSIONS.forEach((version) => {
      expect(Number.isInteger(version)).toBe(true)
    })
  })
})
