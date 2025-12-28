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

export function invalidateCategorizationCache(): void {
  titlePatterns = null;
}

export function updateCategorizedTitles(updates: Array<{ title: string; category: string }>): void {
  const filePath = resolve(RESOURCE_FILES_DIRECTORY, "categorized_titles.json");
  
  let categorizedTitles: CategorizedTitle[] = [];
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    categorizedTitles = JSON.parse(fileContent);
  }

  const titleMap = new Map<string, CategorizedTitle>();
  for (const entry of categorizedTitles) {
    const normalized = normalizeTitle(entry.title);
    titleMap.set(normalized, entry);
  }

  for (const { title, category } of updates) {
    const normalized = normalizeTitle(title);
    titleMap.set(normalized, { title, category });
  }

  const updatedTitles: CategorizedTitle[] = Array.from(titleMap.values()).sort((a, b) => 
    a.title.localeCompare(b.title)
  );

  fs.writeFileSync(
    filePath,
    JSON.stringify(updatedTitles, null, 2),
    "utf-8"
  );

  invalidateCategorizationCache();
}
