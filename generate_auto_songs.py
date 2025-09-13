import os


from scripts.auto_songs import create_poem, create_song


def generate_all_songs_from_books(booksdir: str = "books"):
    for bookdir, dirs, files in os.walk(booksdir):
        bookdir = bookdir.replace("\\", "/")
        if not os.path.exists(f"{bookdir}/index.html"):
            print(f"skip: {bookdir} (no book found)")
            continue
        print(f"creating song from: {bookdir}/index.html -> poem.txt, song.mp3")
        poem_txt = create_poem(f"{bookdir}/index.html", f"{bookdir}/poem.txt")
        create_song(poem_txt, f"{bookdir}/song.mp3")
        dirs[:] = []  # Once a book is found, do not go into its subdirectories!


generate_all_songs_from_books()
