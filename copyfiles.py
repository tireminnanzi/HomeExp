import os

# Get the directory of the script
script_dir = os.path.dirname(os.path.abspath(__file__))

# File lists (relative paths without frontend/backend prefixes)
generic_files = [
    "README.md",
    ".gitignore"
]

backend_files = [
    "server.js",
    "db.json"
]

frontend_files = [
    "index.html",
    "script.js",
    "style.css",
    "src/backendCommunications.js",
    "src/categorizationPage/categorizationPage.js",
    "src/categorizationPage/categoriesManager.js",
    "src/categorizationPage/expenseManager.js",
    "src/categorizationPage/rulesManager.js",
    "src/categorizationPage/StyleExpCategorization.css",
    "src/uploadPage/fileParser.js",
    "src/uploadPage/uploadPage.js",
    "src/visualizationPage/visualizationPage.js"
]

# Output file paths
output_generic = os.path.join(script_dir, "output_generic.txt")
output_backend = os.path.join(script_dir, "output_backend.txt")
output_frontend = os.path.join(script_dir, "output_frontend.txt")

def generate_folder_tree():
    """Generate a folder tree from the file lists."""
    tree = {}
    
    # Add generic files to root
    for file in generic_files:
        tree[file] = None  # Files have no children
    
    # Add backend files
    backend_dict = tree.setdefault("backend", {})
    for file in backend_files:
        parts = file.split(os.sep)
        current = backend_dict
        for part in parts[:-1]:  # Navigate to the correct subdirectory
            current = current.setdefault(part, {})
        current[parts[-1]] = None  # Add the file
    
    # Add frontend files
    frontend_dict = tree.setdefault("Frontend", {})
    for file in frontend_files:
        parts = file.split(os.sep)
        current = frontend_dict
        for part in parts[:-1]:  # Navigate to the correct subdirectory
            current = current.setdefault(part, {})
        current[parts[-1]] = None  # Add the file
    
    # Convert tree to string representation
    def print_tree(node, prefix="", level=0):
        lines = []
        items = sorted(node.keys())  # Sort for consistent output
        for i, key in enumerate(items):
            is_last = i == len(items) - 1
            connector = "└── " if is_last else "├── "
            lines.append(f"{prefix}{connector}{key}")
            if node[key] is not None:  # If it's a directory
                new_prefix = prefix + ("    " if is_last else "│   ")
                lines.extend(print_tree(node[key], new_prefix, level + 1))
        return lines
    
    tree_lines = ["Project Folder Structure:"]
    tree_lines.extend(print_tree(tree))
    return tree_lines

def write_files(file_list, output_path, base_folder=None, is_generic=False):
    """Write files to output with an index and optional folder tree."""
    failed_files = []
    file_index = []
    content_lines = []
    
    # Generate folder tree for generic file
    if is_generic:
        content_lines.extend(generate_folder_tree())
        content_lines.append("")  # Add newline after tree
    
    for relative_path in file_list:
        # Construct full path
        if base_folder:
            file_path = os.path.join(script_dir, base_folder, relative_path)
        else:
            file_path = os.path.join(script_dir, relative_path)
        
        # Check if file exists
        if not os.path.exists(file_path):
            failed_files.append(relative_path)
            print(f"File not found: {file_path}")
            continue
        
        # Read file content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add to index and content
        file_index.append(relative_path)
        content_lines.append("****************")
        content_lines.append(f"Filename: {relative_path}")
        content_lines.append(content)
        content_lines.append("")  # Add newline after content
    
    # Write to output file
    with open(output_path, 'w', encoding='utf-8') as out_file:
        # Write folder tree and/or index
        if is_generic:
            out_file.write("\n".join(content_lines[:len(generate_folder_tree()) + 1]))
            out_file.write("\nIndex of Files:\n")
        else:
            out_file.write("Index of Files:\n")
        # Write index
        for idx, file in enumerate(file_index, 1):
            out_file.write(f"{idx}. {file}\n")
        out_file.write("\n")
        # Write content
        if is_generic:
            out_file.write("\n".join(content_lines[len(generate_folder_tree()) + 1:]))
        else:
            out_file.write("\n".join(content_lines))
    
    return file_index, failed_files

# Process all file groups
report = {
    "generic": [],
    "backend": [],
    "frontend": []
}
failed_files = []

# Write generic files (with folder tree)
generic_index, generic_failed = write_files(generic_files, output_generic, is_generic=True)
report["generic"] = generic_index
failed_files.extend(generic_failed)

# Write backend files
backend_index, backend_failed = write_files(backend_files, output_backend, "backend")
report["backend"] = backend_index
failed_files.extend(backend_failed)

# Write frontend files
frontend_index, frontend_failed = write_files(frontend_files, output_frontend, "Frontend")
report["frontend"] = frontend_index
failed_files.extend(frontend_failed)

# Print report
print("Report:")
for category, files in report.items():
    print(f"{category.capitalize()} Files (output_{category}.txt):")
    if files:
        for file in files:
            print(f"  {file}")
    else:
        print("  No files added")
if failed_files:
    print("Failed files:")
    for file in failed_files:
        print(f"  {file}")