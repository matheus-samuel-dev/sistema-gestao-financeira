import { Avatar } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { memo } from 'react';
import { getIconComponent } from '../utils/iconMap';

export const IconBadge = memo(function IconBadge({ iconName, color, size = 40 }: { iconName: string; color: string; size?: number }) {
  const theme = useTheme();
  const Icon = getIconComponent(iconName);

  return (
    <Avatar
      variant="rounded"
      sx={{
        width: size,
        height: size,
        flex: '0 0 auto',
        borderRadius: size <= 34 ? '10px' : '12px',
        bgcolor: alpha(color || theme.palette.primary.main, 0.16),
        color: color || theme.palette.primary.main,
      }}
    >
      <Icon sx={{ fontSize: size <= 34 ? 18 : 21 }} />
    </Avatar>
  );
});
