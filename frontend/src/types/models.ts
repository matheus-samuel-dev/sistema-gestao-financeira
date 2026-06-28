export type AccountType = 'PERSONAL' | 'BUSINESS';
export type ThemePreference = 'LIGHT' | 'DARK';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'CONFIRMED' | 'PENDING' | 'CANCELED';
export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELED';
export type RecurringFrequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  details?: string[];
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  accountType: AccountType;
  themePreference: ThemePreference;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  active: boolean;
  systemDefault: boolean;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  paymentMethod: string;
  note?: string | null;
  recurring: boolean;
  status: TransactionStatus;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  recurringTransactionId?: number | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description?: string | null;
  status: GoalStatus;
  progressPercentage: number;
  categoryId?: number | null;
  categoryName?: string | null;
}

export interface RecurringTransaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  paymentMethod: string;
  note?: string | null;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string | null;
  nextExecution: string;
  active: boolean;
  categoryId: number;
  categoryName: string;
}

export interface CategoryBreakdownPoint {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyComparisonPoint {
  label: string;
  income: number;
  expense: number;
}

export interface BalanceEvolutionPoint {
  label: string;
  balance: number;
}

export interface TypeCountPoint {
  type: string;
  count: number;
}

export interface DashboardData {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  spendingPercentage: number;
  topExpenseCategory: string;
  activeGoals: number;
  highlightedGoals: Goal[];
  latestTransactions: Transaction[];
  monthlyComparison: MonthlyComparisonPoint[];
  expensesByCategory: CategoryBreakdownPoint[];
  balanceEvolution: BalanceEvolutionPoint[];
  transactionsByType: TypeCountPoint[];
}

export interface ReportCategorySummary {
  category: string;
  total: number;
  color: string;
}

export interface ReportMonthlySummary {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface ReportData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  incomeByCategory: ReportCategorySummary[];
  expenseByCategory: ReportCategorySummary[];
  topExpenses: Transaction[];
  monthlyEvolution: ReportMonthlySummary[];
  monthlyComparison: ReportMonthlySummary[];
}

export interface TransactionPayload {
  description: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  paymentMethod: string;
  note?: string;
  categoryId: number;
  recurring?: boolean;
  status?: TransactionStatus;
  recurringFrequency?: RecurringFrequency;
  recurringStartDate?: string;
  recurringEndDate?: string;
}

export interface CategoryPayload {
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  active?: boolean;
}

export interface GoalPayload {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description?: string;
  status?: GoalStatus;
  categoryId?: number;
}

export interface RecurringPayload {
  description: string;
  amount: number;
  type: TransactionType;
  paymentMethod: string;
  note?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  nextExecution?: string;
  categoryId: number;
  active?: boolean;
}
