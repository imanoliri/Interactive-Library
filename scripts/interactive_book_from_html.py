import json
import os
import re
import string


from bs4 import BeautifulSoup
from collections import Counter
from jinja2 import Template
from pathlib import Path
from PIL import Image

from scripts.interactive_book_words_to_ignore import function_words, particles_to_ignore


# Read the HTML content
def read_html_book(html_file_path: str):
    with open(html_file_path, "r", encoding="utf-8") as file:
        return file.read()


def extract_media(html_content):

    soup = BeautifulSoup(html_content, "html.parser")

    media_list = []
    for element in soup.find_all(["img", "audio", "video"]):
        src = element.get("src")
        if src:
            media_list.append({"type": element.name, "src": src})

    return media_list


def extract_images(html_content):

    soup = BeautifulSoup(html_content, "html.parser")

    image_list = []
    for img in soup.find_all("img"):
        src = img.get("src")
        if src:
            suffix = ".png"
            if src.endswith(suffix):
                src = f"{src[:-len(suffix)]}.jpg"
            image_list.append(src)
    return image_list


def images_png_to_jpg(directory):

    for filename in os.listdir(directory):
        if filename.lower().endswith(".png"):

            png_path = os.path.join(directory, filename)
            with Image.open(png_path) as img:
                white_background = Image.new("RGB", img.size, (255, 255, 255))

                img = img.convert("RGBA")
                white_background.paste(img, mask=img.split()[3])

                jpg_filename = os.path.splitext(filename)[0] + ".jpg"
                jpg_path = os.path.join(directory, jpg_filename)

                white_background.save(jpg_path, "JPEG")
                os.remove(png_path)

            print(f"Converted {filename} to {jpg_filename}")


def extract_word_count(html_content):

    soup = BeautifulSoup(html_content, "html.parser")

    text = ""  # Just aggregate all words in a single str, separated by a space
    for paragraph in soup.find_all(["p", "h1", "h2"]):
        text += paragraph.get_text() + " "
    if soup.title:
        text += soup.title.get_text() + " "

    text = re.sub(r"[^\x00-\x7F]+", "", text)  # Remove non ASCII characters

    for particle in particles_to_ignore:
        text = text.replace(particle, "")

    text = text.lower().translate(
        str.maketrans("", "", string.punctuation)
    )  # lowercase and remove punctuation sign
    text = re.sub(
        r"\b(\w+?)s\b(?=.*\b\1\b)", r"\1", text
    )  # Use re.sub to replace the plural form with the singular form
    text = re.sub(
        r"\s+", " ", text
    ).strip()  # Remove extra spaces left behind and return the cleaned string

    return filter_and_sort_word_count(Counter(text.split()))


def filter_and_sort_word_count(
    word_count, min_word_count: int = 5, max_words: int = 60
):
    word_count = {
        word: count
        for word, count in word_count.items()
        if word.lower() not in function_words
    }

    word_count = {
        word: count for word, count in word_count.items() if count >= min_word_count
    }

    word_count = dict(list(word_count.items())[:max_words])

    return dict(sorted(word_count.items(), key=lambda item: item[1], reverse=True))


def extract_paragraph_texts(html_content):
    return [
        p.get_text()
        for p in BeautifulSoup(html_content, "html.parser").find_all("p")
        if p.get_text() != ""
    ]


# Parse the HTML into tabs
def parse_html_book(html_content):

    soup = BeautifulSoup(html_content, "html.parser")

    chapters = []
    tab_names = []
    current_chapter = []
    default_intro_tab_name = "Intro"
    last_text = None
    last_image = None
    last_name = None

    for element in soup.find_all(["h1", "h2", "img", "p", "ol"]):

        if element.name in ["h1", "h2"]:
            if current_chapter:
                chapters.append(current_chapter)
                if not tab_names:
                    tab_names.append(default_intro_tab_name)
            current_chapter = []  # [str(element)]
            tab_name = element.get_text(strip=True)
            if tab_name:
                tab_names.append(tab_name)
            last_text = element.get_text(strip=True)  # Update last_text
            last_name = element.name

        elif element.name == "img":
            element.attrs.pop("style", None)  # Remove the style from any images
            img_src = element.get("src")
            if img_src != last_image:  # Check for image duplication
                if last_name != "img":
                    current_chapter.append("<br>")
                png_suffix = ".png"
                str_element = str(element)
                if img_src.endswith(png_suffix):
                    str_element = str_element.replace(png_suffix, ".jpg")
                current_chapter.append(str_element)
                last_name = element.name
                last_image = img_src
        else:
            text_content = element.get_text(strip=True)
            if text_content and text_content != last_text:  # Check for text duplication
                if last_name == "img":
                    current_chapter.append("<br>")
                current_chapter.append(str(element))
                last_name = element.name
                last_text = text_content

    if current_chapter:
        chapters.append(current_chapter)

    # Return chapters as a list of HTML strings and tab names
    return ["".join(chapter) for chapter in chapters], tab_names


