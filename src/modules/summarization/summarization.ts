import { categorizeTitle } from "~/utils/categorization.js";

function addCategory(inputRows: { [rowNumber: string]: { date: string; title: string; amount: number; }; }): {
  [rowNumber: string]: {
      date: string;
      title: string;
      category: string;
      amount: number;
  };
} {
  const categorizedRows: { [rowNumber: string]: { date: string; title: string; category: string; amount: number; } } = {};

  for (const [rowNumber, rowData] of Object.entries(inputRows)) {
    categorizedRows[rowNumber] = { ...rowData, category: categorizeTitle(rowData.title) };
  }

  return categorizedRows;
}

function groupAndSumAmountByCategory(
  ungroupedTransactions: {
    [rowNumber: string]: {
        date: string;
        title: string;
        category: string;
        amount: number;
    };
}
): {
  [category: string]: {
      category: string;
      amount: number;
      transactions: {
          date: string;
          title: string;
          category: string;
          amount: number;
      }[];
  };
} {
  const groupedTransactions: { [category: string]: { category: string; amount: number; transactions: { date: string; title: string; category: string; amount: number; }[]; }; } = {};

  for (const [_rowNumber, rowData] of Object.entries(ungroupedTransactions)) {
    const lastCategoryOccurrence = groupedTransactions[rowData.category] || { amount: 0, transactions: [] };
    const amount = Number((((lastCategoryOccurrence.amount * 100) + (rowData.amount * 100)) / 100).toFixed(2));
    const transactions = [...lastCategoryOccurrence.transactions, rowData];

    groupedTransactions[rowData.category] = { category: rowData.category, amount, transactions };
  }

  return groupedTransactions;
}

export function summarizeTransactions(
  transactions: {
    [rowNumber: string]: {
        date: string;
        title: string;
        amount: number;
    };
}): { totalAmount: number; summarizedTransactions: { [category: string]: { category: string; amount: number; transactions: { date: string; title: string; category: string; amount: number; }[]; }; } } {
  const categorizedTransactions = addCategory(transactions);
  const groupedTransactions = groupAndSumAmountByCategory(categorizedTransactions);
  const totalAmount = calculateTotalAmount(groupedTransactions);

  return { totalAmount, summarizedTransactions: groupedTransactions };
}

function calculateTotalAmount(groupedTransactions: {
  [category: string]: {
    category: string; amount: number; transactions: {
      date: string;
      title: string;
      category: string;
      amount: number;
    }[];
  };
}): number {
  let totalAmount = 0;

  for (const [_category, { amount: categoryAmount }] of Object.entries(groupedTransactions)) {
    totalAmount = Number((((totalAmount * 100) + (categoryAmount * 100)) / 100).toFixed(2));
  }

  return totalAmount;
}

