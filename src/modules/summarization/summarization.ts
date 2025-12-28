import { categorizeTitle } from "~/utils/categorization.js";
import { sumFractions } from "~/utils/math.js";
import { CategorizedTransaction, SummarizedTransactions } from "~/utils/summarization.js";

type RowNumberedUncategorizedTransactions = {
  [rowNumber: string]: {
    date: string;
    title: string;
    amount: number;
  };
};

type RowNumberedCategorizedTransactions = {
  [rowNumber: string]: CategorizedTransaction;
};

type Summary = {
  totalAmount: number;
  summarizedTransactions: SummarizedTransactions;
};

function addCategory(inputRows: RowNumberedUncategorizedTransactions): RowNumberedCategorizedTransactions {
  const categorizedRows: RowNumberedCategorizedTransactions = {};

  for (const [rowNumber, rowData] of Object.entries(inputRows)) {
    categorizedRows[rowNumber] = { ...rowData, category: categorizeTitle(rowData.title) };
  }

  return categorizedRows;
}

function groupAndSumAmountByCategory(ungroupedTransactions: RowNumberedCategorizedTransactions): SummarizedTransactions {
  const groupedTransactions: SummarizedTransactions = {};

  for (const [_rowNumber, rowData] of Object.entries(ungroupedTransactions)) {
    const lastCategoryOccurrence = groupedTransactions[rowData.category] || { amount: 0, transactions: [] };
    const amount = sumFractions(lastCategoryOccurrence.amount, rowData.amount);
    const transactions = [...lastCategoryOccurrence.transactions, rowData];

    groupedTransactions[rowData.category] = { category: rowData.category, amount, transactions };
  }

  return groupedTransactions;
}

function calculateTotalAmount(groupedTransactions: SummarizedTransactions): number {
  let totalAmount = 0;

  for (const [_category, { amount: categoryAmount }] of Object.entries(groupedTransactions)) {
    totalAmount = sumFractions(totalAmount, categoryAmount);
  }

  return totalAmount;
}

export function summarizeTransactions(transactions: RowNumberedUncategorizedTransactions): Summary {
  const categorizedTransactions = addCategory(transactions);
  const groupedTransactions = groupAndSumAmountByCategory(categorizedTransactions);
  const totalAmount = calculateTotalAmount(groupedTransactions);

  return { totalAmount, summarizedTransactions: groupedTransactions };
}
