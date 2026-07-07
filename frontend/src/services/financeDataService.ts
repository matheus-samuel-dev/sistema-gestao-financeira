import { api } from '../api/client';
import {
  DEMO_AUTH_RESPONSE,
  DEMO_CATEGORIES,
  DEMO_GOALS,
  DEMO_RECURRING_TRANSACTIONS,
  DEMO_TRANSACTIONS,
  isDemoToken,
} from '../data/demoSession';
import type {
  AccountType,
  AuthResponse,
  Category,
  CategoryPayload,
  DashboardData,
  Goal,
  GoalPayload,
  PaginatedResponse,
  RecurringPayload,
  RecurringTransaction,
  ReportCategorySummary,
  ReportData,
  ReportMonthlySummary,
  ThemePreference,
  Transaction,
  TransactionPayload,
  TransactionStatus,
  TransactionType,
  UserProfile,
} from '../types/models';
import { getStoredToken, getStoredUser, persistStoredUser } from '../utils/sessionStorage';

type QueryValue = string | number | boolean | undefined;
type QueryParams = Record<string, QueryValue>;

interface RequestOptions {
  signal?: AbortSignal;
}

interface ProfilePayload {
  name: string;
  accountType: AccountType;
  themePreference: ThemePreference;
}

interface PasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface FinanceDataService {
  getDashboard: (params: QueryParams, options?: RequestOptions) => Promise<DashboardData>;
  listCategories: (params?: QueryParams) => Promise<Category[]>;
  createCategory: (payload: CategoryPayload) => Promise<Category>;
  updateCategory: (id: number, payload: CategoryPayload) => Promise<Category>;
  toggleCategoryStatus: (id: number, active: boolean) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  listTransactions: (params: QueryParams) => Promise<PaginatedResponse<Transaction>>;
  createTransaction: (payload: TransactionPayload) => Promise<Transaction>;
  updateTransaction: (id: number, payload: TransactionPayload) => Promise<Transaction>;
  deleteTransaction: (id: number) => Promise<void>;
  listGoals: () => Promise<Goal[]>;
  createGoal: (payload: GoalPayload) => Promise<Goal>;
  updateGoal: (id: number, payload: GoalPayload) => Promise<Goal>;
  deleteGoal: (id: number) => Promise<void>;
  listRecurringTransactions: () => Promise<RecurringTransaction[]>;
  createRecurringTransaction: (payload: RecurringPayload) => Promise<RecurringTransaction>;
  updateRecurringTransaction: (id: number, payload: RecurringPayload) => Promise<RecurringTransaction>;
  deleteRecurringTransaction: (id: number) => Promise<void>;
  getReport: (params: QueryParams) => Promise<ReportData>;
  updateProfile: (payload: ProfilePayload) => Promise<UserProfile>;
  changePassword: (payload: PasswordPayload) => Promise<void>;
  refreshSession: () => Promise<AuthResponse>;
}

interface DemoState {
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  recurringTransactions: RecurringTransaction[];
  nextCategoryId: number;
  nextTransactionId: number;
  nextGoalId: number;
  nextRecurringId: number;
}

const monthLabelFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit',
});

let demoState: DemoState | null = null;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function maxId(items: Array<{ id: number }>) {
  return Math.max(0, ...items.map((item) => item.id));
}

function createInitialDemoState(): DemoState {
  const categories = clone(DEMO_CATEGORIES);
  const transactions = clone(DEMO_TRANSACTIONS);
  const goals = clone(DEMO_GOALS);
  const recurringTransactions = clone(DEMO_RECURRING_TRANSACTIONS);

  return {
    categories,
    transactions,
    goals,
    recurringTransactions,
    nextCategoryId: maxId(categories) + 1,
    nextTransactionId: maxId(transactions) + 1,
    nextGoalId: maxId(goals) + 1,
    nextRecurringId: maxId(recurringTransactions) + 1,
  };
}

function getDemoState() {
  if (!demoState) {
    demoState = createInitialDemoState();
  }

  return demoState;
}

export function resetDemoStore() {
  demoState = null;
}

export function isDemoSessionActive() {
  return isDemoToken(getStoredToken());
}

function getActiveService(): FinanceDataService {
  return isDemoSessionActive() ? demoFinanceDataService : realFinanceDataService;
}

