# Level 3 · Final Prose, Poem & Metadata Example

> **Important Build Rule (`generate_books.py`):** Source manuscripts are clean HTML files (NOT named `index.html`), using `<h1>` or `<h2>` headings for automatic chapter tab splitting and `<img src="images/<file>.jpg">` paths (all `.png` assets are converted/standardized to `.jpg`).

## 1. Source Book HTML (`books/.../<Book_Slug>.html`)

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Pip the Cloud-Dragon</title>
</head>
<body>
  <h1>Chapter 1: The Smallest Puff</h1>
  <img src="images/ch01_nest.jpg" alt="Pip peeking from behind a fluffy cloud blanket" />
  <p>High above the Silver Peaks, little Pip tucked his sky-blue wings tight against the chill of dawn.</p>
  <p>Whenever a distant cloud rumbled <em>boom-grumble</em>, the lantern at the tip of his tail blinked like a sleepy amber star.</p>
  <p>"Why do the sky drums have to sound so big?" Pip whispered.</p>

  <h1>Chapter 2: Rain for the Valley</h1>
  <p>Mama Gale folded one silver wing beside him, pointing down to the thirsty valley meadows below...</p>
</body>
</html>
```

### Style Guidelines (Mobile & Read-Aloud Ready)
- Keep paragraphs short (2–4 sentences / ~4 lines max on a 390px phone screen).
- Let dialogue carry warmth and pacing; avoid wall-of-text exposition.
- Match every `<img src="images/...">` filename strictly to `breakdown-template.md` cues.

## 2. Poem Overlay (`poem.html`)

Loaded inside `#poemDialog` (`📜 Read the Poem`); begin with a `<strong>Title</strong>` header and concise 4-line stanzas (also feeds `song.mp3` lyrics):

```html
<strong>Pip the Cloud-Dragon</strong>
Soft little thunder, drum in the sky,
Warm amber lantern flickering high.
Clouds carry raindrops down to the green,
Gentle and sleepy, calm and serene.
```

## 3. Book Metadata (`meta.json`)

```json
{
  "title": "Pip the Cloud-Dragon",
  "author": "Interactive Library Studio",
  "tags": ["bedtime", "dragons", "picture book", "calm"],
  "blurb": "High above the Silver Peaks, tiny cloud-dragon Pip learns that distant thunder simply calls down rain to wake the valley flowers.",
  "children_order": []
}
```
