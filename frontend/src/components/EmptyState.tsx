import InsertChartOutlinedRoundedIcon from '@mui/icons-material/InsertChartOutlinedRounded';
import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { memo } from 'react';

export const EmptyState = memo(function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        border: `1px dashed ${alpha(theme.palette.text.secondary, 0.24)}`,
        borderRadius: '18px',
        p: { xs: 3, md: 4 },
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.18 : 0.58),
      }}
    >
      <Stack alignItems="center" spacing={1.5} textAlign="center">
        <InsertChartOutlinedRoundedIcon color="disabled" sx={{ fontSize: 44 }} />
        <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
          {title}
        </Typography>
        <Typography color="text.secondary" maxWidth={420} variant="body2">
          {description}
        </Typography>
      </Stack>
    </Box>
  );
});