def get_chapters_to_json(chapters, tab_names):
    return dict(zip(tab_names[1:], chapters[1:]))


def add_content_tab(chapters, tab_names, content_dir):
    chapters.append(generate_contents_page(get_content_links(content_dir)))
    tab_names.append("Contents")
    return chapters, tab_names


def get_content_links(base_path):
    content_rel_dir = base_path.split("/")[-1]
    return [
        f"{content_rel_dir}/{content_name}/{content_name}.html"
        for content_name in os.listdir(base_path)
        if os.path.isfile(f"{base_path}/{content_name}/{content_name}.html")
    ]


def generate_contents_page(content_links):
    html_template = """
            <!-- <h1>Contents</h1> -->
            <div class="contents-grid">
                {buttons}
            </div>
    """

    def snake_to_camel_with_spaces(snake_str):
        words = snake_str.split("_")
        camel_case_str = " ".join(word.capitalize() for word in words)
        return camel_case_str

    def get_name_from_file_path(fp):
        return snake_to_camel_with_spaces(fp.split("/")[-1].split(".")[0])

    button_html = "\n\t\t\t\t".join(
        f"<button onclick=\"window.location.href='{content}'\">{get_name_from_file_path(content)}</button>"
        for content in content_links
    )

    return html_template.replace("{buttons}", button_html)


def generate_static_html(chapters, tab_names, title):
    html_template = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ title }}</title>
    <link rel="stylesheet" href="interactive_book.css">
