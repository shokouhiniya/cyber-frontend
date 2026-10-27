'use client';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

/**
 * «مرکز پایش و فراداده» logo. The mark (isSingle) or the full lockup with the
 * name; each has a dark-mode file where the teal is swapped for a light tint.
 */
export function Logo({ sx, disabled, className, href = '/', isSingle = true, ...other }) {
  const name = isSingle ? 'payesh-mark' : 'payesh-full';

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="مرکز پایش و فراداده"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 40,
          height: 40,
          ...(!isSingle && { width: 120, height: 40 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <img className="logo-light" alt="مرکز پایش و فراداده" src={`${CONFIG.assetsDir}/logo/${name}.svg`} />
      <img className="logo-dark" alt="" aria-hidden src={`${CONFIG.assetsDir}/logo/${name}-dark.svg`} />
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(({ theme }) => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
  '& img': { width: '100%', height: '100%', objectFit: 'contain' },
  '& .logo-dark': { display: 'none' },
  ...theme.applyStyles('dark', {
    '& .logo-light': { display: 'none' },
    '& .logo-dark': { display: 'block' },
  }),
}));
