import path from "node:path";
import fs from "node:fs";
import { exec } from "node:child_process"; 
import { checkPath } from "./utils.js";
import { normalizePath } from "vite";

export type OpenSourceData = {
  type: "open-source";
  data: {
    /** The source file to open */
    source?: string;
    /** The remix route ID, usually discovered via the hook useMatches */
    routeID?: string;
    /** The line number in the source file */
    line?: number;
    /** The column number in the source file */
    column?: number;
  };
};


export type EditorConfig = {
  name: string;
  open(path: string  , lineNumber: string | undefined): void;
}

export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  name: "VSCode",
  open: (path, lineNumber) => { 
    exec(`code -g "${normalizePath(path)}${lineNumber ? `:${lineNumber}` : ""}"`);
  }
}

export const handleOpenSource = ({data, openInEditor, remixDir}:    {
  data: OpenSourceData;
  remixDir: string;
  openInEditor: (path: string, lineNum: string | undefined) => void;

}) => {
  const { source, line, routeID } = data.data;
  const lineNum = line ? `${line}` : undefined;

  if (source) { 
    return openInEditor(source, lineNum);
  }

  if (routeID) {
    const routePath = path.join(remixDir, routeID);
    const checkedPath = checkPath(routePath);

    if (!checkedPath) return;
    const { type, validPath } = checkedPath;

    const reactExtensions = ["tsx", "jsx"];
    const allExtensions = ["ts", "js", ...reactExtensions];
    const isRoot = routeID === "root";
    const findFileByExtension = (prefix: string, filePaths: string[]) =>{
      const file = filePaths.find(file => allExtensions.some(ext => file === `${prefix}.${ext}`));
      return file
    }

    if (isRoot) {
      if (!fs.existsSync(remixDir)) return;
      const filesInRemixPath = fs.readdirSync(remixDir);
      const rootFile = findFileByExtension("root", filesInRemixPath);
      rootFile && openInEditor(path.join(remixDir, rootFile), lineNum);
      return;
    }

    // If its not the root route, then we find the file or folder in the routes folder
    // We know that the route ID is in the form of "routes/contact" or "routes/user.profile" when is not root
    // so the ID already contains the "routes" segment, so we just need to find the file or folder in the routes folder
    if (type === "directory") {
      const filesInFolderRoute = fs.readdirSync(validPath);
      const routeFile = findFileByExtension("route", filesInFolderRoute);
      routeFile && openInEditor(path.join(remixDir, routeID, routeFile), lineNum);
      return;
    }
    return openInEditor(validPath, lineNum);
  }
}