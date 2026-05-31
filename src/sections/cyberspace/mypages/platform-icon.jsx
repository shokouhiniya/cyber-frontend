'use client';

import Box from '@mui/material/Box';
import { useColorScheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PlatformIcon({ cfg, size = 18, sx }) {
  // Twitter/X has a black icon (#000000) that's invisible in dark mode — use white instead.
  // Hook must run before any early return to satisfy the rules of hooks.
  const { mode } = useColorScheme();

  if (!cfg) return null;

  if (cfg.iconType === 'img') {
    return (
      <Box
        component="img"
        src={cfg.icon}
        alt={cfg.label}
        sx={{ width: size, height: size, objectFit: 'contain', display: 'block', ...sx }}
      />
    );
  }

  const iconColor = cfg.color === '#000000' && mode === 'dark' ? '#FFFFFF' : cfg.color;

  return <Iconify icon={cfg.icon} width={size} sx={{ color: iconColor, ...sx }} />;
}
