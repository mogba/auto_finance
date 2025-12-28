export type CategorizedTransaction = {
  date: string;
  title: string;
  category: string;
  amount: number;
};

export type SummarizedTransactions = {
  [category: string]: {
    category: string;
    amount: number;
    transactions: CategorizedTransaction[];
  };
};
