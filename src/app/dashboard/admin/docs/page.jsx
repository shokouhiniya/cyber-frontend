'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';

import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';

// ----------------------------------------------------------------------

const BACKEND_URL = CONFIG.serverUrl;

const DOCS = [
  { title: 'معماری سیستم',       titleEn: 'System Architecture',      file: 'SYSTEM_ARCHITECTURE.md',       description: 'ساختار فنی سامانه شامل بک‌اند، فرانت‌اند، پایگاه داده و ماژول‌های ارتباطی', icon: 'solar:server-bold-duotone',          color: '#00A76F' },
  { title: 'امنیت و حریم خصوصی', titleEn: 'Security & Privacy',        file: 'SECURITY_AND_PRIVACY.md',      description: 'رمزنگاری، کنترل دسترسی، حفاظت از داده‌ها و سیاست‌های امنیتی',             icon: 'solar:shield-check-bold-duotone',    color: '#FF5630' },
  { title: 'استقرار و نگهداری',   titleEn: 'Deployment & Maintenance',  file: 'DEPLOYMENT_AND_MAINTENANCE.md', description: 'راهنمای نصب، پیکربندی، پشتیبان‌گیری و عملیات روزمره',                    icon: 'solar:cloud-upload-bold-duotone',    color: '#0088CC' },
  { title: 'بسته‌های استقرار',    titleEn: 'Deployment Packages',       file: 'DEPLOYMENT_PACKAGES.md',       description: 'فهرست کامل بسته‌ها و وابستگی‌های مورد نیاز برای اجرای سامانه',           icon: 'solar:box-bold-duotone',             color: '#FFA94D' },
  { title: 'گزارش آزمون',         titleEn: 'Test Report',               file: 'TEST_REPORT.md',               description: 'نتایج آزمون‌های عملکردی، امنیتی، پایداری و کنترل کیفیت',                 icon: 'solar:checklist-bold-duotone',       color: '#22C55E' },
  { title: 'مشخصات API داده',     titleEn: 'Data API Spec',             file: 'DATA_API_SPEC.md',             description: 'مشخصات فنی اتصال به منابع داده و ساختار درخواست‌ها',                     icon: 'solar:code-bold-duotone',            color: '#8E33FF' },
];

const GUIDES = [
  { title: 'راهنمای کاربر',        file: 'user-guides/01-user-guide.html',        color: '#00B8D9', icon: 'solar:user-bold-duotone' },
  { title: 'راهنمای مدیر کلاینت',  file: 'user-guides/02-client-admin-guide.html', color: '#00A76F', icon: 'solar:shield-user-bold-duotone' },
  { title: 'راهنمای مدیر سیستم',   file: 'user-guides/03-super-admin-guide.html',  color: '#8E33FF', icon: 'solar:settings-bold-duotone' },
];

// ── Shared doc card ───────────────────────────────────────────────────────────

function DocCard({ doc, selected, compact, onSelect, onDownload }) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        p: compact ? 1.5 : 2,
        borderRadius: 2,
        border: `1px solid`,
        borderColor: selected ? doc.color : alpha(doc.color, 0.12),
        cursor: 'pointer',
        transition: 'all 0.15s',
        bgcolor: selected ? alpha(doc.color, 0.06) : 'background.paper',
        '&:hover': { boxShadow: theme.shadows[4], borderColor: alpha(doc.color, 0.4) },
      }}
      onClick={onSelect}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ width: compact ? 32 : 40, height: compact ? 32 : 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(doc.color, 0.1), flexShrink: 0 }}>
          <Iconify icon={doc.icon} width={compact ? 18 : 22} sx={{ color: doc.color }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: compact ? 12 : 13 }}>{doc.title}</Typography>
            <Chip label=".md" size="small" sx={{ height: 16, fontSize: 9, fontWeight: 700, bgcolor: alpha('#607D8B', 0.08), color: 'text.disabled' }} />
          </Stack>
          {!compact && <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>{doc.description}</Typography>}
        </Box>
        {!compact && (
          <Button size="small" variant="outlined"
            startIcon={<Iconify icon="solar:download-bold" width={13} />}
            sx={{ fontSize: 10, height: 26, flexShrink: 0, borderColor: alpha(doc.color, 0.3), color: doc.color }}
            onClick={(e) => { e.stopPropagation(); onDownload(); }}>
            دانلود
          </Button>
        )}
        {compact && selected && <Iconify icon="solar:arrow-left-bold" width={14} sx={{ color: doc.color, flexShrink: 0 }} />}
      </Stack>
    </Card>
  );
}

