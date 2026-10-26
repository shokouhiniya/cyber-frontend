'use client';

import { useState } from 'react';

import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * `src/lib/axios` rejects with a plain string (the server message). Code that
 * throws locally rejects with an Error. Accept both.
 */
export function getErrorText(error, fallback = 'خطایی رخ داده است') {
  if (!error) return fallback;
  if (typeof error === 'string') return error || fallback;
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

// ----------------------------------------------------------------------

/** Shared table styling: sticky header, hover + zebra rows, compact cells. */
export const adminTableSx = (theme) => ({
  '& .MuiTableCell-root': { fontSize: 13, borderBottomColor: theme.vars.palette.divider },
  '& .MuiTableHead-root .MuiTableCell-root': {
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    color: theme.vars.palette.text.secondary,
    bgcolor: theme.vars.palette.background.neutral,
    py: 1.25,
  },
  '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': {
    bgcolor: alpha(theme.palette.grey[500], 0.04),
  },
  '& .MuiTableBody-root .MuiTableRow-root:hover': {
    bgcolor: alpha(theme.palette.primary.main, 0.06),
  },
  '& .MuiTableBody-root .MuiTableRow-root:last-of-type td': { border: 0 },
});

/** Card + scrollable table container with a sticky header. */
export function AdminTableCard({ children, maxHeight = 'calc(100vh - 260px)', sx }) {
  return (
    <Card sx={[{ overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <TableContainer sx={{ maxHeight, overflowX: 'auto' }}>{children}</TableContainer>
    </Card>
  );
}

// ----------------------------------------------------------------------

/**
 * Kebab menu for row actions.
 * items: [{ label, icon, onClick, color, hidden, divider }]
 */
export function RowActionsMenu({ items, tooltip = 'عملیات', size = 'small' }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const visible = items.filter((it) => !it.hidden);

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          size={size}
          aria-label={tooltip}
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(e.currentTarget);
          }}
        >
          <Iconify icon="eva:more-vertical-fill" width={20} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { minWidth: 180 } } }}
      >
        {visible.map((it, i) => [
          it.divider && i > 0 ? <Divider key={`d-${it.label}`} sx={{ borderStyle: 'dashed' }} /> : null,
          <MenuItem
            key={it.label}
            disabled={it.disabled}
            onClick={() => {
              setAnchorEl(null);
              it.onClick?.();
            }}
            sx={{ fontSize: 13, gap: 1.25, ...(it.color && { color: `${it.color}.main` }) }}
          >
            {it.icon && <Iconify icon={it.icon} width={18} />}
            {it.label}
          </MenuItem>,
        ])}
      </Menu>
    </>
  );
}

// ----------------------------------------------------------------------

/** Loading skeleton / empty state for admin lists. */
export function AdminListState({ loading, empty, emptyText = 'موردی یافت نشد.', icon, rows = 4 }) {
  if (loading) {
    return (
      <Card sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={44} />
          ))}
        </Stack>
      </Card>
    );
  }
  if (empty) {
    return (
      <Card sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Iconify
          icon={icon || 'solar:inbox-line-bold-duotone'}
          width={44}
          sx={{ color: 'text.disabled', mb: 1.5 }}
        />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {emptyText}
        </Typography>
      </Card>
    );
  }
  return null;
}
