'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { toFaDigits } from 'src/utils/format-number-fa';

import { useAdminUsers, useDeactivateUser } from 'src/api/admin';
import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { UserFormDialog } from './user-form-dialog';
import { AdminPageHeader } from '../shared/page-header';
import { ResetPasswordDialog } from './reset-password-dialog';
import { ROLE_LABELS, useUsersScope } from './use-users-scope';
import {
  getErrorText,
  adminTableSx,
  AdminListState,
  AdminTableCard,
  RowActionsMenu,
} from '../shared/admin-ui';

// ----------------------------------------------------------------------

const ROLE_COLORS = {
  super_admin: 'error',
  client_admin: 'primary',
  client_viewer: 'default',
};

export function AdminUsersView() {
  const { data: users = [], isLoading } = useAdminUsers();
  const { profiles, isSuperAdmin, isSelf } = useUsersScope();
  const deactivate = useDeactivateUser();
  const { desktopMode } = useAdminDesktopMode();

  const profileById = useMemo(() => {
    const map = {};
    profiles.forEach((p) => { map[p.id] = p; });
    return map;
  }, [profiles]);

  const sorted = useMemo(() => {
    const getSortKey = (u) => {
      if (u.sortName) return u.sortName;
      const parts = (u.name || '').trim().split(/\s+/);
      return parts[parts.length - 1] || '';
    };
    return [...users].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b), 'fa'));
  }, [users]);

  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [resetFor, setResetFor] = useState(null);

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (u) => { setEditing(u); setFormOpen(true); };

  const handleDeactivate = (u) => {
    if (!window.confirm(`کاربر «${u.name}» غیرفعال شود؟`)) return;
    deactivate.mutate(u.id, {
      onSuccess: () => toast.success(`کاربر «${u.name}» غیرفعال شد`),
      onError: (e) => toast.error(getErrorText(e, 'خطا در غیرفعال‌سازی کاربر')),
    });
  };

  const rowActions = (u) => (
    <RowActionsMenu
      items={[
        { label: 'ویرایش', icon: 'solar:pen-bold', onClick: () => openEdit(u) },
        { label: 'تغییر رمز عبور', icon: 'solar:key-bold', onClick: () => setResetFor(u) },
        {
          label: 'غیرفعال‌سازی',
          icon: 'solar:user-block-bold',
          color: 'error',
          divider: true,
          // The backend refuses self-deactivation for client admins
          hidden: !u.isActive || (!isSuperAdmin && isSelf(u)),
          onClick: () => handleDeactivate(u),
        },
      ]}
    />
  );

  const userAvatar = (u, size = 36) => (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: 14,
        fontWeight: 700,
        bgcolor: 'primary.lighter',
        color: 'primary.darker',
      }}
    >
      {(u.name || u.username || '?').charAt(0)}
    </Avatar>
  );

  const roleChip = (u) => (
    <Chip
      size="small"
      label={ROLE_LABELS[u.role] || u.role}
      color={ROLE_COLORS[u.role] || 'default'}
      variant="soft"
      sx={{ fontSize: 12, fontWeight: 700 }}
    />
  );

  const statusChip = (u) => (
    <Chip
      size="small"
      label={u.isActive ? 'فعال' : 'غیرفعال'}
      color={u.isActive ? 'success' : 'default'}
      variant="soft"
      sx={{ fontSize: 12 }}
    />
  );

  const profileChips = (u, max = 3) => {
    if (u.role === 'super_admin') {
      return (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12 }}>
          همه پروفایل‌ها
        </Typography>
      );
    }
    if (!u.profileIds?.length) {
      return (
        <Chip size="small" color="warning" variant="soft" label="بدون پروفایل" sx={{ fontSize: 12 }} />
      );
    }
    return (
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {u.profileIds.slice(0, max).map((pid) => (
          <Chip
            key={pid}
            size="small"
            variant="outlined"
            label={profileById[pid]?.name || pid.slice(0, 8)}
            sx={{ fontSize: 12 }}
          />
        ))}
        {u.profileIds.length > max && (
          <Chip size="small" label={`${toFaDigits(u.profileIds.length - max)}+`} sx={{ fontSize: 12 }} />
        )}
      </Stack>
    );
  };

  const subtitleLine = (u) =>
    [u.username ? `@${u.username}` : null, u.email, u.organization].filter(Boolean).join(' · ') ||
    '—';

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <Container maxWidth={desktopMode ? 'xl' : 'lg'} sx={{ py: { xs: 3, md: 4 } }}>
      <AdminPageHeader
        title="مدیریت کاربران"
        subtitle={[
          isSuperAdmin
            ? 'حساب‌ها را ایجاد، به پروفایل‌ها متصل و رمز عبور را مدیریت کنید'
            : 'کاربران سازمان خود و دسترسی آن‌ها به پروفایل‌هایتان را مدیریت کنید',
          users.length
            ? `${toFaDigits(users.length)} کاربر، ${toFaDigits(activeCount)} فعال`
            : null,
        ]
          .filter(Boolean)
          .join(' · ')}
        action={
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={openNew}>
            کاربر جدید
          </Button>
        }
      />

      {isLoading || users.length === 0 ? (
        <AdminListState
          loading={isLoading}
          empty={!isLoading}
          emptyText="هنوز کاربری ثبت نشده است."
          icon="solar:user-bold"
        />
      ) : desktopMode ? (
        /* ── Desktop: table layout ── */
        <AdminTableCard>
          <Table size="small" stickyHeader sx={adminTableSx}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 2.5 }}>کاربر</TableCell>
                <TableCell>نقش</TableCell>
                <TableCell>سازمان</TableCell>
                <TableCell>پروفایل‌ها</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell align="right" sx={{ width: 64 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((u) => (
                <TableRow key={u.id} sx={{ opacity: u.isActive ? 1 : 0.6 }}>
                  <TableCell sx={{ py: 1.25, pl: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {userAvatar(u, 34)}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                          {u.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          component="div"
                          sx={{ color: 'text.secondary', fontSize: 12 }}
                          noWrap
                        >
                          {u.username ? `@${u.username}` : u.email || '—'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{roleChip(u)}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{u.organization || '—'}</TableCell>
                  <TableCell>{profileChips(u)}</TableCell>
                  <TableCell>{statusChip(u)}</TableCell>
                  <TableCell align="right" sx={{ pr: 1.5 }}>
                    {rowActions(u)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminTableCard>
      ) : (
        /* ── Mobile: card layout ── */
        <Stack spacing={1.5}>
          {sorted.map((u) => (
            <Card key={u.id} sx={{ p: 2, opacity: u.isActive ? 1 : 0.7 }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                {userAvatar(u, 40)}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                    {u.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', wordBreak: 'break-word' }}
                  >
                    {subtitleLine(u)}
                  </Typography>
                  <Stack direction="row" sx={{ mt: 1, flexWrap: 'wrap', gap: 0.75 }}>
                    {roleChip(u)}
                    {statusChip(u)}
                  </Stack>
                  <Box sx={{ mt: 1 }}>{profileChips(u, 4)}</Box>
                </Box>
                {rowActions(u)}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <UserFormDialog open={formOpen} user={editing} onClose={() => setFormOpen(false)} />
      <ResetPasswordDialog open={!!resetFor} user={resetFor} onClose={() => setResetFor(null)} />
    </Container>
  );
}
