import { readdir } from "node:fs/promises";
import path from "node:path";

const apiDirectory = path.resolve(import.meta.dirname, "..", "api");
const maximumHobbyFunctions = 12;

async function collectDeployableTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectDeployableTypeScriptFiles(entryPath);
    if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.startsWith("_")) return [entryPath];
    return [];
  }));
  return files.flat();
}

const functions = await collectDeployableTypeScriptFiles(apiDirectory);
if (functions.length > maximumHobbyFunctions) {
  throw new Error(`Vercel Hobby function limit exceeded: ${functions.length}/${maximumHobbyFunctions}`);
}

console.log(`Vercel Hobby function count: ${functions.length}/${maximumHobbyFunctions}`);
