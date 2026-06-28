import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../utils/apiError';

const registerSchema = z.object({
  name: z.string().min(3, 'Informe um nome com ao menos 3 caracteres.'),
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
  accountType: z.enum(['PERSONAL', 'BUSINESS']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      accountType: 'PERSONAL',
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await register(values);
      showToast('Conta criada com sucesso.');
      navigate('/app/dashboard');
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível concluir o cadastro.'), 'error');
    }
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(14,116,144,0.22), transparent 28%), radial-gradient(circle at bottom right, rgba(249,115,22,0.18), transparent 24%), linear-gradient(180deg, #041420 0%, #0E1726 100%)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: '24px', boxShadow: '0 28px 70px rgba(2, 12, 27, 0.35)' }}>
          <Stack spacing={3}>
            <Stack spacing={1.2} alignItems="flex-start">
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: '16px',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: alpha('#F97316', 0.16),
                  color: '#F97316',
                }}
              >
                <AutoGraphRoundedIcon />
              </Box>
              <Typography variant="h4">Criar uma conta elegante e segura</Typography>
              <Typography color="text.secondary" variant="body1">
                Comece com categorias padrão, dados demonstrativos e uma base pronta para uso pessoal ou empresarial.
              </Typography>
            </Stack>
            <Stack spacing={2}>
              <Controller
                control={control}
                name="name"
                render={({ field }) => <TextField {...field} fullWidth label="Nome" error={!!errors.name} helperText={errors.name?.message} />}
              />
              <Controller
                control={control}
                name="email"
                render={({ field }) => <TextField {...field} fullWidth label="E-mail" error={!!errors.email} helperText={errors.email?.message} />}
              />
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Senha"
                    type="password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="accountType"
                render={({ field }) => (
                  <TextField {...field} select fullWidth label="Tipo de conta">
                    <MenuItem value="PERSONAL">Pessoal</MenuItem>
                    <MenuItem value="BUSINESS">Empresarial</MenuItem>
                  </TextField>
                )}
              />
            </Stack>
            <Button disabled={isSubmitting} onClick={() => void submit()} size="large" variant="contained" color="secondary">
              Criar conta
            </Button>
            <Typography color="text.secondary" variant="body2">
              Já possui acesso?{' '}
              <Typography component={RouterLink} sx={{ color: 'primary.main', fontWeight: 700 }} to="/login" variant="inherit">
                Fazer login
              </Typography>
            </Typography>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
