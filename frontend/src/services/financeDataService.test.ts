import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api/client';
import { DEMO_TOKEN } from '../data/demoSession';
import { TOKEN_KEY } from '../utils/sessionStorage';
import { financeDataService, resetDemoStore } from './financeDataService';

describe('financeDataService demo mode', () => {
  beforeEach(() => {
    localStorage.clear();
    resetDemoStore();
    vi.restoreAllMocks();
  });

  it('serves all main modules from local demo data without calling the API', async () => {
    localStorage.setItem(TOKEN_KEY, DEMO_TOKEN);
    const getSpy = vi.spyOn(api, 'get').mockRejectedValue(new Error('API should not be called in demo mode'));
    const postSpy = vi.spyOn(api, 'post').mockRejectedValue(new Error('API should not be called in demo mode'));
    const putSpy = vi.spyOn(api, 'put').mockRejectedValue(new Error('API should not be called in demo mode'));
    const patchSpy = vi.spyOn(api, 'patch').mockRejectedValue(new Error('API should not be called in demo mode'));
    const deleteSpy = vi.spyOn(api, 'delete').mockRejectedValue(new Error('API should not be called in demo mode'));

    const categories = await financeDataService.listCategories();
    const dashboard = await financeDataService.getDashboard({ month: '7', year: '2026' });
    const transactions = await financeDataService.listTransactions({ page: 0, size: 10 });
    const goals = await financeDataService.listGoals();
    const recurringTransactions = await financeDataService.listRecurringTransactions();
    const report = await financeDataService.getReport({ month: '7', year: '2026' });
    const profile = await financeDataService.updateProfile({
      name: 'Conta Demo Atualizada',
      accountType: 'BUSINESS',
      themePreference: 'DARK',
    });

    expect(categories.length).toBeGreaterThan(0);
    expect(dashboard.currentBalance).toBe(71460);
    expect(transactions.content.length).toBeGreaterThan(0);
    expect(goals.length).toBeGreaterThan(0);
    expect(recurringTransactions.length).toBeGreaterThan(0);
    expect(report.netBalance).toBe(71460);
    expect(profile.name).toBe('Conta Demo Atualizada');

    const created = await financeDataService.createTransaction({
      description: 'Compra demo local',
      amount: 199,
      type: 'EXPENSE',
      transactionDate: '2026-07-07',
      paymentMethod: 'PIX',
      note: 'Criada no teste demo',
      categoryId: categories.find((category) => category.type === 'EXPENSE')?.id ?? categories[0].id,
      recurring: false,
      status: 'CONFIRMED',
    });
    await financeDataService.updateTransaction(created.id, {
      description: 'Compra demo editada',
      amount: 299,
      type: 'EXPENSE',
      transactionDate: '2026-07-07',
      paymentMethod: 'PIX',
      note: '',
      categoryId: created.categoryId,
      recurring: false,
      status: 'CONFIRMED',
    });
    const afterEdit = await financeDataService.listTransactions({ search: 'editada', page: 0, size: 10 });
    await financeDataService.deleteTransaction(created.id);
    const afterDelete = await financeDataService.listTransactions({ search: 'editada', page: 0, size: 10 });

    expect(afterEdit.content).toHaveLength(1);
    expect(afterDelete.content).toHaveLength(0);
    expect(getSpy).not.toHaveBeenCalled();
    expect(postSpy).not.toHaveBeenCalled();
    expect(putSpy).not.toHaveBeenCalled();
    expect(patchSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
