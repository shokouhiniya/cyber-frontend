'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import axios from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ImportView() {
  const theme = useTheme();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped?.type === 'application/json') setFile(dropped);
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/import/json', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setResult(res.data);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'خطا در آپلود فایل');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>ایمپورت داده</Typography>

        {/* Drop zone */}
        <Card
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 2.5,
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.08) },
          }}
          onClick={() => document.getElementById('import-file-input')?.click()}
        >
          <input id="import-file-input" type="file" accept=".json" hidden onChange={handleFileChange} />
          <Iconify icon="solar:cloud-upload-bold-duotone" width={64} sx={{ color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            فایل JSON را اینجا بکشید یا کلیک کنید
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            حداکثر ۵۰۰ مگابایت - فرمت raymon.json
          </Typography>
        </Card>

        {/* Selected file */}
        {file && (
          <Card sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Iconify icon="solar:file-bold-duotone" width={32} sx={{ color: theme.palette.info.main }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{file.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={uploading}
                startIcon={<Iconify icon="solar:upload-bold" width={20} />}
                loading={uploading}
              >
                شروع ایمپورت
              </Button>
            </Stack>

            {uploading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  {progress}% آپلود شده - لطفاً صبر کنید...
                </Typography>
              </Box>
            )}
          </Card>
        )}

        {/* Result */}
        {result && (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>ایمپورت با موفقیت انجام شد</Typography>
            <Typography variant="body2">
              کل: {result.total?.toLocaleString('fa-IR')} | وارد شده: {result.inserted?.toLocaleString('fa-IR')} | رد شده: {result.skipped?.toLocaleString('fa-IR')}
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        )}
      </Stack>
    </DashboardContent>
  );
}