function normalizeNumber(value: QueryValue, fallback = 0) {
  if (value === undefined || value === '') {
    return fallback;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeOptionalNumber(value: QueryValue) {
  if (value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeString(value: QueryValue) {
  return value === undefined ? '' : String(value);
}

function getCategory(categoryId: number) {
  return getDemoState().categories.find((category) => category.id === categoryId) ?? null;
}

function getFallbackCategory(type: TransactionType) {
  return getDemoState().categories.find((category) => category.type === type && category.active) ?? getDemoState().categories[0];
}

function attachTransactionCategory(payload: TransactionPayload, existing?: Transaction): Transaction {
  const category = getCategory(payload.categoryId) ?? getFallbackCategory(payload.type);

  return {
    id: existing?.id ?? getDemoState().nextTransactionId++,
    description: payload.description,
    amount: Number(payload.amount),
    type: payload.type,
    transactionDate: payload.transactionDate,
    paymentMethod: payload.paymentMethod,
    note: payload.note ?? '',
    recurring: Boolean(payload.recurring),
    status: payload.status ?? 'CONFIRMED',
    categoryId: category.id,
    categoryName: category.name,
    categoryColor: category.color,
    categoryIcon: category.icon,
    recurringTransactionId: existing?.recurringTransactionId ?? null,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

function attachGoalCategory(payload: GoalPayload, existing?: Goal): Goal {
  const categoryId = payload.categoryId ?? null;
  const category = categoryId ? getCategory(categoryId) : null;
  const targetAmount = Number(payload.targetAmount);
  const currentAmount = Number(payload.currentAmount);
  const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  return {
    id: existing?.id ?? getDemoState().nextGoalId++,
    name: payload.name,
    targetAmount,
    currentAmount,
    deadline: payload.deadline,
    description: payload.description ?? '',
    status: payload.status ?? 'IN_PROGRESS',
    progressPercentage,
    categoryId,
    categoryName: category?.name ?? null,
  };
}

function attachRecurringCategory(payload: RecurringPayload, existing?: RecurringTransaction): RecurringTransaction {
  const category = getCategory(payload.categoryId) ?? getFallbackCategory(payload.type);

  return {
    id: existing?.id ?? getDemoState().nextRecurringId++,
    description: payload.description,
    amount: Number(payload.amount),
    type: payload.type,
    paymentMethod: payload.paymentMethod,
    note: payload.note ?? '',
    frequency: payload.frequency,
    startDate: payload.startDate,
    endDate: payload.endDate ?? null,
    nextExecution: payload.nextExecution ?? payload.startDate,
    active: payload.active ?? existing?.active ?? true,
    categoryId: category.id,
    categoryName: category.name,
  };
}

function sortTransactions(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => (
    b.transactionDate.localeCompare(a.transactionDate) || b.id - a.id
  ));
}

function matchesTransaction(transaction: Transaction, params: QueryParams = {}) {
  const search = normalizeString(params.search).trim().toLowerCase();
  const type = normalizeString(params.type) as TransactionType | '';
  const categoryId = normalizeOptionalNumber(params.categoryId);
  const month = normalizeOptionalNumber(params.month);
  const year = normalizeOptionalNumber(params.year);
  const minAmount = normalizeOptionalNumber(params.minAmount);
  const maxAmount = normalizeOptionalNumber(params.maxAmount);
  const status = normalizeString(params.status) as TransactionStatus | '';
  const startDate = normalizeString(params.startDate);
  const endDate = normalizeString(params.endDate);
  const transactionMonth = Number(transaction.transactionDate.slice(5, 7));
  const transactionYear = Number(transaction.transactionDate.slice(0, 4));

  if (search && !`${transaction.description} ${transaction.note ?? ''}`.toLowerCase().includes(search)) {
    return false;
  }

  if (type && transaction.type !== type) {
    return false;
  }

  if (categoryId !== null && transaction.categoryId !== categoryId) {
    return false;
  }

  if (month !== null && transactionMonth !== month) {
    return false;
  }

  if (year !== null && transactionYear !== year) {
    return false;
  }

  if (startDate && transaction.transactionDate < startDate) {
    return false;
  }

  if (endDate && transaction.transactionDate > endDate) {
    return false;
  }

  if (minAmount !== null && transaction.amount < minAmount) {
    return false;
  }

  if (maxAmount !== null && transaction.amount > maxAmount) {
    return false;
  }

  if (status && transaction.status !== status) {
    return false;
  }

  return true;
}

function getFilteredTransactions(params: QueryParams = {}) {
  return sortTransactions(getDemoState().transactions.filter((transaction) => matchesTransaction(transaction, params)));
}

function getConfirmedTransactions(params: QueryParams = {}) {
  return getFilteredTransactions(params).filter((transaction) => transaction.status === 'CONFIRMED');
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getTransactionMonthKey(transaction: Transaction) {
  return transaction.transactionDate.slice(0, 7);
}

function createMonthWindow(params: QueryParams = {}) {
  const selectedYear = normalizeOptionalNumber(params.year) ?? 2026;
  const selectedMonth = normalizeOptionalNumber(params.month) ?? 7;

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(selectedYear, selectedMonth - 6 + index, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    return {
      key: monthKey(year, month),
      label: monthLabelFormatter.format(date).replace(/\sde\s/i, '/'),
      month,
      year,
    };
  });
}

function sumTransactions(transactions: Transaction[], type: TransactionType) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function buildExpenseByCategory(transactions: Transaction[]) {
  const grouped = new Map<string, ReportCategorySummary>();

  transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .forEach((transaction) => {
      const current = grouped.get(transaction.categoryName) ?? {
        category: transaction.categoryName,
        total: 0,
        color: transaction.categoryColor,
      };
      current.total += transaction.amount;
      grouped.set(transaction.categoryName, current);
    });

  return [...grouped.values()].sort((a, b) => b.total - a.total);
}

function buildIncomeByCategory(transactions: Transaction[]) {
  const grouped = new Map<string, ReportCategorySummary>();

  transactions
    .filter((transaction) => transaction.type === 'INCOME')
    .forEach((transaction) => {
      const current = grouped.get(transaction.categoryName) ?? {
        category: transaction.categoryName,
        total: 0,
        color: transaction.categoryColor,
      };
      current.total += transaction.amount;
      grouped.set(transaction.categoryName, current);
    });

  return [...grouped.values()].sort((a, b) => b.total - a.total);
}

function buildMonthlySummaries(transactions: Transaction[], params: QueryParams = {}) {
  const months = createMonthWindow(params);

  return months.map<ReportMonthlySummary>((item) => {
    const monthTransactions = transactions.filter((transaction) => getTransactionMonthKey(transaction) === item.key);
    const income = sumTransactions(monthTransactions, 'INCOME');
    const expense = sumTransactions(monthTransactions, 'EXPENSE');

    return {
      month: item.label,
      income,
      expense,
      net: income - expense,
    };
  });
}

function buildDashboardData(params: QueryParams): DashboardData {
  const transactions = getConfirmedTransactions(params);
  const income = sumTransactions(transactions, 'INCOME');
  const expense = sumTransactions(transactions, 'EXPENSE');
  const expensesByCategory = buildExpenseByCategory(transactions);
  const monthlySummaries = buildMonthlySummaries(getDemoState().transactions.filter((transaction) => transaction.status === 'CONFIRMED'), params);
  const activeGoals = getDemoState().goals.filter((goal) => goal.status === 'IN_PROGRESS');
  let runningBalance = 0;

  return {
    currentBalance: income - expense,
    monthlyIncome: income,
    monthlyExpenses: expense,
    monthlySavings: income - expense,
    spendingPercentage: income > 0 ? (expense / income) * 100 : 0,
    topExpenseCategory: expensesByCategory[0]?.category ?? 'Sem despesas',
    activeGoals: activeGoals.length,
    highlightedGoals: activeGoals.slice(0, 3).map(clone),
    latestTransactions: sortTransactions(transactions).slice(0, 5).map(clone),
    monthlyComparison: monthlySummaries.map((item) => ({
      label: item.month,
      income: item.income,
      expense: item.expense,
    })),
    expensesByCategory: expensesByCategory.map((item) => ({
      name: item.category,
      value: item.total,
      color: item.color,
    })),
    balanceEvolution: monthlySummaries.map((item) => {
      runningBalance += item.net;
      return {
        label: item.month,
        balance: runningBalance,
      };
    }),
    transactionsByType: [
      { type: 'Receitas', count: transactions.filter((transaction) => transaction.type === 'INCOME').length },
      { type: 'Despesas', count: transactions.filter((transaction) => transaction.type === 'EXPENSE').length },
    ],
  };
}

function buildReportData(params: QueryParams): ReportData {
  const transactions = getConfirmedTransactions(params);
  const income = sumTransactions(transactions, 'INCOME');
  const expense = sumTransactions(transactions, 'EXPENSE');
  const monthlyComparison = buildMonthlySummaries(
    getDemoState().transactions.filter((transaction) => transaction.status === 'CONFIRMED'),
    params,
  );

  return {
    totalIncome: income,
    totalExpense: expense,
    netBalance: income - expense,
    incomeByCategory: buildIncomeByCategory(transactions),
    expenseByCategory: buildExpenseByCategory(transactions),
    topExpenses: transactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)
      .map(clone),
    monthlyEvolution: monthlyComparison,
    monthlyComparison,
  };
}

const realFinanceDataService: FinanceDataService = {
  async getDashboard(params, options) {
    const { data } = await api.get<DashboardData>('/dashboard', {
      params,
      signal: options?.signal,
    });
    return data;
  },
  async listCategories(params) {
    const { data } = await api.get<Category[]>('/categories', { params });
    return data;
  },
  async createCategory(payload) {
    const { data } = await api.post<Category>('/categories', payload);
    return data;
  },
  async updateCategory(id, payload) {
    const { data } = await api.put<Category>(`/categories/${id}`, payload);
    return data;
  },
  async toggleCategoryStatus(id, active) {
    const { data } = await api.patch<Category>(`/categories/${id}/status`, { active });
    return data;
  },
  async deleteCategory(id) {
    await api.delete(`/categories/${id}`);
  },
  async listTransactions(params) {
    const { data } = await api.get<PaginatedResponse<Transaction>>('/transactions', { params });
    return data;
  },
  async createTransaction(payload) {
    const { data } = await api.post<Transaction>('/transactions', payload);
    return data;
  },
  async updateTransaction(id, payload) {
    const { data } = await api.put<Transaction>(`/transactions/${id}`, payload);
    return data;
  },
  async deleteTransaction(id) {
    await api.delete(`/transactions/${id}`);
  },
  async listGoals() {
    const { data } = await api.get<Goal[]>('/goals');
    return data;
  },
  async createGoal(payload) {
    const { data } = await api.post<Goal>('/goals', payload);
    return data;
  },
  async updateGoal(id, payload) {
    const { data } = await api.put<Goal>(`/goals/${id}`, payload);
    return data;
  },
  async deleteGoal(id) {
    await api.delete(`/goals/${id}`);
  },
  async listRecurringTransactions() {
    const { data } = await api.get<RecurringTransaction[]>('/recurring-transactions');
    return data;
  },
  async createRecurringTransaction(payload) {
    const { data } = await api.post<RecurringTransaction>('/recurring-transactions', payload);
    return data;
  },
  async updateRecurringTransaction(id, payload) {
    const { data } = await api.put<RecurringTransaction>(`/recurring-transactions/${id}`, payload);
    return data;
  },
  async deleteRecurringTransaction(id) {
    await api.delete(`/recurring-transactions/${id}`);
  },
  async getReport(params) {
    const { data } = await api.get<ReportData>('/reports', { params });
    return data;
  },
  async updateProfile(payload) {
    const { data } = await api.put<UserProfile>('/profile', payload);
    return data;
  },
  async changePassword(payload) {
    await api.patch('/profile/password', payload);
  },
  async refreshSession() {
    const { data } = await api.get<AuthResponse>('/auth/me');
    return data;
  },
};

const demoFinanceDataService: FinanceDataService = {
  async getDashboard(params) {
    return clone(buildDashboardData(params));
  },
  async listCategories(params = {}) {
    const activeOnly = params.activeOnly === true || params.activeOnly === 'true';
    const categories = activeOnly
      ? getDemoState().categories.filter((category) => category.active)
      : getDemoState().categories;

    return clone(categories);
  },
  async createCategory(payload) {
    const category: Category = {
      id: getDemoState().nextCategoryId++,
      name: payload.name,
      type: payload.type,
      color: payload.color,
      icon: payload.icon,
      active: payload.active ?? true,
      systemDefault: false,
    };
    getDemoState().categories.unshift(category);
    return clone(category);
  },
  async updateCategory(id, payload) {
    const state = getDemoState();
    const index = state.categories.findIndex((category) => category.id === id);
    if (index === -1) {
      throw new Error('Categoria demo não encontrada.');
    }

    state.categories[index] = {
      ...state.categories[index],
      ...payload,
      active: payload.active ?? state.categories[index].active,
    };

    return clone(state.categories[index]);
  },
  async toggleCategoryStatus(id, active) {
    const state = getDemoState();
    const category = state.categories.find((item) => item.id === id);
    if (!category) {
      throw new Error('Categoria demo não encontrada.');
    }
    category.active = active;
    return clone(category);
  },
  async deleteCategory(id) {
    const state = getDemoState();
    state.categories = state.categories.filter((category) => category.id !== id);
  },
  async listTransactions(params) {
    const page = normalizeNumber(params.page, 0);
    const size = normalizeNumber(params.size, 10);
    const filtered = getFilteredTransactions(params);
    const start = page * size;

    return {
      content: clone(filtered.slice(start, start + size)),
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      page,
      size,
    };
  },
  async createTransaction(payload) {
    const transaction = attachTransactionCategory(payload);
    getDemoState().transactions.unshift(transaction);
    return clone(transaction);
  },
  async updateTransaction(id, payload) {
    const state = getDemoState();
    const index = state.transactions.findIndex((transaction) => transaction.id === id);
    if (index === -1) {
      throw new Error('Transação demo não encontrada.');
    }

    state.transactions[index] = attachTransactionCategory(payload, state.transactions[index]);
    return clone(state.transactions[index]);
  },
  async deleteTransaction(id) {
    const state = getDemoState();
    state.transactions = state.transactions.filter((transaction) => transaction.id !== id);
  },
  async listGoals() {
    return clone(getDemoState().goals);
  },
  async createGoal(payload) {
    const goal = attachGoalCategory(payload);
    getDemoState().goals.unshift(goal);
    return clone(goal);
  },
  async updateGoal(id, payload) {
    const state = getDemoState();
    const index = state.goals.findIndex((goal) => goal.id === id);
    if (index === -1) {
      throw new Error('Meta demo não encontrada.');
    }

    state.goals[index] = attachGoalCategory(payload, state.goals[index]);
    return clone(state.goals[index]);
  },
  async deleteGoal(id) {
    const state = getDemoState();
    state.goals = state.goals.filter((goal) => goal.id !== id);
  },
  async listRecurringTransactions() {
    return clone(getDemoState().recurringTransactions);
  },
  async createRecurringTransaction(payload) {
    const recurringTransaction = attachRecurringCategory(payload);
    getDemoState().recurringTransactions.unshift(recurringTransaction);
    return clone(recurringTransaction);
  },
  async updateRecurringTransaction(id, payload) {
    const state = getDemoState();
    const index = state.recurringTransactions.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Recorrência demo não encontrada.');
    }

    state.recurringTransactions[index] = attachRecurringCategory(payload, state.recurringTransactions[index]);
    return clone(state.recurringTransactions[index]);
  },
  async deleteRecurringTransaction(id) {
    const recurringTransaction = getDemoState().recurringTransactions.find((item) => item.id === id);
    if (recurringTransaction) {
      recurringTransaction.active = false;
    }
  },
  async getReport(params) {
    return clone(buildReportData(params));
  },
  async updateProfile(payload) {
    const currentUser = getStoredUser() ?? DEMO_AUTH_RESPONSE.user;
    const nextUser: UserProfile = {
      ...currentUser,
      name: payload.name,
      accountType: payload.accountType,
      themePreference: payload.themePreference,
    };
    persistStoredUser(nextUser);
    return clone(nextUser);
  },
  async changePassword(payload) {
    if (!payload.currentPassword || !payload.newPassword) {
      throw new Error('Informe a senha atual e a nova senha.');
    }
  },
  async refreshSession() {
    const user = getStoredUser() ?? DEMO_AUTH_RESPONSE.user;
    return {
      token: DEMO_AUTH_RESPONSE.token,
      user: clone(user),
    };
  },
};

export const financeDataService: FinanceDataService = {
  getDashboard: (params, options) => getActiveService().getDashboard(params, options),
  listCategories: (params) => getActiveService().listCategories(params),
  createCategory: (payload) => getActiveService().createCategory(payload),
  updateCategory: (id, payload) => getActiveService().updateCategory(id, payload),
  toggleCategoryStatus: (id, active) => getActiveService().toggleCategoryStatus(id, active),
  deleteCategory: (id) => getActiveService().deleteCategory(id),
  listTransactions: (params) => getActiveService().listTransactions(params),
  createTransaction: (payload) => getActiveService().createTransaction(payload),
  updateTransaction: (id, payload) => getActiveService().updateTransaction(id, payload),
  deleteTransaction: (id) => getActiveService().deleteTransaction(id),
  listGoals: () => getActiveService().listGoals(),
  createGoal: (payload) => getActiveService().createGoal(payload),
  updateGoal: (id, payload) => getActiveService().updateGoal(id, payload),
  deleteGoal: (id) => getActiveService().deleteGoal(id),
  listRecurringTransactions: () => getActiveService().listRecurringTransactions(),
  createRecurringTransaction: (payload) => getActiveService().createRecurringTransaction(payload),
  updateRecurringTransaction: (id, payload) => getActiveService().updateRecurringTransaction(id, payload),
  deleteRecurringTransaction: (id) => getActiveService().deleteRecurringTransaction(id),
  getReport: (params) => getActiveService().getReport(params),
  updateProfile: (payload) => getActiveService().updateProfile(payload),
  changePassword: (payload) => getActiveService().changePassword(payload),
  refreshSession: () => getActiveService().refreshSession(),
};
