#!/usr/bin/env python3
import os
import re
import sys
from pathlib import Path

# List of files in the order they should be compiled for the unified kit
FILES = [
    "README.md",
    "what-this-proves.md",
    "docs/reviewer-guide.md",
    "docs/customer-workflow.md",
    "docs/product-feedback-notes.md",
    "discovery/adoption-questionnaire.md",
    "discovery/workflow-discovery-template.md",
    "discovery/use-case-prioritization-matrix.md",
    "discovery/roi-calculator.md",
    "sessions/30-min-partner-briefing.md",
    "sessions/60-min-workshop-agenda.md",
    "sessions/90-min-associate-hands-on.md",
    "enablement/adoption-maturity-model.md",
    "enablement/skeptical-partner-objections.md",
    "enablement/follow-up-email-templates.md",
    "enablement/product-feedback-template.md",
]

def slugify_path(path):
    # e.g., discovery/adoption-questionnaire.md -> discovery-adoption-questionnaire
    name = os.path.normpath(path).replace(os.sep, "-")
    if name.endswith(".md"):
        name = name[:-3]
    return name.lower()

def clean_title(title):
    return title.strip("# \t\r\n")

def parse_inline(text, slug_map):
    # Escape HTML characters to prevent rendering bugs, but preserve our generated tags
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    
    # Inline code: `code`
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    
    # Bold: **text**
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    
    # Italic: *text*
    text = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', text)
    
    # Markdown links: [text](url)
    def link_repl(match):
        link_text = match.group(1)
        url = match.group(2)
        
        # Check if URL is relative to one of our files
        # Extract base path and anchor
        url_part = url.split("#")[0]
        anchor_part = url.split("#")[1] if "#" in url else ""
        
        # Normalize relative path (e.g. ./sessions/../discovery/file.md -> discovery/file.md)
        # We can do a simple match against our files list
        matched_file = None
        for f in slug_map.keys():
            if url_part == f or url_part.endswith(f) or f.endswith(url_part) and url_part:
                matched_file = f
                break
        
        if matched_file:
            target_slug = slug_map[matched_file]
            if anchor_part:
                return f'<a href="#{target_slug}--{anchor_part}">{link_text}</a>'
            return f'<a href="#{target_slug}">{link_text}</a>'
        
        # If relative to root, adjust for HTML (since output is in enablement/ subfolder)
        if not url.startswith(("http://", "https://", "mailto:", "tel:", "#", "/")):
            if url.startswith("enablement/"):
                adjusted_url = url[len("enablement/"):]
            else:
                adjusted_url = "../" + url
            return f'<a href="{adjusted_url}">{link_text}</a>'
            
        # External or standard link
        return f'<a href="{url}" target="_blank" rel="noopener noreferrer">{link_text}</a>'
        
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link_repl, text)
    return text

