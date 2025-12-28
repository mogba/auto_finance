import * as fs from "fs";
import { resolve } from "path";
import { Readable } from 'stream';
import * as XLSX from "xlsx/xlsx.mjs";

// load "fs" for readFile and writeFile support
XLSX.set_fs(fs);
// load 'stream' for stream support
XLSX.stream.set_readable(Readable);

function extractCsvFileContents(inputCsvFileLocation: string) {
  const workbook = XLSX.readFile(resolve(inputCsvFileLocation));
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return worksheet;
}

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

export function readTransactionsFromCsvFile(csvFileLocation: string) {
  const worksheet = extractCsvFileContents(csvFileLocation);
  const objectContent = parseCsvFileContentsToObject(worksheet);
  return objectContent;
}
