import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, X, Repeat, Calendar, FileText, Tag, DollarSign, AlignLeft } from 'lucide-react';
import { Transaction } from '../types';

type Props = {
  onAdd: (transaction: Transaction) => void;
  onClose: () => void;
  editingTransaction?: Transaction | null;
};

export const TransactionForm: React.FC<Props> = ({ onAdd, onClose, editingTransaction }) => {
  const [formData, setFormData] = useState({
    name: editingTransaction?.name || '',
    category: editingTransaction?.category || '',
    amount: editingTransaction?.amount ? editingTransaction.amount.toString() : '',
    date: editingTransaction?.date || new Date().toISOString().split('T')[0],
    description: editingTransaction?.description || '',
    type: editingTransaction?.type || 'expense' as 'income' | 'expense',
    repeatMonths: '0',
  });

  // Format amount for display (with thousands separator)
  const [displayAmount, setDisplayAmount] = useState('');

  // Auto-focus ref
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (editingTransaction?.amount) {
      setDisplayAmount(editingTransaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    }
  }, [editingTransaction]);



  // Actually, to fully comply with "dot every 3 digits" while typing, it's complex without a library/mask.
  // I will implement a simpler version that accepts the raw input but formats it on blur or display.
  // Wait, let's try a controlled input that formats currency on the fly.

  const formatCurrencyInput = (value: string) => {
    // Remove everything that is not a digit
    const onlyDigits = value.replace(/\D/g, "");

    // Convert to float
    const amount = Number(onlyDigits) / 100;

    return amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyDigits = value.replace(/\D/g, "");

    if (onlyDigits === "") {
      setDisplayAmount("");
      setFormData({ ...formData, amount: "" });
      return;
    }

    const formatted = formatCurrencyInput(value);
    setDisplayAmount(formatted);
    setFormData({ ...formData, amount: (Number(onlyDigits) / 100).toString() });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseTransaction = {
      name: formData.name,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description,
      type: formData.type,
      id: editingTransaction?.id || crypto.randomUUID(),
    };

    // Create array of transactions based on repeat months
    const transactions = [];
    const repeatMonths = parseInt(formData.repeatMonths);

    // Add initial transaction
    transactions.push(baseTransaction);

    // Add repeated transactions
    for (let i = 1; i <= repeatMonths; i++) {
      const date = new Date(formData.date);
      date.setMonth(date.getMonth() + i);

      transactions.push({
        ...baseTransaction,
        id: crypto.randomUUID(),
        date: date.toISOString().split('T')[0],
      });
    }

    // Save all transactions
    transactions.forEach(transaction => onAdd(transaction));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg transform transition-all scale-100">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <FileText size={16} className="mr-2 text-blue-500" />
                Nome
              </label>
              <input
                ref={nameInputRef}
                type="text"
                required
                placeholder="Ex: Salário, Aluguel..."
                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-lg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Tag size={16} className="mr-2 text-indigo-500" />
                Categoria
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Moradia"
                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <AlignLeft size={16} className="mr-2 text-purple-500" />
                Tipo
              </label>
              <select
                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
              >
                <option value="income" className="bg-white dark:bg-gray-800">Receita</option>
                <option value="expense" className="bg-white dark:bg-gray-800">Despesa</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <DollarSign size={16} className="mr-2 text-green-500" />
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R$</span>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-2xl font-bold tracking-tight"
                  value={displayAmount}
                  onChange={handleCurrencyChange}
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Calendar size={16} className="mr-2 text-orange-500" />
                Data
              </label>
              <input
                type="date"
                required
                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descrição (Opcional)</label>
              <textarea
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="col-span-2 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
                <Repeat className="w-4 h-4 mr-2" />
                Repetir Lançamento
              </label>
              <input
                type="number"
                min="0"
                max="60"
                placeholder="0 (apenas este mês)"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={formData.repeatMonths}
                onChange={(e) => setFormData({ ...formData, repeatMonths: e.target.value })}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {parseInt(formData.repeatMonths) > 0
                  ? `Serão gerados ${parseInt(formData.repeatMonths) + 1} lançamentos mensais.`
                  : 'O lançamento será único.'}
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-14 flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-[1.02] transition-all duration-200"
          >
            <PlusCircle className="mr-2" size={24} />
            {parseInt(formData.repeatMonths) > 0
              ? `Confirmar ${parseInt(formData.repeatMonths) + 1} Lançamentos`
              : 'Salvar Transação'
            }
          </button>
        </form>
      </div>
    </div>
  );
};