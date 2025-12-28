import { sumFractions } from '~/utils/math.js';
import { ReadlineInterface } from '~/utils/readline.js';
import { CategorizedTransaction, SummarizedTransactions } from '~/utils/summarization.js';
import { updateCategorizedTitles } from '~/utils/categorization.js';

interface CategoryMapEntry {
  category: string;
  transactions: CategorizedTransaction[];
}

interface ChangeRequest {
  fromCategoryNumber: number;
  transactionNumber: number;
  toCategoryNumber: number | null;
  transactionTitle: string;
  fromCategoryName: string;
  toCategoryName: string;
  isNewCategory: boolean;
}

function createCategoryMap(summarizedTransactions: SummarizedTransactions) {
  const categoryMap: Map<number, CategoryMapEntry> = new Map();

  let categoryNumber = 1;

  for (const [category, data] of Object.entries(summarizedTransactions)) {
    categoryMap.set(categoryNumber, {
      category,
      transactions: data.transactions
    });
    categoryNumber += 1;
  }
  return categoryMap;
}

function printCategoryMap(categoryMap: Map<number, CategoryMapEntry>) {
  console.log("\nReview the identified categories:\n");

  for (const [key, value] of categoryMap.entries()) {
    console.log(`[${key}] - ${value.category}`);

    let transactionNumber = 1;

    for (const transaction of value.transactions) {
      console.log(`    [${transactionNumber}] - ${transaction.title}`);
      transactionNumber += 1;
    }
  }
}

async function askForCategoryChanges(): Promise<string> {
  const readlineInterface = new ReadlineInterface();

  const rawInput = await readlineInterface.openQuestion("\nEnter category-transaction to change (e.g., '1-5') or press Enter to finish: ");
  readlineInterface.closeQuestion();

  return rawInput.trim();
}

function rebuildCategoryMap(
  summarizedTransactions: {
    [category: string]: {
      category: string;
      amount: number;
      transactions: CategorizedTransaction[];
    };
  },
  changes: ChangeRequest[]
): Map<number, CategoryMapEntry> {
  const modifiedTransactions = rebuildSummarizedTransactions(summarizedTransactions, changes);

  const categoryMap: Map<number, CategoryMapEntry> = new Map();
  let categoryNumber = 1;

  for (const [_category, data] of Object.entries(modifiedTransactions)) {
    if (data.transactions.length > 0) {
      categoryMap.set(categoryNumber, {
        category: data.category,
        transactions: data.transactions
      });
      categoryNumber += 1;
    }
  }

  return categoryMap;
}

function deepCopy(transactions: SummarizedTransactions) {
  const copy: SummarizedTransactions = {};

  for (const [category, data] of Object.entries(transactions)) {
    copy[category] = {
      category: data.category,
      amount: data.amount,
      transactions: data.transactions.map(t => ({ ...t }))
    };
  }
  
  return copy;
}

function sumTransactionAmounts(transactions: CategorizedTransaction[]): number {
  let amount = 0;

  for (const transaction of transactions) {
    amount = sumFractions(amount, transaction.amount);
  }

  return amount;
}

function recalculateAmounts(modifiedTransactions: SummarizedTransactions) {
  const result: SummarizedTransactions = {};

  for (const [category, data] of Object.entries(modifiedTransactions)) {
    if (data.transactions.length > 0) {
      result[category] = {
        category: data.category,
        amount: sumTransactionAmounts(data.transactions),
        transactions: data.transactions
      };
    }
  }

  return result;
}

function rebuildSummarizedTransactions(summarizedTransactions: SummarizedTransactions, changes: ChangeRequest[]): SummarizedTransactions {
  const modifiedTransactions = deepCopy(summarizedTransactions);

  for (const change of changes) {
    const sourceCategory = change.fromCategoryName;
    const sourceCategoryData = modifiedTransactions[sourceCategory];
    const targetCategory = change.toCategoryName;
    const transactionNumber = sourceCategoryData?.transactions.findIndex(t => t.title === change.transactionTitle);

    if (!sourceCategoryData || transactionNumber === -1) {
      continue;
    }

    const transaction = sourceCategoryData.transactions[transactionNumber];
    modifiedTransactions[sourceCategory].transactions.splice(transactionNumber, 1);
    transaction.category = targetCategory;

    if (!modifiedTransactions[targetCategory]) {
      modifiedTransactions[targetCategory] = {
        category: targetCategory,
        amount: 0,
        transactions: []
      };
    }

    modifiedTransactions[targetCategory].transactions.push(transaction);
  }

  return recalculateAmounts(modifiedTransactions);
}

function validateInputAndGetSourceCategoryTransaction(input: string):
  { isValid: false; fromCategoryNumber?: undefined; transactionNumber?: undefined } |
  { isValid: true; fromCategoryNumber: number; transactionNumber: number }
{
  const match = input.trim().match(/^(\d+)-(\d+)$/);

  if (!match) {
    console.log("Invalid format. Please use 'category-transaction' format (e.g., '1-5')");
    return { isValid: false };
  }

  const fromCategoryNumber = parseInt(match[1], 10);
  const transactionNumber = parseInt(match[2], 10);

  return { isValid: true, fromCategoryNumber, transactionNumber };
}

function doesCategoryExist(categoryMap: Map<number, CategoryMapEntry>, categoryNumber: number) {
  if (!categoryMap.get(categoryNumber)) {
    console.log(`Category ${categoryNumber} does not exist.`);
    return false;
  }

  return true;
}