def parse_markdown_to_html(md_text, slug_map, file_slug):
    lines = md_text.splitlines()
    html_out = []
    
    state = "NORMAL" # NORMAL, CODE, TABLE, LIST, BLOCKQUOTE
    code_lines = []
    table_rows = []
    list_items = []
    list_type = None # "ul" or "ol"
    blockquote_lines = []
    
    def flush_state():
        nonlocal state, code_lines, table_rows, list_items, blockquote_lines, list_type
        if state == "CODE":
            code_content = "\n".join(code_lines)
            html_out.append(f'<pre><code class="language-text">{code_content}</code></pre>')
            code_lines = []
        elif state == "TABLE":
            html_out.append('<div class="table-container"><table>')
            # Extract header and rows
            if table_rows:
                # Header row
                header_cols = [col.strip() for col in table_rows[0].split("|")[1:-1]]
                html_out.append("<thead><tr>")
                for col in header_cols:
                    html_out.append(f"<th>{parse_inline(col, slug_map)}</th>")
                html_out.append("</tr></thead>")
                
                # Body rows
                html_out.append("<tbody>")
                for row in table_rows[1:]:
                    # Skip alignment rows (e.g., |---|---|)
                    if re.match(r'^\s*\|?[\s\-|]+\|?\s*$', row):
                        continue
                    cols = [col.strip() for col in row.split("|")[1:-1]]
                    html_out.append("<tr>")
                    for col in cols:
                        html_out.append(f"<td>{parse_inline(col, slug_map)}</td>")
                    html_out.append("</tr>")
                html_out.append("</tbody>")
            html_out.append("</table></div>")
            table_rows = []
        elif state == "LIST":
            html_out.append(f"<{list_type}>")
            for item in list_items:
                html_out.append(f"<li>{parse_inline(item, slug_map)}</li>")
            html_out.append(f"</{list_type}>")
            list_items = []
        elif state == "BLOCKQUOTE":
            bq_text = "\n".join(blockquote_lines)
            # Check for GitHub-style alerts: [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]
            alert_match = re.match(r'^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)', bq_text, re.DOTALL | re.IGNORECASE)
            if alert_match:
                alert_type = alert_match.group(1).upper()
                alert_content = alert_match.group(2).strip()
                html_out.append(f'<div class="alert alert-{alert_type.lower()}">')
                html_out.append(f'<div class="alert-title">{alert_type}</div>')
                # Parse markdown lines inside alert content
                html_out.append(f'<p>{parse_inline(alert_content, slug_map)}</p>')
                html_out.append('</div>')
            else:
                html_out.append(f'<blockquote>{parse_inline(bq_text, slug_map)}</blockquote>')
            blockquote_lines = []
        state = "NORMAL"

    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Code Block
        if line.strip().startswith("```"):
            if state == "CODE":
                flush_state()
            else:
                flush_state()
                state = "CODE"
            i += 1
            continue
            
        if state == "CODE":
            # Just collect code block lines verbatim
            code_lines.append(line.replace("<", "&lt;").replace(">", "&gt;"))
            i += 1
            continue
            
        # Table Detection
        if line.strip().startswith("|"):
            if state != "TABLE":
                flush_state()
                state = "TABLE"
            table_rows.append(line)
            i += 1
            continue
        elif state == "TABLE" and not line.strip().startswith("|"):
            flush_state()
            
        # Blockquote Detection
        if line.strip().startswith(">"):
            if state != "BLOCKQUOTE":
                flush_state()
                state = "BLOCKQUOTE"
            blockquote_lines.append(line.strip().lstrip("> ").strip())
            i += 1
            continue
        elif state == "BLOCKQUOTE" and not line.strip().startswith(">"):
            flush_state()
            
        # List Detection
        ul_match = re.match(r'^\s*[\-\*]\s+(.*)', line)
        ol_match = re.match(r'^\s*\d+\.\s+(.*)', line)
        if ul_match:
            if state != "LIST" or list_type != "ul":
                flush_state()
                state = "LIST"
                list_type = "ul"
            list_items.append(ul_match.group(1))
            i += 1
            continue
        elif ol_match:
            if state != "LIST" or list_type != "ol":
                flush_state()
                state = "LIST"
                list_type = "ol"
            list_items.append(ol_match.group(1))
            i += 1
            continue
        elif state == "LIST" and line.strip() != "":
            # Check if it's a continuation of the list item
            if line.startswith("    ") or line.startswith("\t"):
                list_items[-1] += "\n" + line.strip()
                i += 1
                continue
            else:
                flush_state()
                
        # Headers
        header_match = re.match(r'^(#{1,6})\s+(.*)', line)
        if header_match:
            flush_state()
            level = len(header_match.group(1))
            header_text = header_match.group(2)
            # Create a section-specific header ID to avoid conflicts in the unified doc
            header_slug = slugify_path(header_text)
            header_id = f"{file_slug}--{header_slug}"
            
            # If it's a h1 (title) and we are wrapping it in a section, we can make it styled nicely
            parsed_header = parse_inline(header_text, slug_map)
            html_out.append(f'<h{level} id="{header_id}">{parsed_header}</h{level}>')
            i += 1
            continue
            
        # Horizontal Rule
        if re.match(r'^\s*[-*_]{3,}\s*$', line):
            flush_state()
            html_out.append('<hr />')
            i += 1
            continue
            
        # Paragraph or Empty line
        if line.strip() == "":
            flush_state()
        else:
            if state == "NORMAL":
                # Collect lines for a single paragraph
                para_lines = []
                while i < len(lines) and lines[i].strip() != "" and not lines[i].strip().startswith("|") and not lines[i].strip().startswith(">") and not lines[i].strip().startswith("```") and not re.match(r'^\s*[\-\*]\s+', lines[i]) and not re.match(r'^\s*\d+\.\s+', lines[i]) and not re.match(r'^(#{1,6})\s+', lines[i]):
                    para_lines.append(lines[i].strip())
                    i += 1
                para_text = " ".join(para_lines)
                html_out.append(f'<p>{parse_inline(para_text, slug_map)}</p>')
                continue
        i += 1
        
    flush_state()
    return "\n".join(html_out)

