# Ie Fushimi — website v01 (pre-opening)

Static site. No framework and no dependencies, only Node for the build and preview.

```
site/
  build.mjs          wraps src/pages/<lang>/*.html in the shared head/header/footer → public/
  serve.mjs          local preview server (node serve.mjs → http://localhost:4173)
  src/pages/<lang>/  page bodies per language: en, ja, zh (Simplified), ko
                     → published at /, /ja/, /zh/, /ko/ with the same sub-paths
  src/img-dims.json  image sizes used for width/height attributes
  public/            the deployable site (upload this folder)
```

## Editing
1. Edit a file in `src/pages/<lang>/`. Keep the markup the same across the four languages; only the words differ.
   Menu, footer, form and page titles live in the `T` dictionary in `build.mjs`.
2. Run `node build.mjs`.
3. Preview with `node serve.mjs`.

Images are written as `{{img slug | alt text | sizes}}`. The build turns this into a responsive `<img>` pointing at `public/assets/img/slug.webp` and `slug-640.webp`.

## Well water: one switch
Every sentence that says well water goes into tea is marked `data-provisional="well-to-tea"`.
If testing fails, set `SHOW_WELL_TO_TEA = false` at the top of `public/assets/js/site.js`, and those sentences disappear from every page.

## Brand
- Mark: the clean Four Fields icon, taken unaltered from the SVG in *The_Ie_Brand_Guidelines_Manual_Visual_v6.pptx*. The pressed-ink version (`The Ie Logo.png`) is for print only, so the site does not use it. The roof-chevron "∧ IE" mark is not used anywhere.
- Lockup: icon + "The Ie" wordmark + `FUSHIMI` descriptor, following the guideline pattern for approved extensions. **[TO CONFIRM with the brand owner]**
- Fonts: Tiempos Text and Suisse Int'l are licensed. Until the licences are supplied, the site uses **Source Serif 4** and **Inter** from Google Fonts. To switch, add `@font-face` rules. The font stacks in `site.css` already list the licensed fonts first.

## Not built yet (v01 scope)
- CMS: pages are plain HTML. When a CMS is chosen, the chapters, ledger, makers index and collaborations are the parts to move into it.
- Form backend: set `ENQUIRY_ENDPOINT` in `site.js`. Until then, the form tells the visitor to write by email.
- Partner Pack PDF, analytics (Plausible suggested).
- Floor plan: kept for reference only and not shown on the site, as requested.

## Publishing
Pushing to `main` deploys `public/` to GitHub Pages at https://ie.house (see `.github/workflows/deploy.yml`).
Search engines are asked not to list the site until `ALLOW_SEARCH_INDEXING` in `build.mjs` is set to `true`.
