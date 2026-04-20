# HTML templates for the interactive book generation

CONTENTS_PAGE_TEMPLATE = """
            <!-- <h1>Contents</h1> -->
            <div class="contents-grid">
                {buttons}
            </div>
"""

INTERACTIVE_BOOK_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ title }}</title>
    <link rel="stylesheet" href="interactive_book.css">
    <link rel="stylesheet" href="magic_combat_system.css">
</head>
<body>
    <div id="readingProgressBar"></div>
    <h1>{{ title }}</h1>
    <div class="song-banner">
        <button id="mainSlideshowBtn" aria-label="Start Slideshow" onclick="startMainSlideshow()" title="Start Slideshow (S)">📽️ Slideshow</button>
        <button id="songPlayPause" aria-label="Play/Pause" onclick="playSong()" data-song="song.mp3" title="Play/Pause Music (P)">▶️ Play</button>
        <button class="poem-btn" data-poem="poem.html" title="Read the Poem (O)">📜 Read the Poem</button>
        <label class="vol">
        <span>Volume</span>
        <input id="songVolume" type="range" min="0" max="1" step="0.01" value="0.8" oninput="adjustVolume()"/>
        </label>
    </div>
    <dialog id="poemDialog">
        <button class="poem-close" aria-label="Close">&times;</button>
        <article id="poemContent"></article>
    </dialog>
    <div id="fullscreenImgModal">
        <button id="modalClose" aria-label="Close" onclick="syncAndCloseModal()" title="Close Fullscreen (S)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div id="modalInfo" class="modal-info"></div>
        <div class="modal-song-banner">
            <button id="modalSongPlayPause" class="modal-audio-btn round-btn" aria-label="Play/Pause" onclick="playSong()" title="Play/Pause Music (P)">▶️</button>
            <button class="poem-btn modal-audio-btn round-btn" data-poem="poem.html" aria-label="Poem" title="Read the Poem (O)">📜</button>
            <div class="modal-vol">
                <input id="modalSongVolume" type="range" class="vertical-slider" min="0" max="1" step="0.01" value="0.8" oninput="adjustVolume(this.value)"/>
            </div>
        </div>
        <button id="modalPrev" class="modal-nav-btn" aria-label="Previous image" title="Previous Image (Left Arrow)">&#10094;</button>
        <img id="modalImg" style="max-width:90%; max-height:90%;">
        <button id="modalNext" class="modal-nav-btn" aria-label="Next image" title="Next Image (Right Arrow)">&#10095;</button>
        
        {{ combat_templates|safe }}
        <div class="slideshow-controls" id="slideshowControls">
            <button id="modalSlideshowBtn" class="slideshow-btn round-btn" aria-label="Toggle Slideshow" onclick="toggleSlideshow()" title="Toggle Slideshow (Space)">📽️</button>
            <div class="slideshow-interval-controls">
                <button class="interval-btn" onclick="changeSlideshowInterval(-1.0)" aria-label="Decrease time">-</button>
                <span id="slideshowIntervalDisplay">12.0s</span>
                <button class="interval-btn" onclick="changeSlideshowInterval(1.0)" aria-label="Increase time">+</button>
            </div>
        </div>
        <div class="modal-chap-nav">
            <button id="modalPrevChap" class="modal-chap-nav-btn" aria-label="Previous Chapter" title="Previous Chapter (Shift+Tab)">« Prev Chapter</button>
            <button id="modalNextChap" class="modal-chap-nav-btn" aria-label="Next Chapter" title="Next Chapter (Tab)">Next Chapter »</button>
        </div>
    </div>
    <div class="tab-selector">
        <button class="chapter-nav-btn top-nav prev-chap" onclick="navChapter(-1)" aria-label="Previous Chapter" title="Previous Chapter (Shift+Tab)">&#10094; Prev</button>
        <select id="tab-select" aria-label="Choose chapter" title="Toggle Chapter Selector (C)">
    {% for i in range(chapters|length) %}
            <option value="{{ i }}">{{ tab_names[i] }}</option>
    {% endfor %}
        </select>
        <button class="chapter-nav-btn top-nav next-chap" onclick="navChapter(1)" aria-label="Next Chapter" title="Next Chapter (Tab)">Next &#10095;</button>
    </div>
    <div class="tab-content">
        {% for chapter in chapters %}
        <div class="tab">{{ chapter|safe }}</div>
        {% endfor %}
    </div>
    <div class="chapter-footer">
        <button class="chapter-nav-btn btm-nav prev-chap" onclick="navChapter(-1)" aria-label="Previous Chapter" title="Previous Chapter (Shift+Tab)">&#10094; Previous Chapter</button>
        <button class="chapter-nav-btn btm-nav next-chap" onclick="navChapter(1)" aria-label="Next Chapter" title="Next Chapter (Tab)">Next Chapter &#10095;</button>
    </div>
    <script src="interactive_book.js"></script>
    <script src="magic_combat_system.js"></script>
</body>
</html>
"""
