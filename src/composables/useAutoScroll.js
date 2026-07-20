// Lässt die Seite automatisch weiterscrollen, während man beim Ziehen nah an
// den oberen/unteren Bildschirmrand kommt — so wie man es von Trello, Notion
// & Co. kennt. Gebraucht, damit man Items/Reihen auch dann verschieben kann,
// wenn Ziel und Quelle nicht gleichzeitig auf dem Bildschirm passen (v. a.
// auf dem Handy).
//
// onTick wird bei jedem Scroll-Schritt aufgerufen, damit die aufrufende
// Stelle (usePointerDrag.js / useRowPointerDrag.js) das Drop-Ziel neu
// berechnen kann — der Inhalt hat sich unter dem unbewegten Finger/Mauszeiger
// ja verschoben, auch wenn selbst kein neues pointermove-Event kommt.
const EDGE_ZONE = 90
const SCROLL_SPEED = 14

export function createAutoScroll(onTick) {
  let frame = null
  let direction = 0

  function step() {
    window.scrollBy(0, direction * SCROLL_SPEED)
    onTick()
    frame = requestAnimationFrame(step)
  }

  // Wird bei jeder Zeiger-Bewegung mit der aktuellen Y-Position aufgerufen
  function update(clientY) {
    let nextDirection = 0

    if (clientY < EDGE_ZONE) {
      nextDirection = -1
    } else if (clientY > window.innerHeight - EDGE_ZONE) {
      nextDirection = 1
    }

    if (nextDirection === 0) {
      stop()
      return
    }

    if (direction === nextDirection && frame) {
      return
    }

    direction = nextDirection

    if (!frame) {
      step()
    }
  }

  function stop() {
    if (frame) {
      cancelAnimationFrame(frame)
      frame = null
    }
    direction = 0
  }

  return { update, stop }
}
