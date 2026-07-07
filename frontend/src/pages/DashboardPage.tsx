import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import Grid from '@mui/material/Grid';
import {
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from '../components/ChartCard';
import { EmptyState } from '../components/EmptyState';
import { IconBadge } from '../components/IconBadge';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { financeDataService } from '../services/financeDataService';
import type { Category, DashboardData, TransactionType } from '../types/models';
import { getErrorMessage } from '../utils/apiError';
import { formatCompactCurrency, formatCurrency, formatDate, formatPercentage } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';

interface FilterState {
  month: string;
  year: string;
  type: '' | TransactionType;
  categoryId: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}

const monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1));
const chartMargin = { top: 8, right: 12, left: 0, bottom: 0 };
const financialChartMargin = { top: 16, right: 24, left: 18, bottom: 6 };

const getChartNumber = (value: unknown) => {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  const numericValue = Number(normalizedValue);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatAxisCurrency = (value: unknown) => formatCompactCurrency(getChartNumber(value));
const formatTooltipCurrency = (value: unknown) => formatCurrency(getChartNumber(value));

const isCanceledRequest = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'ERR_CANCELED';

export function DashboardPage() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<FilterState>({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    type: '',
    categoryId: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });
  const [data, setData] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const dashboardAbortRef = useRef<AbortController | null>(null);
  const manualRefreshInFlightRef = useRef(false);

  const dashboardParams = useMemo(
    () => ({
      month: filters.month || undefined,
      year: filters.year || undefined,
      type: filters.type || undefined,
      categoryId: filters.categoryId || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      minAmount: filters.minAmount || undefined,
      maxAmount: filters.maxAmount || undefined,
    }),
    [filters],
  );

  const fetchCategories = useCallback(async () => {
    try {
      const activeCategories = await financeDataService.listCategories({ activeOnly: true });
      setCategories(activeCategories);
    } catch (error) {
      if (!isCanceledRequest(error)) {
        console.error('[Dashboard] Não foi possível carregar categorias.', error);
      }
    }
  }, []);

  const fetchDashboard = useCallback(async (options?: { showSuccess?: boolean }) => {
    if (options?.showSuccess && manualRefreshInFlightRef.current) {
      return;
    }

    if (options?.showSuccess) {
      manualRefreshInFlightRef.current = true;
    }

    dashboardAbortRef.current?.abort();
    const controller = new AbortController();
    dashboardAbortRef.current = controller;

    setLoading(true);
    try {
      const dashboardData = await financeDataService.getDashboard(dashboardParams, {
        signal: controller.signal,
      });
      setData(dashboardData);
      if (options?.showSuccess) {
        showToast('Dashboard atualizado com sucesso.', 'success');
      }
    } catch (error) {
      if (isCanceledRequest(error)) {
        return;
      }

      showToast(getErrorMessage(error, 'Não foi possível carregar o dashboard.'), 'error');
    } finally {
      if (dashboardAbortRef.current === controller) {
        dashboardAbortRef.current = null;
        setLoading(false);
      }
      if (options?.showSuccess) {
        manualRefreshInFlightRef.current = false;
      }
    }
  }, [dashboardParams, showToast]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => () => {
    dashboardAbortRef.current?.abort();
  }, []);

  if (loading && !data) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="rounded" height={78} />
        <Grid container spacing={2.4}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, md: 6, xl: 3 }}>
              <Skeleton variant="rounded" height={142} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={340} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="Panorama financeiro"
        description="Visão consolidada de caixa, desempenho mensal, metas próximas do prazo e distribuição de gastos."
        action={
          <Button
            disabled={loading}
            startIcon={loading ? <CircularProgress color="inherit" size={16} /> : <RefreshRoundedIcon />}
            onClick={() => void fetchDashboard({ showSuccess: true })}
            variant="outlined"
          >
            {loading ? 'Atualizando' : 'Atualizar'}
          </Button>
        }
      />

      <Card>
        <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterAltRoundedIcon color="primary" />
              <Typography variant="h6">Filtros do dashboard</Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  label="Mês"
                  select
                  value={filters.month}
                  onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value }))}
                >
                  {monthOptions.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  label="Ano"
                  value={filters.year}
                  onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Tipo"
                  select
                  value={filters.type}
                  onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as FilterState['type'] }))}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="INCOME">Receitas</MenuItem>
                  <MenuItem value="EXPENSE">Despesas</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                <TextField
                  fullWidth
                  label="Categoria"
                  select
                  value={filters.categoryId}
                  onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Valor mínimo"
                  type="number"
                  value={filters.minAmount}
                  onChange={(event) => setFilters((current) => ({ ...current, minAmount: event.target.value }))}
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Valor máximo"
                  type="number"
                  value={filters.maxAmount}
                  onChange={(event) => setFilters((current) => ({ ...current, maxAmount: event.target.value }))}
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                />
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {data ? (
        <>
          <Grid container spacing={2.4}>
            <Grid size={{ xs: 12, md: 6, xl: 3 }}>
              <StatCard
                label="Saldo atual"
                value={formatCurrency(data.currentBalance)}
                helper="Fluxo acumulado da operação"
                highlight={theme.palette.primary.main}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 3 }}>
              <StatCard
                label="Receitas do período"
                value={formatCurrency(data.monthlyIncome)}
                helper="Entradas registradas no filtro atual"
                highlight={theme.palette.success.main}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 3 }}>
              <StatCard
                label="Despesas do período"
                value={formatCurrency(data.monthlyExpenses)}
                helper={`Maior categoria: ${data.topExpenseCategory}`}
                highlight={theme.palette.warning.main}
                positive={false}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 3 }}>
              <StatCard
                label="Economia do período"
                value={formatCurrency(data.monthlySavings)}
                helper={`Percentual gasto: ${formatPercentage(data.spendingPercentage)}`}
                highlight={theme.palette.secondary.main}
                positive={data.monthlySavings >= 0}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.4}>
            <Grid size={{ xs: 12, xl: 8 }}>
              <ChartCard title="Receitas x despesas por mês" subtitle="Comparativo dos últimos seis meses">
                <ResponsiveContainer width="100%" height={248}>
                  <AreaChart data={data.monthlyComparison} margin={financialChartMargin}>
                    <defs>
                      <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.34} />
                        <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="label" stroke={theme.palette.text.secondary} tickMargin={8} />
                    <YAxis
                      stroke={theme.palette.text.secondary}
                      tickFormatter={formatAxisCurrency}
                      tickMargin={8}
                      width={92}
                    />
                    <Tooltip formatter={formatTooltipCurrency} />
                    <Legend wrapperStyle={{ paddingTop: 8 }} />
                    <Area type="monotone" dataKey="income" stroke={theme.palette.success.main} fill="url(#incomeFill)" name="Receitas" />
                    <Area type="monotone" dataKey="expense" stroke={theme.palette.warning.main} fill="url(#expenseFill)" name="Despesas" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
            <Grid size={{ xs: 12, xl: 4 }}>
              <ChartCard title="Despesas por categoria" subtitle="Concentração dos gastos do período">
                {data.expensesByCategory.length ? (
                  <ResponsiveContainer width="100%" height={248}>
                    <PieChart>
                      <Pie data={data.expensesByCategory} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={4}>
                        {data.expensesByCategory.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="Sem despesas no período" description="Adicione despesas para visualizar a concentração por categoria." />
                )}
              </ChartCard>
            </Grid>
            <Grid size={{ xs: 12, xl: 7 }}>
              <ChartCard title="Evolução do saldo" subtitle="Progressão estimada do caixa ao longo dos últimos seis meses">
                <ResponsiveContainer width="100%" height={248}>
                  <BarChart data={data.balanceEvolution} margin={financialChartMargin}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="label" stroke={theme.palette.text.secondary} tickMargin={8} />
                    <YAxis
                      stroke={theme.palette.text.secondary}
                      tickFormatter={formatAxisCurrency}
                      tickMargin={8}
                      width={92}
                    />
                    <Tooltip formatter={formatTooltipCurrency} />
                    <Bar dataKey="balance" radius={[8, 8, 0, 0]} fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
            <Grid size={{ xs: 12, xl: 5 }}>
              <ChartCard title="Status operacional" subtitle="Metas em andamento e volume de transações">
                <Stack spacing={2.2}>
                  <Stack direction="row" spacing={1.2}>
                    <Chip color="info" label={`${data.activeGoals} metas ativas`} />
                    <Chip color="secondary" label={`${data.latestTransactions.length} últimas transações`} />
                  </Stack>
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={data.transactionsByType} margin={chartMargin}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="type" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} fill={theme.palette.secondary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Stack>
              </ChartCard>
            </Grid>
          </Grid>

          <Grid container spacing={2.4}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
                  <Typography variant="h6">Metas em andamento</Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 2.5 }}>
                    Objetivos próximos do prazo e com maior impacto no fluxo financeiro.
                  </Typography>
                  <Stack spacing={2}>
                    {data.highlightedGoals.length ? (
                      data.highlightedGoals.map((goal) => (
                        <Box
                          key={goal.id}
                          sx={{
                            p: 1.8,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '16px',
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Stack spacing={1.2}>
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                              <Typography variant="subtitle1">{goal.name}</Typography>
                              <Chip
                                color={goal.status === 'OVERDUE' ? 'warning' : 'success'}
                                label={goal.status === 'OVERDUE' ? 'Atrasada' : 'Em andamento'}
                                size="small"
                              />
                            </Stack>
                            <Typography color="text.secondary" variant="body2">
                              {goal.categoryName ? `${goal.categoryName} · ` : ''}
                              Prazo: {formatDate(goal.deadline)}
                            </Typography>
                            <LinearProgress value={Math.min(goal.progressPercentage, 100)} variant="determinate" sx={{ height: 8 }} />
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">{formatCurrency(goal.currentAmount)}</Typography>
                              <Typography color="text.secondary" variant="body2">
                                {formatPercentage(goal.progressPercentage)}
                              </Typography>
                              <Typography variant="body2">{formatCurrency(goal.targetAmount)}</Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      ))
                    ) : (
                      <EmptyState title="Nenhuma meta ativa" description="Cadastre metas para acompanhá-las de perto a partir do dashboard." />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
                  <Typography variant="h6">Últimas transações</Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 2.5 }}>
                    Lançamentos recentes para uma leitura rápida da movimentação.
                  </Typography>
                  <Stack spacing={1.5}>
                    {data.latestTransactions.length ? (
                      data.latestTransactions.map((transaction) => (
                        <Box
                          key={transaction.id}
                          sx={{
                            p: 1.6,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '16px',
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Stack direction="row" spacing={1.4} alignItems="center" minWidth={0}>
                            <IconBadge iconName={transaction.categoryIcon} color={transaction.categoryColor} />
                            <Stack flex={1} minWidth={0}>
                              <Typography variant="subtitle2">{transaction.description}</Typography>
                              <Typography color="text.secondary" variant="body2">
                                {transaction.categoryName} · {formatDate(transaction.transactionDate)}
                              </Typography>
                            </Stack>
                            <Typography color={transaction.type === 'INCOME' ? 'success.main' : 'warning.main'} fontWeight={800} textAlign="right">
                              {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                            </Typography>
                          </Stack>
                        </Box>
                      ))
                    ) : (
                      <EmptyState title="Sem transações recentes" description="Cadastre receitas e despesas para alimentar o histórico da plataforma." />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <EmptyState title="Não foi possível montar o dashboard" description="Tente atualizar a página ou revisar o estado da API." />
      )}
    </Stack>
  );
}
