import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { Card, Chip, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { memo } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  helper: string;
  highlight: string;
  positive?: boolean;
}

export const StatCard = memo(function StatCard({ label, value, helper, highlight, positive = true }: StatCardProps) {
  const theme = useTheme();

  return (
    <Card
      className="interactive-card"
      sx={{
        height: '100%',
        p: { xs: 2.2, md: 2.5 },
        overflow: 'visible',
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.96)}, ${alpha(
          highlight,
          0.08,
        )})`,
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.6} minWidth={0}>
        <Stack spacing={0.9} minWidth={0}>
          <Typography color="text.secondary" fontWeight={700} variant="body2">
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: 24, md: 28 },
              lineHeight: 1.15,
              overflowWrap: 'anywhere',
            }}
          >
            {value}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {helper}
          </Typography>
        </Stack>
        <Chip
          color={positive ? 'success' : 'warning'}
          icon={positive ? <TrendingUpRoundedIcon /> : <TrendingDownRoundedIcon />}
          label={positive ? 'Saudável' : 'Atenção'}
          size="small"
          sx={{
            alignSelf: { xs: 'flex-start', sm: 'flex-start' },
            bgcolor: alpha(positive ? theme.palette.success.main : theme.palette.warning.main, 0.16),
          }}
        />
      </Stack>
    </Card>
  );
});
