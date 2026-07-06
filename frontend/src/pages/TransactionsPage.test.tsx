import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api/client';
import { ToastProvider } from '../contexts/ToastContext';
import { exportTransactionsExcel } from '../utils/exporters';
import { TransactionsPage } from './TransactionsPage';

vi.mock('../utils/exporters', () => ({
  exportTransactionsExcel: vi.fn(),
  exportTransactionsPdf: vi.fn(),
}));

const transactionsResponse = {
  content: [
    {
      id: 1,
      description: 'Cloud mensal',
      amount: 350,
      type: 'EXPENSE',
      transactionDate: '2026-06-20',
      paymentMethod: 'PIX',
      recurring: false,
      status: 'CONFIRMED',
      categoryId: 2,
      categoryName: 'Infraestrutura',
      categoryColor: '#0E7490',
      categoryIcon: 'devices',
      createdAt: '2026-06-20T10:00:00',
    },
  ],
  totalElements: 1,
  totalPages: 1,
  page: 0,
  size: 10,
};

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(exportTransactionsExcel).mockReset();
    vi.spyOn(api, 'get').mockImplementation((url) => {
      if (url === '/categories') {
        return Promise.resolve({
          data: [{ id: 2, name: 'Infraestrutura', type: 'EXPENSE', active: true }],
        });
      }

      if (url === '/transactions') {
        return Promise.resolve({ data: transactionsResponse });
      }

      return Promise.reject(new Error(`Unexpected URL ${url}`));
    });
  });

  it('renders financial rows returned by the API', async () => {
    render(
      <ToastProvider>
        <TransactionsPage />
      </ToastProvider>,
    );

    expect(await screen.findByText('Cloud mensal')).toBeInTheDocument();
    expect(screen.getByText('Infraestrutura')).toBeInTheDocument();
    expect(screen.getByText('- R$ 350,00')).toBeInTheDocument();
  });

  it('exports using the active filters instead of only the visible page', async () => {
    render(
      <ToastProvider>
        <TransactionsPage />
      </ToastProvider>,
    );

    await screen.findByText('Cloud mensal');
    fireEvent.change(screen.getByLabelText('Valor mínimo'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Exportar Excel' }));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/transactions', expect.objectContaining({
        params: expect.objectContaining({
          minAmount: '100',
          page: 0,
          size: 3000,
        }),
      }));
    });
    expect(exportTransactionsExcel).toHaveBeenCalledWith(transactionsResponse.content);
  });
});
