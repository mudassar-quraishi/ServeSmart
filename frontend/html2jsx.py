import re
import sys

def html_to_jsx(html_str):
    # Basic replacements
    jsx = html_str.replace('class="', 'className="')
    jsx = jsx.replace('for="', 'htmlFor="')
    jsx = jsx.replace('<!--', '{/*')
    jsx = jsx.replace('-->', '*/}')
    
    # Self closing tags
    for tag in ['img', 'input', 'hr', 'br']:
        # Match <tag ... > but not <tag ... />
        jsx = re.sub(rf'<{tag}([^>]*?)(?<!/)>', rf'<{tag}\1 />', jsx)
    
    return jsx

if __name__ == '__main__':
    filename = sys.argv[1]
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract body content
    match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL | re.IGNORECASE)
    if match:
        body_content = match.group(1)
        jsx_content = html_to_jsx(body_content)
        outfile = sys.argv[2]
        with open(outfile, 'w', encoding='utf-8') as f:
            f.write(jsx_content)
