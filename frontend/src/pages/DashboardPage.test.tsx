import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api/client';
import { DEMO_TOKEN } from '../data/demoSession';
import { ToastProvider } from '../contexts/ToastContext';
import { DashboardPage } from './DashboardPage';

const dashboardData = {
  currentBalance: 120000,
  monthlyIncome: 90000,
  monthlyExpenses: 30000,
  monthlySavings: 60000,
  spendingPercentage: 33.33,
  topExpenseCategory: 'Infraestrutura',
  activeGoals: 1,
  highlightedGoals: [],
  latestTransactions: [],
  monthlyComparison: [
    { label: 'Jan', income: 50000, expense: 20000 },
    { label: 'Fev', income: 90000, expense: 30000 },
  ],
  expensesByCategory: [{ name: 'Infraestrutura', value: 30000, color: '#0E7490' }],
  balanceEvolution: [
    { label: 'Jan', balance: 30000 },
    { label: 'Fev', balance: 120000 },
  ],
  transactionsByType: [
    { type: 'Receitas', count: 4 },
    { type: 'Despesas', count: 2 },
  ],
};

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(api, 'get').mockImplementation((url) => {
      if (url === '/categories') {
        return Promise.resolve({ data: [{ id: 1, name: 'Infraestrutura', type: 'EXPENSE', active: true }] });
      }

      if (url === '/dashboard') {
        return Promise.resolve({ data: dashboardData });
      }

      return Promise.reject(new Error(`Unexpected URL ${url}`));
    });
  });

  it('loads dashboard data and refreshes with feedback', async () => {
    render(
      <ToastProvider>
        <DashboardPage />
      </ToastProvider>,
    );

    expect(await screen.findByText('Panorama financeiro')).toBeInTheDocument();
    expect(await screen.findByText('R$ 120.000,00')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Atualizar' }));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/dashboard', expect.objectContaining({
        params: expect.objectContaining({ month: expect.any(String), year: expect.any(String) }),
      }));
    });
    expect(await screen.findByText('Dashboard atualizado com sucesso.')).toBeInTheDocument();
  });

  it('sends amount range filters to dashboard API', async () => {
    render(
      <ToastProvider>
        <DashboardPage />
      </ToastProvider>,
    );

    await screen.findByText('Panorama financeiro');
    fireEvent.change(screen.getByLabelText('Valor mínimo'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Valor máximo'), { target: { value: '500' } });

    await waitFor(() => {
      expect(api.get).toHaveBeenLastCalledWith('/dashboard', expect.objectContaining({
        params: expect.objectContaining({
          minAmount: '100',
          maxAmount: '500',
        }),
      }));
    });
  });

  it('loads local demo data without calling the API when the demo token is stored', async () => {
    localStorage.setItem('finance-flow-token', DEMO_TOKEN);

    render(
      <ToastProvider>
        <DashboardPage />
      </ToastProvider>,
    );

    expect(await screen.findByText('Panorama financeiro')).toBeInTheDocument();
    expect(await screen.findAllByText('R$ 71.460,00')).toHaveLength(2);
    expect(api.get).not.toHaveBeenCalled();
  });
});
