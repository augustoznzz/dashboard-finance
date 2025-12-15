import { Transaction } from '../types';

const STORAGE_KEY = 'financial_transactions';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getTransactionsFromStorage = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const saveTransactionsToStorage = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const transactions = getTransactionsFromStorage();
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const saveTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
  try {
    const transactions = getTransactionsFromStorage();
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
    };
    transactions.push(newTransaction);
    saveTransactionsToStorage(transactions);
    return newTransaction;
  } catch (error) {
    console.error('Error saving transaction:', error);
    return null;
  }
};

export const updateTransaction = async (transaction: Transaction): Promise<Transaction | null> => {
  try {
    const transactions = getTransactionsFromStorage();
    const index = transactions.findIndex(t => t.id === transaction.id);

    if (index === -1) {
      console.error('Transaction not found');
      return null;
    }

    transactions[index] = transaction;
    saveTransactionsToStorage(transactions);
    return transaction;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return null;
  }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    const transactions = getTransactionsFromStorage();
    const filtered = transactions.filter(t => t.id !== id);
    saveTransactionsToStorage(filtered);
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
};