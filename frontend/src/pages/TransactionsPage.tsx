import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Grid from '@mui/material/Grid';
import {
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { TransactionFormDialog } from '../components/forms/TransactionFormDialog';
import { IconBadge } from '../components/IconBadge';
import { SectionHeader } from '../components/SectionHeader';
import { useToast } from '../contexts/ToastContext';
import type { Category, PaginatedResponse, Transaction, TransactionPayload, TransactionStatus, TransactionType } from '../types/models';
import { getErrorMessage } from '../utils/apiError';
import { formatCurrency, formatDate } from '../utils/formatters';
import { transactionStatusLabels, transactionTypeLabels } from '../utils/labels';

interface TransactionFilters {
  search: string;
  type: '' | TransactionType;
  categoryId: string;
  month: string;
  year: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  status: '' | TransactionStatus;
}

export function TransactionsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<PaginatedResponse<Transaction> | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: '',
    categoryId: '',
    month: '',
    year: String(new Date().getFullYear()),
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    status: '',
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Transaction | null>(null);

  const transactionParams = useMemo(
    () => ({
      search: filters.search || undefined,
      type: filters.type || undefined,
      categoryId: filters.categoryId || undefined,
      month: filters.month || undefined,
      year: filters.year || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      minAmount: filters.minAmount || undefined,
      maxAmount: filters.maxAmount || undefined,
      status: filters.status || undefined,
      page: page - 1,
      size: 10,
      sortBy: 'transactionDate',
      sortDirection: 'desc',
    }),
    [filters, page],
  );

  const fetchCategories = useCallback(async () => {
    const response = await api.get<Category[]>('/categories');
    setCategories(response.data);
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<PaginatedResponse<Transaction>>('/transactions', {
        params: transactionParams,
      });
      setTransactions(response.data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível carregar as transações.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, transactionParams]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  async function handleSubmit(payload: TransactionPayload) {
    try {
      if (editing) {
        await api.put(`/transactions/${editing.id}`, payload);
        showToast('Transação atualizada com sucesso.');
      } else {
        await api.post('/transactions', payload);
        showToast('Transação criada com sucesso.');
      }
      setEditing(null);
      setPage(1);
      await fetchTransactions();
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível salvar a transação.'), 'error');
      throw error;
    }
  }

  async function handleDelete() {
    if (!deleteCandidate) {
      return;
    }
    try {
      await api.delete(`/transactions/${deleteCandidate.id}`);
      showToast('Transação removida com sucesso.');
      setDeleteCandidate(null);
      await fetchTransactions();
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível excluir a transação.'), 'error');
    }
  }

  const currentRows = useMemo(() => transactions?.content ?? [], [transactions]);
  const periodLabel = useMemo(
    () => filters.startDate && filters.endDate
      ? `${formatDate(filters.startDate)} até ${formatDate(filters.endDate)}`
      : 'Período atual',
    [filters.endDate, filters.startDate],
  );

  const fetchRowsForExport = useCallback(async () => {
    const response = await api.get<PaginatedResponse<Transaction>>('/transactions', {
      params: {
        ...transactionParams,
        page: 0,
        size: 3000,
      },
    });

    return response.data.content;
  }, [transactionParams]);

  const handleExportExcel = useCallback(async () => {
    const { exportTransactionsExcel } = await import('../utils/exporters');
    try {
      await exportTransactionsExcel(await fetchRowsForExport());
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível exportar as transações.'), 'error');
    }
  }, [fetchRowsForExport, showToast]);

  const handleExportPdf = useCallback(async () => {
    const { exportTransactionsPdf } = await import('../utils/exporters');
    try {
      await exportTransactionsPdf(await fetchRowsForExport(), 'Relatório de Transações', periodLabel);
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível exportar as transações.'), 'error');
    }
  }, [fetchRowsForExport, periodLabel, showToast]);

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="Transações"
        description="Controle central de receitas e despesas com busca, filtros, recorrência, edição e exclusão."
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
            <Button startIcon={<DownloadRoundedIcon />} variant="outlined" onClick={() => void handleExportExcel()}>
              Exportar Excel
            </Button>
            <Button
              startIcon={<DownloadRoundedIcon />}
              variant="outlined"
              onClick={() => void handleExportPdf()}
            >
              Exportar PDF
            </Button>
            <Button startIcon={<AddRoundedIcon />} variant="contained" onClick={() => setDialogOpen(true)}>
              Nova transação
            </Button>
          </Stack>
        }
      />

      <Card>
        <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Buscar por descrição"
                value={filters.search}
                onChange={(event) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, search: event.target.value }));
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                select
                label="Tipo"
                value={filters.type}
                onChange={(event) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, type: event.target.value as TransactionFilters['type'] }));
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="INCOME">Receitas</MenuItem>
                <MenuItem value="EXPENSE">Despesas</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Categoria"
                value={filters.categoryId}
                onChange={(event) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, categoryId: event.target.value }));
                }}
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
                select
                label="Status"
                value={filters.status}
                onChange={(event) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, status: event.target.value as TransactionFilters['status'] }));
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="CONFIRMED">Confirmada</MenuItem>
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="CANCELED">Cancelada</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Valor mínimo"
                type="number"
                value={filters.minAmount}
                onChange={(event) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, minAmount: event.target.value }));
                }}
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Valor máximo"
                type="number"
                value={filters.maxAmount}
                onChange={(event) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, maxAmount: event.target.value }));
                }}
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Stack p={3}>
              <Typography color="text.secondary">Carregando transações...</Typography>
            </Stack>
          ) : currentRows.length ? (
            isMobile ? (
              <Stack spacing={1.4} p={2}>
                {currentRows.map((transaction) => (
                  <Card key={transaction.id} sx={{ p: 1.8 }}>
                    <Stack spacing={1.4}>
                      <Stack direction="row" spacing={1.3} alignItems="center" minWidth={0}>
                        <IconBadge iconName={transaction.categoryIcon} color={transaction.categoryColor} />
                        <Stack flex={1} minWidth={0}>
                          <Typography variant="subtitle1">{transaction.description}</Typography>
                          <Typography color="text.secondary" variant="body2">
                            {transaction.categoryName} · {formatDate(transaction.transactionDate)}
                          </Typography>
                        </Stack>
                        <Chip
                          color={transaction.type === 'INCOME' ? 'success' : 'warning'}
                          label={transactionTypeLabels[transaction.type]}
                          size="small"
                        />
                      </Stack>
                      <Typography fontWeight={700}>
                        {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                          onClick={() => {
                            setEditing(transaction);
                            setDialogOpen(true);
                          }}
                          size="small"
                          startIcon={<EditRoundedIcon />}
                          variant="outlined"
                        >
                          Editar
                        </Button>
                        <Button color="error" onClick={() => setDeleteCandidate(transaction)} size="small" startIcon={<DeleteOutlineRoundedIcon />} variant="outlined">
                          Excluir
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <TableContainer sx={{ maxHeight: { md: 560 }, overflowX: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Forma</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRows.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell sx={{ minWidth: 260 }}>
                        <Stack direction="row" spacing={1.2} alignItems="center" minWidth={0}>
                          <IconBadge iconName={transaction.categoryIcon} color={transaction.categoryColor} size={34} />
                          <Stack minWidth={0}>
                            <Typography variant="subtitle2">{transaction.description}</Typography>
                            <Typography color="text.secondary" variant="caption">
                              {transactionTypeLabels[transaction.type]}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ minWidth: 140 }}>{transaction.categoryName}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(transaction.transactionDate)}</TableCell>
                      <TableCell sx={{ minWidth: 130 }}>{transaction.paymentMethod}</TableCell>
                      <TableCell sx={{ color: transaction.type === 'INCOME' ? 'success.main' : 'warning.main', fontWeight: 700 }}>
                        {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{transactionStatusLabels[transaction.status]}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar transação">
                          <IconButton
                            aria-label={`Editar ${transaction.description}`}
                            size="small"
                            onClick={() => {
                              setEditing(transaction);
                              setDialogOpen(true);
                            }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir transação">
                          <IconButton aria-label={`Excluir ${transaction.description}`} color="error" size="small" onClick={() => setDeleteCandidate(transaction)}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </TableContainer>
            )
          ) : (
            <Stack p={3}>
              <EmptyState
                title="Nenhuma transação encontrada"
                description="Ajuste os filtros ou crie a primeira receita/despesa para iniciar seu histórico financeiro."
              />
            </Stack>
          )}
        </CardContent>
      </Card>

      {transactions && transactions.totalPages > 1 && (
        <Stack alignItems="center">
          <Pagination color="primary" count={transactions.totalPages} page={page} onChange={(_, nextPage) => setPage(nextPage)} />
        </Stack>
      )}

      <TransactionFormDialog
        open={dialogOpen}
        categories={categories}
        initialData={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteCandidate}
        title="Excluir transação"
        description={`Tem certeza que deseja excluir "${deleteCandidate?.description ?? ''}"?`}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => void handleDelete()}
      />
    </Stack>
  );
}
