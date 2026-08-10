'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import axios, { endpoints } from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ChangePasswordDialog({ open, onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setForm({ current: '', next: '', confirm: '' });
    setShow({ current: false, next: false, confirm: false });
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError('');

    if (form.next.length < 6) {
      setError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد');
      return;
    }
    if (form.next !== form.confirm) {
      setError('تأیید رمز عبور با رمز جدید مطابقت ندارد');
      return;
    }
    if (form.current === form.next) {
      setError('رمز عبور جدید باید با رمز فعلی متفاوت باشد');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(endpoints.auth.changePassword, {
        currentPassword: form.current,
        newPassword: form.next,
      });
      setSuccess(true);
      setTimeout(() => handleClose(), 1500);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'خطا در تغییر رمز عبور');
    } finally {
      setSubmitting(false);
    }
  };

  const passwordField = (key, label) => (
    <TextField
      label={label}
      value={form[key]}
      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      type={show[key] ? 'text' : 'password'}
      fullWidth
      size="small"
      disabled={submitting || success}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
                edge="end"
              >
                <Iconify icon={show[key] ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={18} />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        تغییر رمز عبور
        <IconButton
          onClick={handleClose}
          disabled={submitting}
          sx={{ position: 'absolute', left: 8, top: 8 }}
        >
          <Iconify icon="solar:close-circle-bold" width={22} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {success ? (
            <Alert severity="success">رمز عبور با موفقیت تغییر کرد.</Alert>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary">
                برای تغییر رمز عبور، رمز فعلی و رمز جدید را وارد کنید. رمز جدید حداقل ۶ کاراکتر باشد.
              </Typography>

              {passwordField('current', 'رمز عبور فعلی')}
              {passwordField('next', 'رمز عبور جدید')}
              {passwordField('confirm', 'تکرار رمز جدید')}

              {error && <Alert severity="error">{error}</Alert>}

              <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                <Button variant="outlined" onClick={handleClose} disabled={submitting} fullWidth>
                  انصراف
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting || !form.current || !form.next || !form.confirm}
                  fullWidth
                >
                  {submitting ? 'در حال ذخیره...' : 'ذخیره'}
                </Button>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
