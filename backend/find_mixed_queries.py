
import os
import re

def find_mixed_queries(root_dir):
    for root, dirs, files in os.walk(root_dir):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for file in files:
            if file.endswith('.js'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Find prisma calls using a regex that captures the call block
                    # prisma.model.method({...})
                    pattern = r'prisma\.[a-zA-Z]+\.[a-zA-Z]+\(\{[\s\S]*?\}\)'
                    for match in re.finditer(pattern, content):
                        block = match.group(0)
                        if 'select:' in block and 'include:' in block:
                            print(f"Found mixed query in {path}:")
                            print(block)
                            print("-" * 20)

if __name__ == "__main__":
    find_mixed_queries('backend')