</head>
<body>
    <h1>{{ title }}</h1>
    <div class="song-banner">
        <button id="mainSlideshowBtn" aria-label="Start Slideshow" onclick="startMainSlideshow()">📽️ Slideshow</button>
        <button id="songPlayPause" aria-label="Play/Pause" onclick="playSong()" data-song="song.mp3">▶️ Play</button>
        <button class="poem-btn" data-poem="poem.html">📜 Read the Poem</button>
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
        <button id="modalClose" aria-label="Close" onclick="syncAndCloseModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div id="modalInfo" class="modal-info"></div>
        <div class="modal-song-banner">
            <button id="modalSongPlayPause" class="modal-audio-btn round-btn" aria-label="Play/Pause" onclick="playSong()">▶️</button>
            <button class="poem-btn modal-audio-btn round-btn" data-poem="poem.html" aria-label="Poem">📜</button>
            <div class="modal-vol">
                <input id="modalSongVolume" type="range" class="vertical-slider" min="0" max="1" step="0.01" value="0.8" oninput="adjustVolume(this.value)"/>
            </div>
        </div>
        <button id="modalPrev" class="modal-nav-btn" aria-label="Previous image">&#10094;</button>
        <img id="modalImg" style="max-width:90%; max-height:90%;">
        <button id="fightEnemyBtn" class="game-fight-btn" style="display:none;" onclick="showGameUI()">🔮 Battle!</button>
        <button id="modalNext" class="modal-nav-btn" aria-label="Next image">&#10095;</button>
        
        <!-- Game UI -->
        <div id="gameUIContainer" class="game-ui-overlay" style="display:none;">
            <div class="game-ui-panel">
                <div class="game-ui-header">
                    <div class="enemy-info-left">
                        <h2 id="enemyName">Enemy</h2>
                        <div class="enemy-stats">
                            <span class="stat-badge boss-badge" id="enemyLevelBadge" style="display:none;">Boss (+1)</span>
                            <span class="stat-badge magic-badge" id="enemyMagicType">???</span>
                            <span class="stat-badge phys-badge" id="enemyPhysicalness">???</span>
                        </div>
                    </div>
                    <div class="game-ui-right-controls">
                        <div class="player-energy-display" id="playerEnergyCount" title="Your Energy">🧡 5</div>
                        <button class="guide-btn" onclick="toggleMatchupGuide()" title="Matchup Guide">❔</button>
                        <button class="game-close-btn" onclick="hideGameUI()" title="Close">&times;</button>
                    </div>
                </div>
                
                <div class="player-actions HUD-style">
                    <div class="action-row">
                        <div class="magic-btn-grid" id="magicTypeSelector">
                            <button class="magic-btn water" data-magic="Water" onclick="selectMagic('Water', this)"><span class="btn-icon">💧</span><span class="btn-label">Water</span></button>
                            <button class="magic-btn trees" data-magic="Trees" onclick="selectMagic('Trees', this)"><span class="btn-icon">🌳</span><span class="btn-label">Trees</span></button>
                            <button class="magic-btn earth" data-magic="Earth" onclick="selectMagic('Earth', this)"><span class="btn-icon">⛰️</span><span class="btn-label">Earth</span></button>
                            <button class="magic-btn sun" data-magic="Sun" onclick="selectMagic('Sun', this)"><span class="btn-icon">☀️</span><span class="btn-label">Sun</span></button>
                            <button class="magic-btn wind" data-magic="Wind" onclick="selectMagic('Wind', this)"><span class="btn-icon">💨</span><span class="btn-label">Wind</span></button>
                            <button class="magic-btn fire" data-magic="Fire" onclick="selectMagic('Fire', this)"><span class="btn-icon">🔥</span><span class="btn-label">Fire</span></button>
                            <button class="magic-btn lightning" data-magic="Lightning" onclick="selectMagic('Lightning', this)"><span class="btn-icon">⚡</span><span class="btn-label">Storm</span></button>
                            <button class="magic-btn lifeforce" data-magic="Lifeforce" onclick="selectMagic('Lifeforce', this)"><span class="btn-icon">✨</span><span class="btn-label">Life</span></button>
                        </div>

                        <div class="strength-btn-grid" id="strengthSelector">
                            <button class="strength-btn" onclick="selectStrength('Light', this)"><span class="btn-icon">🗡️</span><span class="btn-label">Light</span></button>
                            <button class="strength-btn" onclick="selectStrength('Medium', this)"><span class="btn-icon">⚔️</span><span class="btn-label">Medium</span></button>
                            <button class="strength-btn has-cost" data-cost="-1" onclick="selectStrength('Heavy', this)"><span class="btn-icon">🛡️</span><span class="btn-label">Heavy</span></button>
                        </div>
                    </div>

                    <div class="battle-actions">
                        <button id="executeAttackBtn" class="execute-btn" onclick="executeAttack()" disabled>Attack!</button>
                    </div>
                </div>
            </div>
            
            <div id="battleResult" class="battle-result-overlay" style="display:none;">
                <h1 id="resultTitle">Victory!</h1>
                <p id="resultDetails">Your attack was successful!</p>
                <button class="execute-btn" style="margin-top: 1rem;" onclick="continueBossFight()">Continue</button>
            </div>

            <!-- Matchup Guide Overlay -->
            <div id="matchupGuideOverlay" class="matchup-guide-overlay" style="display:none;">
                <div class="matchup-guide-content">
                    <h2>📖 Magic Matchups</h2>
                    <div class="matchup-grid">
                        <div class="matchup-item"><span class="strong">💧 Water</span> counters 🔥</div>
                        <div class="matchup-item"><span class="strong">🔥 Fire</span> counters 🌳, 🌑</div>
                        <div class="matchup-item"><span class="strong">🌳 Trees</span> counters 🪨</div>
                        <div class="matchup-item"><span class="strong">🪨 Earth</span> counters ⚡</div>
                        <div class="matchup-item"><span class="strong">⚡ Lightning</span> counters 💧</div>
                        <div class="matchup-item"><span class="strong">☀️ Sun</span> counters 💨, 💀</div>
                        <div class="matchup-item"><span class="strong">💨 Wind</span> counters ☀️</div>
                        <div class="matchup-item"><span class="strong">✨ Lifeforce</span> counters 💀, 🌑</div>
                    </div>
                    <button class="execute-btn" style="margin-top: 1.5rem;" onclick="toggleMatchupGuide()">Close Guide</button>
                </div>
            </div>
        </div>
        <div class="slideshow-controls" id="slideshowControls">
            <button id="modalSlideshowBtn" class="slideshow-btn round-btn" aria-label="Toggle Slideshow" onclick="toggleSlideshow()" title="Start Slideshow">📽️</button>
            <div class="slideshow-interval-controls">
                <button class="interval-btn" onclick="changeSlideshowInterval(-1.0)" aria-label="Decrease time">-</button>
                <span id="slideshowIntervalDisplay">12.0s</span>
                <button class="interval-btn" onclick="changeSlideshowInterval(1.0)" aria-label="Increase time">+</button>
            </div>
        </div>
        <div class="modal-chap-nav">
            <button id="modalPrevChap" class="modal-chap-nav-btn" aria-label="Previous Chapter">« Prev Chapter</button>
            <button id="modalNextChap" class="modal-chap-nav-btn" aria-label="Next Chapter">Next Chapter »</button>
        </div>
    </div>
    <div class="tab-selector">
        <button class="chapter-nav-btn top-nav prev-chap" onclick="navChapter(-1)" aria-label="Previous Chapter">&#10094; Prev</button>
        <select id="tab-select" aria-label="Choose chapter">
    {% for i in range(chapters|length) %}
            <option value="{{ i }}">{{ tab_names[i] }}</option>
    {% endfor %}
        </select>
        <button class="chapter-nav-btn top-nav next-chap" onclick="navChapter(1)" aria-label="Next Chapter">Next &#10095;</button>
    </div>
    <div class="tab-content">
        {% for chapter in chapters %}
        <div class="tab">{{ chapter|safe }}</div>
        {% endfor %}
    </div>
    <div class="chapter-footer">
        <button class="chapter-nav-btn btm-nav prev-chap" onclick="navChapter(-1)" aria-label="Previous Chapter">&#10094; Previous Chapter</button>
        <button class="chapter-nav-btn btm-nav next-chap" onclick="navChapter(1)" aria-label="Next Chapter">Next Chapter &#10095;</button>
    </div>
    <script src="interactive_book.js"></script>
