'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
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
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useAdminProfiles, useCreateDataSource, useUpdateDataSource } from 'src/api/admin';

// ----------------------------------------------------------------------

const EMPTY = {
  name: 'هشتک (8tag)',
  type: '8tag',
  profileId: '',
  apiEndpoint: 'https://d1.8tag.ir',
  credentialsJson: '{\n  "username": "",\n  "password": ""\n}',
  paramsJson: '{\n  "source": "telegram",\n  "or": "",\n  "range": "week",\n  "size": 100,\n  "lang": "fa",\n  "forward": "false"\n}',
  scheduleCron: '',
  isActive: true,
};

function safeStringify(obj) {
  try {
    return JSON.stringify(obj ?? {}, null, 2);
  } catch {
    return '{}';
  }
}

function safeParse(text, fallback = {}) {
  try {
    return text.trim() ? JSON.parse(text) : fallback;
  } catch {
    throw new Error('JSON معتبر نیست');
  }
}

export function DataSourceFormDialog({ open, onClose, dataSource }) {
  const { data: profiles = [] } = useAdminProfiles();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);

  const create = useCreateDataSource();
  const update = useUpdateDataSource();

  useEffect(() => {
    if (open) {
      setError(null);
      setForm(
        dataSource
          ? {
              ...EMPTY,
              ...dataSource,
              credentialsJson: safeStringify(dataSource.credentials),
              paramsJson: safeStringify(dataSource.params),
            }
          : EMPTY
      );
    }
  }, [open, dataSource]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    setError(null);
    try {
      const credentials = safeParse(form.credentialsJson);
      const params = safeParse(form.paramsJson);
      const body = {
        name: form.name,
        type: form.type,
        profileId: form.profileId || undefined,
        apiEndpoint: form.apiEndpoint || undefined,
        credentials,
        params,
        scheduleCron: form.scheduleCron || undefined,
        isActive: form.isActive,
      };

      if (dataSource?.id) {
        await update.mutateAsync({ id: dataSource.id, ...body });
      } else {
        await create.mutateAsync(body);
      }
      onClose();
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.message || 'خطا در ذخیره‌سازی');
    }
  };

  const submitting = create.isPending || update.isPending;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{dataSource?.id ? 'ویرایش منبع داده' : 'منبع داده جدید'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="نام"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              fullWidth
              required
              helperText="مثلاً «هشتک (8tag) — قالیباف»"
            />
            <TextField
              label="API Endpoint"
              value={form.apiEndpoint || ''}
              onChange={(e) => set({ apiEndpoint: e.target.value })}
              fullWidth
              helperText="https://d1.8tag.ir"
            />
          </Stack>

          <FormControl fullWidth>
            <InputLabel>پروفایل مربوطه</InputLabel>
            <Select
              value={form.profileId || ''}
              label="پروفایل مربوطه"
              onChange={(e) => set({ profileId: e.target.value })}
            >
              <MenuItem value=""><em>هیچ‌کدام (عمومی)</em></MenuItem>
              {profiles.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="اعتبارات ۸تگ (credentials JSON)"
            value={form.credentialsJson}
            onChange={(e) => set({ credentialsJson: e.target.value })}
            fullWidth
            multiline
            minRows={3}
            slotProps={{ input: { style: { fontFamily: 'monospace', fontSize: 13 } } }}
            helperText='{ "username": "...", "password": "..." }'
          />

          <TextField
            label="پارامترهای جستجو (params JSON)"
            value={form.paramsJson}
            onChange={(e) => set({ paramsJson: e.target.value })}
            fullWidth
            multiline
            minRows={5}
            slotProps={{ input: { style: { fontFamily: 'monospace', fontSize: 13 } } }}
            helperText='source, or/and/not, range, size, lang, forward, sort — همان پارامترهای پنل جستجو'
          />

          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Cron زمان‌بندی (v1: manual)"
              value={form.scheduleCron || ''}
              onChange={(e) => set({ scheduleCron: e.target.value })}
              fullWidth
              placeholder="0 */6 * * *"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!form.isActive}
                  onChange={(e) => set({ isActive: e.target.checked })}
                />
              }
              label="فعال"
            />
          </Stack>

          {error && <Box sx={{ color: 'error.main', fontSize: 13 }}>{error}</Box>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={submit} disabled={submitting || !form.name}>
          {dataSource?.id ? 'ذخیره' : 'ایجاد'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
