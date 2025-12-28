import { summarizeTransactions } from "~/modules/summarization/summarization.js";
import { readTransactionsFromCsvFile } from "~/modules/csv_processing/csv_processing.js";
import { INPUT_FILES_DIRECTORY, OUTPUT_FILES_DIRECTORY } from "~/utils/constants.js";
import { writeFile } from "~/utils/write_file.js";

const transactions = readTransactionsFromCsvFile(`${INPUT_FILES_DIRECTORY}/summary_credit.csv`);
const summarizedTransactions = summarizeTransactions(transactions);

const outputFileLocation = `${OUTPUT_FILES_DIRECTORY}/summarized_transactions.json`;
writeFile(outputFileLocation, summarizedTransactions)

console.log(`\nSummarized transactions written to file ${outputFileLocation}.`);
console.log(`\nDone.`);
