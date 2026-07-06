import type { ReportData, Transaction } from '../types/models';
import { formatCurrency, formatDate } from './formatters';
import { transactionStatusLabels, transactionTypeLabels } from './labels';

async function createPdfDocument() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  return {
    autoTable,
    doc: new jsPDF(),
  };
}

async function downloadWorkbook(workbook: import('xlsx').WorkBook, fileName: string) {
  const XLSX = await import('xlsx');
  XLSX.writeFile(workbook, fileName);
}

export async function exportTransactionsExcel(transactions: Transaction[]) {
  const XLSX = await import('xlsx');
  const rows = transactions.map((transaction) => ({
    Descrição: transaction.description,
    Tipo: transactionTypeLabels[transaction.type],
    Categoria: transaction.categoryName,
    Valor: transaction.amount,
    Data: transaction.transactionDate,
    Forma: transaction.paymentMethod,
    Status: transactionStatusLabels[transaction.status],
    Recorrente: transaction.recurring ? 'Sim' : 'Não',
    Observação: transaction.note ?? '',
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações');
  await downloadWorkbook(workbook, 'transacoes-finance-flow.xlsx');
}

export async function exportTransactionsPdf(transactions: Transaction[], title: string, periodLabel: string) {
  const { autoTable, doc } = await createPdfDocument();

  doc.setFontSize(18);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Período: ${periodLabel}`, 14, 26);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 32);

  autoTable(doc, {
    startY: 40,
    head: [['Descrição', 'Tipo', 'Categoria', 'Valor', 'Data', 'Forma']],
    body: transactions.map((transaction) => [
      transaction.description,
      transactionTypeLabels[transaction.type],
      transaction.categoryName,
      formatCurrency(transaction.amount),
      formatDate(transaction.transactionDate),
      transaction.paymentMethod,
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [14, 116, 144],
    },
  });

  doc.save('transacoes-finance-flow.pdf');
}

export async function exportReportExcel(report: ReportData) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.json_to_sheet([
    {
      Receitas: report.totalIncome,
      Despesas: report.totalExpense,
      Saldo: report.netBalance,
    },
  ]);

  const expenseSheet = XLSX.utils.json_to_sheet(report.expenseByCategory);
  const incomeSheet = XLSX.utils.json_to_sheet(report.incomeByCategory);
  const topExpensesSheet = XLSX.utils.json_to_sheet(
    report.topExpenses.map((expense) => ({
      Descrição: expense.description,
      Categoria: expense.categoryName,
      Valor: expense.amount,
      Data: expense.transactionDate,
    })),
  );

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
  XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Receitas por Categoria');
  XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Despesas por Categoria');
  XLSX.utils.book_append_sheet(workbook, topExpensesSheet, 'Maiores Despesas');

  await downloadWorkbook(workbook, 'relatorio-finance-flow.xlsx');
}

export async function exportReportPdf(report: ReportData, periodLabel: string) {
  const { autoTable, doc } = await createPdfDocument();

  doc.setFontSize(18);
  doc.text('Relatório Financeiro', 14, 18);
  doc.setFontSize(10);
  doc.text(`Período: ${periodLabel}`, 14, 26);
  doc.text(`Receitas: ${formatCurrency(report.totalIncome)}`, 14, 34);
  doc.text(`Despesas: ${formatCurrency(report.totalExpense)}`, 14, 40);
  doc.text(`Saldo líquido: ${formatCurrency(report.netBalance)}`, 14, 46);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 52);

  autoTable(doc, {
    startY: 60,
    head: [['Categoria', 'Total']],
    body: report.expenseByCategory.map((item) => [item.category, formatCurrency(item.total)]),
    headStyles: {
      fillColor: [249, 115, 22],
    },
  });

  autoTable(doc, {
    startY: (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY
      ? ((doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 70) + 10
      : 110,
    head: [['Descrição', 'Categoria', 'Valor', 'Data']],
    body: report.topExpenses.map((expense) => [
      expense.description,
      expense.categoryName,
      formatCurrency(expense.amount),
      formatDate(expense.transactionDate),
    ]),
    headStyles: {
      fillColor: [14, 116, 144],
    },
  });

  doc.save('relatorio-finance-flow.pdf');
}
