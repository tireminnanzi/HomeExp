import os

# Get the directory of the script
script_dir = os.path.dirname(os.path.abspath(__file__))

# List of file paths (relative to script's directory)
files = [
    os.path.join(script_dir, "README.md"),
    os.path.join(script_dir, "backend", "package.json"),
    os.path.join(script_dir, "backend", "package-lock.json"),
    os.path.join(script_dir, "backend", "server.js"),
    os.path.join(script_dir, "backend", "db.json"),
    os.path.join(script_dir, "Frontend", "package.json"),
    os.path.join(script_dir, "Frontend", "package-lock.json"),
    os.path.join(script_dir, "Frontend", "index.html"),
    os.path.join(script_dir, "Frontend", "script.js"),
    os.path.join(script_dir, "Frontend", "style.css"),
    os.path.join(script_dir, "Frontend", "src", "backendCommunications.js"),
    os.path.join(script_dir, "Frontend", "src", "categorizationPage", "categorizationPage.js"),
    os.path.join(script_dir, "Frontend", "src", "categorizationPage", "categoriesManager.js"),
    os.path.join(script_dir, "Frontend", "src", "uploadPage", "fileParser.js"),
    os.path.join(script_dir, "Frontend", "src", "uploadPage", "uploadPage.js"),
    os.path.join(script_dir, "Frontend", "src", "visualizationPage", "visualizationPage.js")
]

output_base = "output"
output_ext = ".txt"
max_lines = 2000
file_num = 1
current_lines = 0
current_file = None
report = {}  # {output_file: [files_added]}
failed_files = []

for file_path in files:
    if not os.path.exists(file_path):
        failed_files.append(file_path)
        print(f"File not found: {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    code_lines = content.splitlines()
    added_lines = 3 + len(code_lines)  # **** + filename + content + possible newline
    
    if current_file is None or current_lines + added_lines > max_lines:
        if current_file:
            current_file.close()
        output_path = f"{output_base}{file_num}{output_ext}"
        current_file = open(output_path, 'w', encoding='utf-8')
        report[output_path] = []
        current_lines = 0
        file_num += 1
    
    current_file.write("****************\n")
    current_file.write(f"Filename: {file_path}\n")
    current_file.write(content + "\n")
    current_lines += added_lines
    report[output_path].append(file_path)

if current_file:
    current_file.close()

# Report with each filename on a new line
print("Report:")
for out_file, added in report.items():
    print(f"{out_file}:")
    for file in added:
        print(f"  {file}")
if failed_files:
    print("Failed files:")
    for file in failed_files:
        print(f"  {file}")