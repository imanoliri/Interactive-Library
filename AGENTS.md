# Deep Dive & Handover Manual

Welcome to the **Interactive Library** project! This document serves as the ultimate "Deep Dive" reference guide. Whether you are adding new interactive elements, resolving layout bugs, or adjusting combat logic, read this file to understand the architecture.

## 1. Project Architecture & Build Pipeline

The project is built around a custom Python compilation step that turns raw HTML/Markdown fragments into fully functional, interactive books with embedded games.

### Python Environment Setup
The python builder relies on external libraries (like `BeautifulSoup4`, `jinja2`, and `Pillow`). When initializing the project on a new workstation or for a new agent, you must install dependencies into the virtual environment:
```powershell
pip install -r requirements_python_local.txt
```

### New Book Asset Baseline
When parsing a new folder within `books/`, `generate_books.py` explicitly expects certain core assets. If these are missing, it will throw terminal warnings. A complete book requires:
*   A `.html` file not called `index.html` (e.g., `Paths_of_Magic.html`) which serves as the source text for the book.
*   `cover.jpg` (The book cover)
*   `poem.html` (The poem overlay text)
*   `song.mp3` (The background music)

### The Source of Truth
*   **DO NOT manually edit the `books/*/index.html` files!** These are built artifacts.
*   **The Engine**: The core engine lives in the `scripts/` directory.
    *   `interactive_book_from_html.py`: The Python compiler.
    *   `interactive_book.js`: The client-side logic (combat, modals, etc).
    *   `interactive_book.css`: The styling rules.
    *   `interactive_book_words_to_ignore.py`: The NLP exclusion list.
    *   `generate_books.py`: The build orchestrator.

### The Build Step
Whenever you modify CSS, Javascript, or Python templates, you **MUST** run the build command to propagate changes to all books:
```powershell
.\.venv\Scripts\python.exe generate_books.py
```
*What happens under the hood?*
1.  `generate_books.py` traverses the `books/` directory looking for directories containing HTML text files (it specifically picks the first `.html` file it finds that is *not* named `index.html` as the source).
2.  It copies `interactive_book.css` and `interactive_book.js` into those directories.
3.  It calls `interactive_book_from_html.py` which performs a robust extraction and compilation process:
    *   **Data Extraction & Serialization**: Before compiling the book, it rigorously extracts book data and serializes it into local JSON files for consumption by additional games/features later. This includes:
        *   `interactive_book_media.json`: Extracts all audio/video sources.
        *   `interactive_book_images.json`: Records all image sources.
        *   `interactive_book_word_count.json`: Extracts word frequencies (ignoring common words) via Python's `Counter` to generate data for word clouds and extra games.
        *   `interactive_book_parapragh_texts.json`: Aggregates flat paragraph strings.
        *   `story_by_chapters.json`: Maps the compiled HTML logic to their respective chapter strings.
    *   **Asset Standardization**: Detects `<img>` tags and strictly converts stray `.png` images to `.jpg` via Python's `PIL` to standardise assets and save space.
    *   **DOM Compilation & Output**: Splits text by `h1`/`h2` tags to create tabbed chapters, injects the `game-ui-overlay` (Combat HUD), and fully renders the interactive document.
        *   The final, complete web application is exported and saved locally as `index.html` within the specific book's directory.
    *   **Contents Integration**: Generates a dynamic `Contents` tab appended to `index.html`. This tab parses the `contents/` directory to create functional buttons connecting the book to its standalone mini-games (which exist as separate `.html` files in their respective folders).

## 2. Reader Interactivity & Features

Beyond standard text parsing, the engine injects rich interactivity directly into the reading experience:
*   **Tabbed Navigation**: The Python script automatically converts `<h1>` and `<h2>` blocks into clickable chapter tabs, generating top and bottom `prev/next` navigational buttons.
*   **Song Banner (Audio)**: A global audio controller (`.song-banner`) handles background music (`song.mp3`). It supports play/pause and dynamic volume dragging.
*   **The Poem Modal**: Clicking "📜 Read the Poem" opens an overlaid `<dialog id="poemDialog">` which fetches and renders `poem.html` natively over the text.
*   **Fullscreen Image Modals & Slideshow**: 
    *   Clicking any image (`<img>`) opens `#fullscreenImgModal`, scaling the image to the max viewport constraints.
    *   The "📽️ Slideshow" button triggers an automated cycle of all book images with a customizable time interval, accessible via the modal.
*   **Extra "Contents" Mini-Games**: As detailed above, the final tab ("Contents") provides direct access to isolated data games (like Word Clouds) built from the aforementioned serialized JSONs.

## 3. "Paths of Magic" Combat Logic

The combat is injected into the book seamlessly when a user clicks a "Battle" button attached to creature images.

