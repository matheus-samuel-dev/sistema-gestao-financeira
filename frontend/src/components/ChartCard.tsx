import { Card, CardContent, Stack, Typography } from '@mui/material';
import { memo } from 'react';

export const ChartCard = memo(function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card sx={{ height: '100%', minHeight: 320, overflow: 'visible' }}>
      <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
        <Stack spacing={0.4} mb={2.2} minWidth={0}>
          <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
            {title}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {subtitle}
          </Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
});
