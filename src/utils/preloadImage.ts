// Map images are ~775 KB PNGs that are only fetched once a modal opens, so on a
// cold cache they pop in after the modal's fade has finished. Warming the one
// image a visitor is about to open (on hover, focus or first touch of its
// trigger) buys the 100–300ms before the click. Preloading every map up front
// would cost ~6 MB per page view, most of it for maps nobody opens.
const preloaded = new Map<string, HTMLImageElement>()

export function preloadImage(url?: string): void {
  if (!url || preloaded.has(url)) {
    return
  }

  const img = new Image()
  img.decoding = 'async'
  img.src = url
  // Hold a reference so the request isn't dropped before it completes.
  preloaded.set(url, img)
}
