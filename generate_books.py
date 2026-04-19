import os
import shutil
from scripts.interactive_book_from_html import generate_interactive_book_from_html


def first_non_index_html(p):
    for f in sorted(os.listdir(p)):
        if (
            f.lower().endswith(".html")
            and f.lower() != "index.html"
            and os.path.isfile(os.path.join(p, f))
        ):
            return f
    return None


TEMPLATE_CONTENTS = "scripts/contents"


def generate_all_books_from_html(booksdir: str = "books"):
    
    for bookdir, dirs, files in os.walk(booksdir):
        bookdir = bookdir.replace("\\", "/")
        html = first_non_index_html(bookdir)
        if not html:
            print(f"skip: {bookdir} -> no book found")
            continue
        print(f"build: {bookdir} -> {html}")

        # Check for zip files
        for f in files:
            if f.lower().endswith(".zip"):
                print(f"WARNING: Zip file found in {bookdir}: {f}. It should probably be deleted.")

        # Check for cover and song
        if "cover.jpg" not in files:
            print(f"WARNING: No cover.jpg found in {bookdir}. Book will have no cover.")
        if "poem.html" not in files:
            print(f"WARNING: No poem.html found in {bookdir}. Book will have no poem.")
        if "song.mp3" not in files:
            print(f"WARNING: No song.mp3 found in {bookdir}. Book will have no song.")

        # Ensure contents directory exists and is up to date
        target_contents = os.path.join(bookdir, "contents")
        if os.path.exists(TEMPLATE_CONTENTS):
            try:
                shutil.copytree(TEMPLATE_CONTENTS, target_contents, dirs_exist_ok=True)
                print(f"Synced contents from {TEMPLATE_CONTENTS} to {bookdir}")
            except Exception as e:
                print(f"Error copying contents: {e}")
        else:
            print(f"WARNING: No {TEMPLATE_CONTENTS} directory found. Standalone mini-games will be missing.")

        generate_interactive_book_from_html(bookdir, f"{bookdir}/{html}")
        shutil.copy("scripts/interactive_book.css", bookdir)
        shutil.copy("scripts/interactive_book.js", bookdir)
        shutil.copy("scripts/magic_combat_system.css", bookdir)
        shutil.copy("scripts/magic_combat_system.js", bookdir)
        dirs[:] = []


generate_all_books_from_html()
