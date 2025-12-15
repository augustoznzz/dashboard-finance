import React, { useState, useEffect } from 'react';
import { Sun, Moon, PlusCircle, FileDown } from 'lucide-react';
import { Transaction, FilterOptions } from './types';
import { formatCurrency } from './utils/format';
import { TransactionForm } from './components/TransactionForm';
import { ExportPdfForm } from './components/ExportPdfForm';
import { TransactionList } from './components/TransactionList';
import { Charts } from './components/Charts';
import { Filters } from './components/Filters';
import { fetchTransactions, saveTransaction, deleteTransaction, updateTransaction } from './lib/supabase';

function App() {
  const [showExportPdf, setShowExportPdf] = useState(false);
  const chartsRef = React.useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    name: null,
    category: null,
    minAmount: null,
    maxAmount: null,
    type: null,
  });
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions().then(setTransactions);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      const updated = await updateTransaction({
        ...transaction,
        id: editingTransaction.id
      });
      if (updated) {
        setTransactions(transactions.map((t) => 
          t.id === updated.id ? updated : t
        ));
      }
      setEditingTransaction(null);
    } else {
      const saved = await saveTransaction(transaction);
      if (saved) {
        // Fetch all transactions to ensure we have the latest data
        const updatedTransactions = await fetchTransactions();
        setTransactions(updatedTransactions);
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const success = await deleteTransaction(id);
    if (success) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filters.startDate && transaction.date < filters.startDate) return false;
    if (filters.endDate && transaction.date > filters.endDate) return false;
    if (filters.name && !transaction.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.category && !transaction.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
    if (filters.minAmount && transaction.amount < filters.minAmount) return false;
    if (filters.maxAmount && transaction.amount > filters.maxAmount) return false;
    if (filters.type && transaction.type !== filters.type) return false;
    return true;
  });

  const totalBalance = filteredTransactions.reduce(
    (acc, curr) => acc + (curr.type === 'income' ? curr.amount : -curr.amount),
    0
  );

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Financeiro</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="text-yellow-500" /> : <Moon className="text-gray-700" />}
            </button>
            <button
              onClick={() => setShowExportPdf(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileDown className="mr-2" size={20} />
              Exportar PDF
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="mr-2" size={20} />
              Nova Transação
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Saldo Total</h3>
            <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Total de Receitas</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Total de Despesas</h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>

        <Filters filters={filters} onFilterChange={setFilters} />
        
        <div ref={chartsRef}>
          <Charts transactions={filteredTransactions} />
        </div>

        <TransactionList
          transactions={filteredTransactions}
          onDelete={handleDeleteTransaction}
          onEdit={handleEditTransaction}
        />

        {showForm && (
          <TransactionForm
            onAdd={handleAddTransaction}
            editingTransaction={editingTransaction}
            onClose={() => {
              setShowForm(false);
              setEditingTransaction(null);
            }}
          />
        )}
        {showExportPdf && (
          <ExportPdfForm
            onClose={() => setShowExportPdf(false)}
            transactions={transactions}
            chartsRef={chartsRef}
          />
        )}
      </div>
    </div>
  );
}

export default App;