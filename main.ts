import { summarizeTransactions } from "~/modules/summarization/summarization.js";
import { readTransactionsFromCsvFile } from "~/modules/csv_processing/csv_processing.js";
import { INPUT_FILES_DIRECTORY, OUTPUT_FILES_DIRECTORY } from "~/utils/constants.js";
import { writeFile } from "~/utils/write_file.js";
import { tuneCategories } from "~/modules/category_tuning/category_tuning.js";
import { SummarizedTransactions } from "~/utils/summarization.js";

const transactions = readTransactionsFromCsvFile(`${INPUT_FILES_DIRECTORY}/summary_credit.csv`);
const summarizedTransactions = summarizeTransactions(transactions);

const outputFileLocation = `${OUTPUT_FILES_DIRECTORY}/summarized_transactions.json`;
writeFile(outputFileLocation, summarizedTransactions)

console.log(`\nSummarized transactions written to file ${outputFileLocation}.`);

let modifiedSummarizedTransactions: SummarizedTransactions | null = summarizedTransactions.summarizedTransactions;

while (true) {
  modifiedSummarizedTransactions = await tuneCategories(modifiedSummarizedTransactions);

  if (modifiedSummarizedTransactions === null) {
    break;
  }

  const updatedSummarizedTransactions = {
    totalAmount: summarizedTransactions.totalAmount,
    summarizedTransactions: modifiedSummarizedTransactions
  };

  writeFile(outputFileLocation, updatedSummarizedTransactions);
  
  console.log(`\nUpdated summarized transactions written to file ${outputFileLocation}.`);
}
