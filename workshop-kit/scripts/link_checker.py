import os
import re
import sys
from pathlib import Path

def find_markdown_files(root_dir):
    md_files = []
    for root, dirs, files in os.walk(root_dir):
        # Exclude hidden directories like .git
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for file in files:
            if file.endswith('.md'):
                md_files.append(Path(root) / file)
    return md_files

def extract_links(content):
    # Regex to find links [text](link) and images ![alt](link)
    # Matches anything inside the parentheses of a markdown link
    pattern = re.compile(r'\[[^\]]*\]\(([^)]+)\)')
    return pattern.findall(content)

def check_links():
    root_dir = Path(".")
    md_files = find_markdown_files(root_dir)
    broken_links = []
    checked_count = 0

    for file_path in md_files:
        content = file_path.read_text(encoding="utf-8")
        links = extract_links(content)
        for link in links:
            # Clean up link from anchors or queries
            link_clean = link.split("#")[0].split("?")[0].strip()
            
            # Skip empty links, external links, and mailto
            if not link_clean or link_clean.startswith(("http://", "https://", "mailto:", "tel:")):
                continue

            checked_count += 1
            # Resolve target path relative to the file containing the link
            target_path = (file_path.parent / link_clean).resolve()
            
            # Check if target exists on disk
            if not target_path.exists():
                broken_links.append((file_path, link, target_path))

    if broken_links:
        print(f"\nFound {len(broken_links)} broken link(s) across {len(md_files)} markdown files:")
        for source, link, target in broken_links:
            print(f"- {source}: Broken link '{link}' (resolved to: '{target}')")
        sys.exit(1)
    else:
        print(f"OK: Checked {checked_count} links across {len(md_files)} markdown files. All links are valid.")
        sys.exit(0)

if __name__ == "__main__":
    check_links()
