import os
import json

BOOKS_DIR = "books"
MANIFEST_FILE = "books/manifest.json"

def get_metadata(path):
    """Reads meta.json if it exists, otherwise generates defaults."""
    meta_path = os.path.join(path, "meta.json")
    default_name = os.path.basename(path).replace("_", " ").title()
    
    meta = {
        "title": default_name,
        "author": "Unknown",
        "tags": [],
        "blurb": "",
        "children_order": [] # List of folder/file names to define sort order
    }
    
    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                meta.update(data)
        except Exception as e:
            print(f"Error reading metadata for {path}: {e}")
            
    return meta

def build_tree(current_path):
    """Recursively scans directories to build the manifest tree."""
    name = os.path.basename(current_path)
    
    # 1. Get Metadata for the CURRENT directory (to retrieve children_order)
    meta = get_metadata(current_path)
    order_list = meta.get("children_order", [])

    # Check if this directory is a "Book"
    if os.path.exists(os.path.join(current_path, "index.html")) and \
       os.path.exists(os.path.join(current_path, "interactive_book.js")):
        return {
            "type": "book",
            "name": name,
            "path": current_path.replace("\\", "/").replace("books/", ""),
            "cover": "cover.jpg" if os.path.exists(os.path.join(current_path, "cover.jpg")) else None,
            "meta": meta
        }

    # Otherwise, treat as a Directory
    children_nodes = []
    
    try:
        # scan all entries
        entries = os.listdir(current_path)
    except PermissionError:
        entries = []

    # Filter valid entries first
    valid_entries = []
    for entry in entries:
        full_entry_path = os.path.join(current_path, entry)
        if os.path.isdir(full_entry_path) and entry != "contents" and entry != "images":
           valid_entries.append(entry)

    # 2. Sort Entries
    # Helper to get index in defined order, or return infinity if not present
    def sort_key(entry_name):
        try:
            return order_list.index(entry_name)
        except ValueError:
            return 999
            
    # Sort primarily by explicit order, secondarily by alphabet
    valid_entries.sort(key=lambda x: (sort_key(x), x.lower()))

    # 3. Categorize into Folders and Books to enforce "Folders First"
    folders = []
    books = []

    for entry in valid_entries:
        full_entry_path = os.path.join(current_path, entry)
        child_node = build_tree(full_entry_path)
        
        if child_node:
            if child_node["type"] == "dir":
                folders.append(child_node)
            else:
                books.append(child_node)
    
    # Final children list: Folders first, then Books
    children_nodes = folders + books

    if current_path == BOOKS_DIR: # Root
        return {
            "type": "dir", 
            "name": "books", 
            "path": "", 
            "children": children_nodes
        }
    
    if not children_nodes:
        return None 

    return {
        "type": "dir",
        "name": name,
        "path": current_path.replace("\\", "/").replace("books/", ""),
        "cover": "cover.jpg" if os.path.exists(os.path.join(current_path, "cover.jpg")) else None,
        "children": children_nodes
    }

def generate():
    print("Generating manifest...")
    tree = build_tree(BOOKS_DIR)
    
    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(tree, f, indent=2)
    print(f"Manifest written to {MANIFEST_FILE}")

if __name__ == "__main__":
    generate()
