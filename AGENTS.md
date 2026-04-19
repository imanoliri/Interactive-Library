# Interactive Library Developer Reference Manual

Welcome to the **Interactive Library** project! Whether you are adding new interactive elements, resolving layout bugs, or modifying existing elements, read this document for reference.

## 1. Project Architecture & Build Pipeline

The project is built around a custom Python compilation step `generate_books.py` that turns a raw HTML books (exported from google docs) into fully functional, interactive books with embedded games.

### Python Environment Setup
The python script `generate_books.py` relies on external libraries (like `BeautifulSoup4`, `jinja2`, and `Pillow`). When initializing the project on a new workstation or for a new agent, you must install dependencies into the virtual environment:
```powershell
pip install -r requirements_python_local.txt
```

### New Book Creation
The script walks the directory `books/` and its subdirectories for any `.html` files that are not named `index.html`. The first html not named `index.html` is considered the source text for the book and from it an interactive book will be created as `index.html` in the same directory.
For this, `generate_books.py` will call `scripts/interactive_book_from_html.py` which explicitly expects certain core assets. If these are missing, it will throw terminal warnings. A complete book requires:
*   The aforementioned `.html` file not called `index.html` (e.g., `Paths_of_Magic.html`) which serves as the source for the book.
*   `cover.jpg` (The book cover)
*   `poem.html` (The poem overlay text)
*   `song.mp3` (The background music)

Additionally, the script will copy and paste certain elements from `scripts` that are necessary for the book to be interactive. 


### Source of Truth for Interactive Features
*   **DO NOT manually edit the `books/*/index.html` files!** These are built artifacts.
*   **The Engine**: The core engine lives in the `scripts/` directory.
    *   `interactive_book_from_html.py`: The _book-into-interactive-book_ parser + the html template for the interactive book.
    *   `interactive_book.js`: The client-side logic for the interactive book.
    *   `interactive_book.css`: The styling rules for the interactive book.
    *   `combat_templates.py`: The html template for the magic combat system.
    *   `magic_combat_system.js`: The magic combat logic.
    *   `magic_combat_system.css`: The magic combat styling rules.

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
        *   `interactive_book_media.json`: Extracts all audio/image/video sources.
        *   `interactive_book_images.json`: Records all image sources.
        *   `interactive_book_word_count.json`: Extracts top word counts (ignoring common words).
        *   `interactive_book_parapragh_texts.json`: Aggregates flat paragraph strings.
        *   `story_by_chapters.json`: Maps the compiled HTML logic to their respective chapter strings.
    *   **Asset Standardization**: Detects `<img>` tags and strictly converts stray `.png` images to `.jpg` via Python's `PIL` to standardise assets and save space.
    *   **DOM Compilation & Output**: Splits text by `h1`/`h2` tags to create tabbed chapters, injects the `game-ui-overlay` (Combat HUD), and fully renders the interactive document.
        *   The final, complete web application is exported and saved locally as `index.html` within the specific book's directory.
    *   **Contents Propagation**: Copies the `contents/` directory from any other book's directory.
    *   **Contents Integration**: Generates a dynamic `Contents` tab appended to `index.html`. This tab has a button for each standalone mini-game which each is a separate `.html` file in its own folder in the now copied `contents/` directory.

## 2. Reader Interactivity & Features

Beyond standard text parsing, the engine injects rich interactivity directly into the reading experience:
*   **Tabbed Navigation**: The Python script automatically converts `<h1>` and `<h2>` blocks into clickable chapter tabs, generating top and bottom `prev/next` navigational buttons.
*   **Song Banner (Audio)**: A global audio controller (`.song-banner`) handles background music (`song.mp3`). It supports play/pause and dynamic volume dragging.
*   **The Poem Modal**: Clicking "📜 Read the Poem" opens an overlaid `<dialog id="poemDialog">` which fetches and renders `poem.html` natively over the text.
*   **Fullscreen Image & Slideshow Modes**: 
    *   Clicking any image (`<img>`) opens `#fullscreenImgModal`, scaling the image to the max viewport constraints.
    *   The "📽️ Slideshow" button triggers an automated cycle of all book images with a customizable time interval, accessible via the modal.
*   **Keyboard Navigation**:
    *   `Tab` / `Shift + Tab`: Navigate to the Next / Previous Chapter (works consistently across Reading and Slideshow modes, and instantly wakes up hidden UI).
    *   `Left Arrow` / `Right Arrow`: Manually step backward or forward through images in the Slideshow Modal (also wakes up the UI).
    *   `Escape`: Immediately close active overlays and modals.
    *   `Spacebar`: Start/Stop the automated Slideshow animation, or toggle Play/Pause for the audio player if the Poem Modal is active.
    *   `S`: Toggle the Fullscreen Slideshow mode.
    *   `O`: Toggle the Poem Modal.
    *   `P`: Toggle the background song Play/Pause.
    *   `B`: Start Combat! (Clicks the 'Battle!' button if you are viewing an active enemy image in Slideshow mode).
    Note: all of these shortcuts are deactivated during combat.
*   **Extra "Contents" Mini-Games**: As detailed above, the final tab ("Contents") provides direct access to isolated data games (like Word Clouds) built from the aforementioned serialized JSONs.

## 3. "Paths of Magic" Combat Logic

The combat is injected into the book seamlessly when a user clicks a "Battle" button attached to creature images.

### How to Enter Combat
1.  **Open an Image**: Click on any image (`<img>`) within the book's text to open the fullscreen slideshow modal (`#fullscreenImgModal`).
2.  **Iterate through Images**: Use the navigation arrow button, the keyboard's arrows or the "📽️ Slideshow" button to browse the book's images.
3.  **Find the Battle Button**: Combat is only available for specific creature images defined in `enemy_metadata.json`. Iterate through the slideshow until you find an image that displays a "Battle!" button at the bottom.
4.  **Start the Fight**: Click the "Battle!" button to trigger the `game-ui-overlay` (Combat HUD) and initiate the elemental combat system.

