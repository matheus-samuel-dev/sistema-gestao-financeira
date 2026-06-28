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
import { useEffect } from 'react';
import { z } from 'zod';
import type { Category, CategoryPayload } from '../../types/models';
import { availableIcons } from '../../utils/iconMap';

const categorySchema = z.object({
  name: z.string().min(2, 'Informe o nome da categoria.'),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Informe uma cor hexadecimal válida.'),
  icon: z.string().min(1, 'Selecione um ícone.'),
  active: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  open: boolean;
  loading?: boolean;
  initialData?: Category | null;
  onClose: () => void;
  onSubmit: (payload: CategoryPayload) => Promise<void>;
}

export function CategoryFormDialog({
  open,
  loading = false,
  initialData,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'EXPENSE',
      color: '#0E7490',
      icon: 'payments',
      active: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        name: '',
        type: 'EXPENSE',
        color: '#0E7490',
        icon: 'payments',
        active: true,
      });
    }
  }, [initialData, open, reset]);

  const closeAndReset = () => {
    reset();
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    closeAndReset();
  });

  return (
    <Dialog aria-labelledby="category-dialog-title" open={open} onClose={closeAndReset} fullWidth maxWidth="sm">
      <DialogTitle id="category-dialog-title">{initialData ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.2} mt={1}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField {...field} fullWidth label="Nome" error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                control={control}
                name="color"
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Cor" type="color" error={!!errors.color} helperText={errors.color?.message} />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                control={control}
                name="icon"
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Ícone">
                    {availableIcons.map((iconName) => (
                      <MenuItem key={iconName} value={iconName}>
                        {iconName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
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
