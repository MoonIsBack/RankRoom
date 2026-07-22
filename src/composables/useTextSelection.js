// Unterdrückt das Markieren von Text, solange gezogen wird.
//
// Ohne das hält der Browser die Zieh-Bewegung für den Versuch, Text zu
// markieren, und färbt z. B. den Tier-Buchstaben blau ein, während man eine
// Reihe verschiebt.
//
// Zwei Feinheiten, die beide nötig sind:
//
// 1. Safari kennt "userSelect" ohne Präfix erst ab Version 17 — auf älteren
//    Geräten muss zusätzlich "webkitUserSelect" gesetzt werden, sonst
//    passiert dort weiterhin nichts.
//
// 2. Gesetzt wird das erst, wenn der Drag "scharf" wird (also nach ein paar
//    Pixeln Bewegung, siehe die arm-Funktionen). In dieser kurzen Zeit davor
//    kann der Browser bereits eine Markierung begonnen haben — die bleibt
//    dann sichtbar stehen, obwohl sie ab jetzt gesperrt ist. Deshalb wird
//    eine eventuell schon begonnene Markierung einmal aktiv aufgehoben.
export function suppressTextSelection() {
  document.body.style.userSelect = 'none'
  document.body.style.webkitUserSelect = 'none'

  window.getSelection()?.removeAllRanges()
}

export function restoreTextSelection() {
  document.body.style.userSelect = ''
  document.body.style.webkitUserSelect = ''
}
