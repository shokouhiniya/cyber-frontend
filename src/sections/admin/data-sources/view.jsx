'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';

import {
  useAdminProfiles,
  useAdminDataSources,
  useToggleDataSource,
  useDeleteDataSource,
} from 'src/api/admin';

import { Iconify } from 'src/components/iconify';

import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';
import { EightTagSearchPanel } from './search-panel';
import { AdminPageHeader } from '../shared/page-header';
import { DataSourceFormDialog } from './data-source-form-dialog';

// ----------------------------------------------------------------------

export function AdminDataSourcesView() {
  const theme = useTheme();
  const { desktopMode } = useAdminDesktopMode();
  const { data: profiles = [] } = useAdminProfiles();
  const { data: sources = [], isLoading } = useAdminDataSources();

  const toggle = useToggleDataSource();
  const remove = useDeleteDataSource();

  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  // Profile selected in the picker — seeds the search form
  const [selectedProfileId, setSelectedProfileId] = useState('');

  const profileById = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);
  const selectedProfile = profileById[selectedProfileId] || null;

  // The 8tag source (first one found)
  const eightTagSource = sources.find(
    (s) => s.name?.toLowerCase().includes('8tag') || s.name?.toLowerCase().includes('هشتک'),
  );

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (ds) => { setEditing(ds); setFormOpen(true); };

  return (
    <Container maxWidth={desktopMode ? 'xl' : 'lg'} sx={{ py: 4 }}>
      <AdminPageHeader
        title="پیکربندی ۸تگ"
        subtitle="مدیریت اتصال، فیلترهای جستجو و آزمایش زنده برای هر پروفایل"
        action={
          <Button variant="outlined" size="small" startIcon={<Iconify icon="eva:plus-fill" />} onClick={openNew}>
            منبع جدید
          </Button>
        }
      />

      {/* ── Connection status card + profile picker: side-by-side on desktop ── */}
      {isLoading ? (
        <Card sx={{ p: 3, mb: 2 }}>در حال بارگذاری...</Card>
      ) : !eightTagSource ? (
        <Card sx={{ p: 3, mb: 2, textAlign: 'center' }}>
          <Iconify icon="solar:plug-circle-bold-duotone" width={40} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            هنوز منبع ۸تگ تعریف نشده است.
          </Typography>
          <Button variant="contained" onClick={openNew} startIcon={<Iconify icon="eva:plus-fill" />}>
            افزودن منبع ۸تگ
          </Button>
        </Card>
      ) : (
        <Box sx={desktopMode ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 } : {}}>
          {/* Connection card */}
          <Card sx={{ overflow: 'hidden', ...(desktopMode ? {} : { mb: 2 }) }}>
          {/* Header bar */}
          <Box
            sx={{
              p: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.info.main, 0.06)} 100%)`,
              borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:database-bold-duotone" width={22} sx={{ color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>{eightTagSource.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {eightTagSource.apiEndpoint}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                {/* Active toggle */}
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    {eightTagSource.isActive ? 'فعال' : 'غیرفعال'}
                  </Typography>
                  <Switch
                    size="small"
                    checked={!!eightTagSource.isActive}
                    onChange={(e) => toggle.mutate({ id: eightTagSource.id, isActive: e.target.checked })}
                  />
                </Stack>
                <IconButton size="small" onClick={() => openEdit(eightTagSource)} title="ویرایش">
                  <Iconify icon="solar:pen-bold" width={18} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (window.confirm(`منبع «${eightTagSource.name}» حذف شود؟`)) {
                      remove.mutate(eightTagSource.id);
                    }
                  }}
                  title="حذف"
                >
                  <Iconify icon="solar:trash-bin-2-bold" width={18} />
                </IconButton>
              </Stack>
            </Stack>
          </Box>

          {/* Status row */}
          <Stack direction="row" spacing={2} sx={{ px: 2, py: 1.5, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              icon={<Iconify icon={eightTagSource.isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} width={14} />}
              label={eightTagSource.isActive ? 'متصل' : 'غیرفعال'}
              color={eightTagSource.isActive ? 'success' : 'default'}
              variant="outlined"
            />
            {eightTagSource.lastFetchAt && (
              <Chip
                size="small"
                icon={<Iconify icon="solar:clock-circle-bold" width={14} />}
                label={`آخرین اجرا: ${new Date(eightTagSource.lastFetchAt).toLocaleString('fa-IR')}`}
                variant="outlined"
              />
            )}
            {eightTagSource.lastRunStatus === 'error' && (
              <Chip size="small" color="error" label={`خطا: ${eightTagSource.lastError || 'نامشخص'}`} />
            )}
            {eightTagSource.profileId && (
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={profileById[eightTagSource.profileId]?.name || 'پروفایل'}
              />
            )}
          </Stack>
        </Card>
        {/* Profile picker — second column on desktop, below on mobile */}
        {eightTagSource && (
          <Card sx={{ p: 2, ...(desktopMode ? {} : { mb: 2 }) }}>
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                <Iconify icon="solar:user-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle2" fontWeight={700}>
                جستجو برای پروفایل
              </Typography>
            </Stack>

            <FormControl size="small" sx={{ minWidth: 260, flex: 1 }}>
              <InputLabel>انتخاب پروفایل</InputLabel>
              <Select
                value={selectedProfileId}
                label="انتخاب پروفایل"
                onChange={(e) => setSelectedProfileId(e.target.value)}
              >
                <MenuItem value="">
                  <em>بدون پروفایل (جستجوی آزاد)</em>
                </MenuItem>
                {[...profiles].sort((a, b) => {
                  const ka = a.sortName || (a.name || '').split(/\s+/).pop() || '';
                  const kb = b.sortName || (b.name || '').split(/\s+/).pop() || '';
                  return ka.localeCompare(kb, 'fa');
                }).map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 10, height: 10, borderRadius: '50%',
                          bgcolor: p.primaryColor || 'primary.main', flexShrink: 0,
                        }}
                      />
                      <span>{p.name}</span>
                      {p.keywords?.length > 0 && (
                        <Typography variant="caption" color="text.disabled">
                          ({p.keywords.slice(0, 2).join('، ')}{p.keywords.length > 2 ? '...' : ''})
                        </Typography>
                      )}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedProfile && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ flex: 1 }}>
                {selectedProfile.keywords?.map((kw) => (
                  <Chip key={kw} size="small" label={kw} color="primary" variant="outlined" />
                ))}
                {selectedProfile.excludedKeywords?.map((kw) => (
                  <Chip key={kw} size="small" label={kw} color="error" variant="outlined" />
                ))}
              </Stack>
            )}
          </Stack>
        </Card>
        )}
        </Box>
      )}

      {/* ── Search panel (always visible when source exists) ── */}
      {eightTagSource && (
        <EightTagSearchPanel
          dataSourceId={eightTagSource.id}
          profileKeywords={selectedProfile?.keywords || []}
          profileExcluded={selectedProfile?.excludedKeywords || []}
          profileName={selectedProfile?.name || null}
        />
      )}

      <DataSourceFormDialog
        open={formOpen}
        dataSource={editing}
        onClose={() => setFormOpen(false)}
      />
    </Container>
  );
}