function areFromCategoryAndTransactionNumbersValid({
  fromCategoryNumber,
  transactionNumber,
  categoryMap
}: {
  fromCategoryNumber: number;
  transactionNumber: number;
  categoryMap: Map<number, CategoryMapEntry>
}) {
  const categoryEntry = categoryMap.get(fromCategoryNumber)!;

  if (!doesCategoryExist(categoryMap, fromCategoryNumber)) {
    return false;
  }

  if (transactionNumber < 1 || transactionNumber > categoryEntry.transactions.length) {
    console.log(`Transaction number ${transactionNumber} is out of range for category ${fromCategoryNumber}.`);
    return false;
  }

  return true;
}

async function getTargetCategory(
  transactionTitle: string,
  categoryMap: Map<number, CategoryMapEntry>
): Promise<{ isNumber: true; categoryNumber: number } | { isNumber: false; categoryName: string } | null> {
  const readlineInterface = new ReadlineInterface();

  const targetCategoryInput = await readlineInterface.openQuestion(
    `Move transaction "${transactionTitle}" to which category number (or type a new category name)? `
  );
  readlineInterface.closeQuestion();
  
  const trimmedInput = targetCategoryInput.trim();
  const categoryNumber = parseInt(trimmedInput, 10);
  
  // If it's a valid number
  if (!isNaN(categoryNumber)) {
    // Check if it exists in the map
    if (categoryMap.has(categoryNumber)) {
      return { isNumber: true, categoryNumber };
    } else {
      // Number doesn't exist - show error and return null to retry
      console.log(`Category number ${categoryNumber} does not exist. Please enter a valid category number or type a new category name.`);
      return null;
    }
  }
  
  // Not a number - treat it as a new category name
  return { isNumber: false, categoryName: trimmedInput };
}

function isToCategoryValid({
  toCategoryNumber,
  toCategoryName,
  fromCategoryNumber,
  categoryMap,
  isNewCategory
}: {
  toCategoryNumber: number | null;
  toCategoryName: string;
  fromCategoryNumber: number;
  categoryMap: Map<number, CategoryMapEntry>;
  isNewCategory: boolean;
}): boolean {
  if (isNewCategory) {
    // For new categories, check if the name is not empty
    if (!toCategoryName || toCategoryName.trim() === "") {
      console.log("Category name cannot be empty.");
      return false;
    }
    
    // Check if the new category name matches the current category
    const fromCategoryEntry = categoryMap.get(fromCategoryNumber);
    if (fromCategoryEntry && fromCategoryEntry.category === toCategoryName.trim()) {
      console.log("Transaction is already in that category.");
      return false;
    }
    
    return true;
  } else {
    // For existing categories, use the old validation logic
    if (toCategoryNumber === null || !categoryMap.has(toCategoryNumber)) {
      console.log(`Invalid category number ${toCategoryNumber}.`);
      return false;
    }

    if (fromCategoryNumber === toCategoryNumber) {
      console.log("Transaction is already in that category.");
      return false;
    }

    if (!doesCategoryExist(categoryMap, toCategoryNumber)) {
      return false;
    }

    return true;
  }
}

export async function tuneCategories(summarizedTransactions: SummarizedTransactions): Promise<SummarizedTransactions | null> {
  const categoryMap: Map<number, CategoryMapEntry> = createCategoryMap(summarizedTransactions);
  printCategoryMap(categoryMap);

  const changes: ChangeRequest[] = [];

  while (true) {
    const input = await askForCategoryChanges();

    if (input.trim() === "" && changes.length === 0) {
      return null;
    }
    if (input.trim() === "" && changes.length > 0) {
      const newCategoryMap = rebuildCategoryMap(summarizedTransactions, changes);
      printCategoryMap(newCategoryMap);

      const titleUpdates = changes.map(change => ({
        title: change.transactionTitle,
        category: change.toCategoryName
      }));
      updateCategorizedTitles(titleUpdates);

      return rebuildSummarizedTransactions(summarizedTransactions, changes);
    }

    const { isValid, fromCategoryNumber, transactionNumber } = validateInputAndGetSourceCategoryTransaction(input);

    if (!isValid || !areFromCategoryAndTransactionNumbersValid({ fromCategoryNumber, transactionNumber, categoryMap })) {
      continue;
    }

    const categoryEntry = categoryMap.get(fromCategoryNumber)!;
    const transaction = categoryEntry.transactions[transactionNumber - 1];
    const transactionTitle = transaction.title;
    const fromCategoryName = categoryEntry.category;

    const targetCategory = await getTargetCategory(transactionTitle, categoryMap);

    // If null, it means there was an error (invalid category number), retry
    if (targetCategory === null) {
      continue;
    }

    let toCategoryNumber: number | null;
    let toCategoryName: string;
    let isNewCategory: boolean;

    if (targetCategory.isNumber) {
      toCategoryNumber = targetCategory.categoryNumber;
      toCategoryName = categoryMap.get(toCategoryNumber)!.category;
      isNewCategory = false;
    } else {
      toCategoryNumber = null;
      toCategoryName = targetCategory.categoryName.trim();
      isNewCategory = true;
    }

    if (!isToCategoryValid({ toCategoryNumber, toCategoryName, fromCategoryNumber, categoryMap, isNewCategory })) {
      continue;
    }

    changes.push({
      fromCategoryNumber,
      transactionNumber,
      toCategoryNumber,
      transactionTitle,
      fromCategoryName,
      toCategoryName,
      isNewCategory
    });

    if (isNewCategory) {
      console.log(`OK - New category "${toCategoryName}" will be created.`);
    } else {
      console.log("OK");
    }
  }
}
