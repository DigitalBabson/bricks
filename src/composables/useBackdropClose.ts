// Close-on-backdrop handling shared by modal overlays. Bind `onPointerdown` and
// `onClick` on the backdrop element. A click closes only when both the press
// and the release land outside the content, so a drag that starts on the
// content (e.g. selecting caption text) and ends on the backdrop doesn't close.
export function createBackdropClose(
  isOutside: (event: MouseEvent) => boolean,
  close: () => void,
) {
  let pressStartedOutside = true

  return {
    onPointerdown(event: PointerEvent) {
      pressStartedOutside = isOutside(event)
    },
    onClick(event: MouseEvent) {
      const startedOutside = pressStartedOutside
      pressStartedOutside = true
      if (startedOutside && isOutside(event)) {
        close()
      }
    },
  }
}
