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

// Wie nah (in Pixel) man an den Rand muss, damit überhaupt gescrollt wird.
const EDGE_ZONE = 70

// Tempo GANZ AUSSEN am Rand, in Pixel pro Sekunde. Dazwischen wird sanft
// hochgeregelt (siehe RAMP_EXPONENT) — beim Betreten der Zone passiert also
// zunächst fast nichts, erst weit außen wird es wirklich schnell. Eine frühere
// Version legte stattdessen sofort mit voller Geschwindigkeit los, sobald man
// die Zone auch nur streifte; das fühlte sich an, als würde die Seite einem
// beim kleinsten Verrutschen davonlaufen.
const MAX_SPEED = 850

// Je höher, desto später wird es schnell. 2 = quadratisch: auf halbem Weg in
// die Zone hinein läuft es nur mit einem Viertel des Tempos.
const RAMP_EXPONENT = 2

export function createAutoScroll(onTick) {
  let frame = null
  let direction = 0
  // 0..1 — wie weit man in die Randzone hineinragt
  let intensity = 0
  let lastTimestamp = null

  function step(timestamp) {
    // Nach der verstrichenen ZEIT rechnen, nicht pro Bild: sonst scrollt ein
    // 120-Hz-Display doppelt so schnell wie ein 60-Hz-Display.
    const elapsed = lastTimestamp === null ? 0 : Math.min((timestamp - lastTimestamp) / 1000, 0.05)
    lastTimestamp = timestamp

    window.scrollBy(0, direction * intensity ** RAMP_EXPONENT * MAX_SPEED * elapsed)
    onTick()
    frame = requestAnimationFrame(step)
  }

  // Wird bei jeder Zeiger-Bewegung mit der aktuellen Y-Position aufgerufen
  function update(clientY) {
    const distanceFromTop = clientY
    const distanceFromBottom = window.innerHeight - clientY

    if (distanceFromTop < EDGE_ZONE) {
      direction = -1
      intensity = (EDGE_ZONE - distanceFromTop) / EDGE_ZONE
    } else if (distanceFromBottom < EDGE_ZONE) {
      direction = 1
      intensity = (EDGE_ZONE - distanceFromBottom) / EDGE_ZONE
    } else {
      stop()
      return
    }

    intensity = Math.min(Math.max(intensity, 0), 1)

    if (!frame) {
      lastTimestamp = null
      frame = requestAnimationFrame(step)
    }
  }

  function stop() {
    if (frame) {
      cancelAnimationFrame(frame)
      frame = null
    }
    direction = 0
    intensity = 0
    lastTimestamp = null
  }

  return { update, stop }
}
