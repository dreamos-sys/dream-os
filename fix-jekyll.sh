#!/bin/bash

echo "🔧 Fixing Jekyll GitHub Pages issues..."

# 1. Create .nojekyll file
echo "Creating .nojekyll file..."
touch .nojekyll

# 2. Rename folders (optional)
echo "Renaming folders..."
if [ -d "_js" ]; then
    mv _js js
fi

if [ -d "_css" ]; then
    mv _css css
fi

if [ -d "_apps" ]; then
    mv _apps apps
fi

if [ -d "_components" ]; then
    mv _components components
fi

# 3. Update HTML files
echo "Updating file paths..."
find . -name "*.html" -type f -exec sed -i '' 's/_js\//js\//g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's/_css\//css\//g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's/_apps\//apps\//g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's/_components\//components\//g' {} \;

# 4. Update JavaScript files
find . -name "*.js" -type f -exec sed -i '' 's/_js\//js\//g' {} \;
find . -name "*.js" -type f -exec sed -i '' 's/_css\//css\//g' {} \;

echo "✅ Fix completed!"
echo "Please commit and push changes to GitHub."
