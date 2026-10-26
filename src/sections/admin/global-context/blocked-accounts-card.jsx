'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { fNum } from 'src/utils/format-number-fa';

import { useGlobalContext, useUpsertGlobalContext } from 'src/api/admin';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { getErrorText } from '../shared/admin-ui';

// ----------------------------------------------------------------------

/**
 * Editor for the account blocklist (global_context key `blocked_accounts`).
 * Stored as a JSON array of lowercase handles without "@". Posts from these
 * accounts are hidden from every dashboard list, stat and the influencer map.
 */

const KEY = 'blocked_accounts';

const normalize = (h) =>
  String(h ?? '')
    .trim()
    .replace(/^https?:\/\/(www\.)?[^/]+\//i, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '')
    .toLowerCase();

function parseList(value) {
  if (!value?.trim()) return [];
  let items;
  try {
    const parsed = JSON.parse(value);
    items = Array.isArray(parsed) ? parsed : [];
  } catch {
    items = value.split(/[\n,،]+/);
  }
  return [...new Set(items.filter((i) => typeof i === 'string').map(normalize).filter(Boolean))];
}

export function BlockedAccountsCard() {
  const { data: rows = [], isLoading } = useGlobalContext();
  const upsert = useUpsertGlobalContext();

  const stored = rows.find((r) => r.key === KEY)?.value;
  const [list, setList] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    setList(parseList(stored));
  }, [stored]);

  const dirty = JSON.stringify(list) !== JSON.stringify(parseList(stored));

  const add = () => {
    const handles = input.split(/[\s,،]+/).map(normalize).filter(Boolean);
    if (!handles.length) return;
    setList((prev) => [...new Set([...prev, ...handles])]);
    setInput('');
  };

  const save = () => {
    upsert.mutate(
      { key: KEY, value: JSON.stringify(list) },
      {
        onSuccess: () => toast.success('فهرست حساب‌های مسدود ذخیره شد'),
        onError: (e) => toast.error(getErrorText(e, 'خطا در ذخیره فهرست')),
      }
    );
  };

  return (
    <Card variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, mt: 3 }}>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
        <Iconify icon="solar:shield-cross-bold-duotone" width={24} sx={{ color: 'error.main' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          حساب‌های مسدود
        </Typography>
        {!isLoading && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ({fNum(list.length)})
          </Typography>
        )}
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.8 }}>
        پست‌های این حساب‌ها (مثلاً کانال‌های تبلیغاتی یا بی‌ربط) در هیچ فهرست، آمار یا نقشه تأثیرگذاران
        نمایش داده نمی‌شوند. حساب‌هایی که نام آن‌ها شامل proxy، vpn، v2ray، فیلترشکن یا پروکسی است
        خودکار کنار گذاشته می‌شوند. تغییرات حداکثر پس از یک دقیقه اعمال می‌شوند.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="نام کاربری حساب، مثلاً @channel_name"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          slotProps={{ htmlInput: { dir: 'ltr' } }}
        />
        <Button variant="outlined" onClick={add} startIcon={<Iconify icon="eva:plus-fill" />} sx={{ flexShrink: 0 }}>
          افزودن
        </Button>
      </Stack>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, minHeight: 32 }}>
        {list.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            هنوز حسابی مسدود نشده است.
          </Typography>
        ) : (
          list.map((h) => (
            <Chip
              key={h}
              label={`@${h}`}
              size="small"
              onDelete={() => setList((prev) => prev.filter((x) => x !== h))}
              sx={{ direction: 'ltr', fontFamily: 'monospace' }}
            />
          ))
        )}
      </Box>

      <Stack direction="row" justifyContent="flex-end">
        <Button variant="contained" disabled={!dirty || upsert.isPending} onClick={save}>
          {upsert.isPending ? 'در حال ذخیره…' : 'ذخیره فهرست'}
        </Button>
      </Stack>
    </Card>
  );
}
