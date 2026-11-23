# Level 3 · Final Prose, Ballad Poem & Metadata Example

> **Critical HTML Parser Rule (`scripts/interactive_book_from_html.py`):**  
> `parse_html_book()` puts everything *before* the first `<h1>`/`<h2>` into tab `0` (`Intro`) and writes `story_by_chapters.json` from `tab_names[1:]`. **Always place the Title + Premise `<p>` + Chapter `<ol>` + Word/Tone line BEFORE `<h1>Chapter 1: ...</h1>`**, or Chapter 1 will be sliced out of `story_by_chapters.json`!

## 1. Source Book HTML (`books/.../<Book_Slug>.html`)

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Valley of Dragons: Example Chronicle</title>
</head>
<body>
  <p><strong>Valley of Dragons: Example Chronicle</strong></p>
  <p>A crisp 2–3 sentence premise framing the stakes, allies, and frontier of the story.</p>
  <ol>
    <li>A Call for Help.</li>
    <li>Kingdom under the Mountain.</li>
  </ol>
  <p>850 words per chapter plus 1,200 extra words for climactic battles (~8,500 words). Medium language, 3rd person, epic heroic tone.</p>

  <h1>Chapter 1: A Call for Help</h1>
  <p>The Valley of Dragons had settled once more into a hard-won peace. Along the sunlit road below Castle Tarn, river wagons rolled toward the western hills while silver and blue wings crossed the morning sky.</p>
  <img src="images/ch01_council_arrival.jpg" alt="Roric entering the Castle Tarn council hall with the paladins" />
  <p>“Their need is great, and their peril is real,” Percival said quietly, resting one hand upon the stone war table.</p>
  <p>Alaric looked across the map that ended at the mountain passes. Enemies in the valley had always been plain to see. Turning away from a distant neighbor in need was another test entirely.</p>
  <p>“We answer the call,” he told the hall.</p>
</body>
</html>
```

### Style Guidelines (Authentic Author Voice)
- **Write chapter-by-chapter** straight into `books/<Book_Dir>/<Book_Slug>.html` so late chapters never get compressed.
- **Accessible 3rd-person rhythm:** Clear, grounded sentences (`11–18` words average), alternating vivid worldbuilding/tactical paragraphs (`35–70` words) with punchy single-line dramatic pivots and natural dialogue (`30–45%` in `heroic-saga`).
- **Character & stakes:** Include brief internal weight/reflection before major decisions and authentic back-and-forth struggle in decisive battles.
- **Strict Asset Sync:** Every `<img src="images/...">` must be `.jpg` and match `2. Chapter Breakdown` `[IMG:]` cues.

## 2. Heroic Ballad Poem Overlay (`poem.html`)

Rendered inside `#poemDialog` (`📜 Read the Poem`) and adapted verbatim as `song.mp3` lyrics. Write `<strong>Title</strong>` plus `5–6` four-line rhyming stanzas recapping the whole book from opening calm to final triumph:

```html
<strong>Clash Under the Mountain</strong>
Peace rested bright in the Valley’s sky,
Till a dwarf came with a worried eye,
“Khazad-Throm is bleeding—help us, or we die.”

The paladins met in Castle Tarn,
Gawain weighed risk, Percival stayed calm,
And Alaric swore: “We answer the call of harm.”

At Durin’s Chasm, two bridges held,
At Iron Footing, shield-walls swelled,
In Broken Shard, the goblin horde was felled,
As Alaric’s sword and dragon-fire compelled.
```

## 3. Book Metadata (`meta.json`)

```json
{
  "title": "Valley of Dragons: Example Chronicle",
  "author": "Interactive Library Studio",
  "tags": ["fantasy", "dragons", "knights", "alliance", "tactical", "heroic"],
  "blurb": "A crisp two-sentence hook summarizing the quest, central alliance, and stakes for the library card.",
  "children_order": []
}
```
