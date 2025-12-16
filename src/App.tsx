import React, { useState, useEffect } from 'react';
import { Sun, Moon, PlusCircle, FileDown, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
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
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Dashboard Financeiro
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas finanças com elegância</p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="text-yellow-500" size={20} /> : <Moon className="text-gray-700" size={20} />}
            </button>
            <button
              onClick={() => setShowExportPdf(true)}
              className="flex items-center px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 font-medium"
            >
              <FileDown className="mr-2" size={20} />
              Exportar
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200 font-medium"
            >
              <PlusCircle className="mr-2" size={20} />
              Nova Transação
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                <Wallet size={24} />
              </div>
              <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${totalBalance >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {totalBalance >= 0 ? '+ Positivo' : '- Negativo'}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Saldo Total</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalBalance)}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600 dark:text-green-400">
                <TrendingUp size={24} />
              </div>
              <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Receitas
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total de Receitas</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-600 dark:text-red-400">
                <TrendingDown size={24} />
              </div>
              <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Despesas
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total de Despesas</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>

        <Filters filters={filters} onFilterChange={setFilters} availableCategories={Array.from(new Set(transactions.map(t => t.category)))} />

        <div ref={chartsRef} className="mb-10">
          <Charts transactions={filteredTransactions} />
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transações Recentes</h2>
          </div>
          <TransactionList
            transactions={filteredTransactions}
            onDelete={handleDeleteTransaction}
            onEdit={handleEditTransaction}
          />
        </div>

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