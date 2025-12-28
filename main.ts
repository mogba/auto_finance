import * as fs from "fs";
import { resolve } from "path";
import { Readable } from 'stream';
import * as XLSX from "xlsx/xlsx.mjs";
import { categorizeTitle } from "./src/utils/categorization.js";
import { INPUT_FILES_DIRECTORY } from "~/utils/constants.js";

// load "fs" for readFile and writeFile support
XLSX.set_fs(fs);
// load 'stream' for stream support
XLSX.stream.set_readable(Readable);

const csvFileLocation = resolve(`${INPUT_FILES_DIRECTORY}/summary_credit.csv`);

function extractCsvFileContents(inputCsvFileLocation: string) {
  const workbook = XLSX.readFile(inputCsvFileLocation);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return worksheet;
}

const worksheet = extractCsvFileContents(csvFileLocation);

function getValueByCellType(cell: any): string | undefined {
  switch (cell.t) {
    case "s": // string (title)
      return cell.v;
    case "n": // number (date, amount)
      return cell.w;
    default:
      return undefined;
  }
}

function parseCsvFileContentsToObject(inputWorksheet: XLSX.WorkSheet): { [rowNumber: string]: { date: string; title: string; amount: number } } {
  const maxRowNumber = 10_000;
  const columnLetters = ["A", "B", "C"];
  const columnNames: { [letter: string]: string } = { A: "date", B: "title", C: "amount" }

  const maxBlankRowsCount = 10;
  let blankRowsCount = 0;

  const rows: { [rowNumber: string]: { date: string; title: string; amount: number } } = {};

  for (let rowNumber = 1; blankRowsCount < maxBlankRowsCount && rowNumber < maxRowNumber; rowNumber++) {
    for (const columnLetter of columnLetters) {
      const cellId = `${columnLetter}${rowNumber}`;
      const cell = inputWorksheet[cellId];

      if (columnLetter === "A" && !cell) {
        blankRowsCount += 1;
        continue;
      } else if (blankRowsCount > 0) {
        blankRowsCount = 0;
      }

      if (cell) {
        const columnName = columnNames[columnLetter];
        let value: string | number | undefined = getValueByCellType(cell);

        const isHeaderRow = value && Object.values(columnNames).includes(value);
        const isNegativeNumber = value && value.startsWith("-") && !isNaN(Number(value.split("-")[1]));

        if (isHeaderRow) {
          continue;
        }
        if (isNegativeNumber) {
          // Remove credit payments as we want to sum credit expenses
          delete rows[rowNumber];
          continue;
        }

        if (columnName === "amount") {
          value = Number(value);
        }
        
        rows[rowNumber] = { ...rows[rowNumber], [columnName]: value };
      }
    }
  }

  return rows;
}

const rows = parseCsvFileContentsToObject(worksheet);

function categorizeTransactions(inputRows: { [rowNumber: string]: { date: string; title: string; amount: number; }; }) {
  const categorizedRows: { [rowNumber: string]: { date: string; title: string; category: string; amount: number; } } = {};

  for (const [rowNumber, rowData] of Object.entries(inputRows)) {
    categorizedRows[rowNumber] = { ...rowData, category: categorizeTitle(rowData.title) };
  }

  return categorizedRows;
}

const categorizedRows: { [rowNumber: string]: { date: string; title: string; category: string; amount: number; } } = categorizeTransactions(rows);

function summarizeTransactions(inputCategorizedRows: { [rowNumber: string]: { date: string; title: string; category: string; amount: number; } }): { totalAmount: number; summarizedTransactions: { [category: string]: { category: string; amount: number; transactions: { date: string; title: string; category: string; amount: number; }[]; }; } } {
  const summarizedTransactions: { [category: string]: { category: string; amount: number; transactions: { date: string; title: string; category: string; amount: number; }[]; }; } = {};

  for (const [_rowNumber, rowData] of Object.entries(inputCategorizedRows)) {
    const lastCategoryOccurrence = summarizedTransactions[rowData.category] || { amount: 0, transactions: [] };
    const amount = Number((((lastCategoryOccurrence.amount * 100) + (rowData.amount * 100)) / 100).toFixed(2));
    const transactions = [...lastCategoryOccurrence.transactions, rowData];

    summarizedTransactions[rowData.category] = { category: rowData.category, amount, transactions };
  }

  let totalAmount = 0;

  for (const [_category, { amount: categoryAmount }] of Object.entries(summarizedTransactions)) {
    totalAmount = Number((((totalAmount * 100) + (categoryAmount * 100)) / 100).toFixed(2));
  }

  return { totalAmount, summarizedTransactions };
}

const summarizedTransactions = summarizeTransactions(categorizedRows);

console.log("\nSummarized transactions:\n\n", summarizedTransactions);
