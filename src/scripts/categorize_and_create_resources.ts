import * as fs from "fs";
import { resolve } from "path";
import { categorizeTitle } from "../utils/categorization.js";
import { INPUT_FILES_DIRECTORY, RESOURCE_FILES_DIRECTORY } from "../utils/constants.js";
import { writeFile } from "~/utils/write_file.js";

// Read the CSV file
const csvFilePath = resolve(`${INPUT_FILES_DIRECTORY}/summary_credit.csv`);
const csvContent = fs.readFileSync(csvFilePath, "utf-8");
const lines = csvContent.split("\n").filter(line => line.trim() !== "");

// Extract unique titles (skip header and empty lines)
const titles = new Set<string>();
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line || line.trim() === "") continue;
  
  const parts = line.split(";");
  if (parts.length >= 2 && parts[1] && parts[1].trim() !== "") {
    titles.add(parts[1].trim());
  }
}

// Categorize all titles
const categorizedTitles = Array.from(titles).map(title => ({
  title: title,
  category: categorizeTitle(title)
}));

// Get all unique categories
const categories = new Set(categorizedTitles.map(item => item.category));
const categoriesList = Array.from(categories).sort();

// Write categorized titles to JSON
writeFile(`${RESOURCE_FILES_DIRECTORY}/categorized_titles.json`, categorizedTitles);

// Write categories to JSON
writeFile(`${RESOURCE_FILES_DIRECTORY}/categories.json`, categoriesList);

console.log(`Categorized ${categorizedTitles.length} unique titles`);
console.log(`Created ${categoriesList.length} categories:`, categoriesList.join(", "));
console.log("Files created:");
console.log("  - categorized_titles.json");
console.log("  - categories.json");

