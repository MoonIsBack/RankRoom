// RECHENHILFEN FÜRS ZIEHEN UND ABLEGEN.
//
// Reine Rechnerei mit Rechtecken und Punkten — hier steckt kein Zustand, kein
// Vue und kein Wissen darüber, was gerade gezogen wird. Jede Funktion bekommt
// alles als Parameter und liefert immer dasselbe Ergebnis für dieselbe Eingabe.
//
// Ausgelagert aus usePointerDrag.js, damit dort nur noch der eigentliche
// Ablauf der Geste steht (anfassen, bewegen, loslassen) und nicht zusätzlich
// die Geometrie dahinter.

// Fenster-relatives Rect -> dokument-relativ.
//
// getBoundingClientRect() misst ab dem oberen Fensterrand. Scrollt die Seite
// während des Ziehens, verschieben sich diese Werte, obwohl das Element an
// derselben Stelle im Dokument geblieben ist. Mit window.scrollY gerechnet
// bleiben die Werte über das Scrollen hinweg vergleichbar.
export function toDocRect(rect) {
  return {
    left: rect.left,
    right: rect.right,
    width: rect.width,
    height: rect.height,
    top: rect.top + window.scrollY,
    bottom: rect.bottom + window.scrollY,
  }
}

// Das eingefrorene Rechteck einer Zone, erweitert um das, was die Zone
// inzwischen tatsächlich einnimmt.
//
// Der eine Fall, in dem das Einfrieren allein nicht reicht: schiebt man eine
// Karte in eine Reihe, die bereits genau voll ist, bekommt diese Reihe durch
// den Platzhalter eine ZWEITE ZEILE und wird dadurch höher. Die neue Zeile
// liegt aber unterhalb des eingefrorenen Rechtecks — dort hätte nach den
// alten Werten schon die nächste Reihe angefangen. Man konnte die Karte
// deshalb nur in die obere Zeile legen, nicht in die neu entstandene.
//
// Gemessen wird nur für die Zone, die ohnehin schon anvisiert ist, und das
// Rechteck kann dadurch ausschließlich WACHSEN. Ein Aufschaukeln ist damit
// ausgeschlossen: die Messung kann die Zone nie wechseln, nur halten.
export function grownRect(entry) {
  if (!entry.el) {
    return entry.rect
  }

  const live = toDocRect(entry.el.getBoundingClientRect())

  return {
    left: Math.min(entry.rect.left, live.left),
    right: Math.max(entry.rect.right, live.right),
    top: Math.min(entry.rect.top, live.top),
    bottom: Math.max(entry.rect.bottom, live.bottom),
  }
}

// Liegt der Punkt innerhalb des Rechtecks? margin weitet die Grenze nach
// außen auf, damit knapp daneben noch als "drin" zählt.
export function containsPoint(rect, x, docY, margin) {
  return (
    x >= rect.left - margin && x <= rect.right + margin && withinVerticalBand(rect, docY, margin)
  )
}

// Nur die Höhe betrachtet: liegt docY zwischen Ober- und Unterkante?
// Wird gebraucht, wenn der Zeiger seitlich neben einer Reihe steht, aber
// erkennbar noch diese Reihe gemeint ist.
export function withinVerticalBand(rect, docY, margin) {
  return docY >= rect.top - margin && docY <= rect.bottom + margin
}
