import os
import re

target_dir = 'c:/Users/ATHARVA/Downloads/MediWaste_Ai-main/frontend/src'

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            if "'http://localhost:8000" in content or '`http://localhost:8000' in content:
                print(f"Updating {path}")
                # Add the apiBase definition if not present
                if 'apiBase =' not in content:
                    imports = [m.end() for m in re.finditer(r'^import .+\n', content, re.MULTILINE)]
                    insert_pos = imports[-1] if imports else 0
                    
                    api_var = "\nconst apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';\n"
                    content = content[:insert_pos] + api_var + content[insert_pos:]
                
                # Replace the occurrences
                content = content.replace("'http://localhost:8000", "`\\${apiBase}")
                content = content.replace("`http://localhost:8000", "`\\${apiBase}")
                
                # Make sure to close the backtick correctly if it started with a single quote
                content = re.sub(r"`\$\{apiBase\}([^']*)'", r"`\$\{apiBase\}\1`", content)
                
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Done {file}')
