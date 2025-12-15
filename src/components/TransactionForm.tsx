import React, { useState } from 'react';
import { PlusCircle, X, Repeat } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/format';

type Props = {
  onAdd: (transaction: Transaction) => void;
  onClose: () => void;
  editingTransaction?: Transaction | null;
};

export const TransactionForm: React.FC<Props> = ({ onAdd, onClose, editingTransaction }) => {
  const [formData, setFormData] = useState({
    name: editingTransaction?.name || '',
    category: editingTransaction?.category || '',
    amount: editingTransaction?.amount.toString() || '',
    date: editingTransaction?.date || '',
    description: editingTransaction?.description || '',
    type: editingTransaction?.type || 'expense' as 'income' | 'expense',
    repeatMonths: '0',
  });

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
    
    for (let i = 0; i <= repeatMonths; i++) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-white">
            {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
            <input
              type="number"
              required
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Repetir por (meses)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                min="0"
                max="60"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.repeatMonths}
                onChange={(e) => setFormData({ ...formData, repeatMonths: e.target.value })}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Repeat className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              0 = sem repetição, máximo 60 meses
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="mr-2" size={20} />
            {parseInt(formData.repeatMonths) > 0
              ? `Adicionar ${parseInt(formData.repeatMonths) + 1} Transações`
              : 'Adicionar Transação'
            }
          </button>
        </form>
      </div>
    </div>
  );
};