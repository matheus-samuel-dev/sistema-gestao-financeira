import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

const highlights = [
  {
    title: 'Dashboard executivo',
    description: 'Indicadores, evolução de saldo e distribuição de gastos para leitura rápida da operação.',
    icon: AutoGraphRoundedIcon,
  },
  {
    title: 'Controle completo',
    description: 'Receitas, despesas, recorrências, categorias e metas em uma experiência consistente.',
    icon: SavingsRoundedIcon,
  },
  {
    title: 'Relatórios prontos',
    description: 'Exportações em PDF e Excel com dados organizados para análise e apresentação.',
    icon: FileDownloadRoundedIcon,
  },
  {
    title: 'Acesso seguro',
    description: 'Sessão autenticada, dados por usuário e preferências persistidas para uso contínuo.',
    icon: LockRoundedIcon,
  },
];

const metricCards = [
  { label: 'Saldo atual', value: 'R$ 48.390', tone: '#10B981' },
  { label: 'Receitas', value: 'R$ 14.000', tone: '#0EA5E9' },
  { label: 'Despesas', value: 'R$ 4.730', tone: '#F97316' },
];

function DashboardMockup() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: { xs: 'auto -120px 24px 28px', md: '112px -86px 42px auto', xl: '96px -20px 42px auto' },
        width: { xs: 520, md: 640, xl: 720 },
        maxWidth: '86vw',
        opacity: { xs: 0.3, md: 0.62, xl: 0.7 },
        transform: { xs: 'rotate(-2deg)', md: 'rotate(-3deg)' },
        transformOrigin: 'center',
      }}
    >
      <Box
        sx={{
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: '28px',
          p: { xs: 2, md: 2.4 },
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.34)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar variant="rounded" sx={{ bgcolor: '#0E7490', borderRadius: '14px' }}>
                <AutoGraphRoundedIcon />
              </Avatar>
              <Box>
                <Typography color="#FFFFFF" fontWeight={800}>
                  Finance Flow Pro
                </Typography>
                <Typography color="rgba(255,255,255,0.64)" variant="body2">
                  Junho de 2026
                </Typography>
              </Box>
            </Stack>
            <Chip label="Operação saudável" sx={{ bgcolor: alpha('#10B981', 0.2), color: '#D1FAE5' }} />
          </Stack>

          <Grid container spacing={1.4}>
            {metricCards.map((item) => (
              <Grid key={item.label} size={{ xs: 4 }}>
                <Box
                  sx={{
                    minHeight: 92,
                    border: `1px solid ${alpha(item.tone, 0.24)}`,
                    borderRadius: '18px',
                    p: 1.6,
                    bgcolor: alpha(item.tone, 0.14),
                  }}
                >
                  <Typography color="rgba(255,255,255,0.68)" variant="caption">
                    {item.label}
                  </Typography>
                  <Typography color="#FFFFFF" fontWeight={800} sx={{ mt: 0.6 }}>
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ borderRadius: '18px', bgcolor: 'rgba(3, 7, 18, 0.42)', p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.4}>
              <Typography color="#FFFFFF" fontWeight={800}>
                Metas financeiras
              </Typography>
              <Typography color="rgba(255,255,255,0.64)" variant="body2">
                74%
              </Typography>
            </Stack>
            <LinearProgress color="success" value={74} variant="determinate" sx={{ height: 9 }} />
            <Grid container spacing={1.2} sx={{ mt: 1.6 }}>
              {['Reserva estratégica', 'Expansão', 'Equipamentos'].map((item, index) => (
                <Grid key={item} size={{ xs: 12, sm: 4 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: index === 1 ? '#F97316' : '#14B8A6' }} />
                    <Typography color="rgba(255,255,255,0.78)" variant="caption">
                      {item}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export function LandingPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F6F8FB' }}>
      <Box
        component="section"
        sx={{
          position: 'relative',
          minHeight: { xs: '86vh', md: '88vh' },
          overflow: 'hidden',
          color: '#FFFFFF',
          background:
            'linear-gradient(135deg, rgba(3, 10, 20, 0.98) 0%, rgba(8, 32, 45, 0.96) 48%, rgba(14, 116, 144, 0.9) 100%)',
        }}
      >
        <DashboardMockup />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 3, md: 4 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar variant="rounded" sx={{ bgcolor: '#0E7490', borderRadius: '14px' }}>
                <AutoGraphRoundedIcon />
              </Avatar>
              <Typography fontWeight={900}>Finance Flow Pro</Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/login" color="inherit" variant="outlined">
                Login
              </Button>
              <Button component={RouterLink} to="/cadastro" color="secondary" variant="contained">
                Criar conta
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={3} sx={{ maxWidth: 760, pt: { xs: 9, md: 13 } }}>
            <Chip
              icon={<BoltRoundedIcon />}
              label="SaaS financeiro full stack"
              sx={{
                alignSelf: 'flex-start',
                bgcolor: alpha('#14B8A6', 0.18),
                color: '#D1FAE5',
                border: '1px solid rgba(209,250,229,0.24)',
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 42, sm: 54, md: 72 },
                maxWidth: 640,
                textShadow: '0 16px 42px rgba(0,0,0,0.25)',
              }}
            >
              Finance Flow Pro
            </Typography>
            <Typography sx={{ color: alpha('#FFFFFF', 0.84), fontSize: { xs: 17, md: 20 }, maxWidth: 610 }}>
              Plataforma para organizar caixa, metas, categorias, recorrências e relatórios com a clareza visual de um
              produto pronto para empresas.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                component={RouterLink}
                to="/cadastro"
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
              >
                Criar conta demo
              </Button>
              <Button component={RouterLink} to="/login" variant="outlined" color="inherit" size="large">
                Ver ambiente
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack spacing={4}>
          <Stack spacing={1} maxWidth={780}>
            <Typography color="primary.main" fontWeight={800} variant="body2">
              VISÃO DE PRODUTO
            </Typography>
            <Typography color="#0F172A" variant="h3">
              Gestão financeira com leitura rápida e acabamento comercial.
            </Typography>
            <Typography color="text.secondary" variant="body1">
              As principais rotinas ficam organizadas em uma interface objetiva, responsiva e preparada para demonstração
              profissional.
            </Typography>
          </Stack>

          <Grid container spacing={2.2}>
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <Grid key={item.title} size={{ xs: 12, md: 6, lg: 3 }}>
                  <Card className="interactive-card" sx={{ p: 2.6, height: '100%' }}>
                    <Stack spacing={1.8}>
                      <Avatar
                        variant="rounded"
                        sx={{ bgcolor: alpha('#0E7490', 0.12), color: '#0E7490', borderRadius: '14px' }}
                      >
                        <Icon />
                      </Avatar>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {item.description}
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Card
            sx={{
              p: { xs: 2.5, md: 3 },
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            }}
          >
            <Grid container spacing={2.4} alignItems="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={1.2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar variant="rounded" sx={{ bgcolor: alpha('#F97316', 0.14), color: '#F97316', borderRadius: '12px' }}>
                      <InsightsRoundedIcon />
                    </Avatar>
                    <Typography variant="h5">Pronto para apresentar</Typography>
                  </Stack>
                  <Typography color="text.secondary">
                    Dashboard, relatórios, metas e transações foram pensados para mostrar domínio técnico sem sacrificar
                    usabilidade.
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Stack divider={<Divider flexItem />} spacing={1.5}>
                  {['Indicadores claros', 'Exportações profissionais', 'Tema claro e escuro'].map((item) => (
                    <Stack key={item} direction="row" spacing={1.2} alignItems="center">
                      <TrendingUpRoundedIcon color="success" fontSize="small" />
                      <Typography fontWeight={700}>{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
