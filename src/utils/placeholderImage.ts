import { PLACEHOLDER_IMAGE_PATH } from "../constants"

type DrupalFile = { attributes?: { uri?: { value?: string; url?: string } } }

export function normalizeDrupalAssetPath(value?: string): string {
  if (!value) {
    return '';
  }

  const withoutQuery = value.split('?')[0];
  if (withoutQuery.startsWith('public://')) {
    return `/sites/default/files/${withoutQuery.slice('public://'.length)}`;
  }

  try {
    return new URL(withoutQuery).pathname;
  } catch {
    return withoutQuery;
  }
}

function getFileName(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1);
}

// Drupal holds several copies of the placeholder (images/bricks/, default_images/,
// 2026-03/) and bricks reference whichever one an editor picked — on stage2 and
// prod that is images/bricks/, not the 2026-03/ copy DEV_PLACEHOLDER_IMAGE points
// at. So match on the file name, allowing the _0, _1, … suffix Drupal gives
// re-uploads, rather than on the full path.
export function isPlaceholderAssetPath(
  value?: string,
  placeholderPath: string = PLACEHOLDER_IMAGE_PATH
): boolean {
  const placeholderName = getFileName(normalizeDrupalAssetPath(placeholderPath));
  const fileName = getFileName(normalizeDrupalAssetPath(value));
  if (!placeholderName || !fileName) {
    return false;
  }

  const dot = placeholderName.lastIndexOf('.');
  const stem = dot > 0 ? placeholderName.slice(0, dot) : placeholderName;
  const ext = dot > 0 ? placeholderName.slice(dot) : '';
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escape(stem)}(_\\d+)?${escape(ext)}$`, 'i').test(fileName);
}

export function isDefaultDrupalImage(
  fileId?: string,
  file?: DrupalFile,
  placeholderPath: string = PLACEHOLDER_IMAGE_PATH
): boolean {
  const placeholderUuid = import.meta.env.DEV_PLACEHOLDER_IMAGE_UUID ?? '';
  if (placeholderUuid && fileId === placeholderUuid) {
    return true;
  }

  if (!file?.attributes) {
    return false;
  }

  return [file.attributes.uri?.value, file.attributes.uri?.url]
    .some((value) => isPlaceholderAssetPath(value, placeholderPath));
}
