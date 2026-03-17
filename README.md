# bricks
Babson bricks page for advancement
The data with images is stored on intranet.babson.edu
* Clone the project.
* Run 'npm install'
* Use 'npm run dev' to develop
* Build css and javascript with 'npm run build'
* Upload compiled js and css from dist to Terminal Four (bricks directory in the media).

## GitHub Pages review deploy

This repo can deploy to GitHub Pages from GitHub Actions without committing a local `.env` file.

Required repository or environment secrets:

* `DEV_DRUPAL_ENDPOINT`
* `DEV_SEARCHSTAX_ENDPOINT`
* `DEV_SEARCHSTAX_TOKEN`

Optional repository or environment variables:

* `DEV_HERO_IMAGE`
* `DEV_PLACEHOLDER_IMAGE`
* `DEV_PLACEHOLDER_IMAGE_UUID`

Optional repository variable:

* `PAGES_BASE_PATH` if you need to override the default `/<repo-name>/` GitHub Pages base path.

Setup steps:

1. In GitHub, enable `Settings > Pages` and set `Build and deployment` to `GitHub Actions`.
2. Add the required secrets above, and add any optional public image values as variables if you need to override the defaults. Use only browser-safe throwaway values, because Vite injects `DEV_*` values into the client bundle at build time.
3. Push to `develop` or run the `Deploy GitHub Pages` workflow manually.

Notes:

* The workflow writes a temporary `.env.production` during CI only; nothing sensitive is committed.
* If `DEV_DRUPAL_ENDPOINT`, `DEV_SEARCHSTAX_ENDPOINT`, or `DEV_SEARCHSTAX_TOKEN` are missing, the deploy fails fast instead of falling back to the intranet default.