def compile_kit():
    print("Compiling Legal AI Workshop Kit...")
    
    # 1. Create slug map
    slug_map = {f: slugify_path(f) for f in FILES}
    
    # 2. Build Unified Markdown
    unified_md_content = []
    unified_md_content.append("# Legal AI Workshop Kit — Unified Playbook")
    unified_md_content.append("\n*This is a single unified file compiling all discovery tools, workshop agendas, and post-sales playbooks in the Legal AI Workshop Kit.*")
    unified_md_content.append("\n---\n")
    
    toc_md = ["## Table of Contents\n"]
    
    # Read files to get titles for TOC
    file_titles = {}
    for filepath in FILES:
        if not os.path.exists(filepath):
            print(f"Error: Required file {filepath} not found.")
            sys.exit(1)
            
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            # Find first h1
            h1_match = re.search(r'^#\s+(.*)', content, re.MULTILINE)
            title = clean_title(h1_match.group(1)) if h1_match else filepath
            file_titles[filepath] = title
            
            # Add to TOC markdown
            slug = slug_map[filepath]
            toc_md.append(f"- [{title}](#{slug})")
            
    unified_md_content.append("\n".join(toc_md))
    unified_md_content.append("\n---\n")
    
    # Compile each file into Markdown
    for filepath in FILES:
        slug = slug_map[filepath]
        title = file_titles[filepath]
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Strip the first H1 tag since we are wrapping in section or adding a clean subheader
        content_lines = content.splitlines()
        clean_lines = []
        stripped_title = False
        for line in content_lines:
            if line.startswith("# ") and not stripped_title:
                stripped_title = True
                continue
            clean_lines.append(line)
        
        body_content = "\n".join(clean_lines)
        
        # Rewrite relative links in markdown to hash links
        def md_link_repl(match):
            link_text = match.group(1)
            url = match.group(2)
            url_part = url.split("#")[0]
            anchor_part = url.split("#")[1] if "#" in url else ""
            
            matched_file = None
            for f in slug_map.keys():
                if url_part == f or url_part.endswith(f) or f.endswith(url_part) and url_part:
                    matched_file = f
                    break
            if matched_file:
                target_slug = slug_map[matched_file]
                if anchor_part:
                    return f"[{link_text}](#{target_slug}--{anchor_part})"
                return f"[{link_text}](#{target_slug})"
            
            # If not matched, adjust relative path since output is in enablement/
            if not url.startswith(("http://", "https://", "mailto:", "tel:", "#", "/")):
                if url.startswith("enablement/"):
                    adjusted_url = url[len("enablement/"):]
                else:
                    adjusted_url = "../" + url
                return f"[{link_text}]({adjusted_url})"
            return match.group(0)
            
        body_content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', md_link_repl, body_content)
        
        unified_md_content.append(f'<div id="{slug}">\n\n')
        unified_md_content.append(f"## {title}\n\n")
        unified_md_content.append(body_content)
        unified_md_content.append("\n\n</div>\n\n---\n")
        
    # Write unified MD
    output_dir = Path("enablement")
    output_dir.mkdir(exist_ok=True)
    
    unified_md_path = output_dir / "workshop-kit-unified.md"
    unified_md_path.write_text("\n".join(unified_md_content), encoding="utf-8")
    print(f"Successfully generated {unified_md_path}")
    
    # 3. Build Unified HTML
    # Define CSS styles for premium, state-of-the-art dark theme (Rich Aesthetics)
    css_styles = """
    :root {
        --bg-color: #0b0f19;
        --card-bg: rgba(22, 30, 49, 0.7);
        --border-color: rgba(255, 255, 255, 0.08);
        --text-primary: #f3f4f6;
        --text-secondary: #9ca3af;
        --primary: #3b82f6;
        --primary-hover: #60a5fa;
        --accent-success: #10b981;
        --accent-warning: #f59e0b;
        --accent-danger: #ef4444;
        --font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        --heading-font: 'Outfit', sans-serif;
    }

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        background-color: var(--bg-color);
        color: var(--text-primary);
        font-family: var(--font-family);
        line-height: 1.6;
        display: flex;
        min-height: 100vh;
        overflow-x: hidden;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    ::-webkit-scrollbar-track {
        background: var(--bg-color);
    }
    ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    /* Sidebar Navigation */
    aside {
        width: 320px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(12px);
        border-right: 1px solid var(--border-color);
        padding: 2rem 1.5rem;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        z-index: 100;
    }

    .sidebar-title {
        font-family: var(--heading-font);
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        color: #fff;
        letter-spacing: -0.025em;
        background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .sidebar-subtitle {
        font-size: 0.75rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 2rem;
    }

    aside ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    aside a {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.875rem;
        display: block;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        transition: all 0.2s ease;
        border: 1px solid transparent;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    aside a:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.03);
    }

    aside a.active {
        color: #fff;
        background: rgba(59, 130, 246, 0.15);
        border-color: rgba(59, 130, 246, 0.3);
        font-weight: 500;
    }

    /* Main Content Area */
    main {
        margin-left: 320px;
        padding: 3rem 4rem;
        max-width: 1000px;
        width: calc(100% - 320px);
        margin-right: auto;
    }

    section {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 2.5rem;
        margin-bottom: 3rem;
        box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(8px);
    }

    h1, h2, h3, h4, h5, h6 {
        font-family: var(--heading-font);
        color: #fff;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        letter-spacing: -0.02em;
    }

    h1 {
        font-size: 2.25rem;
        margin-top: 0;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 1rem;
        background: linear-gradient(135deg, #fff 50%, #9ca3af 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    h2 {
        font-size: 1.75rem;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 0.5rem;
        margin-top: 2rem;
    }

    h3 {
        font-size: 1.35rem;
    }

    p {
        color: #d1d5db;
        margin-bottom: 1.25rem;
        font-size: 0.975rem;
    }

    /* Links */
    a {
        color: var(--primary-hover);
        text-decoration: none;
        transition: color 0.15s ease;
    }
    a:hover {
        color: #93c5fd;
        text-decoration: underline;
    }

    /* Lists */
    ul, ol {
        margin-bottom: 1.5rem;
        padding-left: 1.5rem;
        color: #d1d5db;
    }
    li {
        margin-bottom: 0.5rem;
        font-size: 0.975rem;
    }

    /* Code blocks */
    pre {
        background: #030712;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.25rem;
        overflow-x: auto;
        margin-bottom: 1.5rem;
    }
    code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 0.875rem;
        color: #f3f4f6;
    }
    p > code, li > code {
        background: rgba(255, 255, 255, 0.08);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-size: 0.85em;
    }

    /* Tables */
    .table-container {
        overflow-x: auto;
        margin-bottom: 1.5rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
    }
    table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.9rem;
    }
    th, td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-color);
    }
    th {
        background: rgba(255, 255, 255, 0.02);
        color: #fff;
        font-weight: 600;
        font-family: var(--heading-font);
    }
    tr:last-child td {
        border-bottom: none;
    }
    tr:hover td {
        background: rgba(255, 255, 255, 0.01);
    }

    /* Alerts */
    .alert {
        border-left: 4px solid var(--primary);
        background: rgba(59, 130, 246, 0.05);
        border-radius: 0 8px 8px 0;
        padding: 1rem 1.25rem;
        margin-bottom: 1.5rem;
    }
    .alert-title {
        font-weight: 700;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.25rem;
        color: var(--primary-hover);
    }
    .alert-tip {
        border-left-color: var(--accent-success);
        background: rgba(16, 185, 129, 0.05);
    }
    .alert-tip .alert-title {
        color: var(--accent-success);
    }
    .alert-important {
        border-left-color: var(--primary);
        background: rgba(59, 130, 246, 0.05);
    }
    .alert-important .alert-title {
        color: var(--primary-hover);
    }
    .alert-warning {
        border-left-color: var(--accent-warning);
        background: rgba(245, 158, 11, 0.05);
    }
    .alert-warning .alert-title {
        color: var(--accent-warning);
    }
    .alert-caution {
        border-left-color: var(--accent-danger);
        background: rgba(239, 68, 68, 0.05);
    }
    .alert-caution .alert-title {
        color: var(--accent-danger);
    }

    /* Blockquotes */
    blockquote {
        border-left: 4px solid var(--border-color);
        padding-left: 1.25rem;
        color: var(--text-secondary);
        font-style: italic;
        margin-bottom: 1.5rem;
    }

    /* Horizontal Rule */
    hr {
        border: none;
        border-top: 1px solid var(--border-color);
        margin: 2rem 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
        body {
            flex-direction: column;
        }
        aside {
            width: 100%;
            position: relative;
            height: auto;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
        }
        main {
            margin-left: 0;
            width: 100%;
            padding: 1.5rem;
        }
        section {
            padding: 1.5rem;
        }
    }
    """
    
    # Compile sections to HTML
    html_sections = []
    for filepath in FILES:
        slug = slug_map[filepath]
        title = file_titles[filepath]
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Strip first header
        content_lines = content.splitlines()
        clean_lines = []
        stripped_title = False
        for line in content_lines:
            if line.startswith("# ") and not stripped_title:
                stripped_title = True
                continue
            clean_lines.append(line)
        body_content = "\n".join(clean_lines)
        
        parsed_body = parse_markdown_to_html(body_content, slug_map, slug)
        
        section_html = f"""
        <section id="{slug}">
            <h1>{title}</h1>
            {parsed_body}
        </section>
        """
        html_sections.append(section_html)
        
    # Build sidebar list
    sidebar_items = []
    for filepath in FILES:
        slug = slug_map[filepath]
        title = file_titles[filepath]
        sidebar_items.append(f'<li><a href="#{slug}" id="link-{slug}">{title}</a></li>')
        
    sidebar_html = "\n".join(sidebar_items)
    sections_combined = "\n".join(html_sections)
    
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Legal AI Workshop Kit Playbook</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@600;700&display=swap" rel="stylesheet">
    <style>
        {css_styles}
    </style>
