import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import { z } from 'zod';
import type { Category, Goal, GoalPayload } from '../../types/models';
import { toInputDate } from '../../utils/formatters';

const goalSchema = z.object({
  name: z.string().min(3, 'Informe o nome da meta.'),
  targetAmount: z.coerce.number().positive('Informe um valor alvo maior que zero.'),
  currentAmount: z.coerce.number().min(0, 'O valor atual não pode ser negativo.'),
  deadline: z.string().min(1, 'Informe o prazo da meta.'),
  description: z.string().optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELED']),
  categoryId: z.coerce.number().optional(),
});

type GoalFormInput = z.input<typeof goalSchema>;
type GoalFormValues = z.output<typeof goalSchema>;

interface GoalFormDialogProps {
  open: boolean;
  categories: Category[];
  loading?: boolean;
  initialData?: Goal | null;
  onClose: () => void;
  onSubmit: (payload: GoalPayload) => Promise<void>;
}

export function GoalFormDialog({ open, categories, loading = false, initialData, onClose, onSubmit }: GoalFormDialogProps) {
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === 'EXPENSE'),
    [categories],
  );
  const { control, handleSubmit, reset, formState: { errors } } = useForm<GoalFormInput, unknown, GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date().toISOString().slice(0, 10),
      description: '',
      status: 'IN_PROGRESS',
      categoryId: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        targetAmount: initialData.targetAmount,
        currentAmount: initialData.currentAmount,
        deadline: toInputDate(initialData.deadline),
        description: initialData.description ?? '',
        status: initialData.status,
        categoryId: initialData.categoryId ?? undefined,
      });
    } else {
      reset({
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: new Date().toISOString().slice(0, 10),
        description: '',
        status: 'IN_PROGRESS',
        categoryId: undefined,
      });
    }
  }, [initialData, open, reset]);

  const closeAndReset = () => {
    reset();
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      categoryId: values.categoryId || undefined,
    });
    closeAndReset();
  });

  return (
    <Dialog aria-labelledby="goal-dialog-title" open={open} onClose={closeAndReset} fullWidth maxWidth="md">
      <DialogTitle id="goal-dialog-title">{initialData ? 'Editar meta' : 'Nova meta'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                control={control}
                name="name"
                render={({ field }) => <TextField {...field} fullWidth label="Nome da meta" error={!!errors.name} helperText={errors.name?.message} />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                control={control}
                name="targetAmount"
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Valor alvo" type="number" error={!!errors.targetAmount} helperText={errors.targetAmount?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                control={control}
                name="currentAmount"
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Valor atual" type="number" error={!!errors.currentAmount} helperText={errors.currentAmount?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                control={control}
                name="deadline"
                render={({ field }) => <TextField {...field} fullWidth label="Prazo" type="date" InputLabelProps={{ shrink: true }} />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Status">
                    <MenuItem value="IN_PROGRESS">Em andamento</MenuItem>
                    <MenuItem value="COMPLETED">Concluída</MenuItem>
                    <MenuItem value="OVERDUE">Atrasada</MenuItem>
                    <MenuItem value="CANCELED">Cancelada</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Categoria (opcional)">
                    <MenuItem value="">Sem categoria</MenuItem>
                    {expenseCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller control={control} name="description" render={({ field }) => <TextField {...field} fullWidth label="Descrição" multiline minRows={3} />} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={closeAndReset}>
          Cancelar
        </Button>
        <Button disabled={loading} onClick={() => void submit()} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
