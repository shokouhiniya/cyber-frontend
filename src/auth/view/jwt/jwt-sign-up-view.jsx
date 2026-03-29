'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { signUp } from '../../context/jwt';
import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export const SignUpSchema = zod.object({
  firstName: zod.string().min(1, { message: 'نام الزامی است' }),
  lastName: zod.string().min(1, { message: 'نام خانوادگی الزامی است' }),
  email: zod
    .string()
    .min(1, { message: 'ایمیل الزامی است' })
    .email({ message: 'ایمیل معتبر وارد کنید' }),
  password: zod
    .string()
    .min(1, { message: 'رمز عبور الزامی است' })
    .min(6, { message: 'رمز عبور حداقل ۶ کاراکتر باشد' }),
});

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const router = useRouter();
  const showPassword = useBoolean();
  const { checkUserSession } = useAuthContext();
  const [errorMessage, setErrorMessage] = useState('');

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      await checkUserSession?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage(getErrorMessage(error));
    }
  });

  return (
    <>
      <FormHead
        title="ساخت حساب کاربری"
        description={
          <>
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
              وارد شوید
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{ display: 'flex', gap: { xs: 3, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}
          >
            <Field.Text
              name="firstName"
              label="نام"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Field.Text
              name="lastName"
              label="نام خانوادگی"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          <Field.Text
            name="email"
            label="ایمیل"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Field.Text
            name="password"
            label="رمز عبور"
            placeholder="حداقل ۶ کاراکتر"
            type={showPassword.value ? 'text' : 'password'}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showPassword.onToggle} edge="end">
                      <Iconify
                        icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="در حال ثبت‌نام..."
          >
            ثبت‌نام
          </Button>
        </Box>
      </Form>
    </>
  );
}
