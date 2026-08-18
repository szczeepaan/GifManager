const fs = require("fs");
const path = require("path");

const gifDirectory = path.join(__dirname, "..", "storage", "gif");
const outputFile = path.join(__dirname, "..", "storage", "storage.js");

// Image formats that should be included
const imageExtensions = new Set([
    ".gif",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".bmp",
    ".avif"
]);

function sanitizeFilename(filename) {
    const extension = path.extname(filename).toLowerCase();
    const name = path.basename(filename, path.extname(filename));

    const sanitizedName = name
        // Convert accented/unicode characters to their basic form
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

        // Lowercase
        .toLowerCase()

        // Whitespace -> underscore
        .replace(/\s+/g, "_")

        // Keep only letters, numbers, underscores and hyphens
        .replace(/[^a-z0-9_-]/g, "")

        // Collapse multiple underscores
        .replace(/_+/g, "_")

        // Remove underscores/hyphens from the beginning/end
        .replace(/^[-_]+|[-_]+$/g, "");

    return sanitizedName + extension;
}

function getUniqueFilename(filename, usedNames) {
    if (!usedNames.has(filename)) {
        usedNames.add(filename);
        return filename;
    }

    const extension = path.extname(filename);
    const name = path.basename(filename, extension);

    let counter = 2;
    let newFilename;

    do {
        newFilename = `${name}_${counter}${extension}`;
        counter++;
    } while (usedNames.has(newFilename));

    usedNames.add(newFilename);

    return newFilename;
}

// Read files from the GIF directory
const files = fs.readdirSync(gifDirectory, { withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .filter(file => imageExtensions.has(path.extname(file).toLowerCase()));

const usedNames = new Set();
const gifs = [];

for (const file of files) {
    const sanitizedName = sanitizeFilename(file);
    const newFilename = getUniqueFilename(sanitizedName, usedNames);

    const oldPath = path.join(gifDirectory, file);
    const newPath = path.join(gifDirectory, newFilename);

    if (file !== newFilename) {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: "${file}" -> "${newFilename}"`);
    }

    gifs.push(newFilename);
}

// Sort alphabetically
gifs.sort();

// Generate storage.js
const output = `const GIF = ${JSON.stringify(gifs, null, 4)};\n`;

fs.writeFileSync(outputFile, output);

console.log(`\nGenerated: ${outputFile}`);
console.log(`Found ${gifs.length} image(s).`);