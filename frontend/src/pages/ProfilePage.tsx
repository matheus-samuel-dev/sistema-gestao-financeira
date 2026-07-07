import LockRoundedIcon from '@mui/icons-material/LockRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import Grid from '@mui/material/Grid';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { SectionHeader } from '../components/SectionHeader';
import { financeDataService } from '../services/financeDataService';
import type { AccountType, ThemePreference } from '../types/models';
import { getErrorMessage } from '../utils/apiError';
import { formatDate } from '../utils/formatters';

export function ProfilePage() {
  const theme = useTheme();
  const { user, updateStoredUser } = useAuth();
  const { showToast } = useToast();
  const [profileForm, setProfileForm] = useState({
    name: '',
    accountType: 'PERSONAL',
    themePreference: 'LIGHT',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        accountType: user.accountType,
        themePreference: user.themePreference,
      });
    }
  }, [user]);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const updatedUser = await financeDataService.updateProfile({
        name: profileForm.name,
        accountType: profileForm.accountType as AccountType,
        themePreference: profileForm.themePreference as ThemePreference,
      });
      updateStoredUser(updatedUser);
      showToast('Perfil atualizado com sucesso.');
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível atualizar o perfil.'), 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setSavingPassword(true);
    try {
      await financeDataService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      showToast('Senha alterada com sucesso.');
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível alterar a senha.'), 'error');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHeader
        title="Perfil e preferências"
        description="Atualize informações da conta, tema e segurança de acesso."
      />

      <Grid container spacing={2.4} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.4} height="100%">
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2.6 }}>
                <Stack spacing={2.2} alignItems="center" textAlign="center">
                  <Avatar
                    sx={{
                      width: 74,
                      height: 74,
                      bgcolor: alpha(theme.palette.primary.main, 0.16),
                      color: 'primary.main',
                      fontSize: 28,
                      fontWeight: 900,
                    }}
                  >
                    {user?.name?.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">{user?.name}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                    <Chip label={user?.accountType === 'BUSINESS' ? 'Empresarial' : 'Pessoal'} color="primary" size="small" />
                    <Chip label={user?.themePreference === 'DARK' ? 'Tema escuro' : 'Tema claro'} size="small" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 2.4 }}>
                <Stack spacing={1.4}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.success.main, 0.14), color: 'success.main', borderRadius: '12px' }}>
                      <VerifiedUserRoundedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">Resumo da conta</Typography>
                      <Typography color="text.secondary" variant="body2">
                        Dados principais do acesso
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider />
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Typography color="text.secondary" variant="body2">
                        Criada em
                      </Typography>
                      <Typography fontWeight={800} textAlign="right" variant="body2">
                        {user ? formatDate(user.createdAt.slice(0, 10)) : '--'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Typography color="text.secondary" variant="body2">
                        Tipo
                      </Typography>
                      <Typography fontWeight={800} textAlign="right" variant="body2">
                        {user?.accountType === 'BUSINESS' ? 'Empresarial' : 'Pessoal'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Typography color="text.secondary" variant="body2">
                        Tema salvo
                      </Typography>
                      <Typography fontWeight={800} textAlign="right" variant="body2">
                        {user?.themePreference === 'DARK' ? 'Escuro' : 'Claro'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Grid container spacing={2.4}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent sx={{ p: 2.6 }}>
                  <Stack spacing={2.2}>
                    <Typography variant="h6">Dados principais</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Nome"
                          value={profileForm.name}
                          onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth label="E-mail" value={user?.email ?? ''} disabled />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Tipo de conta"
                          select
                          value={profileForm.accountType}
                          onChange={(event) => setProfileForm((current) => ({ ...current, accountType: event.target.value }))}
                        >
                          <MenuItem value="PERSONAL">Pessoal</MenuItem>
                          <MenuItem value="BUSINESS">Empresarial</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Tema"
                          select
                          value={profileForm.themePreference}
                          onChange={(event) => setProfileForm((current) => ({ ...current, themePreference: event.target.value }))}
                        >
                          <MenuItem value="LIGHT">Claro</MenuItem>
                          <MenuItem value="DARK">Escuro</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                    <Stack direction="row" justifyContent="flex-end">
                      <Button disabled={savingProfile} onClick={() => void saveProfile()} startIcon={<SaveRoundedIcon />} variant="contained">
                        Salvar alterações
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent sx={{ p: 2.6 }}>
                  <Stack spacing={2}>
                    <Stack spacing={0.3}>
                      <Typography variant="h6">Segurança</Typography>
                      <Typography color="text.secondary" variant="body2">
                        Atualize sua senha de acesso.
                      </Typography>
                    </Stack>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                          fullWidth
                          label="Senha atual"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                          fullWidth
                          label="Nova senha"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }} display="flex">
                        <Button
                          fullWidth
                          disabled={savingPassword}
                          onClick={() => void changePassword()}
                          startIcon={<LockRoundedIcon />}
                          variant="outlined"
                        >
                          Alterar
                        </Button>
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Stack>
  );
}
