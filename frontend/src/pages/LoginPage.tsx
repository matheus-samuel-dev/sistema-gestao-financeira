import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@financeiro.com',
      password: '123456',
    },
  });

  useEffect(() => {
    if (searchParams.get('sessionExpired') === '1') {
      showToast('Sua sessão expirou. Entre novamente para continuar.', 'info');
    }
  }, [searchParams, showToast]);

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
        minHeight: '100svh',
        background:
          'radial-gradient(circle at top left, rgba(14,116,144,0.22), transparent 28%), radial-gradient(circle at bottom right, rgba(249,115,22,0.18), transparent 24%), linear-gradient(180deg, #041420 0%, #0E1726 100%)',
        display: 'flex',
        alignItems: 'center',
        overflowY: 'auto',
        py: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ boxSizing: 'border-box', display: 'flex', justifyContent: 'center', width: '100%', px: { xs: 1.5, sm: 2 } }}>
        <Card
          sx={{
            boxSizing: 'border-box',
            width: '100%',
            maxWidth: 480,
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: { xs: '18px', sm: '24px' },
            boxShadow: '0 28px 70px rgba(2, 12, 27, 0.35)',
          }}
        >
          <Stack spacing={{ xs: 2, sm: 3 }}>
            <Stack spacing={1.2} alignItems="flex-start">
              <Box
                sx={{
                  width: { xs: 46, sm: 54 },
                  height: { xs: 46, sm: 54 },
                  borderRadius: { xs: '14px', sm: '16px' },
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: alpha('#0E7490', 0.14),
                  color: '#0E7490',
                }}
              >
                <AutoGraphRoundedIcon />
              </Box>
              <Typography variant="h4" sx={{ fontSize: { xs: 26, sm: 34 }, lineHeight: 1.12 }}>
                Entrar na sua operação
              </Typography>
              <Typography color="text.secondary" variant="body1" sx={{ fontSize: { xs: 14, sm: 16 }, lineHeight: 1.55 }}>
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
            <Button disabled={isSubmitting} fullWidth onClick={() => void submit()} size="large" variant="contained">
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
      </Box>
    </Box>
  );
}
