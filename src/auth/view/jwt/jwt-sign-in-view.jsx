'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { signInWithPassword } from '../../context/jwt';

// ----------------------------------------------------------------------

export const PRODUCT_NAME = 'سامانه رصد فضای مجازی';

export const SignInSchema = zod.object({
  username: zod.string().trim().min(1, { message: 'نام کاربری الزامی است' }),
  password: zod
    .string()
    .min(1, { message: 'رمز عبور الزامی است' })
    .min(6, { message: 'رمز عبور حداقل ۶ کاراکتر باشد' }),
});

/**
 * `src/lib/axios` rejects with the server message as a plain string (e.g. the
 * 429 lockout text «به دلیل تلاش‌های ناموفق متعدد...»); local failures throw an
 * Error. Show either verbatim.
 */
function toSignInError(error) {
  if (typeof error === 'string' && error) return error;
  const msg = getErrorMessage(error);
  if (!msg || msg.startsWith('Unknown error') || msg === 'Access token not found in response') {
    return 'ورود ناموفق بود. لطفاً دوباره تلاش کنید.';
  }
  return msg;
}

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();
  const showPassword = useBoolean();
  const { checkUserSession } = useAuthContext();
  const [errorMessage, setErrorMessage] = useState('');
  // Own submitting flag, always cleared in `finally`, so the button can never
  // stay stuck in its loading/disabled state after a failed attempt.
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: { username: '', password: '' },
  });

  const { handleSubmit, watch } = methods;

  // Clear the server error as soon as the user edits either field.
  useEffect(() => {
    const sub = watch(() => setErrorMessage(''));
    return () => sub.unsubscribe();
  }, [watch]);

  const submit = useCallback(
    async (data) => {
      setSubmitting(true);
      setErrorMessage('');
      try {
        await signInWithPassword({ username: data.username.trim(), password: data.password });
        await checkUserSession?.();
        router.refresh();
      } catch (error) {
        console.error(error);
        setErrorMessage(toSignInError(error));
      } finally {
        setSubmitting(false);
      }
    },
    [checkUserSession, router]
  );

  const onSubmit = handleSubmit(submit);

  return (
    <>
      <Stack spacing={1.5} alignItems="center" sx={{ mb: 4, textAlign: 'center' }}>
        <Box
          sx={(theme) => ({
            width: 56,
            height: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.12),
          })}
        >
          <Iconify icon="solar:shield-keyhole-bold-duotone" width={32} />
        </Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, fontSize: { xs: 22, md: 26 } }}>
          {PRODUCT_NAME}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          برای ورود به {CONFIG.appName}، نام کاربری و رمز عبور خود را وارد کنید.
        </Typography>
      </Stack>

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Box sx={{ gap: 2.5, display: 'flex', flexDirection: 'column' }}>
          <Field.Text
            name="username"
            label="نام کاربری"
            autoFocus
            slotProps={{
              htmlInput: { autoComplete: 'username', dir: 'ltr', autoCapitalize: 'none', spellCheck: false },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:user-bold" width={20} sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Field.Text
            name="password"
            label="رمز عبور"
            type={showPassword.value ? 'text' : 'password'}
            slotProps={{
              htmlInput: { autoComplete: 'current-password', dir: 'ltr' },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:key-bold" width={20} sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showPassword.value ? 'پنهان کردن رمز' : 'نمایش رمز'}>
                      <IconButton
                        onClick={showPassword.onToggle}
                        edge="end"
                        aria-label={showPassword.value ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
                      >
                        <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={submitting}
            sx={{ mt: 0.5 }}
          >
            {submitting ? 'در حال ورود...' : 'ورود'}
          </Button>

          <Typography
            variant="caption"
            component="p"
            sx={{ color: 'text.secondary', textAlign: 'center', fontSize: 12, m: 0 }}
          >
            برای بازیابی رمز عبور با مدیر سامانه تماس بگیرید.
          </Typography>
        </Box>
      </Form>
    </>
  );
}
