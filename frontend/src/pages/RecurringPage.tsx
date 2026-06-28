import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Grid from '@mui/material/Grid';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { RecurringFormDialog } from '../components/forms/RecurringFormDialog';
import { SectionHeader } from '../components/SectionHeader';
import { useToast } from '../contexts/ToastContext';
import type { Category, RecurringPayload, RecurringTransaction } from '../types/models';
import { getErrorMessage } from '../utils/apiError';
import { formatCurrency, formatDate } from '../utils/formatters';
import { recurringFrequencyLabels, transactionTypeLabels } from '../utils/labels';

export function RecurringPage() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [recurringItems, setRecurringItems] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<RecurringTransaction | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [recurringResponse, categoriesResponse] = await Promise.all([
        api.get<RecurringTransaction[]>('/recurring-transactions'),
        api.get<Category[]>('/categories'),
      ]);
      setRecurringItems(recurringResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível carregar as recorrências.'), 'error');
    }
  }, [showToast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  async function handleSubmit(payload: RecurringPayload) {
    try {
      if (editing) {
        await api.put(`/recurring-transactions/${editing.id}`, payload);
        showToast('Recorrência atualizada com sucesso.');
      } else {
        await api.post('/recurring-transactions', payload);
        showToast('Recorrência criada com sucesso.');
      }
      setEditing(null);
      await fetchData();
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível salvar a recorrência.'), 'error');
      throw error;
    }
  }

  async function handleDelete() {
    if (!deleteCandidate) {
      return;
    }
    try {
      await api.delete(`/recurring-transactions/${deleteCandidate.id}`);
      showToast('Recorrência inativada com sucesso.');
      setDeleteCandidate(null);
      await fetchData();
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível inativar a recorrência.'), 'error');
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="Transações Recorrentes"
        description="Automatize compromissos fixos e receitas previsíveis com frequência e próxima execução."
        action={
          <Button startIcon={<AddRoundedIcon />} variant="contained" onClick={() => setDialogOpen(true)}>
            Nova recorrência
          </Button>
        }
      />

      {recurringItems.length ? (
        <Grid container spacing={2}>
          {recurringItems.map((item) => (
            <Grid key={item.id} size={{ xs: 12, md: 6, xl: 4 }}>
              <Card className="interactive-card" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.2 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" spacing={1.4} alignItems="flex-start">
                      <Stack spacing={0.35} minWidth={0}>
                        <Typography variant="subtitle1">{item.description}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {item.categoryName} · {transactionTypeLabels[item.type]}
                        </Typography>
                      </Stack>
                      <Chip color={item.active ? 'success' : 'default'} label={item.active ? 'Ativa' : 'Inativa'} size="small" />
                    </Stack>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 1,
                        borderRadius: '14px',
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        p: 1.2,
                      }}
                    >
                      <Box>
                        <Typography color="text.secondary" variant="caption">
                          Frequência
                        </Typography>
                        <Typography fontWeight={800} variant="body2">
                          {recurringFrequencyLabels[item.frequency]}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography color="text.secondary" variant="caption">
                          Próxima execução
                        </Typography>
                        <Typography fontWeight={800} variant="body2">
                          {formatDate(item.nextExecution)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography color="text.secondary" variant="caption">
                          Início
                        </Typography>
                        <Typography fontWeight={800} variant="body2">
                          {formatDate(item.startDate)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography color="text.secondary" variant="caption">
                          Valor
                        </Typography>
                        <Typography color={item.type === 'INCOME' ? 'success.main' : 'warning.main'} fontWeight={900} variant="body2">
                          {formatCurrency(item.amount)}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={0.4} justifyContent="flex-end">
                      <Tooltip title="Editar recorrência">
                        <IconButton
                          aria-label={`Editar ${item.description}`}
                          size="small"
                          onClick={() => {
                            setEditing(item);
                            setDialogOpen(true);
                          }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Inativar recorrência">
                        <IconButton aria-label={`Inativar ${item.description}`} color="error" size="small" onClick={() => setDeleteCandidate(item)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState title="Sem recorrências cadastradas" description="Cadastre aluguel, salário, internet, assinaturas e outros lançamentos cíclicos." />
      )}

      <RecurringFormDialog
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
        title="Inativar recorrência"
        description={`Deseja inativar "${deleteCandidate?.description ?? ''}"? Históricos já gerados serão preservados.`}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => void handleDelete()}
      />
    </Stack>
  );
}
