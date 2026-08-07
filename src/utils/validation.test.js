import { describe, expect, it } from 'vitest'

import {
  MAX_ITEM_NAME_LENGTH,
  MAX_TIER_NAME_LENGTH,
  formatFileSize,
  hasForbiddenKeys,
  isAllowedImageDataUrl,
  sanitizeItemName,
  sanitizeTierListName,
  sanitizeTierName,
} from './validation'

describe('Namen zurechtschneiden', () => {
  it('entfernt Leerzeichen am Anfang und Ende', () => {
    expect(sanitizeItemName('  Inception  ')).toBe('Inception')
  })

  // Steuerzeichen sind unsichtbar und kommen leicht über kopierten Text mit
  // hinein. Sie werden zu einem Leerzeichen, nicht ersatzlos gelöscht — sonst
  // würde aus "Zeile1\nZeile2" das schwer lesbare "Zeile1Zeile2".
  it('macht aus Zeilenumbrüchen und Tabs ein Leerzeichen', () => {
    expect(sanitizeItemName('Teil A\nTeil B')).toBe('Teil A Teil B')
    expect(sanitizeItemName('Teil A\tTeil B')).toBe('Teil A Teil B')
  })

  it('entfernt Steuerzeichen auch dann, wenn sie ganz außen stehen', () => {
    expect(sanitizeItemName('\n\nInception\n')).toBe('Inception')
  })

  it('gibt bei allem, was kein Text ist, einen leeren String zurück', () => {
    expect(sanitizeItemName(undefined)).toBe('')
    expect(sanitizeItemName(null)).toBe('')
    expect(sanitizeItemName(42)).toBe('')
    expect(sanitizeItemName({})).toBe('')
  })

  it('kürzt auf die jeweils passende Obergrenze', () => {
    const zuLang = 'x'.repeat(200)

    expect(sanitizeItemName(zuLang)).toHaveLength(MAX_ITEM_NAME_LENGTH)
    expect(sanitizeTierName(zuLang)).toHaveLength(MAX_TIER_NAME_LENGTH)
  })

  // Die drei Varianten müssen sich wirklich unterscheiden — sonst wäre die
  // Aufteilung sinnlos und ein Reihenname könnte so lang wie ein Listenname
  // werden und aus der farbigen Beschriftung herauslaufen.
  it('benutzt für Reihen eine strengere Grenze als für Items', () => {
    const zuLang = 'x'.repeat(200)

    expect(sanitizeTierName(zuLang).length).toBeLessThan(sanitizeItemName(zuLang).length)
    expect(sanitizeTierName(zuLang).length).toBeLessThan(sanitizeTierListName(zuLang).length)
  })
})

describe('isAllowedImageDataUrl', () => {
  it('erlaubt PNG und JPEG', () => {
    expect(isAllowedImageDataUrl('data:image/png;base64,iVBORw0KGgo=')).toBe(true)
    expect(isAllowedImageDataUrl('data:image/jpeg;base64,/9j/4AAQ')).toBe(true)
    expect(isAllowedImageDataUrl('data:image/jpg;base64,/9j/4AAQ')).toBe(true)
  })

  // Der eigentliche Zweck: Eine importierte JSON-Datei darf nichts anderes als
  // ein echtes Bild in ein <img> schleusen.
  it('lehnt alles andere ab', () => {
    expect(isAllowedImageDataUrl('data:image/svg+xml;base64,PHN2Zz4=')).toBe(false)
    expect(isAllowedImageDataUrl('data:text/html;base64,PGgxPg==')).toBe(false)
    expect(isAllowedImageDataUrl('https://example.com/bild.png')).toBe(false)
    expect(isAllowedImageDataUrl('')).toBe(false)
    expect(isAllowedImageDataUrl(undefined)).toBe(false)
  })

  it('lässt sich nicht davon täuschen, dass der Präfix mittendrin vorkommt', () => {
    expect(isAllowedImageDataUrl('x data:image/png;base64,iVBORw0KGgo=')).toBe(false)
  })
})

describe('hasForbiddenKeys', () => {
  it('meldet nichts bei harmlosen Daten', () => {
    expect(hasForbiddenKeys({ name: 'A', items: [{ name: 'B' }] })).toBe(false)
    expect(hasForbiddenKeys([])).toBe(false)
    expect(hasForbiddenKeys('Text')).toBe(false)
    expect(hasForbiddenKeys(null)).toBe(false)
  })

  // JSON.parse statt eines Objekt-Literals ist hier entscheidend: Schreibt man
  // { __proto__: ... } direkt im Code hin, setzt JavaScript den Prototyp und
  // legt gar keinen Schlüssel an. Aus JSON.parse kommt dagegen ein echter,
  // eigener Schlüssel — und genau der Fall soll erkannt werden.
  it('erkennt __proto__ aus einer eingelesenen JSON-Datei', () => {
    expect(hasForbiddenKeys(JSON.parse('{"__proto__": {"böse": true}}'))).toBe(true)
  })

  it('erkennt constructor und prototype', () => {
    expect(hasForbiddenKeys(JSON.parse('{"constructor": 1}'))).toBe(true)
    expect(hasForbiddenKeys(JSON.parse('{"prototype": 1}'))).toBe(true)
  })

  it('sucht auch tief in verschachtelten Objekten und Listen', () => {
    expect(hasForbiddenKeys(JSON.parse('{"a": {"b": {"__proto__": 1}}}'))).toBe(true)
    expect(hasForbiddenKeys(JSON.parse('{"items": [{"ok": 1}, {"prototype": 1}]}'))).toBe(true)
  })
})

describe('formatFileSize', () => {
  it('zeigt kleine Größen in Byte', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(999)).toBe('999 B')
  })

  it('zeigt mittlere Größen in KB', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1024 * 500)).toBe('500 KB')
  })

  // Mit Komma statt Punkt, weil die gesamte Oberfläche deutsch ist.
  it('zeigt große Größen in MB mit deutschem Dezimalkomma', () => {
    expect(formatFileSize(15 * 1024 * 1024)).toBe('15,0 MB')
    expect(formatFileSize(3.4 * 1024 * 1024)).toBe('3,4 MB')
  })
})