### State Management (`interactive_book.js`)
*   `window.enemyMetadata`: Loaded async from `enemy_metadata.json`. Holds names, arrays of `magicType`s, `lives`, `powerBonus`, and complex `magicConfig` rules governing stacking interactions.
*   `window.currentEnemy`: The currently active enemy object parsed from the image filename and the metadata.
*   `window.enemyState`: Tracks the current pool of health (`lives`) and memory of used attacks `[]` for any enemy currently being fought (though it defaults to 1 life if undefined). Note: "Light" attacks are never added to this memory list and can be cast as often as wanted, provided they haven't been expended yet.
*   **Result Popups**: The combat UI features a non-blocking HUD popup that tracks individual attack rolls and energy changes. A blocking "Victory/Defeat" screen only interrupts when the enemy is fully defeated (all lives drained), or the player runs out of energy entirely.

### Elemental Counters
The entire strategy relies on the `magicCounters` constant in `magic_combat_system.js` and the enemy's innate types.
*   Example: `Water` counters `['Fire', 'Wind', 'Lightning']`.
*   **Logic Rule**: If the player uses an element that counters an enemy's innate `magicType`, it counts as a generic "Weakness". Attacks are categorized by points: *Heavy (3 Pts)*, *Medium (2 Pts)*, *Light (1 Pt)*.
    *   **Infinite Light Attack**: Selecting "Light" strength displays "Light 🔄" in the UI. These attacks are **infinite/reusable** and are NOT added to the `enemyState.usedMagics` list, allowing them to be cast indefinitely without exhaustion.
*   **Modifiers**: The points are dynamically adjusted based on `magicConfig` (e.g., compounding weaknesses vs overlapping bonuses). Weakness targets add advantage points, whereas using an element where the enemy has a Bonus adds him advantage points.

### The Matchup Guide (Magic Circle)
A crucial, complex visual element inside `toggleMatchupGuide()`:
*   The guide draws SVG arrows dynamically between HTML icons.
*   The icons are specified in the `nodes` array (`['Water', 'Trees', 'Earth', 'Sun', 'Wind', 'Fire', 'Storm', 'Life', 'Darkness', 'Undead']`).
*   **WARNING**: If you change the order of `nodes`, the visual web of arrows will completely change shape. Keep it aligned with the Combat HUD sequence so the player's mental map remains intact.

### The Enemy Matchup Guide (Pentagram Button)
A second button (`⛧`) exists in the enemy HUD (next to the `❔` info button).
*   **Function**: Opens the Magic Matchup Guide with specialized highlights.
    *   **Highlight Logic**: 
        *   **Spectral White Glow Nodes** (`is-enemy-highlight`): Highlights the enemy's innate magic types on the Magic Circle with a professional silver aura.
        *   **Solar Amber Nodes** (`is-double-edged`): Highlights magic types that are both an advantage and a threat (Double-edged sword).
        *   **Emerald Nodes/Arrows** (`is-target-out`): Represents a **Player Advantage**.
        *   **Crimson Nodes/Arrows** (`is-target-in`): Represents a **Player Threat**.
    *   **Intensity Logic**: Only connections that actively apply based on `enemy_metadata.json` are bright; non-applicable or latent counters (including generic counters not involving the enemy) are faded.
*   **Management**: Handled by `showEnemyMatchupGuide()` and `clearEnemyMatchupHighlights()` in `magic_combat_system.js`.

### Combat Keyboard Shortcuts
To ensure a fast-paced "action" feel, specialized shortcuts are active **only** while the Combat HUD is visible. General book shortcuts (Song, Slideshow, Poem) are automatically deactivated during combat to prevent accidental interference.

*   **Elemental Selection**:
    *   `W`: Water / `T`: Trees / `E`: Earth / `S`: Sun
    *   `D`: Wind / `F`: Fire / `R`: Storm (Lightning) / `L`: Life (Lifeforce)
*   **Attack Strength**:
    *   `1`: Light / `2`: Medium / `3`: Heavy
*   **Actions**:
    *   `Enter`: Execute Attack (if ready) or Continue (when results screen is visible).
    *   `Escape`: Close combat interface.

## 4. UI, CSS, and Responsiveness

The application's aesthetic focuses on a functional, clear, and interactive experience using simple, standard CSS.

### Base Styles (Landscape & Desktop)
By default, the layout utilizes standard sizes and horizontal arrangements suitable for reading on monitors and laptops. The core stylesheets (`interactive_book.css` and `magic_combat_system.css`) are kept intentionally simple and straightforward to ensure maximum readability and robust performance across devices.

### Mobile Optimization (Portrait Mode)
The UI seamlessly adapts for phones by leveraging `@media (orientation: portrait)` media queries. Instead of relying on complex viewport formulas or massive component rewrites, mobile responsiveness is achieved through two minimal strategies:
*   **Element Upscaling**: Fonts and primary interactive elements (such as the magic attack grid, strength slider thumbs, and dossier text) are significantly upscaled to remain highly legible and easily tappable on smaller physical screens.
*   **Vertical Stacking**: UI components that are horizontally wide in the default view (like the Game UI rows and action columns) are forced into flex column directions (`flex-direction: column;`), allowing the layout to naturally flow vertically down a phone screen.

### Double-Tap-To-Zoom Prevention
To ensure a smooth, "native app" combat experience without the screen accidentally zooming or jarring during rapid taps, the `touch-action: manipulation;` style is enforced globally via a `* { ... }` selector in `interactive_book.css`.
