'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

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

export function AdminUsersView() {
  const { data: users = [], isLoading } = useAdminUsers();
  const { data: profiles = [] } = useAdminProfiles();
  const deactivate = useDeactivateUser();

  const profileById = useMemo(() => {
    const map = {};
    profiles.forEach((p) => { map[p.id] = p; });
    return map;
  }, [profiles]);

  // Sort by family name (sortName field, or last word of name as fallback)
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

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (u) => {
    setEditing(u);
    setFormOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
      ) : (
        <Stack spacing={1.5}>
          {sorted.map((u) => (
            <Card key={u.id} sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {u.name}
                    </Typography>
                    <Chip size="small" label={ROLE_LABELS[u.role] || u.role} />
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
                          <Chip
                            key={pid}
                            size="small"
                            variant="outlined"
                            label={profileById[pid]?.name || pid}
                          />
                        ))
                      ) : (
                        <Chip size="small" color="warning" label="بدون پروفایل" />
                      )}
                    </Stack>
                  )}
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton onClick={() => openEdit(u)} title="ویرایش">
                    <Iconify icon="solar:pen-bold" width={18} />
                  </IconButton>
                  <IconButton onClick={() => setResetFor(u)} title="تغییر رمز">
                    <Iconify icon="solar:key-bold" width={18} />
                  </IconButton>
                  {u.isActive && (
                    <IconButton
                      onClick={() => {
                        if (window.confirm(`کاربر «${u.name}» غیرفعال شود؟`)) {
                          deactivate.mutate(u.id);
                        }
                      }}
                      title="غیرفعال‌سازی"
                    >
                      <Iconify icon="solar:user-block-bold" width={18} />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <UserFormDialog open={formOpen} user={editing} onClose={() => setFormOpen(false)} />
      <ResetPasswordDialog
        open={!!resetFor}
        user={resetFor}
        onClose={() => setResetFor(null)}
      />
    </Container>
  );
}
