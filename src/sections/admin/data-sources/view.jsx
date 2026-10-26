'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';

import { fRelativeFa } from 'src/utils/format-number-fa';

import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';
import {
  useAdminProfiles,
  useAdminDataSources,
  useToggleDataSource,
  useDeleteDataSource,
} from 'src/api/admin';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { EightTagSearchPanel } from './search-panel';
import { AdminPageHeader } from '../shared/page-header';
import { DataSourceFormDialog } from './data-source-form-dialog';
import { getErrorText, AdminListState, RowActionsMenu } from '../shared/admin-ui';

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

  const handleToggle = (checked) => {
    toggle.mutate(
      { id: eightTagSource.id, isActive: checked },
      {
        onSuccess: () => toast.success(checked ? 'منبع فعال شد' : 'منبع غیرفعال شد'),
        onError: (e) => toast.error(getErrorText(e, 'خطا در تغییر وضعیت منبع')),
      }
    );
  };

  const handleDelete = () => {
    if (!window.confirm(`منبع «${eightTagSource.name}» حذف شود؟`)) return;
    remove.mutate(eightTagSource.id, {
      onSuccess: () => toast.success('منبع حذف شد'),
      onError: (e) => toast.error(getErrorText(e, 'خطا در حذف منبع')),
    });
  };

  const sortedProfiles = [...profiles].sort((a, b) => {
    const ka = a.sortName || (a.name || '').split(/\s+/).pop() || '';
    const kb = b.sortName || (b.name || '').split(/\s+/).pop() || '';
    return ka.localeCompare(kb, 'fa');
  });

  return (
    <Container maxWidth={desktopMode ? 'xl' : 'lg'} sx={{ py: { xs: 3, md: 4 } }}>
      <AdminPageHeader
        title="پیکربندی ۸تگ"
        subtitle="مدیریت اتصال، فیلترهای جستجو و آزمایش زنده برای هر پروفایل"
        action={
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={openNew}>
            منبع جدید
          </Button>
        }
      />

      {/* ── Connection status card + profile picker: side-by-side on desktop ── */}
      {isLoading ? (
        <Box sx={{ mb: 2 }}>
          <AdminListState loading rows={2} />
        </Box>
      ) : !eightTagSource ? (
        <Card sx={{ p: { xs: 3, md: 5 }, mb: 2, textAlign: 'center' }}>
          <Iconify icon="solar:plug-circle-bold-duotone" width={44} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            هنوز منبع ۸تگ تعریف نشده است.
          </Typography>
          <Button variant="contained" onClick={openNew} startIcon={<Iconify icon="eva:plus-fill" />}>
            افزودن منبع ۸تگ
          </Button>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
            mb: 2,
          }}
        >
          {/* Connection card */}
          <Card sx={{ overflow: 'hidden' }}>
            {/* Header bar */}
            <Box
              sx={{
                p: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.info.main, 0.06)} 100%)`,
                borderBottom: `1px solid ${theme.vars.palette.divider}`,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      flexShrink: 0,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="solar:database-bold-duotone" width={22} sx={{ color: 'primary.main' }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                      {eightTagSource.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="div"
                      sx={{ color: 'text.secondary', fontSize: 12, direction: 'ltr', textAlign: 'left' }}
                      noWrap
                    >
                      {eightTagSource.apiEndpoint}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                  <Tooltip title={eightTagSource.isActive ? 'غیرفعال کردن' : 'فعال کردن'}>
                    <Switch
                      size="small"
                      checked={!!eightTagSource.isActive}
                      disabled={toggle.isPending}
                      onChange={(e) => handleToggle(e.target.checked)}
                      slotProps={{ input: { 'aria-label': 'فعال/غیرفعال' } }}
                    />
                  </Tooltip>
                  <RowActionsMenu
                    items={[
                      { label: 'ویرایش', icon: 'solar:pen-bold', onClick: () => openEdit(eightTagSource) },
                      {
                        label: 'حذف منبع',
                        icon: 'solar:trash-bin-2-bold',
                        color: 'error',
                        divider: true,
                        onClick: handleDelete,
                      },
                    ]}
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Status row */}
            <Stack direction="row" sx={{ px: 2, py: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                size="small"
                variant="soft"
                icon={
                  <Iconify
                    icon={eightTagSource.isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                    width={14}
                  />
                }
                label={eightTagSource.isActive ? 'متصل' : 'غیرفعال'}
                color={eightTagSource.isActive ? 'success' : 'default'}
                sx={{ fontSize: 12 }}
              />
              {eightTagSource.lastFetchAt && (
                <Tooltip title={fRelativeFa(eightTagSource.lastFetchAt)}>
                  <Chip
                    size="small"
                    icon={<Iconify icon="solar:clock-circle-bold" width={14} />}
                    label={`آخرین اجرا: ${new Date(eightTagSource.lastFetchAt).toLocaleString('fa-IR')}`}
                    variant="outlined"
                    sx={{ fontSize: 12 }}
                  />
                </Tooltip>
              )}
              {eightTagSource.lastRunStatus === 'error' && (
                <Chip
                  size="small"
                  color="error"
                  variant="soft"
                  label={`خطا: ${eightTagSource.lastError || 'نامشخص'}`}
                  sx={{ fontSize: 12, maxWidth: 1 }}
                />
              )}
              {eightTagSource.profileId && (
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={profileById[eightTagSource.profileId]?.name || 'پروفایل'}
                  sx={{ fontSize: 12 }}
                />
              )}
            </Stack>
          </Card>

          {/* Profile picker — second column on desktop, below on mobile */}
          <Card sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:user-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  جستجو برای پروفایل
                </Typography>
              </Stack>

              <FormControl size="small" fullWidth>
                <InputLabel>انتخاب پروفایل</InputLabel>
                <Select
                  value={selectedProfileId}
                  label="انتخاب پروفایل"
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>بدون پروفایل (جستجوی آزاد)</em>
                  </MenuItem>
                  {sortedProfiles.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: p.primaryColor || 'primary.main',
                            flexShrink: 0,
                          }}
                        />
                        <span>{p.name}</span>
                        {p.keywords?.length > 0 && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                            ({p.keywords.slice(0, 2).join('، ')}
                            {p.keywords.length > 2 ? '...' : ''})
                          </Typography>
                        )}
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedProfile && (
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
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
