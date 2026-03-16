let lockCount = 0

export function lockBodyScroll() {
  lockCount++
  if (lockCount === 1) {
    document.body.style.overflow = 'hidden'
  }
}

export function unlockBodyScroll() {
  if (lockCount > 0) {
    lockCount--
  }
  if (lockCount === 0) {
    document.body.style.overflow = ''
  }
}
