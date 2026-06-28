import type { GoalStatus, RecurringFrequency, TransactionStatus, TransactionType } from '../types/models';

export const transactionTypeLabels: Record<TransactionType, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
};

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  CONFIRMED: 'Confirmada',
  PENDING: 'Pendente',
  CANCELED: 'Cancelada',
};

export const goalStatusLabels: Record<GoalStatus, string> = {
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluída',
  OVERDUE: 'Atrasada',
  CANCELED: 'Cancelada',
};

export const recurringFrequencyLabels: Record<RecurringFrequency, string> = {
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
};
