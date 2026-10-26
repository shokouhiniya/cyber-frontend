'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useResetUserPassword } from 'src/api/admin';

import { toast } from 'src/components/snackbar';

import { getErrorText } from '../shared/admin-ui';

// ----------------------------------------------------------------------

export function ResetPasswordDialog({ open, onClose, user }) {
  const reset = useResetUserPassword();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword('');
      setError(null);
      setDone(false);
    }
  }, [open]);

  const submit = async () => {
    setError(null);
    try {
      await reset.mutateAsync({ id: user.id, password });
      setDone(true);
      toast.success('رمز عبور تغییر کرد');
    } catch (e) {
      setError(getErrorText(e, 'خطا در تغییر رمز'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>تغییر رمز کاربر</DialogTitle>
      <DialogContent>
        {done ? (
          <Alert severity="success" sx={{ mt: 1 }}>رمز با موفقیت تغییر کرد.</Alert>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ color: 'text.secondary', fontSize: 14 }}>
              برای کاربر: <strong>{user?.name || user?.username}</strong>
              {user?.username && <Box component="span" sx={{ color: 'text.disabled' }}> (@{user.username})</Box>}
            </Box>
            <TextField
              label="رمز جدید"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              autoFocus
              helperText="حداقل ۶ کاراکتر"
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{done ? 'بستن' : 'انصراف'}</Button>
        {!done && (
          <Button variant="contained" onClick={submit} loading={reset.isPending} disabled={reset.isPending || password.length < 6}>
            ذخیره
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
