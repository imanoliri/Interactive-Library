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


def find_template_contents(booksdir: str):
    """Finds the first 'contents' directory in the books tree to use as a template."""
    for root, dirs, files in os.walk(booksdir):
        if "contents" in dirs:
            return os.path.join(root, "contents")
    return None


def generate_all_books_from_html(booksdir: str = "books"):
    template_contents = find_template_contents(booksdir)
    
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

        # Check for contents directory
        if "contents" not in dirs:
            if template_contents and os.path.exists(template_contents):
                # Avoid copying into itself if finding itself
                if os.path.abspath(template_contents) != os.path.abspath(os.path.join(bookdir, "contents")):
                     try:
                        shutil.copytree(template_contents, os.path.join(bookdir, "contents"))
                        print(f"Copied contents from {template_contents} to {bookdir}")
                     except Exception as e:
                        print(f"Error copying contents: {e}")
            else:
                 print(f"WARNING: No contents directory in {bookdir} and could not propagate from any other book.")

        generate_interactive_book_from_html(bookdir, f"{bookdir}/{html}")
        shutil.copy("scripts/interactive_book.css", bookdir)
        shutil.copy("scripts/interactive_book.js", bookdir)
        dirs[:] = []  # Once a book is found, do not go into its subdirectories!


generate_all_books_from_html()
