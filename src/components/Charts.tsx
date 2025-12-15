import React from 'react';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend,
  ResponsiveContainer
} from 'recharts';
import { Transaction } from '../types';
import { format, parseISO, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency, formatNumber } from '../utils/format';

// Create a color map to ensure consistent colors per category
const categoryColors = new Map<string, string>();
const COLORS = {
  primary: [
    '#FF6B6B',   // Coral Red
    '#4ECDC4',   // Turquoise
    '#45B7D1',   // Sky Blue
    '#96CEB4',   // Sage Green
    '#9B5DE5',   // Purple
    '#F15BB5',   // Pink
    '#00BBF9',   // Bright Blue
    '#00F5D4',   // Mint
    '#FEE440',   // Yellow
    '#F29E4C',   // Orange
    '#E76F51',   // Burnt Orange
    '#845EC2',   // Deep Purple
    '#D65DB1',   // Magenta
    '#FF9671',   // Peach
    '#FFC75F',   // Golden Yellow
    '#2C73D2',   // Royal Blue
    '#008F7A',   // Deep Teal
    '#C34A36',   // Rusty Red
    '#FF8066',   // Salmon
    '#4B4453'    // Dark Gray
  ]
};

const calculatePercentage = (value: number, total: number): string => {
  return `${((value / total) * 100).toFixed(1)}%`;
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

  const sortedExpenses = Object.entries(expensesByCategory)
    .sort((a, b) => b[1].total - a[1].total);

  const totalExpenses = sortedExpenses.reduce((sum, [_, data]) => sum + data.total, 0);

  const pieData = sortedExpenses.map(([name, data]) => ({
    name,
    value: data.total,
    color: data.color,
    percentage: calculatePercentage(data.total, totalExpenses)
  }));

  // Prepare data for line chart
  const lineData = Object.values(transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, curr, _, arr) => {
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
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={400}>
          <PieChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={{ stroke: '#666666', strokeWidth: 0.5 }}
              label={({ name, value, percentage }) => {
                return [
                  `${name.substring(0, 12)}${name.length > 12 ? '...' : ''}`,
                  `${formatCurrency(value)}`,
                  `(${percentage})`
                ].join('\n');
              }}
              outerRadius={120}
              innerRadius={80}
              dataKey="value"
              style={{ fontSize: '16px' }}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string, entry: any) => [
                `${formatCurrency(value)} (${entry.payload.percentage})`,
                name
              ]}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                fontSize: '14px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Receitas vs Despesas</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={Object.values(barData)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="dark:opacity-10" />
            <XAxis 
              dataKey="month" 
              style={{ fontSize: '12px' }}
              className="dark:text-gray-300"
            />
            <YAxis 
              style={{ fontSize: '12px' }}
              className="dark:text-gray-300"
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                fontSize: '14px'
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="#22c55e" name="Receitas" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Evolução do Saldo</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="dark:opacity-10" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(parse(value, 'MM/yyyy', new Date()), 'MMM/yyyy', { locale: ptBR })}
              style={{ fontSize: '12px' }}
              className="dark:text-gray-300"
            />
            <YAxis 
              style={{ fontSize: '12px' }}
              className="dark:text-gray-300"
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                fontSize: '14px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', strokeWidth: 1, r: 4 }}
              activeDot={{ r: 8 }}
              name="Saldo"
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: '#22c55e', strokeWidth: 1, r: 4 }}
              name="Receitas"
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 1, r: 4 }}
              name="Despesas"
            />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};