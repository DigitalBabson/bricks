// Drupal image style URLs are served with max-age=31536000, and their ?itok=
// token is derived from the style and file path — not the file contents. When an
// editor replaces an image in place, the URL is unchanged, so browsers and the
// Acquia CDN keep serving the old derivative for up to a year. Appending the file
// entity's `changed` timestamp gives each revision of the file its own URL.
export function withCacheBuster<T extends string | undefined>(url: T, changed?: string): T {
  if (!url || !changed) {
    return url;
  }

  const timestamp = Date.parse(changed);
  if (Number.isNaN(timestamp)) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${Math.floor(timestamp / 1000)}` as T;
}
