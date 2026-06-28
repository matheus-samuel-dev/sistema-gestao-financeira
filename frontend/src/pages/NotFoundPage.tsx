import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="sm">
        <Stack spacing={2} textAlign="center" alignItems="center">
          <Typography variant="h2">404</Typography>
          <Typography variant="h5">A página que você tentou abrir não existe.</Typography>
          <Typography color="text.secondary" variant="body1">
            Volte para o painel principal e continue gerenciando suas finanças.
          </Typography>
          <Button component={RouterLink} to="/app/dashboard" startIcon={<ArrowBackRoundedIcon />} variant="contained">
            Ir para o dashboard
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
