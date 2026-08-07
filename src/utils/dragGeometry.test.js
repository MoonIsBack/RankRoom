import { afterEach, describe, expect, it, vi } from 'vitest'

import { containsPoint, grownRect, toDocRect, withinVerticalBand } from './dragGeometry'

// toDocRect liest window.scrollY. Diese Tests laufen ohne Browser, deshalb
// wird das Fenster hier gestellt — so lässt sich gezielt prüfen, was bei
// gescrollter Seite passiert, ohne wirklich scrollen zu müssen.
function fensterMitScroll(scrollY) {
  vi.stubGlobal('window', { scrollY })
}

// Baut ein Rechteck, wie es getBoundingClientRect() liefern würde
function rect({ left, top, width, height }) {
  return { left, top, width, height, right: left + width, bottom: top + height }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('toDocRect', () => {
  it('lässt die Werte unverändert, solange die Seite nicht gescrollt ist', () => {
    fensterMitScroll(0)

    expect(toDocRect(rect({ left: 10, top: 20, width: 100, height: 50 }))).toEqual({
      left: 10,
      right: 110,
      top: 20,
      bottom: 70,
      width: 100,
      height: 50,
    })
  })

  // Der eigentliche Sinn der Funktion: getBoundingClientRect misst ab dem
  // oberen Fensterrand. Scrollt die Seite während des Ziehens, wandern diese
  // Werte, obwohl das Element im Dokument stehen geblieben ist.
  it('rechnet die Scrollposition auf oben und unten drauf', () => {
    fensterMitScroll(300)

    const ergebnis = toDocRect(rect({ left: 10, top: 20, width: 100, height: 50 }))

    expect(ergebnis.top).toBe(320)
    expect(ergebnis.bottom).toBe(370)
  })

  it('lässt links und rechts vom Scrollen unberührt', () => {
    fensterMitScroll(300)

    const ergebnis = toDocRect(rect({ left: 10, top: 20, width: 100, height: 50 }))

    expect(ergebnis.left).toBe(10)
    expect(ergebnis.right).toBe(110)
  })
})

describe('withinVerticalBand', () => {
  const band = { top: 100, bottom: 200 }

  it('erkennt Punkte innerhalb der Höhe', () => {
    expect(withinVerticalBand(band, 150, 0)).toBe(true)
  })

  it('zählt die Kanten selbst noch als drin', () => {
    expect(withinVerticalBand(band, 100, 0)).toBe(true)
    expect(withinVerticalBand(band, 200, 0)).toBe(true)
  })

  it('erkennt Punkte darüber und darunter', () => {
    expect(withinVerticalBand(band, 99, 0)).toBe(false)
    expect(withinVerticalBand(band, 201, 0)).toBe(false)
  })

  // margin ist der Toleranzbereich: knapp daneben soll noch als "gemeint"
  // durchgehen, damit die Vorschau beim Ziehen nicht ständig flackert.
  it('weitet die Grenze um margin nach außen', () => {
    expect(withinVerticalBand(band, 90, 20)).toBe(true)
    expect(withinVerticalBand(band, 210, 20)).toBe(true)
    expect(withinVerticalBand(band, 79, 20)).toBe(false)
  })
})

describe('containsPoint', () => {
  const feld = { left: 0, right: 100, top: 0, bottom: 100 }

  it('erkennt einen Punkt in der Mitte', () => {
    expect(containsPoint(feld, 50, 50, 0)).toBe(true)
  })

  it('erkennt Punkte außerhalb — waagerecht wie senkrecht', () => {
    expect(containsPoint(feld, 150, 50, 0)).toBe(false)
    expect(containsPoint(feld, -10, 50, 0)).toBe(false)
    expect(containsPoint(feld, 50, 150, 0)).toBe(false)
  })

  it('weitet auch waagerecht um margin', () => {
    expect(containsPoint(feld, 110, 50, 20)).toBe(true)
    expect(containsPoint(feld, 130, 50, 20)).toBe(false)
  })
})

describe('grownRect', () => {
  it('gibt das eingefrorene Rechteck zurück, wenn kein Element dranhängt', () => {
    const eingefroren = { left: 0, right: 100, top: 0, bottom: 50 }

    expect(grownRect({ el: null, rect: eingefroren })).toBe(eingefroren)
  })

  // Der Fall, für den es die Funktion gibt: Schiebt man eine Karte in eine
  // Reihe, die schon genau voll ist, bekommt die Reihe durch den Platzhalter
  // eine zweite Zeile und wird höher. Ohne Nachmessen ließe sich in dieser
  // neuen Zeile nichts ablegen.
  it('wächst nach unten mit, wenn die Reihe inzwischen höher ist', () => {
    fensterMitScroll(0)

    const ergebnis = grownRect({
      rect: { left: 0, right: 100, top: 0, bottom: 50 },
      el: { getBoundingClientRect: () => rect({ left: 0, top: 0, width: 100, height: 120 }) },
    })

    expect(ergebnis.bottom).toBe(120)
  })

  // Wichtig gegen Aufschaukeln: Die Messung darf das Rechteck nur vergrößern.
  // Könnte sie es auch schrumpfen lassen, könnte die anvisierte Zone während
  // des Ziehens hin- und herspringen.
  it('schrumpft nie, auch wenn das Element inzwischen kleiner ist', () => {
    fensterMitScroll(0)

    const ergebnis = grownRect({
      rect: { left: 0, right: 100, top: 0, bottom: 50 },
      el: { getBoundingClientRect: () => rect({ left: 20, top: 10, width: 40, height: 20 }) },
    })

    expect(ergebnis).toEqual({ left: 0, right: 100, top: 0, bottom: 50 })
  })

  it('berücksichtigt die Scrollposition beim Nachmessen', () => {
    fensterMitScroll(200)

    const ergebnis = grownRect({
      rect: { left: 0, right: 100, top: 200, bottom: 250 },
      el: { getBoundingClientRect: () => rect({ left: 0, top: 0, width: 100, height: 120 }) },
    })

    expect(ergebnis.bottom).toBe(320)
  })
})
