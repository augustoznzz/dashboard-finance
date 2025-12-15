import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { FilterOptions } from '../types';

type Props = {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
};

export const Filters: React.FC<Props> = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(true);

  const clearFilters = () => {
    onFilterChange({
      startDate: null,
      endDate: null,
      name: null,
      category: null,
      minAmount: null,
      maxAmount: null,
      type: null,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== null && value !== '');

  const formatNumber = (val: number | null): string => {
    if (val === null || val === undefined) return '';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseNumber = (val: string): number | null => {
    const raw = val.replace(/\./g, '');
    if (!raw) return null;
    return Number(raw);
  };

  const handleAmountChange = (key: 'minAmount' | 'maxAmount', value: string) => {
    const numericValue = parseNumber(value);
    onFilterChange({ ...filters, [key]: numericValue });
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 mb-10 transition-all duration-300 overflow-hidden">
      <div
        className="p-4 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
          <Filter size={20} className="text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold">Filtros de Busca</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full">
              Ativos
            </span>
          )}
        </div>
        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="p-6 space-y-6">
          {/* Row 1: Common text/date filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Inicial</label>
              <input
                type="date"
                className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all p-2.5 outline-none"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value || null })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Final</label>
              <input
                type="date"
                className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all p-2.5 outline-none"
                value={filters.endDate || ''}
                onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value || null })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pl-9 p-2.5 outline-none"
                  value={filters.name || ''}
                  onChange={(e) => onFilterChange({ ...filters, name: e.target.value || null })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoria</label>
              <input
                type="text"
                placeholder="Ex: Alimentação"
                className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all p-2.5 outline-none"
                value={filters.category || ''}
                onChange={(e) => onFilterChange({ ...filters, category: e.target.value || null })}
              />
            </div>
          </div>

          {/* Row 2: Amount and Type */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Amount Filter - Increased Width */}
            <div className="space-y-1.5 md:col-span-5 lg:col-span-4">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor (Min - Max)</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Min"
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all p-2.5 outline-none"
                  value={formatNumber(filters.minAmount)}
                  onChange={(e) => handleAmountChange('minAmount', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Max"
                  className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all p-2.5 outline-none"
                  value={formatNumber(filters.maxAmount)}
                  onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-3 lg:col-span-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</label>
              <select
                className="w-full rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all p-2.5 outline-none cursor-pointer"
                value={filters.type || ''}
                onChange={(e) => onFilterChange({ ...filters, type: e.target.value ? e.target.value as 'income' | 'expense' : null })}
              >
                <option value="" className="bg-white dark:bg-gray-800">Todos</option>
                <option value="income" className="bg-white dark:bg-gray-800">Receita</option>
                <option value="expense" className="bg-white dark:bg-gray-800">Despesa</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end pt-2">
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-lg transition-colors duration-200"
              >
                <X size={16} className="mr-2" />
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};