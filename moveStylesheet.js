import fs from "fs-extra";

async function moveCssFile() {
  try {
    const srcPath = "src/public/stylesheet.css";
    const destPath = "dist/stylesheet.css";

    await fs.copy(srcPath, destPath);
    console.log(`Successfully moved ${srcPath} to ${destPath}`);
  } catch (error) {
    console.error("Error moving CSS file:", error);
  }
}

moveCssFile();
