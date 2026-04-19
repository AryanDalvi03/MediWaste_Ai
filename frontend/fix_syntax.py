import os

target_dir = 'c:/Users/ATHARVA/Downloads/MediWaste_Ai-main/frontend/src'

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # fix the incorrect apiBase assignment
            content = content.replace("const apiBase = (import.meta as any).env?.VITE_API_URL || `\\${apiBase}';", "const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';")
            
            # fix the fetch calls
            content = content.replace("`\\${apiBase}", "`${apiBase}")
            
            content = content.replace("`${apiBase}/api/bins')", "`${apiBase}/api/bins`)")
            content = content.replace("`${apiBase}/api/work_log?limit=30')", "`${apiBase}/api/work_log?limit=30`)")
            content = content.replace("`${apiBase}/api/staff')", "`${apiBase}/api/staff`)")
            content = content.replace("`${apiBase}/api/reports')", "`${apiBase}/api/reports`)")
            
            # For BinOperations.tsx and others
            content = content.replace("`${apiBase}/api/bins', {", "`${apiBase}/api/bins`, {")
            content = content.replace("`${apiBase}/api/staff', {", "`${apiBase}/api/staff`, {")
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
