import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  Container,
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

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@financeiro.com',
      password: '123456',
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await login(values);
      showToast('Login realizado com sucesso.');
      navigate('/app/dashboard');
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível entrar na plataforma.'), 'error');
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
                  bgcolor: alpha('#0E7490', 0.14),
                  color: '#0E7490',
                }}
              >
                <AutoGraphRoundedIcon />
              </Box>
              <Typography variant="h4">Entrar na sua operação</Typography>
              <Typography color="text.secondary" variant="body1">
                Use a conta demo ou acesse seu ambiente privado para controlar fluxo de caixa, metas e relatórios.
              </Typography>
            </Stack>
            <Stack spacing={2}>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <TextField {...field} fullWidth label="E-mail" error={!!errors.email} helperText={errors.email?.message} />
                )}
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
            </Stack>
            <Button disabled={isSubmitting} onClick={() => void submit()} size="large" variant="contained">
              Entrar
            </Button>
            <Typography color="text.secondary" variant="body2">
              Ainda não tem conta?{' '}
              <Typography component={RouterLink} sx={{ color: 'primary.main', fontWeight: 700 }} to="/cadastro" variant="inherit">
                Criar cadastro
              </Typography>
            </Typography>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