</head>
<body>
    <aside>
        <div class="sidebar-title">Legal AI</div>
        <div class="sidebar-subtitle">Workshop Kit Playbook</div>
        <nav>
            <ul>
                {sidebar_html}
            </ul>
        </nav>
    </aside>
    <main>
        {sections_combined}
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {{
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('aside nav a');

            // Simple intersection observer to highlight current section in TOC
            const observerOptions = {{
                root: null,
                rootMargin: '-20% 0px -60% 0px',
                threshold: 0
            }};

            const observer = new IntersectionObserver((entries) => {{
                entries.forEach(entry => {{
                    if (entry.isIntersecting) {{
                        const id = entry.target.getAttribute('id');
                        navLinks.forEach(link => {{
                            if (link.getAttribute('href') === '#' + id) {{
                                link.classList.add('active');
                                // Scroll link into view inside sidebar if needed
                                link.scrollIntoView({{ behavior: 'smooth', block: 'nearest' }});
                            }} else {{
                                link.classList.remove('active');
                            }}
                        }});
                    }}
                }});
            }}, observerOptions);

            sections.forEach(section => observer.observe(section));

            // Smooth scrolling to section from TOC
            navLinks.forEach(link => {{
                link.addEventListener('click', (e) => {{
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {{
                        targetSection.scrollIntoView({{ behavior: 'smooth' }});
                        window.history.pushState(null, null, '#' + targetId);
                    }}
                }});
            }});
        }});
    </script>
</body>
</html>
"""
    
    unified_html_path = output_dir / "workshop-kit-unified.html"
    unified_html_path.write_text(full_html, encoding="utf-8")
    print(f"Successfully generated {unified_html_path}")
    print("Compilation complete!")

if __name__ == "__main__":
    compile_kit()