function GuideCard({ guide, selected, compact, onSelect }) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        p: compact ? 1.5 : 1.75,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: selected ? guide.color : alpha(guide.color, 0.12),
        cursor: 'pointer',
        bgcolor: selected ? alpha(guide.color, 0.06) : 'background.paper',
        transition: 'all 0.15s',
        '&:hover': { bgcolor: alpha(guide.color, 0.04), borderColor: alpha(guide.color, 0.3) },
      }}
      onClick={onSelect}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Iconify icon={guide.icon} width={18} sx={{ color: guide.color, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12, flex: 1 }}>{guide.title}</Typography>
        <Iconify icon="solar:arrow-left-bold" width={14} sx={{ color: selected ? guide.color : 'text.disabled' }} />
      </Stack>
    </Card>
  );
}

// ── Preview pane ──────────────────────────────────────────────────────────────

function PreviewPane({ item, onDownload }) {
  const theme = useTheme();
  if (!item) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', color: 'text.disabled' }}>
        <Iconify icon="solar:document-text-bold-duotone" width={48} sx={{ mb: 1.5, opacity: 0.3 }} />
        <Typography variant="body2">یک سند را از فهرست انتخاب کنید</Typography>
      </Stack>
    );
  }

  const isHtml = item.file.endsWith('.html');
  const url = `${BACKEND_URL}/docs/${item.file}`;

  return (
    <Stack sx={{ height: '100%' }}>
      {/* Preview header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(item.color, 0.1) }}>
          <Iconify icon={item.icon} width={18} sx={{ color: item.color }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>{item.title}</Typography>
          {item.description && <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{item.description}</Typography>}
        </Box>
        <Stack direction="row" spacing={1}>
          {onDownload && (
            <Button size="small" variant="outlined"
              startIcon={<Iconify icon="solar:download-bold" width={13} />}
              sx={{ fontSize: 10, height: 28, borderColor: alpha(item.color, 0.3), color: item.color }}
              onClick={onDownload}>
              دانلود
            </Button>
          )}
          <Button size="small" variant="outlined"
            startIcon={<Iconify icon="solar:square-arrow-right-up-bold" width={13} />}
            sx={{ fontSize: 10, height: 28 }}
            onClick={() => window.open(url, '_blank')}>
            باز کردن
          </Button>
        </Stack>
      </Stack>

      {/* iframe preview */}
      <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
        <iframe
          src={url}
          title={item.title}
          style={{ width: '100%', height: '100%', border: 'none', colorScheme: 'light', background: 'white' }}
        />
      </Box>
    </Stack>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDocsPage() {
  const theme = useTheme();
  const { desktopMode } = useAdminDesktopMode();
  const [selected, setSelected] = useState(DOCS[0]);

  const handleDownload = (file) => window.open(`${BACKEND_URL}/docs/${file}`, '_blank');

  // ── Desktop two-pane ─────────────────────────────────────────────────────────
  if (desktopMode) {
    return (
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        {/* Left pane — document list */}
        <Box sx={{ width: 320, flexShrink: 0, borderLeft: '1px solid', borderColor: 'divider', overflow: 'auto', p: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: 10, letterSpacing: 1, mb: 1.5 }}>
            مستندات فنی
          </Typography>
          <Stack spacing={1} sx={{ mb: 2.5 }}>
            {DOCS.map((doc) => (
              <DocCard
                key={doc.file}
                doc={doc}
                compact
                selected={selected?.file === doc.file}
                onSelect={() => setSelected(doc)}
                onDownload={() => handleDownload(doc.file)}
              />
            ))}
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: 10, letterSpacing: 1, mb: 1.5 }}>
            راهنماهای کاربری
          </Typography>
          <Stack spacing={1}>
            {GUIDES.map((guide) => (
              <GuideCard
                key={guide.file}
                guide={guide}
                compact
                selected={selected?.file === guide.file}
                onSelect={() => setSelected(guide)}
              />
            ))}
          </Stack>
        </Box>

        {/* Right pane — preview */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <PreviewPane
            item={selected}
            onDownload={selected && !selected.file.endsWith('.html') ? () => handleDownload(selected.file) : null}
          />
        </Box>
      </Box>
    );
  }

  // ── Mobile single-column ─────────────────────────────────────────────────────
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.12) }}>
          <Iconify icon="solar:document-text-bold-duotone" width={28} sx={{ color: theme.palette.primary.main }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>مستندات فنی</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>مستندات قراردادی و فنی پروژه — برای دانلود روی هر سند کلیک کنید</Typography>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        {DOCS.map((doc) => (
          <DocCard key={doc.file} doc={doc} onSelect={() => handleDownload(doc.file)} onDownload={() => handleDownload(doc.file)} />
        ))}
      </Stack>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 4, mb: 1.5 }}>راهنماهای کاربری (HTML)</Typography>
      <Stack spacing={1}>
        {GUIDES.map((g) => (
          <GuideCard key={g.file} guide={g} onSelect={() => window.open(`${BACKEND_URL}/docs/${g.file}`, '_blank')} />
        ))}
      </Stack>
    </Container>
  );
}
