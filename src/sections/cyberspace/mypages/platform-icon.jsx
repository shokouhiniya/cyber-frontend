'use client';

import Box from '@mui/material/Box';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Renders either an Iconify icon or a local SVG image depending on
 * the platform config's `iconType` field.
 *
 * Props:
 *   cfg   — platform config object from platformById
 *   size  — icon size in px (default 18)
 *   sx    — MUI sx prop forwarded to the wrapper Box
 */
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

  return <Iconify icon={cfg.icon} width={size} sx={{ color: cfg.color, ...sx }} />;
}
