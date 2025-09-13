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


def generate_all_books_from_html(booksdir: str = "books"):
    for bookdir, dirs, files in os.walk(booksdir):
        bookdir = bookdir.replace("\\", "/")
        html = first_non_index_html(bookdir)
        if not html:
            print(f"skip: {bookdir} (no book found)")
            continue
        print(f"build: {bookdir} -> {html}")
        generate_interactive_book_from_html(bookdir, f"{bookdir}/{html}")
        shutil.copy("scripts/interactive_book.css", bookdir)
        shutil.copy("scripts/interactive_book.js", bookdir)
        dirs[:] = []  # Once a book is found, do not go into its subdirectories!


generate_all_books_from_html()
