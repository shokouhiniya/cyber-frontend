'use client';

import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PostsSearchDialog({ open, onClose, onApply, onClear, filters }) {
  const theme = useTheme();
  const [keyword, setKeyword] = useState(filters?.keyword || '');
  const [username, setUsername] = useState(filters?.username || '');

  const handleApply = () => {
    onApply({ keyword, username });
  };

  const handleClear = () => {
    setKeyword('');
    setUsername('');
    onClear();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5, maxWidth: 380 } }}
    >
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            autoFocus
            placeholder="جستجو با کلمه کلیدی..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-linear" width={20} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />

          <TextField
            fullWidth
            placeholder="جستجو با نام کاربری..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:user-linear" width={20} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />

          <Stack direction="row" spacing={1.5}>
            <IconButton
              onClick={handleClear}
              sx={{
                bgcolor: alpha(theme.palette.grey[500], 0.08),
                '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.16) },
              }}
            >
              <Iconify icon="solar:trash-bin-minimalistic-bold" width={20} />
            </IconButton>
            <IconButton
              onClick={handleApply}
              sx={{
                flex: 1,
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                borderRadius: 1.5,
                '&:hover': { bgcolor: theme.palette.primary.dark },
              }}
            >
              <Iconify icon="solar:check-circle-bold" width={20} />
            </IconButton>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
