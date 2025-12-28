import * as readline from 'readline';

interface Transaction {
  date: string;
  title: string;
  category: string;
  amount: number;
}

interface CategoryMapEntry {
  category: string;
  transactions: Transaction[];
}

interface ChangeRequest {
  fromCategoryNumber: number;
  transactionIndex: number;
  toCategoryNumber: number;
  transactionTitle: string;
  fromCategoryName: string;
  toCategoryName: string;
}

function printCategoryMap(categoryMap: Map<number, CategoryMapEntry>) {
  console.log("\nReview the identified categories:\n");

  for (const [key, value] of categoryMap.entries()) {
    console.log(`[${key}] - ${value.category}`);

    let transactionIndex = 1;

    for (const transaction of value.transactions) {
      console.log(`    [${transactionIndex}] - ${transaction.title}`);
      transactionIndex += 1;
    }
  }
}

function rebuildCategoryMap(
  summarizedTransactions: {
    [category: string]: {
      category: string;
      amount: number;
      transactions: Transaction[];
    };
  },
  changes: ChangeRequest[]
): Map<number, CategoryMapEntry> {
  // Create a deep copy of summarizedTransactions
  const modifiedTransactions: {
    [category: string]: {
      category: string;
      amount: number;
      transactions: Transaction[];
    };
  } = {};

  for (const [category, data] of Object.entries(summarizedTransactions)) {
    modifiedTransactions[category] = {
      category: data.category,
      amount: data.amount,
      transactions: data.transactions.map(t => ({ ...t }))
    };
  }

  // Apply changes
  for (const change of changes) {
    const sourceCategory = change.fromCategoryName;
    const targetCategory = change.toCategoryName;

    // Find the transaction in the source category
    const sourceCategoryData = modifiedTransactions[sourceCategory];
    if (!sourceCategoryData) {
      continue;
    }

    // Find the transaction by title (assuming unique titles within a category)
    const transactionIndex = sourceCategoryData.transactions.findIndex(
      t => t.title === change.transactionTitle
    );

    if (transactionIndex === -1) {
      continue;
    }

    const transaction = sourceCategoryData.transactions[transactionIndex];

    // Remove from source category
    modifiedTransactions[sourceCategory].transactions.splice(transactionIndex, 1);

    // Update transaction's category
    transaction.category = targetCategory;

    // Add to target category (create if it doesn't exist)
    if (!modifiedTransactions[targetCategory]) {
      modifiedTransactions[targetCategory] = {
        category: targetCategory,
        amount: 0,
        transactions: []
      };
    }
    modifiedTransactions[targetCategory].transactions.push(transaction);
  }

  // Rebuild category map (only include categories with transactions)
  const categoryMap: Map<number, CategoryMapEntry> = new Map();
  let categoryNumber = 1;

  for (const [category, data] of Object.entries(modifiedTransactions)) {
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

export async function tuneCategories(summarizedTransactions: {
  [category: string]: {
      category: string;
      amount: number;
      transactions: Transaction[];
  };
}): Promise<void> {
  const categoryMap: Map<number, CategoryMapEntry> = new Map();

  let categoryNumber = 1;

  for (const [category, data] of Object.entries(summarizedTransactions)) {
    categoryMap.set(categoryNumber, {
      category,
      transactions: data.transactions
    });
    categoryNumber += 1;
  }

  printCategoryMap(categoryMap);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  const changes: ChangeRequest[] = [];

  while (true) {
    const input = await question("\nEnter category-transaction to change (e.g., '1-5') or press Enter to finish: ");

    if (input.trim() === '') {
      if (changes.length === 0) {
        rl.close();
        return;
      } else {
        // Rebuild category map with changes
        const newCategoryMap = rebuildCategoryMap(summarizedTransactions, changes);
        printCategoryMap(newCategoryMap);
        rl.close();
        return;
      }
    }

    // Parse input format "category-transaction"
    const match = input.trim().match(/^(\d+)-(\d+)$/);
    if (!match) {
      console.log("Invalid format. Please use 'category-transaction' format (e.g., '1-5')");
      continue;
    }

    const fromCategoryNumber = parseInt(match[1], 10);
    const transactionIndex = parseInt(match[2], 10);

    const categoryEntry = categoryMap.get(fromCategoryNumber);
    if (!categoryEntry) {
      console.log(`Category ${fromCategoryNumber} does not exist.`);
      continue;
    }

    if (transactionIndex < 1 || transactionIndex > categoryEntry.transactions.length) {
      console.log(`Transaction index ${transactionIndex} is out of range for category ${fromCategoryNumber}.`);
      continue;
    }

    const transaction = categoryEntry.transactions[transactionIndex - 1];
    const transactionTitle = transaction.title;
    const fromCategoryName = categoryEntry.category;

    // Ask for target category
    const targetCategoryInput = await question(`Move transaction "${transactionTitle}" to which category number? `);
    const toCategoryNumber = parseInt(targetCategoryInput.trim(), 10);

    if (isNaN(toCategoryNumber) || !categoryMap.has(toCategoryNumber)) {
      console.log(`Invalid category number ${toCategoryNumber}.`);
      continue;
    }

    if (fromCategoryNumber === toCategoryNumber) {
      console.log("Transaction is already in that category.");
      continue;
    }

    const toCategoryEntry = categoryMap.get(toCategoryNumber);
    if (!toCategoryEntry) {
      console.log(`Category ${toCategoryNumber} does not exist.`);
      continue;
    }

    const toCategoryName = toCategoryEntry.category;

    // Store the change
    changes.push({
      fromCategoryNumber,
      transactionIndex,
      toCategoryNumber,
      transactionTitle,
      fromCategoryName,
      toCategoryName
    });

    console.log("OK");
  }
}