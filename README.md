# Interactive Library

A static web-based library viewer designed to organize and display a collection of digital books in HTML format. This project functions as a lightweight, fast "bookshelf" application.

## Project Overview

This tool provides a clean interface for browsing and searching through a library of converted HTML books. It is designed to be hosted on any static file server (like GitHub Pages) with minimal dependencies.

## Key Features

-   **Single Page Interface:** A seamless browsing experience that renders content dynamically without page reloads.
-   **Real-time Search:** Instantly filter books by title, author, tags, or description.
-   **Zero Dependencies:** Built with Vanilla JavaScript and standard Web APIs—no heavy frameworks like React, Vue, or Angular.
-   **Automated Tooling:** Includes Python scripts to standardise and "interactivize" HTML books for the viewer.

## How to Add a New Book

1.  Download the Google Doc story as a zipped HTML.
2.  Create a new directory for the new story in the correct place (e.g., inside `books/`).
3.  Unzip the story zipped HTML there. Then delete the zip file
4.  Copy the `contents` directory from another story. It will automatically reference the automatically generated data from this story.
5.  Execute `python generate_books.py`.
6.  Copy an image JPG file and name it `cover.jpg` in the directory of the story, where the newly generated `index.html` is.
7.  Copy the poem file from another story and edit its contents to the correct text for this new story.
8.  Add a `song.mp3` file to be played as music.
9.  Execute `scripts/generate_manifest.py`. If the book is in a series directory and it has a `meta.json` you will need to add the book to the `children_order` array previously.

## Architecture

### Frontend (The Viewer)
-   **Core Logic:** `interactive_library.js` handles the application state. It fetches a `manifest.json` to build a navigable directory tree.
-   **Routing:** Uses client-side routing with query parameters (`?path=...`) to support deep linking and navigation history.
-   **Rendering:** Utilizes modern HTML `<template>` tags for efficient DOM manipulation.

### Backend / Tooling (The Generator)
-   **Generator Script:** `generate_books.py` scans the `books/` directory.
-   **Transformation:** It identifies HTML book files and injects specific visual styles and scripts (`interactive_book.js`/`.css`) to ensure a consistent reading experience across all books.
-   **Smart Processing:** The script efficiently processes "book" directories, avoiding unnecessary recursion once a valid book is identified.

## Code Analysis & Rating

**Rating: 8/10** (for a small, personal utility)

### Strengths
-   **Clean & Lightweight:** The codebase is very lean. No heavy frameworks (React/Vue/Angular) are used, making it extremely fast and easy to deploy (it can be hosted on any static file server like GitHub Pages).
-   **Modern Practices:** The JavaScript uses modern ES6+ features (`async/await`, `fetch`, arrow functions) and standard Web APIs (`URLSearchParams`, `<template>`).
-   **Separation of Concerns:** Data normalization, state navigation, and DOM rendering are well-separated in the JS functions.
-   **Efficient:** The usage of `dirs[:] = []` in the Python script is a smart way to prune the directory walk once a book is found, preventing unnecessary recursion.

### Weaknesses / Observations
-   **Implicit Variable Declaration:** In `interactive_library.js` (line 122), `html = ...` is missing a `const` or `let` declaration, which implicitly makes it a global variable.
-   **Terse Naming:** Variable names like `n`, `p`, `q`, `r` in the JavaScript are very short. While common in small algorithms, slightly more descriptive names (e.g., `node`, `path`, `query`) would improve readability.
-   **Missing Manifest Generation:** The JavaScript *heavily* relies on `/books/manifest.json` to function, but `generate_books.py` does not appear to generate this file (it only processes individual books). Unless I missed a file in `scripts/`, there is a missing link in the automation pipeline between "processing books" and "listing them for the frontend."

### Verdict
A solid, well-written minimalistic project. It achieves its goal with zero bloat, though the tooling pipeline for the `manifest.json` generation seems to be the only missing context.

