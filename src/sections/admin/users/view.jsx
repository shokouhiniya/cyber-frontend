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
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';
import { useAdminUsers, useAdminProfiles, useDeactivateUser } from 'src/api/admin';

import { Iconify } from 'src/components/iconify';

import { UserFormDialog } from './user-form-dialog';
import { AdminPageHeader } from '../shared/page-header';
import { ResetPasswordDialog } from './reset-password-dialog';

// ----------------------------------------------------------------------

const ROLE_LABELS = {
  super_admin: 'مدیرکل',
  client_admin: 'مدیر کلاینت',
  client_viewer: 'بازدیدکننده',
};

const ROLE_COLORS = {
  super_admin: 'error',
  client_admin: 'primary',
  client_viewer: 'default',
};

export function AdminUsersView() {
  const { data: users = [], isLoading } = useAdminUsers();
  const { data: profiles = [] } = useAdminProfiles();
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
    if (window.confirm(`کاربر «${u.name}» غیرفعال شود؟`)) deactivate.mutate(u.id);
  };

  const actionButtons = (u) => (
    <Stack direction="row" spacing={0.5}>
      <IconButton size="small" onClick={() => openEdit(u)} title="ویرایش">
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
      <IconButton size="small" onClick={() => setResetFor(u)} title="تغییر رمز">
        <Iconify icon="solar:key-bold" width={18} />
      </IconButton>
      {u.isActive && (
        <IconButton size="small" onClick={() => handleDeactivate(u)} title="غیرفعال‌سازی">
          <Iconify icon="solar:user-block-bold" width={18} />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <Container maxWidth={desktopMode ? 'xl' : 'lg'} sx={{ py: 4 }}>
      <AdminPageHeader
        title="مدیریت کاربران"
        subtitle="حساب‌ها را ایجاد، به پروفایل‌ها متصل و رمز عبور را مدیریت کنید."
        action={
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={openNew}>
            کاربر جدید
          </Button>
        }
      />

      {isLoading ? (
        <Card sx={{ p: 3 }}>در حال بارگذاری...</Card>
      ) : users.length === 0 ? (
        <Card sx={{ p: 3 }}>کاربری یافت نشد.</Card>
      ) : desktopMode ? (
        /* ── Desktop: table layout ── */
        <Card sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25, pl: 2 }}>کاربر</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25 }}>نقش</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25 }}>پروفایل‌ها</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25 }}>وضعیت</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12, py: 1.25, pr: 2 }}>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sorted.map((u) => (
                  <TableRow key={u.id} hover sx={{ opacity: u.isActive ? 1 : 0.55, '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1, pl: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: 'primary.lighter', color: 'primary.dark' }}>
                          {(u.name || u.username || '?').charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13 }}>{u.name}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                            {u.username ? `@${u.username}` : u.email || '—'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Chip size="small" label={ROLE_LABELS[u.role] || u.role}
                        color={ROLE_COLORS[u.role] || 'default'}
                        sx={{ height: 20, fontSize: 11, fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      {u.role === 'super_admin' ? (
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>همه پروفایل‌ها</Typography>
                      ) : u.profileIds?.length ? (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {u.profileIds.slice(0, 3).map((pid) => (
                            <Chip key={pid} size="small" variant="outlined"
                              label={profileById[pid]?.name || pid.slice(0, 8)}
                              sx={{ height: 18, fontSize: 10 }} />
                          ))}
                          {u.profileIds.length > 3 && (
                            <Chip size="small" label={`+${u.profileIds.length - 3}`} sx={{ height: 18, fontSize: 10 }} />
                          )}
                        </Stack>
                      ) : (
                        <Chip size="small" color="warning" label="بدون پروفایل" sx={{ height: 18, fontSize: 10 }} />
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Chip size="small"
                        label={u.isActive ? 'فعال' : 'غیرفعال'}
                        color={u.isActive ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ height: 18, fontSize: 10 }} />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1, pr: 1.5 }}>
                      {actionButtons(u)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        /* ── Mobile: card layout ── */
        <Stack spacing={1.5}>
          {sorted.map((u) => (
            <Card key={u.id} sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight={700}>{u.name}</Typography>
                    <Chip size="small" label={ROLE_LABELS[u.role] || u.role} color={ROLE_COLORS[u.role] || 'default'} />
                    {!u.isActive && <Chip label="غیرفعال" size="small" color="default" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {u.username && <><strong>@{u.username}</strong>{(u.email || u.organization) ? ' — ' : ''}</>}
                    {u.email}{u.email && u.organization ? ' — ' : ''}{u.organization}
                  </Typography>
                  {u.role !== 'super_admin' && (
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                      {u.profileIds?.length ? (
                        u.profileIds.map((pid) => (
                          <Chip key={pid} size="small" variant="outlined" label={profileById[pid]?.name || pid} />
                        ))
                      ) : (
                        <Chip size="small" color="warning" label="بدون پروفایل" />
                      )}
                    </Stack>
                  )}
                </Box>
                {actionButtons(u)}
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