### How to Enter Combat
1.  **Open an Image**: Click on any image (`<img>`) within the book's text to open the fullscreen slideshow modal (`#fullscreenImgModal`).
2.  **Iterate through Images**: Use the navigation arrow button, the keyboard's arrows or the "📽️ Slideshow" button to browse the book's images.
3.  **Find the Battle Button**: Combat is only available for specific creature images. Iterate through the slideshow until you find an image that displays a "Battle!" button at the bottom.
4.  **Start the Fight**: Click the "Battle!" button to trigger the `game-ui-overlay` (Combat HUD) and initiate the elemental combat system.

### State Management (`interactive_book.js`)
*   `window.enemyMetadata`: Loaded async from `enemy_metadata.json`. Holds names, levels, and magic weaknesses/bonus properties for specific enemies.
*   `window.currentEnemy`: The currently active enemy object parsed from the image filename and the metadata.
*   `window.bossState`: Tracks the extra pool of health and memory of used attacks for bosses (`level 2` creatures).

### Elemental Counters
The entire strategy relies on the `magicCounters` constant in `interactive_book.js`.
*   Example: `Water` counters `['Fire', 'Wind', 'Lightning']`.
*   **Logic Rule**: If the player uses Water against a Fire enemy, the player hits their "WEAKNESS". Player attacks are measured by:
    *   *Heavy (3 Pts)*, *Medium (2 Pts)*, *Light (1 Pt)*.
*   **Modifiers**: Weaknesses add points; using elements where the enemy has a Bonus removes points.

### The Matchup Guide (Magic Circle)
A crucial, complex visual element inside `toggleMatchupGuide()`:
*   The guide draws SVG arrows dynamically between HTML icons.
*   The icons are specified in the `nodes` mathematical array (`['Water', 'Trees', 'Earth', 'Sun', 'Wind', 'Fire', 'Storm', 'Life', 'Darkness', 'Undead']`).
*   **WARNING**: If you change the order of `nodes`, the visual web of arrows will completely change shape. Keep it aligned with the Combat HUD sequence so the player's mental map remains intact.

### The Enemy Matchup Guide (Pentagram Button)
A second button (`⛧`) exists in the enemy HUD (next to the `❔` info button).
*   **Function**: Opens the Magic Matchup Guide with specialized highlights.
    *   **Highlight Logic**: 
    *   The enemy's own magic types are highlighted with an **Orange tactical glow** (`is-double-edged`).
    *   **Universal Color Coding**: 
        *   **Green Arrows**: Highlight all connections representing a **Player Advantage** (Incoming to enemy weaknesses).
        *   **Red Arrows**: Highlight all connections representing a **Player Threat** (Outgoing from enemy bonuses).
    *   **Intensity Logic**: Only connections that actively apply based on `enemy_metadata.json` are bright; non-applicable or latent counters (including generic counters not involving the enemy) are faded.
*   **Management**: Handled by `showEnemyMatchupGuide()` and `clearEnemyMatchupHighlights()` in `magic_combat_system.js`.

## 4. UI, CSS, and Responsiveness

The aesthetic of the application aims for a premium, magical, interactive feel. Modern conventions (`clamp`, gradients, micro-animations) are used extensively.

### Unit Protocols
*   **`ch` (character width)**: Used strictly for `.reader` text width (`80ch`) to guarantee optimal reading lengths.
*   **`vw` / `vh`**: Used for Modals and Game UIs to ensure they gracefully expand and shrink on all screen sizes.

### The Matchup Diagram Constraint
> [!CAUTION]
> The `.magic-circle-container` in `interactive_book.css` must ALWAYS preserve an `aspect-ratio: 1/1` within severe constraints (e.g., `height: 65%` of its flex parent). 
> *Why?* The SVG `preserveAspectRatio="xMidYMid meet"` constraint draws perfectly circular arrow coordinate math. If CSS flexbox warps the `.magic-circle-container` into an oval, the HTML icons and the SVG arrow trajectories will visually disconnect.

### Mobile Optimization
*   **The Viewport Tag**: The `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">` tag must exist in `interactive_book_from_html.py`. Do NOT remove it. Without it, physical mobile devices render the UI like a 1000px desktop monitor and physically squash the interface.
*   **Portrait Overrides**: `@media (orientation: portrait)` contains bespoke logic to stack horizontal layouts (like `.game-ui-header`) vertically, shrink giant desktop navigation circles, and define the `magic-btn-grid`.

## 5. Workflows for Future Agents
1.  **Debugging Layouts**: If mobile UI breaks, simulate using browser dev tools AND verify that the viewport meta tag wasn't accidentally stripped.
2.  **Adding Magic**: If adding a new element to `magicCounters`, you MUST also add the node to `initMagicCircle()`, update the HTML template in `interactive_book_from_html.py`, and create an associated CSS class selector for its gradient/glow.
3.  **Deploying**: When your changes are done, commit to Git. Only the source files in `scripts/` matter; `index.html` files are ephemeral.