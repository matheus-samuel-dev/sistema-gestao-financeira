import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import Grid from '@mui/material/Grid';
import {
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
import { api } from '../api/client';
import { ChartCard } from '../components/ChartCard';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { useToast } from '../contexts/ToastContext';
import type { Category, ReportData, TransactionType } from '../types/models';
import { getErrorMessage } from '../utils/apiError';
import { formatCompactCurrency, formatCurrency, formatDate } from '../utils/formatters';

interface ReportFilters {
  month: string;
  year: string;
  type: '' | TransactionType;
  categoryId: string;
  startDate: string;
  endDate: string;
}

const monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1));
const financialChartMargin = { top: 16, right: 24, left: 18, bottom: 6 };

const getChartNumber = (value: unknown) => {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  const numericValue = Number(normalizedValue);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatAxisCurrency = (value: unknown) => formatCompactCurrency(getChartNumber(value));
const formatTooltipCurrency = (value: unknown) => formatCurrency(getChartNumber(value));

export function ReportsPage() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    type: '',
    categoryId: '',
    startDate: '',
    endDate: '',
  });

  const reportParams = useMemo(
    () => ({
      month: filters.month || undefined,
      year: filters.year || undefined,
      type: filters.type || undefined,
      categoryId: filters.categoryId || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    }),
    [filters],
  );

  const fetchData = useCallback(async () => {
    try {
      const [categoriesResponse, reportResponse] = await Promise.all([
        api.get<Category[]>('/categories', { params: { activeOnly: true } }),
        api.get<ReportData>('/reports', {
          params: reportParams,
        }),
      ]);
      setCategories(categoriesResponse.data);
      setReport(reportResponse.data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível carregar os relatórios.'), 'error');
    }
  }, [reportParams, showToast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const periodLabel = useMemo(
    () => filters.startDate && filters.endDate
      ? `${formatDate(filters.startDate)} até ${formatDate(filters.endDate)}`
      : `${filters.month || '--'}/${filters.year || '--'}`,
    [filters.endDate, filters.month, filters.startDate, filters.year],
  );

  const handleExportExcel = useCallback(async () => {
    if (!report) {
      return;
    }
    const { exportReportExcel } = await import('../utils/exporters');
    exportReportExcel(report);
  }, [report]);

  const handleExportPdf = useCallback(async () => {
    if (!report) {
      return;
    }
    const { exportReportPdf } = await import('../utils/exporters');
    exportReportPdf(report, periodLabel);
  }, [periodLabel, report]);

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="Relatórios"
        description="Resumos por período, comparativos mensais, ranking de despesas e exportações prontas para compartilhar."
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
            <Button disabled={!report} startIcon={<DownloadRoundedIcon />} variant="outlined" onClick={() => void handleExportExcel()}>
              Exportar Excel
            </Button>
            <Button
              disabled={!report}
              startIcon={<DownloadRoundedIcon />}
              variant="contained"
              onClick={() => void handleExportPdf()}
            >
              Exportar PDF
            </Button>
          </Stack>
        }
      />

      <Card>
        <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
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
              <TextField fullWidth label="Ano" value={filters.year} onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Tipo"
                select
                value={filters.type}
                onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as ReportFilters['type'] }))}
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
          </Grid>
        </CardContent>
      </Card>

      {report ? (
        <>
          <Grid container spacing={2.4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <StatCard label="Receitas" value={formatCurrency(report.totalIncome)} helper="Entradas acumuladas no período" highlight={theme.palette.success.main} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <StatCard
                label="Despesas"
                value={formatCurrency(report.totalExpense)}
                helper="Saídas somadas no período"
                highlight={theme.palette.warning.main}
                positive={false}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <StatCard
                label="Saldo líquido"
                value={formatCurrency(report.netBalance)}
                helper="Diferença entre receitas e despesas"
                highlight={theme.palette.primary.main}
                positive={report.netBalance >= 0}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.4}>
            <Grid size={{ xs: 12, xl: 7 }}>
              <ChartCard title="Comparação entre meses" subtitle="Receitas, despesas e saldo ao longo do período">
                <ResponsiveContainer width="100%" height={248}>
                  <BarChart data={report.monthlyComparison} margin={financialChartMargin}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} tickMargin={8} />
                    <YAxis
                      stroke={theme.palette.text.secondary}
                      tickFormatter={formatAxisCurrency}
                      tickMargin={8}
                      width={92}
                    />
                    <Tooltip formatter={formatTooltipCurrency} />
                    <Legend wrapperStyle={{ paddingTop: 8 }} />
                    <Bar dataKey="income" fill={theme.palette.success.main} radius={[8, 8, 0, 0]} name="Receitas" />
                    <Bar dataKey="expense" fill={theme.palette.warning.main} radius={[8, 8, 0, 0]} name="Despesas" />
                    <Bar dataKey="net" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} name="Saldo" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
            <Grid size={{ xs: 12, xl: 5 }}>
              <ChartCard title="Despesas por categoria" subtitle="Onde o caixa está sendo mais pressionado">
                {report.expenseByCategory.length ? (
                  <ResponsiveContainer width="100%" height={248}>
                    <PieChart>
                      <Pie data={report.expenseByCategory} dataKey="total" nameKey="category" innerRadius={68} outerRadius={98}>
                        {report.expenseByCategory.map((entry) => (
                          <Cell key={entry.category} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="Sem despesas no período" description="Ajuste o filtro ou registre despesas para visualizar a distribuição." />
                )}
              </ChartCard>
            </Grid>
          </Grid>

          <Card>
            <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
              <Typography variant="h6">Ranking de maiores despesas</Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2.2 }}>
                Principais saídas financeiras consideradas no relatório atual.
              </Typography>
              {report.topExpenses.length ? (
                <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.topExpenses.map((expense) => (
                      <TableRow key={expense.id} hover>
                        <TableCell sx={{ minWidth: 240 }}>{expense.description}</TableCell>
                        <TableCell sx={{ minWidth: 140 }}>{expense.categoryName}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(expense.transactionDate)}</TableCell>
                        <TableCell sx={{ color: 'warning.main', fontWeight: 800, whiteSpace: 'nowrap' }}>{formatCurrency(expense.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </TableContainer>
              ) : (
                <EmptyState title="Sem despesas ranqueadas" description="O ranking aparecerá aqui assim que houver despesas filtradas no período." />
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState title="Relatório indisponível" description="Verifique os filtros escolhidos e tente novamente." />
      )}
    </Stack>
  );
}
