export type Transaction = {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
};

export type FilterOptions = {
  startDate: string | null;
  endDate: string | null;
  name: string | null;
  category: string | null;
  minAmount: number | null;
  maxAmount: number | null;
  type: 'income' | 'expense' | null;
};

export type SortField = 'amount' | 'date' | null;
export type SortDirection = 'asc' | 'desc' | null;

export type SortConfig = {
  field: SortField;
  direction: SortDirection;
};