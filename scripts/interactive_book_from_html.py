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
            tab_names.append(element.get_text(strip=True))
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
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <h1>{{ title }}</h1>
    <button class="poem-btn" data-poem="poem.html">📜 Read the Poem</button>
    <dialog id="poemDialog">
        <button class="poem-close" aria-label="Close">&times;</button>
        <article id="poemContent"></article>
    </dialog>
    <div class="tab-selector">
        <select id="tab-select" aria-label="Choose chapter">
    {% for i in range(chapters|length) %}
            <option value="{{ i }}">{{ tab_names[i] }}</option>
    {% endfor %}
        </select>
    </div>
    <div class="tab-content">
        {% for chapter in chapters %}
        <div class="tab">{{ chapter|safe }}</div>
        {% endfor %}
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
