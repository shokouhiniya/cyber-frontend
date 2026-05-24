'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import {
  useGlobalContext,
  useDeleteGlobalContext,
  useUpsertGlobalContext,
} from 'src/api/admin';

import { Iconify } from 'src/components/iconify';

import { AdminPageHeader } from '../shared/page-header';

// ----------------------------------------------------------------------

/**
 * Every key saved here becomes available to Promtic prompts as
 * `{{ global_<key> }}`. Lives once across every profile.
 */
export function AdminGlobalContextView() {
  const { data: rows = [], isLoading } = useGlobalContext();
  const upsert = useUpsertGlobalContext();
  const remove = useDeleteGlobalContext();

  const [dialog, setDialog] = useState(null);

  const openNew = () => setDialog({ key: '', value: '', isNew: true });
  const openEdit = (r) => setDialog({ key: r.key, value: r.value ?? '', isNew: false });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <AdminPageHeader
        title="متغیرهای عمومی"
        subtitle="این مقادیر هنگام هر فراخوانی LLM به عنوان {{ global_<key> }} در اختیار پرامپت‌ها قرار می‌گیرند."
        action={
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={openNew}>
            متغیر جدید
          </Button>
        }
      />

      {isLoading ? (
        <Card sx={{ p: 3 }}>در حال بارگذاری...</Card>
      ) : rows.length === 0 ? (
        <Card sx={{ p: 3 }}>هنوز متغیری اضافه نشده.</Card>
      ) : (
        <Stack spacing={1.5}>
          {rows.map((r) => (
            <Card key={r.key} sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" color="primary" label={`global_${r.key}`} sx={{ fontFamily: 'monospace' }} />
                    {r.updatedAt && (
                      <Typography variant="caption" color="text.disabled">
                        آخرین ویرایش: {new Date(r.updatedAt).toLocaleString('fa-IR')}
                      </Typography>
                    )}
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {r.value}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton onClick={() => openEdit(r)} title="ویرایش">
                    <Iconify icon="solar:pen-bold" width={18} />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      if (window.confirm(`متغیر «${r.key}» حذف شود؟`)) {
                        remove.mutate(r.key);
                      }
                    }}
                    title="حذف"
                  >
                    <Iconify icon="solar:trash-bin-2-bold" width={18} />
                  </IconButton>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <ContextDialog
        value={dialog}
        onClose={() => setDialog(null)}
        onSave={async (row) => {
          await upsert.mutateAsync(row);
          setDialog(null);
        }}
        saving={upsert.isPending}
      />
    </Container>
  );
}

// ----------------------------------------------------------------------

function ContextDialog({ value, onClose, onSave, saving }) {
  const [form, setForm] = useState({ key: '', value: '' });

  useEffect(() => {
    if (value) setForm({ key: value.key, value: value.value });
  }, [value]);

  if (!value) return null;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{value.isNew ? 'متغیر جدید' : `ویرایش ${value.key}`}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="کلید (key)"
            value={form.key}
            onChange={(e) => setForm((f) => ({ ...f, key: e.target.value.replace(/[^a-z0-9_]/g, '_') }))}
            disabled={!value.isNew}
            fullWidth
            helperText="حروف کوچک، عدد و زیرخط. در prompt به شکل {{ global_KEY }} در دسترس است."
          />
          <TextField
            label="مقدار"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            multiline
            minRows={5}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button
          variant="contained"
          onClick={() => onSave(form)}
          disabled={saving || !form.key}
        >
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}
