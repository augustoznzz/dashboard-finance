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

      const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

      const totalExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

      const totalBalance = totalIncome - totalExpenses;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // -- Helper Functions --
      const addHeader = () => {
        // Blue Header Background
        pdf.setFillColor(63, 81, 181); // Indigo 500
        pdf.rect(0, 0, pageWidth, 40, 'F');

        // Title
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Relatório Financeiro', 20, 20);

        // Date Range
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Período: ${format(parseISO(startDate), 'dd MMM yyyy', { locale: ptBR })} - ${format(parseISO(endDate), 'dd MMM yyyy', { locale: ptBR })}`,
          20,
          30
        );

        // Logo/Brand (Optional placeholder)
        pdf.setFontSize(10);
        pdf.text('Dashboard Finance', pageWidth - 20, 20, { align: 'right' });
      };

      const addFooter = (pageNumber: number) => {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(8);
        pdf.text(`Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, pageHeight - 6);
        pdf.text(`Página ${pageNumber}`, pageWidth - 20, pageHeight - 6, { align: 'right' });
      };

      let currentPage = 1;
      addHeader();
      addFooter(currentPage);

      let yPos = 50;

      // -- Summary Cards --
      const cardWidth = (pageWidth - 40 - 10) / 3; // 40 margins, 10 gap (5*2 gaps)
      const cardHeight = 25;

      // Income Card
      pdf.setFillColor(220, 252, 231); // Green 100
      pdf.setDrawColor(22, 163, 74); // Green 600
      pdf.roundedRect(20, yPos, cardWidth, cardHeight, 3, 3, 'FD');

      pdf.setTextColor(22, 101, 52); // Green 800
      pdf.setFontSize(10);
      pdf.text('Receitas', 25, yPos + 8);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(totalIncome), 25, yPos + 18);

      // Expenses Card
      pdf.setFillColor(254, 226, 226); // Red 100
      pdf.setDrawColor(220, 38, 38); // Red 600
      pdf.roundedRect(20 + cardWidth + 5, yPos, cardWidth, cardHeight, 3, 3, 'FD');

      pdf.setTextColor(153, 27, 27); // Red 800
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Despesas', 25 + cardWidth + 5, yPos + 8);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(totalExpenses), 25 + cardWidth + 5, yPos + 18);

      // Balance Card
      // Actually sticking to blue for Balance distinctiveness
      pdf.setFillColor(219, 234, 254); // Blue 100
      pdf.setDrawColor(37, 99, 235); // Blue 600
      pdf.roundedRect(20 + (cardWidth + 5) * 2, yPos, cardWidth, cardHeight, 3, 3, 'FD');

      pdf.setTextColor(30, 64, 175); // Blue 800
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Saldo', 25 + (cardWidth + 5) * 2, yPos + 8);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(totalBalance), 25 + (cardWidth + 5) * 2, yPos + 18);

      yPos += 35;

      // -- Charts --
      if (chartsRef.current) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Análise Gráfica', 20, yPos);
        yPos += 5;

        const canvas = await html2canvas(chartsRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if image fits
        if (yPos + imgHeight > pageHeight - 20) {
          pdf.addPage();
          currentPage++;
          addHeader();
          addFooter(currentPage);
          yPos = 50;
        }

        pdf.addImage(imgData, 'PNG', 20, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15;
      }

      // -- Transactions Table --
      // Check for new page before starting table
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        currentPage++;
        addHeader();
        addFooter(currentPage);
        yPos = 50;
      }

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detalhamento das Transações', 20, yPos);
      yPos += 8;

      // Table Config
      const colWidths = [30, 60, 40, 30, 30]; // Total 190
      const headers = ['Data', 'Nome', 'Categoria', 'Tipo', 'Valor'];
      const startX = 20;

      // Table Header
      pdf.setFillColor(243, 244, 246); // Gray 100
      pdf.rect(startX, yPos, pageWidth - 40, 10, 'F');

      pdf.setTextColor(55, 65, 81); // Gray 700
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');

      let currentX = startX;
      headers.forEach((header, i) => {
        const align = i === 4 ? 'right' : 'left';
        const x = i === 4 ? currentX + colWidths[i] - 2 : currentX + 2;
        pdf.text(header, x, yPos + 7, { align });
        currentX += colWidths[i];
      });

      yPos += 10;

      // Table Rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      filteredTransactions.forEach((t, index) => {
        if (yPos > pageHeight - 25) {
          pdf.addPage();
          currentPage++;
          addHeader();
          addFooter(currentPage);
          yPos = 50;

          // Reprint Table Header on new page? Optional, but good for readability
          pdf.setFillColor(243, 244, 246);
          pdf.rect(startX, yPos, pageWidth - 40, 10, 'F');
          pdf.setTextColor(55, 65, 81);
          pdf.setFont('helvetica', 'bold');
          let cx = startX;
          headers.forEach((h, i) => {
            const align = i === 4 ? 'right' : 'left';
            const x = i === 4 ? cx + colWidths[i] - 2 : cx + 2;
            pdf.text(h, x, yPos + 7, { align });
            cx += colWidths[i];
          });
          pdf.setFont('helvetica', 'normal');
          yPos += 10;
        }

        // Zebra striping
        if (index % 2 === 0) {
          pdf.setFillColor(255, 255, 255);
        } else {
          pdf.setFillColor(249, 250, 251); // Gray 50
        }
        pdf.rect(startX, yPos, pageWidth - 40, 8, 'F');

        pdf.setTextColor(75, 85, 99); // Gray 600

        currentX = startX;

        // Data content
        // Date
        pdf.text(format(parseISO(t.date), 'dd/MM/yyyy'), currentX + 2, yPos + 5.5);
        currentX += colWidths[0];

        // Name (Truncate if too long)
        const name = t.name.length > 25 ? t.name.substring(0, 22) + '...' : t.name;
        pdf.text(name, currentX + 2, yPos + 5.5);
        currentX += colWidths[1];

        // Category
        const category = t.category.length > 18 ? t.category.substring(0, 15) + '...' : t.category;
        pdf.text(category, currentX + 2, yPos + 5.5);
        currentX += colWidths[2];

        // Type
        const typeLabel = t.type === 'income' ? 'Receita' : 'Despesa';
        pdf.setTextColor(t.type === 'income' ? 22 : 220, t.type === 'income' ? 163 : 38, t.type === 'income' ? 74 : 38); // Green or Red
        pdf.text(typeLabel, currentX + 2, yPos + 5.5);
        pdf.setTextColor(75, 85, 99); // Reset
        currentX += colWidths[3];

        // Amount
        const amountStr = formatCurrency(t.amount);
        pdf.text(amountStr, currentX + colWidths[4] - 2, yPos + 5.5, { align: 'right' });

        yPos += 8;

        // Draw line at bottom of row (optional, maybe just for the last one)
        pdf.setDrawColor(229, 231, 235); // Gray 200
        pdf.line(startX, yPos, startX + pageWidth - 40, yPos);
      });

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Exportar Relatório PDF
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              required
              className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Data Final
            </label>
            <input
              type="date"
              required
              className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            onClick={generatePDF}
            disabled={loading || !startDate || !endDate}
            className="w-full h-12 flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={24} />
            ) : (
              <FileDown className="mr-2" size={24} />
            )}
            {loading ? 'Gerando...' : 'Baixar Relatório'}
          </button>
        </div>
      </div>
    </div>
  );
};