import React from 'react';
import { useState } from 'react';
import { Transaction, SortConfig } from '../types';
import { format, parseISO } from 'date-fns';
import { Trash2, Edit, ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '../utils/format';

type Props = {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
};

export const TransactionList: React.FC<Props> = ({ transactions, onDelete, onEdit }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: null
  });

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortConfig.field || !sortConfig.direction) return 0;

    if (sortConfig.field === 'date') {
      const dateA = parseISO(a.date).getTime();
      const dateB = parseISO(b.date).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortConfig.field === 'amount') {
      return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    return 0;
  });

  const handleSort = (field: 'amount' | 'date') => {
    setSortConfig(current => {
      if (current.field !== field) {
        return { field, direction: 'desc' };
      }
      if (current.direction === 'desc') {
        return { field, direction: 'asc' };
      }
      return { field: null, direction: null };
    });
  };

  const getSortIcon = (field: 'amount' | 'date') => {
    return (
      <ArrowUpDown
        size={14}
        className={`transform transition-transform ${
          sortConfig.field === field
            ? sortConfig.direction === 'asc'
              ? 'rotate-180'
              : ''
            : 'opacity-50'
        }`}
      />
    );
  };

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span>Data</span>
                  {getSortIcon('date')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span>Valor</span>
                  {getSortIcon('amount')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {format(parseISO(transaction.date), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {transaction.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {transaction.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.type === 'income'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};