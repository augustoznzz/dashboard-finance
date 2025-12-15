import React from 'react';
import {
  PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend,
  ResponsiveContainer
} from 'recharts';
import { Transaction } from '../types';
import { format, parseISO, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/format';

// Modern, vibrant color palette
const COLORS = {
  primary: [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#6366F1', // Indigo Light
    '#84CC16', // Lime
  ]
};

const calculatePercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 dark:text-gray-300 capitalize">{entry.name}:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

type Props = {
  transactions: Transaction[];
};

export const Charts: React.FC<Props> = ({ transactions }) => {
  // Prepare data for pie chart
  const expensesByCategory = Object.entries(transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: Record<string, { total: number, color: string }>, curr) => {
      if (!acc[curr.category]) {
        const colorIndex = Object.keys(acc).length;
        acc[curr.category] = {
          total: 0,
          color: COLORS.primary[colorIndex % COLORS.primary.length]
        };
      }
      acc[curr.category].total += curr.amount;
      return acc;
    }, {}));

  const sortedExpenses = expensesByCategory
    .sort((a, b) => b[1].total - a[1].total);

  const totalExpenses = sortedExpenses.reduce((sum, item) => sum + item[1].total, 0);

  const pieData = sortedExpenses.map(([name, data]) => ({
    name,
    value: data.total,
    color: data.color,
    percentage: calculatePercentage(data.total, totalExpenses)
  }));

  // Prepare data for line chart
  const lineData = Object.values(transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, curr) => {
      const date = format(parseISO(curr.date), 'MM/yyyy');
      const amount = curr.type === 'income' ? curr.amount : -curr.amount;
      if (!acc[date]) {
        const lastDate = Object.keys(acc).sort().pop();
        const lastBalance = lastDate ? acc[lastDate].balance : 0;
        acc[date] = {
          date,
          balance: lastBalance,
          income: 0,
          expense: 0
        };
      }
      acc[date].balance += amount;
      if (curr.type === 'income') {
        acc[date].income += curr.amount;
      } else {
        acc[date].expense += curr.amount;
      }
      return acc;
    }, {} as Record<string, { date: string; balance: number; income: number; expense: number }>));

  // Prepare data for bar chart
  const barData = transactions.reduce((acc, curr) => {
    const month = format(parseISO(curr.date), 'MMM/yyyy', { locale: ptBR });
    if (!acc[month]) {
      acc[month] = { month, income: 0, expense: 0 };
    }
    if (curr.type === 'income') {
      acc[month].income += curr.amount;
    } else {
      acc[month].expense += curr.amount;
    }
    return acc;
  }, {} as Record<string, { month: string; income: number; expense: number }>);

  return (
    <div className="space-y-8 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-shadow">
          <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
            Despesas por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            {pieData.length > 0 ? (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-gray-600 dark:text-gray-300 ml-1">{value}</span>
                  )}
                />
              </PieChart>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                Nehuma despesa registrada
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-shadow">
          <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
            Receitas vs Despesas
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={Object.values(barData)} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-10" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `R$ ${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(229, 231, 235, 0.2)' }} />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              <Bar dataKey="income" fill="#10B981" name="Receitas" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar dataKey="expense" fill="#EF4444" name="Despesas" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-shadow">
        <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
          Evolução Financeira
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={lineData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-10" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => format(parse(value, 'MM/yyyy', new Date()), 'MMM', { locale: ptBR })}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `R$ ${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" align="right" iconType="circle" />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#4F46E5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorBalance)"
              name="Saldo"
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIncome)"
              name="Receitas"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpense)"
              name="Despesas"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};