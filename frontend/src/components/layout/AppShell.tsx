import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import {
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useColorMode } from '../../theme/ColorModeContext';

const drawerWidth = 252;

const navigationItems = [
  { label: 'Dashboard', path: '/app/dashboard', icon: DashboardRoundedIcon },
  { label: 'Transações', path: '/app/transacoes', icon: ReceiptLongRoundedIcon },
  { label: 'Categorias', path: '/app/categorias', icon: CategoryRoundedIcon },
  { label: 'Metas Financeiras', path: '/app/metas', icon: FlagRoundedIcon },
  { label: 'Recorrências', path: '/app/recorrencias', icon: RepeatRoundedIcon },
  { label: 'Relatórios', path: '/app/relatorios', icon: AutoGraphRoundedIcon },
  { label: 'Perfil', path: '/app/perfil', icon: PersonRoundedIcon },
];

export function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useColorMode();

  const activeItem = useMemo(
    () => navigationItems.find((item) => pathname.startsWith(item.path)) ?? navigationItems[0],
    [pathname],
  );

  const drawerContent = (
    <Stack height="100%" p={{ xs: 2, lg: 2.2 }}>
      <Paper
        sx={{
          p: 2,
          borderRadius: '22px',
          background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(
            theme.palette.secondary.main,
            0.12,
          )})`,
        }}
      >
        <Stack direction="row" spacing={1.4} alignItems="center" minWidth={0}>
          <Avatar
            variant="rounded"
            sx={{ bgcolor: theme.palette.primary.main, width: 42, height: 42, borderRadius: '14px' }}
          >
            <AutoGraphRoundedIcon />
          </Avatar>
          <Box minWidth={0}>
            <Typography variant="h6" sx={{ fontSize: 18 }}>
              Finance Flow Pro
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Gestão financeira
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <List sx={{ mt: 2, display: 'grid', gap: 0.45 }}>
        {navigationItems.map((item) => {
          const selected = pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              sx={{
                borderRadius: '14px',
                px: 1.4,
                py: 1,
                bgcolor: selected ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                color: selected ? 'primary.main' : 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.13),
                  color: 'primary.main',
                },
                '&.Mui-selected:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.17),
                },
              }}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 34 }}>
                <Icon sx={{ fontSize: 21 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: selected ? 800 : 700, lineHeight: 1.25 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box flex={1} />
      <Divider sx={{ mb: 1.6 }} />
      <Paper sx={{ p: 1.6, borderRadius: '18px' }}>
        <Stack direction="row" spacing={1.2} alignItems="center" minWidth={0}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: alpha(theme.palette.primary.main, 0.18),
              color: 'primary.main',
              fontSize: 14,
            }}
          >
            {user?.name?.slice(0, 1).toUpperCase()}
          </Avatar>
          <Box minWidth={0}>
            <Typography noWrap variant="subtitle2">
              {user?.name}
            </Typography>
            <Typography color="text.secondary" noWrap variant="body2">
              {user?.accountType === 'BUSINESS' ? 'Conta empresarial' : 'Conta pessoal'}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.8} sx={{ mt: 1.3 }}>
          <Tooltip title={mode === 'LIGHT' ? 'Usar tema escuro' : 'Usar tema claro'}>
            <IconButton
              aria-label="Alternar tema"
              onClick={toggleMode}
              size="small"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '12px',
              }}
            >
              {mode === 'LIGHT' ? <DarkModeRoundedIcon fontSize="small" /> : <LightModeRoundedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Sair">
            <IconButton
              aria-label="Sair"
              color="error"
              onClick={logout}
              size="small"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '12px',
              }}
            >
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <div className="aurora-bg" />
      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          variant={isDesktop ? 'permanent' : 'temporary'}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          maxWidth: '100vw',
          overflowX: 'hidden',
          width: { xs: '100%', lg: `calc(100% - ${drawerWidth}px)` },
          px: { xs: 2, md: 3, xl: 3.5 },
          pt: { xs: 2, md: 3 },
          pb: { xs: 11, lg: 4 },
        }}
      >
        {!isDesktop && (
          <Box sx={{ display: 'flex', mb: 2 }}>
            <IconButton
              aria-label="Abrir menu"
              onClick={() => setMobileOpen(true)}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.88),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '14px',
                boxShadow: theme.customShadows.floating,
                backdropFilter: 'blur(12px)',
              }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Box>
        )}
        <Box key={pathname} className="app-page" sx={{ minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>

      {!isDesktop && (
        <Paper
          elevation={10}
          sx={{
            position: 'fixed',
            left: 12,
            right: 12,
            bottom: 12,
            borderRadius: '22px',
            overflow: 'hidden',
            zIndex: theme.zIndex.appBar,
          }}
        >
          <BottomNavigation
            showLabels={false}
            value={activeItem.path}
            onChange={(_, value) => navigate(value)}
            sx={{ minHeight: 62 }}
          >
            {navigationItems.slice(0, 5).map((item) => {
              const Icon = item.icon;

              return (
                <BottomNavigationAction
                  aria-label={item.label}
                  key={item.path}
                  icon={<Icon sx={{ fontSize: 22 }} />}
                  value={item.path}
                />
              );
            })}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
