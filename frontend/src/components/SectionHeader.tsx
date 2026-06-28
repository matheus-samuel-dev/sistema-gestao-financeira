import { Stack, Typography } from '@mui/material';

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      spacing={2.2}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      sx={{ maxWidth: '100%', minWidth: 0 }}
    >
      <Stack spacing={0.5} minWidth={0} maxWidth={760}>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: 26, md: 30 },
            overflowWrap: 'anywhere',
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" variant="body1">
            {description}
          </Typography>
        )}
      </Stack>
      {action && <Stack sx={{ maxWidth: '100%', minWidth: 0, width: { xs: '100%', md: 'auto' } }}>{action}</Stack>}
    </Stack>
  );
}
