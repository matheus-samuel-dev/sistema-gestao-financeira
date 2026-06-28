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
import type { Category, RecurringPayload, RecurringTransaction } from '../../types/models';
import { toInputDate } from '../../utils/formatters';

const recurringSchema = z.object({
  description: z.string().min(3, 'Informe a descrição.'),
  amount: z.coerce.number().positive('Informe um valor maior que zero.'),
  type: z.enum(['INCOME', 'EXPENSE']),
  paymentMethod: z.string().min(2, 'Informe a forma de pagamento ou recebimento.'),
  note: z.string().optional(),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.string().min(1, 'Informe a data inicial.'),
  endDate: z.string().optional(),
  nextExecution: z.string().min(1, 'Informe a próxima execução.'),
  categoryId: z.coerce.number().positive('Selecione a categoria.'),
});

type RecurringFormInput = z.input<typeof recurringSchema>;
type RecurringFormValues = z.output<typeof recurringSchema>;

interface RecurringFormDialogProps {
  open: boolean;
  categories: Category[];
  loading?: boolean;
  initialData?: RecurringTransaction | null;
  onClose: () => void;
  onSubmit: (payload: RecurringPayload) => Promise<void>;
}

export function RecurringFormDialog({
  open,
  categories,
  loading = false,
  initialData,
  onClose,
  onSubmit,
}: RecurringFormDialogProps) {
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<RecurringFormInput, unknown, RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'EXPENSE',
      paymentMethod: '',
      note: '',
      frequency: 'MONTHLY',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      nextExecution: new Date().toISOString().slice(0, 10),
      categoryId: 0,
    },
  });

  const selectedType = watch('type');
  const typeCategories = useMemo(
    () => categories.filter((category) => category.type === selectedType && category.active),
    [categories, selectedType],
  );

  useEffect(() => {
    if (initialData) {
      reset({
        description: initialData.description,
        amount: initialData.amount,
        type: initialData.type,
        paymentMethod: initialData.paymentMethod,
        note: initialData.note ?? '',
        frequency: initialData.frequency,
        startDate: toInputDate(initialData.startDate),
        endDate: toInputDate(initialData.endDate),
        nextExecution: toInputDate(initialData.nextExecution),
        categoryId: initialData.categoryId,
      });
    } else {
      reset({
        description: '',
        amount: 0,
        type: 'EXPENSE',
        paymentMethod: '',
        note: '',
        frequency: 'MONTHLY',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        nextExecution: new Date().toISOString().slice(0, 10),
        categoryId: typeCategories[0]?.id ?? 0,
      });
    }
  }, [initialData, open, reset, typeCategories]);

  const closeAndReset = () => {
    reset();
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      note: values.note || '',
      endDate: values.endDate || undefined,
    });
    closeAndReset();
  });

  return (
    <Dialog aria-labelledby="recurring-dialog-title" open={open} onClose={closeAndReset} fullWidth maxWidth="md">
      <DialogTitle id="recurring-dialog-title">{initialData ? 'Editar recorrência' : 'Nova recorrência'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                control={control}
                name="description"
                render={({ field }) => <TextField {...field} fullWidth label="Descrição" error={!!errors.description} helperText={errors.description?.message} />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Valor" type="number" error={!!errors.amount} helperText={errors.amount?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Tipo">
                    <MenuItem value="INCOME">Receita</MenuItem>
                    <MenuItem value="EXPENSE">Despesa</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Forma de pagamento/recebimento" error={!!errors.paymentMethod} helperText={errors.paymentMethod?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                control={control}
                name="frequency"
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Frequência">
                    <MenuItem value="WEEKLY">Semanal</MenuItem>
                    <MenuItem value="MONTHLY">Mensal</MenuItem>
                    <MenuItem value="YEARLY">Anual</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Categoria">
                    {typeCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller control={control} name="startDate" render={({ field }) => <TextField {...field} fullWidth label="Início" type="date" InputLabelProps={{ shrink: true }} />} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller control={control} name="nextExecution" render={({ field }) => <TextField {...field} fullWidth label="Próxima execução" type="date" InputLabelProps={{ shrink: true }} />} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller control={control} name="endDate" render={({ field }) => <TextField {...field} fullWidth label="Fim (opcional)" type="date" InputLabelProps={{ shrink: true }} />} />
            </Grid>
            <Grid size={12}>
              <Controller control={control} name="note" render={({ field }) => <TextField {...field} fullWidth label="Observação" multiline minRows={2} />} />
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
