import type { AuthResponse, Category, DashboardData } from '../types/models';

export const DEMO_EMAIL = 'demo@financeiro.com';
export const DEMO_PASSWORD = '123456';
export const DEMO_TOKEN = 'demo-local-token';
export const DEMO_INVALID_CREDENTIALS_CODE = 'DEMO_INVALID_CREDENTIALS';

export const DEMO_AUTH_RESPONSE: AuthResponse = {
  token: DEMO_TOKEN,
  user: {
    id: 1,
    name: 'Conta Demo',
    email: DEMO_EMAIL,
    accountType: 'BUSINESS',
    themePreference: 'LIGHT',
    createdAt: '2026-06-28T10:00:00Z',
  },
};

export const DEMO_CATEGORIES: Category[] = [
  { id: 1, name: 'Salário', type: 'INCOME', color: '#10B981', icon: 'payments', active: true, systemDefault: true },
  { id: 2, name: 'Vendas', type: 'INCOME', color: '#0EA5E9', icon: 'trending_up', active: true, systemDefault: true },
  { id: 3, name: 'Moradia', type: 'EXPENSE', color: '#F97316', icon: 'home', active: true, systemDefault: true },
  { id: 4, name: 'Tecnologia', type: 'EXPENSE', color: '#0E7490', icon: 'devices', active: true, systemDefault: true },
  { id: 5, name: 'Alimentação', type: 'EXPENSE', color: '#F59E0B', icon: 'restaurant', active: true, systemDefault: true },
];

export const DEMO_DASHBOARD_DATA: DashboardData = {
  currentBalance: 71460,
  monthlyIncome: 87400,
  monthlyExpenses: 15940,
  monthlySavings: 71460,
  spendingPercentage: 18.24,
  topExpenseCategory: 'Moradia',
  activeGoals: 2,
  highlightedGoals: [
    {
      id: 1,
      name: 'Upgrade de equipamentos',
      targetAmount: 12000,
      currentAmount: 6700,
      deadline: '2026-08-28',
      description: 'Troca de notebook, monitor e periféricos do escritório.',
      status: 'IN_PROGRESS',
      progressPercentage: 55.83,
      categoryId: 4,
      categoryName: 'Tecnologia',
    },
    {
      id: 2,
      name: 'Reserva de emergência',
      targetAmount: 30000,
      currentAmount: 18500,
      deadline: '2026-10-28',
      description: 'Meta para garantir seis meses de segurança financeira.',
      status: 'IN_PROGRESS',
      progressPercentage: 61.67,
      categoryId: 3,
      categoryName: 'Moradia',
    },
  ],
  latestTransactions: [
    {
      id: 1,
      description: 'Salário principal',
      amount: 7800,
      type: 'INCOME',
      transactionDate: '2026-07-05',
      paymentMethod: 'PIX',
      note: 'Receita recorrente mensal',
      recurring: true,
      status: 'CONFIRMED',
      categoryId: 1,
      categoryName: 'Salário',
      categoryColor: '#10B981',
      categoryIcon: 'payments',
      createdAt: '2026-07-05T10:00:00Z',
    },
    {
      id: 2,
      description: 'Assinaturas e cloud',
      amount: 940,
      type: 'EXPENSE',
      transactionDate: '2026-06-18',
      paymentMethod: 'Cartão',
      note: 'Ferramentas SaaS da operação.',
      recurring: false,
      status: 'CONFIRMED',
      categoryId: 4,
      categoryName: 'Tecnologia',
      categoryColor: '#0E7490',
      categoryIcon: 'devices',
      createdAt: '2026-06-18T10:00:00Z',
    },
    {
      id: 3,
      description: 'Plano premium anual',
      amount: 6200,
      type: 'INCOME',
      transactionDate: '2026-06-15',
      paymentMethod: 'Cartão',
      note: 'Venda de plano anual.',
      recurring: false,
      status: 'CONFIRMED',
      categoryId: 2,
      categoryName: 'Vendas',
      categoryColor: '#0EA5E9',
      categoryIcon: 'trending_up',
      createdAt: '2026-06-15T10:00:00Z',
    },
  ],
  monthlyComparison: [
    { label: 'fev./26', income: 11000, expense: 4090 },
    { label: 'mar./26', income: 12900, expense: 3310 },
    { label: 'abr./26', income: 12400, expense: 4470 },
    { label: 'mai./26', income: 11300, expense: 2810 },
    { label: 'jun./26', income: 14000, expense: 4730 },
    { label: 'jul./26', income: 14100, expense: 2570 },
  ],
  expensesByCategory: [
    { name: 'Moradia', value: 6300, color: '#F97316' },
    { name: 'Tecnologia', value: 3080, color: '#0E7490' },
    { name: 'Alimentação', value: 2650, color: '#F59E0B' },
    { name: 'Contas Fixas', value: 2130, color: '#14B8A6' },
    { name: 'Transporte', value: 1780, color: '#6366F1' },
  ],
  balanceEvolution: [
    { label: 'fev./26', balance: 32000 },
    { label: 'mar./26', balance: 41490 },
    { label: 'abr./26', balance: 49420 },
    { label: 'mai./26', balance: 57910 },
    { label: 'jun./26', balance: 67180 },
    { label: 'jul./26', balance: 71460 },
  ],
  transactionsByType: [
    { type: 'Receitas', count: 8 },
    { type: 'Despesas', count: 16 },
  ],
};

export function normalizeDemoEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isDemoEmail(email: string) {
  return normalizeDemoEmail(email) === DEMO_EMAIL;
}

export function isDemoToken(token: string | null) {
  return token === DEMO_TOKEN;
}

export function isDemoCredentials(email: string, password: string) {
  return isDemoEmail(email) && password === DEMO_PASSWORD;
}

export function createDemoInvalidCredentialsError() {
  return Object.assign(new Error('Credenciais demo inválidas.'), {
    code: DEMO_INVALID_CREDENTIALS_CODE,
  });
}

export function isDemoInvalidCredentialsError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === DEMO_INVALID_CREDENTIALS_CODE
  );
}
