import * as fs from "fs";
import { resolve } from "path";
import { RESOURCE_FILES_DIRECTORY } from "./constants.js";

type CategorizedTitle = {
  title: string;
  category: string;
};

function normalizeTitle(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, " ");
}

let titlePatterns: Array<{ pattern: string; category: string }> | null = null;

function loadCategorizedTitles(): Array<{ pattern: string; category: string }> {
  if (titlePatterns !== null) {
    return titlePatterns;
  }

  const filePath = resolve(RESOURCE_FILES_DIRECTORY, "categorized_titles.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const categorizedTitles: CategorizedTitle[] = JSON.parse(fileContent);

  titlePatterns = categorizedTitles
    .map(({ title, category }) => ({
      pattern: normalizeTitle(title),
      category,
    }))
    .sort((a, b) => b.pattern.length - a.pattern.length);

  return titlePatterns;
}

export function categorizeTitle(title: string): string {
  const patterns = loadCategorizedTitles();
  const normalizedTitle = normalizeTitle(title);

  for (const { pattern, category } of patterns) {
    if (normalizedTitle.includes(pattern)) {
      return category;
    }
  }

  // Fallback: check for numeric prefix pattern (Personal Services)
  if (/^\d+/.test(normalizedTitle)) {
    return "Personal Services";
  }

  return "Other";
}