</body>
</html>
    """
    template = Template(html_template)
    return template.render(
        chapters=chapters, tab_names=tab_names, title=title.replace("_", " ")
    )


def save_to_json(data, filepath):
    with open(filepath, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4)


def load_from_json(filepath):
    with open(filepath) as f:
        return json.load(f)


def save_html(data, filepath):
    with open(filepath, "w", encoding="utf-8") as file:
        file.write(data)


def save_html_to_content(data, contents_dir, name):
    filepath = f"{contents_dir}/{name}/{name}.html"
    Path(filepath).parent.mkdir(parents=True, exist_ok=True)
    save_html(data, filepath)


def generate_interactive_book_from_html(bookdir: str, html_file_path: str):

    contents_dir = f"{bookdir}/contents"
    images_dir = f"{bookdir}/images"
    title = html_file_path.split("/")[-1].split(".")[0]
    output_file_path = f"{bookdir}/index.html"

    # Read html
    html_book = read_html_book(html_file_path)
    save_to_json(extract_media(html_book), f"{bookdir}/interactive_book_media.json")
    save_to_json(extract_images(html_book), f"{bookdir}/interactive_book_images.json")
    images_png_to_jpg(images_dir)
    save_to_json(
        extract_word_count(html_book), f"{bookdir}/interactive_book_word_count.json"
    )
    save_to_json(
        extract_paragraph_texts(html_book),
        f"{bookdir}/interactive_book_parapragh_texts.json",
    )

    # Generate html interactive book
    chapters, tab_names = parse_html_book(html_book)
    save_to_json(
        get_chapters_to_json(chapters, tab_names), f"{bookdir}/story_by_chapters.json"
    )
    chapters, tab_names = add_content_tab(chapters, tab_names, contents_dir)
    interactive_book = generate_static_html(chapters, tab_names, title)

    # Save book locally
    save_html(interactive_book, output_file_path)
