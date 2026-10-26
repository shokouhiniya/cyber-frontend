'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useCreateUser, useUpdateUser } from 'src/api/admin';

import { toast } from 'src/components/snackbar';

import { getErrorText } from '../shared/admin-ui';
import { useUsersScope } from './use-users-scope';

// ----------------------------------------------------------------------

const EMPTY = {
  name: '',
  username: '',
  email: '',
  password: '',
  role: 'client_viewer',
  organization: '',
  isActive: true,
  profileIds: [],
};

export function UserFormDialog({ open, onClose, user }) {
  const { profiles, roleOptions, canEditOrganization, isSuperAdmin, isSelf } = useUsersScope();
  // client admins cannot change their own role (backend refuses it)
  const roleLocked = !isSuperAdmin && isSelf(user);

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);

  const create = useCreateUser();
  const update = useUpdateUser();

  useEffect(() => {
    if (open) {
      setError(null);
      setForm(
        user
          ? {
              ...EMPTY,
              name: user.name ?? '',
              username: user.username ?? '',
              email: user.email ?? '',
              password: '',
              role: user.role ?? 'client_admin',
              organization: user.organization ?? '',
              isActive: user.isActive ?? true,
              profileIds: user.profileIds ?? [],
            }
          : EMPTY
      );
    }
  }, [open, user]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const submitting = create.isPending || update.isPending;

  const submit = async () => {
    setError(null);
    try {
      // Organisation is set by the backend for client admins
      const { password, organization, ...rest } = form;
      const body = canEditOrganization ? { ...rest, organization } : rest;
      // An empty email fails the backend's @IsEmail; null means "no email"
      body.email = body.email?.trim() || null;
      if (roleLocked) delete body.role;
      if (user?.id) {
        await update.mutateAsync({ id: user.id, ...body });
      } else {
        await create.mutateAsync({ ...body, password });
      }
      toast.success(user?.id ? 'تغییرات کاربر ذخیره شد' : 'کاربر جدید ایجاد شد');
      onClose();
    } catch (e) {
      const msg = getErrorText(e, 'خطا در ذخیره‌سازی');
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{user?.id ? 'ویرایش کاربر' : 'کاربر جدید'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="نام کامل"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="نام کاربری"
              value={form.username}
              onChange={(e) => set({ username: e.target.value })}
              fullWidth
              required
              helperText="برای ورود به سیستم استفاده می‌شود"
            />
          </Stack>

          <TextField
            label="ایمیل (اختیاری)"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            fullWidth
            type="email"
          />

          {!user?.id && (
            <TextField
              label="رمز عبور اولیه"
              type="text"
              value={form.password}
              onChange={(e) => set({ password: e.target.value })}
              fullWidth
              required
              helperText="کاربر می‌تواند بعداً خودش تغییر دهد"
            />
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth disabled={roleLocked}>
              <InputLabel>نقش</InputLabel>
              <Select
                value={form.role}
                label="نقش"
                onChange={(e) => set({ role: e.target.value })}
              >
                {roleOptions.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {canEditOrganization && (
              <TextField
                label="سازمان"
                value={form.organization}
                onChange={(e) => set({ organization: e.target.value })}
                fullWidth
              />
            )}
          </Stack>

          {form.role !== 'super_admin' && (
            <FormControl fullWidth>
              <InputLabel>پروفایل‌های قابل دسترس</InputLabel>
              <Select
                multiple
                value={form.profileIds || []}
                onChange={(e) => set({ profileIds: e.target.value })}
                input={<OutlinedInput label="پروفایل‌های قابل دسترس" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const p = profiles.find((pp) => pp.id === id);
                      return <Chip key={id} size="small" label={p?.name || id} />;
                    })}
                  </Box>
                )}
              >
                {profiles.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {user?.id && !roleLocked && (
            <FormControlLabel
              control={
                <Switch
                  checked={!!form.isActive}
                  onChange={(e) => set({ isActive: e.target.checked })}
                />
              }
              label="فعال"
            />
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button
          variant="contained"
          onClick={submit}
          loading={submitting}
          disabled={submitting || !form.name || !form.username || (!user?.id && !form.password)}
        >
          {user?.id ? 'ذخیره' : 'ایجاد'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
