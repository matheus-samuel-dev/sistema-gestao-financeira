import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import { z } from 'zod';
import type { Category, Transaction, TransactionPayload } from '../../types/models';
import { toInputDate } from '../../utils/formatters';

const transactionSchema = z.object({
  description: z.string().min(3, 'Informe uma descrição com ao menos 3 caracteres.'),
  amount: z.coerce.number().positive('Informe um valor maior que zero.'),
  type: z.enum(['INCOME', 'EXPENSE']),
  transactionDate: z.string().min(1, 'Informe a data da transação.'),
  paymentMethod: z.string().min(2, 'Informe a forma de pagamento ou recebimento.'),
  note: z.string().optional(),
  categoryId: z.coerce.number().positive('Selecione uma categoria.'),
  recurring: z.boolean(),
  status: z.enum(['CONFIRMED', 'PENDING', 'CANCELED']),
  recurringFrequency: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  recurringStartDate: z.string().optional(),
  recurringEndDate: z.string().optional(),
});

type TransactionFormInput = z.input<typeof transactionSchema>;
type TransactionFormValues = z.output<typeof transactionSchema>;

interface TransactionFormDialogProps {
  open: boolean;
  loading?: boolean;
  categories: Category[];
  initialData?: Transaction | null;
  onClose: () => void;
  onSubmit: (payload: TransactionPayload) => Promise<void>;
}

export function TransactionFormDialog({
  open,
  loading = false,
  categories,
  initialData,
  onClose,
  onSubmit,
}: TransactionFormDialogProps) {
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<TransactionFormInput, unknown, TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'EXPENSE',
      transactionDate: new Date().toISOString().slice(0, 10),
      paymentMethod: '',
      note: '',
      categoryId: 0,
      recurring: false,
      status: 'CONFIRMED',
      recurringFrequency: 'MONTHLY',
      recurringStartDate: new Date().toISOString().slice(0, 10),
      recurringEndDate: '',
    },
  });

  const selectedType = watch('type');
  const recurring = watch('recurring');

  const typeCategories = useMemo(
    () => categories.filter((category) => category.type === selectedType && category.active),
    [categories, selectedType],
  );

  const closeAndReset = () => {
    reset();
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      note: values.note || '',
      recurringFrequency: values.recurring ? values.recurringFrequency : undefined,
      recurringStartDate: values.recurring ? values.recurringStartDate : undefined,
      recurringEndDate: values.recurring && values.recurringEndDate ? values.recurringEndDate : undefined,
    });
    closeAndReset();
  });

  useEffect(() => {
    if (initialData) {
      reset({
        description: initialData.description,
        amount: initialData.amount,
        type: initialData.type,
        transactionDate: toInputDate(initialData.transactionDate),
        paymentMethod: initialData.paymentMethod,
        note: initialData.note ?? '',
        categoryId: initialData.categoryId,
        recurring: initialData.recurring,
        status: initialData.status,
        recurringFrequency: 'MONTHLY',
        recurringStartDate: toInputDate(initialData.transactionDate),
        recurringEndDate: '',
      });
    } else {
      reset({
        description: '',
        amount: 0,
        type: 'EXPENSE',
        transactionDate: new Date().toISOString().slice(0, 10),
        paymentMethod: '',
        note: '',
        categoryId: typeCategories[0]?.id ?? 0,
        recurring: false,
        status: 'CONFIRMED',
        recurringFrequency: 'MONTHLY',
        recurringStartDate: new Date().toISOString().slice(0, 10),
        recurringEndDate: '',
      });
    }
  }, [initialData, open, reset, typeCategories]);

  return (
    <Dialog aria-labelledby="transaction-dialog-title" open={open} onClose={closeAndReset} fullWidth maxWidth="md">
      <DialogTitle id="transaction-dialog-title">{initialData ? 'Editar transação' : 'Nova transação'}</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2.2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Descrição" error={!!errors.description} helperText={errors.description?.message} />
                )}
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
                name="transactionDate"
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Data da transação"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.transactionDate}
                    helperText={errors.transactionDate?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
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
                name="categoryId"
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Categoria"
                    error={!!errors.categoryId}
                    helperText={errors.categoryId?.message}
                  >
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
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Forma de pagamento/recebimento"
                    error={!!errors.paymentMethod}
                    helperText={errors.paymentMethod?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Status">
                    <MenuItem value="CONFIRMED">Confirmada</MenuItem>
                    <MenuItem value="PENDING">Pendente</MenuItem>
                    <MenuItem value="CANCELED">Cancelada</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Controller
                control={control}
                name="note"
                render={({ field }) => <TextField {...field} fullWidth label="Observação" multiline minRows={2} />}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                control={control}
                name="recurring"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                    label="Transação recorrente"
                  />
                )}
              />
            </Grid>
            {recurring && (
              <>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    control={control}
                    name="recurringFrequency"
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
                    name="recurringStartDate"
                    render={({ field }) => (
                      <TextField {...field} fullWidth label="Início da recorrência" type="date" InputLabelProps={{ shrink: true }} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    control={control}
                    name="recurringEndDate"
                    render={({ field }) => (
                      <TextField {...field} fullWidth label="Fim da recorrência" type="date" InputLabelProps={{ shrink: true }} />
                    )}
                  />
                </Grid>
              </>
            )}
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
