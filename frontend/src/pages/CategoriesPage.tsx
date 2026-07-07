import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import Grid from '@mui/material/Grid';
import {
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { CategoryFormDialog } from '../components/forms/CategoryFormDialog';
import { IconBadge } from '../components/IconBadge';
import { SectionHeader } from '../components/SectionHeader';
import { useToast } from '../contexts/ToastContext';
import { financeDataService } from '../services/financeDataService';
import type { Category, CategoryPayload } from '../types/models';
import { getErrorMessage } from '../utils/apiError';

export function CategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await financeDataService.listCategories();
      setCategories(data);
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível carregar as categorias.'), 'error');
    }
  }, [showToast]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  async function handleSubmit(payload: CategoryPayload) {
    try {
      if (editing) {
        await financeDataService.updateCategory(editing.id, payload);
        showToast('Categoria atualizada com sucesso.');
      } else {
        await financeDataService.createCategory(payload);
        showToast('Categoria criada com sucesso.');
      }
      setEditing(null);
      await fetchCategories();
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível salvar a categoria.'), 'error');
      throw error;
    }
  }

  async function toggleCategory(category: Category) {
    try {
      await financeDataService.toggleCategoryStatus(category.id, !category.active);
      showToast(category.active ? 'Categoria inativada.' : 'Categoria reativada.');
      await fetchCategories();
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível atualizar o status da categoria.'), 'error');
    }
  }

  async function handleDelete() {
    if (!deleteCandidate) {
      return;
    }
    try {
      await financeDataService.deleteCategory(deleteCandidate.id);
      showToast('Categoria removida com sucesso.');
      setDeleteCandidate(null);
      await fetchCategories();
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível excluir a categoria.'), 'error');
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="Categorias"
        description="Organize receitas e despesas por grupos claros, com cor, ícone e status de uso."
        action={
          <Button startIcon={<AddRoundedIcon />} variant="contained" onClick={() => setDialogOpen(true)}>
            Nova categoria
          </Button>
        }
      />

      {categories.length ? (
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid key={category.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
              <Card className="interactive-card" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" spacing={1.4} alignItems="flex-start">
                      <Stack direction="row" spacing={1.2} alignItems="center" minWidth={0}>
                        <IconBadge iconName={category.icon} color={category.color} />
                        <Stack minWidth={0}>
                          <Typography variant="subtitle1">{category.name}</Typography>
                          <Typography color="text.secondary" variant="body2">
                            {category.type === 'INCOME' ? 'Receita' : 'Despesa'}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Chip color={category.active ? 'success' : 'default'} label={category.active ? 'Ativa' : 'Inativa'} size="small" />
                    </Stack>

                    <Stack direction="row" spacing={1} minHeight={28}>
                      {category.systemDefault && <Chip label="Padrão" size="small" />}
                    </Stack>

                    <Stack direction="row" spacing={0.4} justifyContent="flex-end" alignItems="center">
                      <Tooltip title="Editar categoria">
                        <IconButton
                          aria-label={`Editar ${category.name}`}
                          size="small"
                          onClick={() => {
                            setEditing(category);
                            setDialogOpen(true);
                          }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={category.active ? 'Inativar categoria' : 'Reativar categoria'}>
                        <IconButton aria-label="Alterar status da categoria" size="small" onClick={() => void toggleCategory(category)}>
                          {category.active ? <PauseCircleOutlineRoundedIcon fontSize="small" /> : <PlayCircleOutlineRoundedIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir categoria">
                        <IconButton aria-label={`Excluir ${category.name}`} color="error" size="small" onClick={() => setDeleteCandidate(category)}>
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
        <EmptyState title="Sem categorias" description="Crie categorias personalizadas para refinar a leitura dos seus lançamentos." />
      )}

      <CategoryFormDialog
        open={dialogOpen}
        initialData={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteCandidate}
        title="Excluir categoria"
        description={`Deseja excluir "${deleteCandidate?.name ?? ''}"? Categorias em uso precisam ser apenas inativadas.`}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => void handleDelete()}
      />
    </Stack>
  );
}
