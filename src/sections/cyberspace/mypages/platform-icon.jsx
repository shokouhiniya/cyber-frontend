'use client';

import Box from '@mui/material/Box';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PlatformIcon({ cfg, size = 18, sx }) {
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

  // Twitter/X's brand color is black, invisible in dark mode — use the theme's
  // text color instead (a CSS variable, so it also follows a 'system' scheme).
  const iconColor = cfg.color === '#000000' ? 'text.primary' : cfg.color;

  return <Iconify icon={cfg.icon} width={size} sx={{ color: iconColor, ...sx }} />;
}
