import { writeFileSync } from "fs";
import { resolve } from "path";

export function writeFile(path: string, content: any) {
  const resolvedPath = resolve(path);

  writeFileSync(
    resolvedPath,
    JSON.stringify(content, null, 2),
    "utf-8"
  );
}