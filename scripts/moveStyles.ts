import { readFile, writeFile } from "fs/promises";

const run = async () => {
  const file = await readFile("src/output.css", "utf8");
  // await writeFile("src/output-css.ts", `const styles = \`${file.replaceAll("`", '"')}\`;\nexport default styles;`);
};

run();
