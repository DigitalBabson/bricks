// Endpoint-first: use the full CMS URL when available, fall back to the relative
// Drupal path so placeholder detection and display stay consistent everywhere.
export const PLACEHOLDER_IMAGE_PATH: string =
  import.meta.env.DEV_PLACEHOLDER_IMAGE ||
  '/sites/default/files/images/bricks/coming-soon-gray.jpg'
