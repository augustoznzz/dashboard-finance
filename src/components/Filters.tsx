import React from 'react';
import { FilterOptions } from '../types';

type Props = {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
};

export const Filters: React.FC<Props> = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data Inicial</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filters.startDate || ''}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value || null })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data Final</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filters.endDate || ''}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value || null })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filters.name || ''}
            onChange={(e) => onFilterChange({ ...filters, name: e.target.value || null })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filters.category || ''}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value || null })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Mínimo</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filters.minAmount || ''}
            onChange={(e) => onFilterChange({ ...filters, minAmount: e.target.value ? Number(e.target.value) : null })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Máximo</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filters.maxAmount || ''}
            onChange={(e) => onFilterChange({ ...filters, maxAmount: e.target.value ? Number(e.target.value) : null })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filters.type || ''}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value ? e.target.value as 'income' | 'expense' : null })}
          >
            <option value="">Todos</option>
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
          </select>
        </div>
      </div>
    </div>
  );
};