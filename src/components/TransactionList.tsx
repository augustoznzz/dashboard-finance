import React, { useState } from 'react';
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
        className={`transform transition-transform ${sortConfig.field === field
          ? sortConfig.direction === 'asc'
            ? 'rotate-180 text-blue-600 dark:text-blue-400'
            : 'text-blue-600 dark:text-blue-400'
          : 'opacity-30 group-hover:opacity-100'
          }`}
      />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50/50 dark:bg-gray-800/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider group cursor-pointer" onClick={() => handleSort('date')}>
              <div className="flex items-center space-x-2">
                <span>Data</span>
                {getSortIcon('date')}
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoria</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider group cursor-pointer" onClick={() => handleSort('amount')}>
              <div className="flex items-center space-x-2">
                <span>Valor</span>
                {getSortIcon('amount')}
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700 backdrop-blur-xl">
          {sortedTransactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors duration-150 group">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {format(parseISO(transaction.date), 'dd/MM/yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {transaction.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  {transaction.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                <span className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {formatCurrency(transaction.amount)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'income'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}>
                  {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-1 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                    title="Deletar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};