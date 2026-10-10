export async function enterAssignmentFullscreen() {
  try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); }
  catch { /* The existing guard provides the manual fullscreen action. */ }
}

export async function exitAssignmentFullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); }
  catch { /* Browser may already have left fullscreen. */ }
}
