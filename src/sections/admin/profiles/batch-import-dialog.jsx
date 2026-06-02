'use client';

import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';

import axios, { endpoints } from 'src/lib/axios';
import { Iconify } from 'src/components/iconify';
import { useBatchImportProfiles } from 'src/api/admin';

// ── CSV parser ────────────────────────────────────────────────────────────────
// Simple RFC-4180 compliant parser — handles quoted fields with embedded commas
// and newlines, and strips the UTF-8 BOM if present.
function parseCsv(text) {
  const clean = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"' && clean[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n') {
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += ch;
    }
  }
  // Last field/row
  row.push(field);
  if (row.some(f => f !== '')) rows.push(row);

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(cells => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cells[i] ?? ''; });
    return obj;
  }).filter(r => r.name?.trim());
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BatchImportDialog({ open, onClose }) {
  const fileRef = useRef(null);
  const [parsed, setParsed] = useState(null);   // array of row objects from CSV
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [result, setResult] = useState(null);   // { created, skipped, errors }

  const { mutateAsync: batchImport, isPending } = useBatchImportProfiles();

  const reset = () => {
    setParsed(null);
    setFileName('');
    setParseError('');
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError('');
    setParsed(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rows = parseCsv(ev.target.result);
        if (rows.length === 0) {
          setParseError('فایل خالی است یا ستون‌های لازم را ندارد.');
          return;
        }
        if (!rows[0].name) {
          setParseError('ستون name در فایل یافت نشد. مطمئن شوید از قالب صحیح استفاده می‌کنید.');
          return;
        }
        setParsed(rows);
      } catch {
        setParseError('خطا در پردازش فایل CSV.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    if (!parsed?.length) return;
    try {
      const res = await batchImport(parsed);
      setResult(res);
    } catch (err) {
      setParseError(err?.response?.data?.message || err?.message || 'خطای سرور');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(endpoints.admin.profileSampleCsv, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'profiles-import-template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setParseError('خطا در دانلود فایل نمونه.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 15, pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:import-bold-duotone" width={22} sx={{ color: 'primary.main' }} />
          <span>درج دسته‌جمعی پروفایل‌ها</span>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Step 1: Download template */}
          <Box sx={{ p: 2, borderRadius: 1.5, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.neutral' }}>
            <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
              گام اول — دانلود قالب CSV
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
              فایل قالب را دانلود کنید، ردیف‌های جدید اضافه کنید، و همان فایل را آپلود نمایید.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="solar:download-minimalistic-bold" width={15} />}
              onClick={handleDownloadTemplate}
            >
              دانلود نمونه CSV
            </Button>
          </Box>

          {/* Step 2: Upload */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              گام دوم — آپلود فایل CSV
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                variant="contained"
                component="label"
                startIcon={<Iconify icon="solar:upload-bold" width={15} />}
              >
                انتخاب فایل
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {fileName && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1 }}>
                  {fileName}
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Parse error */}
          {parseError && <Alert severity="error" sx={{ fontSize: 12 }}>{parseError}</Alert>}

          {/* Preview */}
          {parsed && !result && (
            <Alert severity="info" sx={{ fontSize: 12 }}>
              <strong>{parsed.length}</strong> ردیف پروفایل شناسایی شد و آماده درج است.
            </Alert>
          )}

          {/* Progress */}
          {isPending && <LinearProgress />}

          {/* Result */}
          {result && (
            <Stack spacing={1}>
              <Alert severity={result.errors?.length > 0 ? 'warning' : 'success'} sx={{ fontSize: 12 }}>
                <strong>{result.created}</strong> پروفایل ایجاد شد،{' '}
                <strong>{result.skipped}</strong> تکراری یا خالی رد شد.
                {result.errors?.length > 0 && (
                  <> · <strong>{result.errors.length}</strong> خطا</>
                )}
              </Alert>
              {result.errors?.length > 0 && (
                <Box sx={{ maxHeight: 150, overflow: 'auto', fontSize: 11, bgcolor: 'background.neutral', p: 1, borderRadius: 1 }}>
                  {result.errors.map((e, i) => (
                    <div key={i}>ردیف {e.row}: <strong>{e.name}</strong> — {e.error}</div>
                  ))}
                </Box>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button size="small" onClick={handleClose} color="inherit">
          {result ? 'بستن' : 'انصراف'}
        </Button>
        {!result && (
          <Button
            size="small"
            variant="contained"
            disabled={!parsed || isPending}
            onClick={handleImport}
            startIcon={<Iconify icon="solar:import-bold" width={15} />}
          >
            درج {parsed ? `(${parsed.length})` : ''}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
