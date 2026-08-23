# Book Publication Rules

These instructions apply to every book under `books/` and supplement the repository-root `AGENTS.md`.

## Complete Book Asset Workflow

A book is not publication-complete until it has all three presentation assets below in its book directory:

- `cover.jpg`
- `poem.html`
- `song.mp3`

### 1. Cover

- Generate or prepare several suitable cover concepts based on the book's accepted story, tone, setting, and major characters.
- Present meaningful alternatives to the user when a cover has not already been selected.
- The user's selected image is authoritative. Do not silently substitute a different generated option.
- Convert the selected image to JPEG if required and save the final asset as `cover.jpg` in the book directory.
- The cover may be resized/compressed for the web, but its composition must not be materially changed without review.

### 2. Poem

- Before drafting a new book poem, inspect the poems of the closest existing books in the same series, or otherwise similar books in the Interactive Library.
- Use those poems as structural inspiration: stanza count and length, cadence, rhyme approach, refrain/chorus pattern, narrative progression, and overall tone where applicable.
- The new poem must remain original and specific to the new story; do not copy lines from earlier poems.
- Draft the poem and present it to the user for review **before** treating it as final.
- Incorporate the user's corrections or requested changes.
- Only after the poem is approved should it be saved as `poem.html`, preserving the intended stanza and line breaks.

### 3. Song

- The song is generated only **after the poem has been reviewed and approved**.
- Use the approved poem as the lyrics for the song-generation step.
- The normal production workflow is to create the song in **Suno using the user's account**.
- Choose a musical style that fits both the story and the established tone of the series; if materially different style choices exist, let the user review/select them.
- Do not silently rewrite approved lyrics merely to make them easier for Suno to sing. Any substantial lyric changes require user review.
- Once the user selects/approves the generated song, export/download the chosen track and save it in the book directory as `song.mp3`.

## Build Ownership

For a normal book publication, humans/agents provide only the authored source and intentional book assets:

- the exported raw source `.html` file (not named `index.html`),
- `cover.jpg`,
- `poem.html`,
- `song.mp3`,
- and any intentional book-specific metadata such as `meta.json`.

Everything else that belongs to the interactive reader/build output is owned by the build pipeline.

- Run `generate_books.py` and let it create/update `index.html` and the generated JSON files.
- Let the script copy/synchronize the interactive reader CSS/JS and `contents/` assets as designed.
- Let the script regenerate `books/manifest.json`; do not manually maintain the library landing-page manifest for ordinary new-book publication.
- Do **not** manually assemble, copy, move, reconstruct, or patch generated reader files just to make a book preview work.
- If generated output is wrong or missing, fix the source HTML, intentional assets/metadata, generator, or templates, then rerun `generate_books.py`.

## Local Build First — Hard Rule

For normal publication work, the build must be performed **locally/by the acting agent before pushing**. GitHub Actions or Netlify must not be used as the primary mechanism for creating a missing book.

The required order is:

1. Export the completed source document directly to one real source HTML file in the book directory.
2. Do not split the source into temporary `.source_parts`, chunk files, or similar staging files.
3. Put the intentional assets/metadata in the book directory.
4. Run `generate_books.py` locally.
5. Inspect the local generated output and confirm the book has the expected chapters and files.
6. Commit/push the source, assets/metadata, and the generator outputs together to the **existing PR branch**.
7. Only after that push, use the PR/Netlify build as external verification.

Do not create an Actions workflow, Netlify build workaround, temporary branch, or hand-built generated artifact merely because uploading/building the normal local result is inconvenient. Solve the normal local build/push path first.

## PR / Netlify Preview Rule

For book work performed on a feature/publication branch with an open pull request:

- Always commit/push each meaningful book-publication change to the **existing PR branch**. Do not leave relevant work only in a local workspace or an unrelated branch.
- Do not create extra publication/rewrite branches merely to test book output when an active PR branch already exists.
- Treat the Netlify deploy preview for that PR as part of the normal validation loop, not as an optional final check.
- Netlify is a **verification layer**, not the source-of-truth build system for normal publication. The PR branch should already contain the complete locally generated book before Netlify is asked to validate it.
- After pushing a change that affects the library hub, book source, assets, metadata, generator, or generated output, verify that the PR/Netlify build has run successfully.
- Open/check the deployed preview when accessible and validate the user-visible result there: the library tile, navigation into the book, chapter structure, cover, poem modal, audio, responsive reader behavior, and any changed functionality relevant to that update.
- If the preview is wrong, fix the appropriate source/asset/metadata/generator input, rerun `generate_books.py` locally, push the correction to the same PR branch, and re-check the preview.
- Do not report a publication change as verified merely because files look correct in Git. For user-visible book changes, verification means the PR preview has been checked whenever the preview is available.

## Build and Publication Order

The intended new-book workflow is:

1. Finalize the story text in its source document.
2. Export the source document directly as one raw source HTML file and place that source HTML in the book directory.
3. Generate/select and save `cover.jpg`.
4. Draft the poem from the established library/series poem patterns.
5. Obtain user review and approval of the poem.
6. Save the approved poem as `poem.html`.
7. Generate the song in Suno from the approved poem lyrics, using the user's account.
8. Obtain user selection/approval of the song and save it as `song.mp3`.
9. Add/update only intentional book metadata such as `meta.json` where needed.
10. Run `generate_books.py` locally once the source/assets are ready.
11. Verify the locally generated `index.html`, chapter navigation, generated JSONs, copied reader assets, manifest entry, and expected chapter count.
12. Commit/push the source HTML, intentional assets/metadata, and the script-generated outputs to the active PR branch.
13. Confirm that the PR head actually contains that commit; do not confuse a local commit with a pushed PR update.
14. Verify the PR/Netlify build and inspect the deployed preview.
15. Validate the library tile, navigation into the book, chapter structure, cover, poem modal, audio playback, responsive behavior, and any changed functionality in the preview.
16. If anything is wrong, correct the source or pipeline, rebuild locally, push to the same PR, and repeat the preview check.

## Generated Output Guard

- `books/*/index.html` and other generated reader artifacts are outputs of the Python build pipeline.
- **Never hand-edit generated `index.html` to patch book content.** Correct the raw source HTML, engine/template, metadata, or assets as appropriate, then rerun the generator.
- Do not create temporary chunk files, reconstructed generated files, or manually copied engine assets as a substitute for running the generator.
- It is acceptable to publish a work-in-progress preview before `poem.html` and `song.mp3` exist, but it must be clearly treated as incomplete and must not be represented as a finished book release.
