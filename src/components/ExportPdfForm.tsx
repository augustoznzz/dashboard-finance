import React, { useState } from 'react';
import { FileDown, X, Loader2 } from 'lucide-react';
import { Transaction } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/format';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Props = {
  onClose: () => void;
  transactions: Transaction[];
  chartsRef: React.RefObject<HTMLDivElement>;
};

export const ExportPdfForm: React.FC<Props> = ({ onClose, transactions, chartsRef }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione o intervalo de datas');
      return;
    }

    setLoading(true);

    try {
      const filteredTransactions = transactions.filter(t => {
        const transactionDate = t.date;
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      const totalBalance = filteredTransactions.reduce(
        (acc, curr) => acc + (curr.type === 'income' ? curr.amount : -curr.amount),
        0
      );

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();

      // Add title
      pdf.setFontSize(20);
      pdf.text('Relatório Financeiro', pageWidth / 2, 20, { align: 'center' });

      // Add date range
      pdf.setFontSize(12);
      pdf.text(
        `Período: ${format(parseISO(startDate), 'dd/MM/yyyy', { locale: ptBR })} - ${format(parseISO(endDate), 'dd/MM/yyyy', { locale: ptBR })}`,
        pageWidth / 2,
        30,
        { align: 'center' }
      );

      // Add balance
      pdf.setFontSize(14);
      pdf.text(`Saldo do Período: ${formatCurrency(totalBalance)}`, pageWidth / 2, 40, { align: 'center' });

      // Add charts
      if (chartsRef.current) {
        const canvas = await html2canvas(chartsRef.current);
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);

        // Add transactions table
        let yPos = imgHeight + 70;
        
        // Table header
        pdf.setFontSize(12);
        pdf.text('Data', 20, yPos);
        pdf.text('Nome', 45, yPos);
        pdf.text('Categoria', 90, yPos);
        pdf.text('Tipo', 135, yPos);
        pdf.text('Valor', 170, yPos);
        yPos += 10;

        // Table content
        pdf.setFontSize(10);
        filteredTransactions.forEach((transaction) => {
          // Add new page if needed
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }

          pdf.text(format(parseISO(transaction.date), 'dd/MM/yyyy'), 20, yPos);
          pdf.text(transaction.name.substring(0, 20), 45, yPos);
          pdf.text(transaction.category.substring(0, 20), 90, yPos);
          pdf.text(transaction.type === 'income' ? 'Receita' : 'Despesa', 135, yPos);
          pdf.text(formatCurrency(transaction.amount), 170, yPos);
          yPos += 7;
        });
      }

      // Save the PDF
      pdf.save(`relatorio-financeiro-${startDate}-${endDate}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar o PDF. Por favor, tente novamente.');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-white">Exportar Relatório PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Data Inicial
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Data Final
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            onClick={generatePDF}
            disabled={loading || !startDate || !endDate}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              <FileDown className="mr-2" size={20} />
            )}
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
};