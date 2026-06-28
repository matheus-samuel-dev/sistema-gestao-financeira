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
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { GoalFormDialog } from '../components/forms/GoalFormDialog';
import { SectionHeader } from '../components/SectionHeader';
import { useToast } from '../contexts/ToastContext';
import type { Category, Goal, GoalPayload } from '../types/models';
import { getErrorMessage } from '../utils/apiError';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';
import { goalStatusLabels } from '../utils/labels';

export function GoalsPage() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Goal | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [goalsResponse, categoriesResponse] = await Promise.all([
        api.get<Goal[]>('/goals'),
        api.get<Category[]>('/categories'),
      ]);
      setGoals(goalsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível carregar as metas.'), 'error');
    }
  }, [showToast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const summary = useMemo(() => {
    const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const current = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const progress = target > 0 ? (current / target) * 100 : 0;

    return {
      active: goals.filter((goal) => goal.status === 'IN_PROGRESS').length,
      completed: goals.filter((goal) => goal.status === 'COMPLETED').length,
      target,
      progress,
    };
  }, [goals]);

  async function handleSubmit(payload: GoalPayload) {
    try {
      if (editing) {
        await api.put(`/goals/${editing.id}`, payload);
        showToast('Meta atualizada com sucesso.');
      } else {
        await api.post('/goals', payload);
        showToast('Meta criada com sucesso.');
      }
      setEditing(null);
      await fetchData();
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível salvar a meta.'), 'error');
      throw error;
    }
  }

  async function handleDelete() {
    if (!deleteCandidate) {
      return;
    }
    try {
      await api.delete(`/goals/${deleteCandidate.id}`);
      showToast('Meta removida com sucesso.');
      setDeleteCandidate(null);
      await fetchData();
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível excluir a meta.'), 'error');
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="Metas Financeiras"
        description="Acompanhe progresso, prazos e foco de capital com metas que ajudam a tomar decisão."
        action={
          <Button startIcon={<AddRoundedIcon />} variant="contained" onClick={() => setDialogOpen(true)}>
            Nova meta
          </Button>
        }
      />

      {goals.length ? (
        <>
          <Grid container spacing={2}>
            {[
              { label: 'Metas ativas', value: summary.active },
              { label: 'Concluídas', value: summary.completed },
              { label: 'Valor alvo', value: formatCurrency(summary.target) },
              { label: 'Progresso médio', value: formatPercentage(summary.progress) },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography color="text.secondary" fontWeight={700} variant="body2">
                      {item.label}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 0.6 }}>
                      {item.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            {goals.map((goal) => {
              const progress = Math.min(goal.progressPercentage, 100);
              const progressColor = goal.status === 'OVERDUE' ? theme.palette.warning.main : theme.palette.success.main;

              return (
                <Grid key={goal.id} size={{ xs: 12, md: 6, xl: 4 }}>
                  <Card className="interactive-card" sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2.2 }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" spacing={1.4} alignItems="flex-start">
                          <Stack spacing={0.35} minWidth={0}>
                            <Typography variant="subtitle1">{goal.name}</Typography>
                            <Typography color="text.secondary" variant="body2">
                              {goal.categoryName ?? 'Sem categoria'} · Prazo {formatDate(goal.deadline)}
                            </Typography>
                          </Stack>
                          <Chip label={goalStatusLabels[goal.status]} size="small" />
                        </Stack>

                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                            <Typography color="text.secondary" variant="caption">
                              Progresso
                            </Typography>
                            <Typography fontWeight={800} variant="caption">
                              {formatPercentage(goal.progressPercentage)}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            value={progress}
                            variant="determinate"
                            sx={{
                              height: 9,
                              '& .MuiLinearProgress-bar': { bgcolor: progressColor },
                            }}
                          />
                        </Box>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={1.2}
                          sx={{
                            borderRadius: '14px',
                            bgcolor: alpha(theme.palette.primary.main, 0.06),
                            p: 1.2,
                          }}
                        >
                          <Box>
                            <Typography color="text.secondary" variant="caption">
                              Atual
                            </Typography>
                            <Typography fontWeight={800} variant="body2">
                              {formatCurrency(goal.currentAmount)}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography color="text.secondary" variant="caption">
                              Alvo
                            </Typography>
                            <Typography fontWeight={800} variant="body2">
                              {formatCurrency(goal.targetAmount)}
                            </Typography>
                          </Box>
                        </Stack>

                        <Typography color="text.secondary" variant="body2">
                          {goal.description || 'Sem descrição informada.'}
                        </Typography>

                        <Stack direction="row" spacing={0.4} justifyContent="flex-end">
                          <Tooltip title="Editar meta">
                            <IconButton
                              aria-label={`Editar ${goal.name}`}
                              size="small"
                              onClick={() => {
                                setEditing(goal);
                                setDialogOpen(true);
                              }}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir meta">
                            <IconButton aria-label={`Excluir ${goal.name}`} color="error" size="small" onClick={() => setDeleteCandidate(goal)}>
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      ) : (
        <EmptyState title="Nenhuma meta cadastrada" description="Crie metas para acompanhar reserva, expansão, compras e objetivos prioritários." />
      )}

      <GoalFormDialog
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
        title="Excluir meta"
        description={`Tem certeza que deseja excluir a meta "${deleteCandidate?.name ?? ''}"?`}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => void handleDelete()}
      />
    </Stack>
  );
}
