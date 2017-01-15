const fs = require("fs");
const path = require("path");

function copy(from, to) {
    fs.writeFileSync(to, fs.readFileSync(from));
}

const files = [
    "index.html",
    "style.css",
    "built/bundle.js",
];

const target = "docs";

for (const file of files) {
    const targetPath = path.join(target, file);
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }
    fs.writeFileSync(targetPath, fs.readFileSync(file));
}
