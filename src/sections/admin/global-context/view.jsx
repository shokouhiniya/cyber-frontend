'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import axios from 'src/lib/axios';
import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';
import {
  useGlobalContext,
  useAdminProfiles,
  useUpdateProfile,
  useIngestSettings,
  useSaveIngestSettings,
  useDeleteGlobalContext,
  useUpsertGlobalContext,
} from 'src/api/admin';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { MacroRawContent, parseMacroValue } from 'src/sections/cyberspace/shared/macro-parsed-content';

import { AdminPageHeader } from '../shared/page-header';
import { BlockedAccountsCard } from './blocked-accounts-card';
import { getErrorText, AdminListState, RowActionsMenu } from '../shared/admin-ui';

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/** Keys whose value is the macro-politics JSON structure */
const MACRO_KEYS = ['macro_political_context', 'macro_political_context_7d'];

function tryParseJson(str) {
  try { return JSON.parse(str); } catch { return null; }
}

// ----------------------------------------------------------------------
// Structured display for macro-politics JSON — delegates to shared component
// ----------------------------------------------------------------------

function MacroValueDisplay({ value }) {
  return <MacroRawContent raw={value} />;
}

// ----------------------------------------------------------------------
// Plain-text display
// ----------------------------------------------------------------------

function PlainValueDisplay({ value }) {
  return (
    <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap', fontSize: 12, lineHeight: 1.8, color: 'text.secondary' }}>
      {value}
    </Typography>
  );
}

// ----------------------------------------------------------------------
// Main view
// ----------------------------------------------------------------------

export function AdminGlobalContextView() {
  const { data: rows = [], isLoading } = useGlobalContext();
  const upsert = useUpsertGlobalContext();
  const remove = useDeleteGlobalContext();
  const { desktopMode } = useAdminDesktopMode();

  const [dialog, setDialog] = useState(null);
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(() => {
    const t = searchParams?.get('tab');
    return t === '1' ? 1 : 0;
  });

  const openEdit = (r) => setDialog({ key: r.key, value: r.value ?? '', isNew: false });
  const openNew  = () => setDialog({ key: '', value: '', isNew: true });

  const handleDelete = (r) => {
    if (!window.confirm(`متغیر «${r.key}» حذف شود؟`)) return;
    remove.mutate(r.key, {
      onSuccess: () => toast.success('متغیر حذف شد'),
      onError: (e) => toast.error(getErrorText(e, 'خطا در حذف متغیر')),
    });
  };

  return (
    <Container maxWidth={desktopMode ? 'xl' : 'lg'} sx={{ py: { xs: 3, md: 4 } }}>
      <AdminPageHeader
        title="تنظیمات"
        subtitle="متغیرهای عمومی، زمینه‌های تحلیل پروفایل‌ها و تنظیمات سیستم"
        action={tab === 0 ? (
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={openNew}>
            متغیر جدید
          </Button>
        ) : null}
      />

      {/* Tabs */}
      <Card sx={{ mb: 2.5 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ px: { xs: 1, md: 2 } }}
        >
          <Tab label="متغیرهای عمومی" icon={<Iconify icon="solar:settings-bold" width={18} />} iconPosition="start" sx={{ fontSize: 13, minHeight: 52 }} />
          <Tab label="زمینه‌های تحلیل پروفایل" icon={<Iconify icon="solar:user-id-bold" width={18} />} iconPosition="start" sx={{ fontSize: 13, minHeight: 52 }} />
          <Tab label="تنظیمات جمع‌آوری" icon={<Iconify icon="solar:refresh-bold" width={18} />} iconPosition="start" sx={{ fontSize: 13, minHeight: 52 }} />
        </Tabs>
      </Card>

      {/* Tab 0: Global variables (existing) */}
      {tab === 0 && (
      <>
      {isLoading || rows.length === 0 ? (
        <AdminListState
          loading={isLoading}
          empty={!isLoading}
          emptyText="هنوز متغیری اضافه نشده است."
          icon="solar:settings-bold"
        />
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 2,
        }}>
          {rows.map((r) => {
            const isMacro = MACRO_KEYS.includes(r.key);
            return (
              <Card key={r.key} sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Header row */}
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        size="small"
                        color="primary"
                        variant="soft"
                        label={`global_${r.key}`}
                        sx={{ fontFamily: 'monospace', fontSize: 12, direction: 'ltr' }}
                      />
                      {isMacro && (
                        <Chip size="small" label="وضعیت کلان" variant="outlined" sx={{ fontSize: 12 }} />
                      )}
                      {r.updatedAt && (
                        <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
                          {new Date(r.updatedAt).toLocaleString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      )}
                    </Stack>

                    {/* Value display */}
                    {isMacro
                      ? <MacroValueDisplay value={r.value} />
                      : <PlainValueDisplay value={r.value} />
                    }
                  </Box>

                  {/* Actions */}
                  <Box sx={{ flexShrink: 0 }}>
                    <RowActionsMenu
                      items={[
                        { label: 'ویرایش', icon: 'solar:pen-bold', onClick: () => openEdit(r) },
                        {
                          label: 'حذف',
                          icon: 'solar:trash-bin-2-bold',
                          color: 'error',
                          divider: true,
                          onClick: () => handleDelete(r),
                        },
                      ]}
                    />
                  </Box>
                </Stack>
              </Card>
            );
          })}
        </Box>
      )}
      </> /* end tab 0 */
      )}

      {/* Tab 1: Profile contexts */}
      {tab === 1 && <ProfileContextsTab desktopMode={desktopMode} initialProfileId={searchParams?.get('profile') || ''} />}

      {/* Tab 2: Ingest settings */}
      {tab === 2 && (<><IngestSettingsTab /><BlockedAccountsCard /></>)}

      <ContextDialog
        value={dialog}
        onClose={() => setDialog(null)}
        onSave={async (row) => {
          try {
            await upsert.mutateAsync(row);
            toast.success('متغیر ذخیره شد');
            setDialog(null);
          } catch (e) {
            toast.error(getErrorText(e, 'خطا در ذخیره متغیر'));
          }
        }}
        saving={upsert.isPending}
      />
    </Container>
  );
}

// ----------------------------------------------------------------------
// Profile Contexts Tab
// ----------------------------------------------------------------------

const PROMPT_SECTIONS = [
  { key: 'default', label: 'زمینه پایه (مشترک)', desc: 'برای همه پرامپت‌هایی که override ندارند' },
  { key: 'batch_sentiment', label: 'تحلیل احساسات', desc: 'طبقه‌بندی پست‌ها' },
  { key: 'dashboard_ai_summary', label: 'خلاصه داشبورد', desc: 'خلاصه تحلیلی ۳-۴ جمله‌ای' },
  { key: 'macro_context_analysis', label: 'تحلیل بستر کلان', desc: 'بینش‌های سیاسی-اجتماعی' },
  { key: 'smart_recommendations', label: 'پیشنهادها', desc: 'توصیه‌های ارتباطی' },
  { key: 'narrative_gap_analysis', label: 'شکاف روایت', desc: 'فاصله پیام رسمی و بحث عمومی' },
  { key: 'scenario_simulator', label: 'شبیه‌ساز سناریو', desc: 'تحلیل فرضی' },
];

function ProfileContextsTab({ desktopMode, initialProfileId = '' }) {
  const theme = useTheme();
  const { data: profiles = [] } = useAdminProfiles();
  const updateProfile = useUpdateProfile();

  const [selectedId, setSelectedId] = useState(initialProfileId);
  const [editingKey, setEditingKey] = useState(null); // which section is being edited
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedProfile = profiles.find((p) => p.id === selectedId) || null;
  const contexts = selectedProfile?.profileContexts || {};

  const handleSave = async () => {
    if (!selectedId || !editingKey) return;
    setSaving(true);
    try {
      const updated = { ...contexts };
      if (editValue.trim()) {
        updated[editingKey] = editValue;
      } else {
        delete updated[editingKey]; // empty = use default
      }
      await updateProfile.mutateAsync({ id: selectedId, profileContexts: updated });
      toast.success('زمینه تحلیل ذخیره شد');
      setEditingKey(null);
    } catch (e) {
      toast.error(getErrorText(e, 'خطا در ذخیره زمینه تحلیل'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {/* Profile picker */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', gap: 1.5 }}>
          <Iconify icon="solar:user-id-bold" width={20} sx={{ color: 'primary.main', flexShrink: 0 }} />
          <FormControl size="small" sx={{ minWidth: { xs: 0, sm: 280 }, flex: 1 }}>
            <InputLabel>انتخاب پروفایل</InputLabel>
            <Select value={selectedId} label="انتخاب پروفایل" onChange={(e) => { setSelectedId(e.target.value); setEditingKey(null); }}>
              {profiles.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedProfile && (
            <Chip size="small" label={contexts.default ? 'دارای زمینه' : 'بدون زمینه'} color={contexts.default ? 'success' : 'warning'} variant="soft" sx={{ fontSize: 12 }} />
          )}
        </Stack>
      </Card>

      {/* Context sections */}
      {selectedProfile && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 2 }}>
          {/* Section list */}
          <Stack spacing={1}>
            {PROMPT_SECTIONS.map((sec) => {
              const hasOverride = !!contexts[sec.key];
              const isActive = editingKey === sec.key;
              return (
                <Card key={sec.key} variant="outlined"
                  onClick={() => { setEditingKey(sec.key); setEditValue(contexts[sec.key] || (sec.key === 'default' ? '' : '')); }}
                  sx={{
                    p: 1.5, cursor: 'pointer', transition: 'all 0.15s',
                    borderColor: isActive ? 'primary.main' : hasOverride ? 'success.light' : 'divider',
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                    '&:hover': { borderColor: 'primary.light' },
                  }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: hasOverride ? 'success.main' : 'text.disabled', flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13, display: 'block' }}>{sec.label}</Typography>
                      <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>{sec.desc}</Typography>
                    </Box>
                    {hasOverride && sec.key !== 'default' && (
                      <Chip size="small" label="override" color="success" variant="soft" sx={{ fontSize: 12 }} />
                    )}
                  </Stack>
                </Card>
              );
            })}
          </Stack>

          {/* Editor */}
          {editingKey ? (
            <Card sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2" fontWeight={700}>
                    {PROMPT_SECTIONS.find((s) => s.key === editingKey)?.label}
                  </Typography>
                  {editingKey !== 'default' && (
                    <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
                      خالی = استفاده از زمینه پایه
                    </Typography>
                  )}
                </Stack>
                <TextField
                  multiline
                  minRows={desktopMode ? 18 : 8}
                  maxRows={30}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder={editingKey === 'default' ? 'زمینه تحلیل پروفایل (Markdown)...' : 'خالی بگذارید تا از زمینه پایه استفاده شود، یا override بنویسید...'}
                  sx={{ '& .MuiInputBase-root': { fontSize: 12, fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' } }}
                />
                <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                  <Button variant="outlined" size="small" onClick={() => setEditingKey(null)}>انصراف</Button>
                  <Button variant="contained" size="small" onClick={handleSave} loading={saving}>
                    ذخیره
                  </Button>
                </Stack>
              </Stack>
            </Card>
          ) : (
            <Card sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stack alignItems="center" spacing={1}>
                <Iconify icon="solar:document-text-bold-duotone" width={36} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary">یک بخش را از فهرست انتخاب کنید</Typography>
              </Stack>
            </Card>
          )}
        </Box>
      )}

      {!selectedProfile && (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Iconify icon="solar:user-id-bold" width={40} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">ابتدا یک پروفایل انتخاب کنید</Typography>
        </Card>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------
// Ingest Settings Tab
// ----------------------------------------------------------------------

const TIER_LABELS = { heavy: 'سنگین (Heavy)', medium: 'متوسط (Medium)', light: 'سبک (Light)' };
// Palette keys so the tier cards follow light / dark mode.
const TIER_COLORS = { heavy: 'error', medium: 'warning', light: 'success' };
const TIER_DESCS = {
  heavy: 'پروفایل‌های پرترافیک — بیش از ۱۰k پست در روز',
  medium: 'پروفایل‌های متوسط — ۵۰۰ تا ۱۰k پست در روز',
  light: 'پروفایل‌های کم‌ترافیک — کمتر از ۵۰۰ پست در روز',
};
const RANGE_OPTIONS = [
  { value: 'day', label: '۲۴ ساعت گذشته' },
  { value: 'week', label: 'هفته گذشته' },
  { value: 'month', label: 'ماه گذشته' },
];

// Effective schedule as registered on the server (Asia/Tehran). Reading it also
// makes the server re-sync its cron jobs with the saved settings.
const SCHEDULE_QUERY_KEY = ['admin', 'ingest-schedule'];
function useIngestSchedule() {
  return useQuery({
    queryKey: SCHEDULE_QUERY_KEY,
    queryFn: async () => (await axios.get('/api/admin/ingest/schedule')).data,
    staleTime: 60 * 1000,
  });
}

const fRunTime = (iso) =>
  new Date(iso).toLocaleString('fa-IR', {
    timeZone: 'Asia/Tehran',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function TierScheduleInfo({ entry, dirty, enabled }) {
  if (!entry) return null;
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 1,
        bgcolor: (th) => alpha(th.palette.grey[500], 0.08),
        opacity: enabled ? 1 : 0.6,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
        <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: 'text.secondary', flexShrink: 0 }} />
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {entry.description}
        </Typography>
      </Stack>
      {entry.error && (
        <Typography variant="caption" component="p" sx={{ color: 'error.main', mb: 0.5 }}>
          {entry.error}
        </Typography>
      )}
      {dirty ? (
        <Typography variant="caption" sx={{ color: 'info.main' }}>
          زمان‌بندی تغییر کرده است؛ پس از ذخیره اعمال می‌شود.
        </Typography>
      ) : enabled ? (
        <Stack spacing={0.25}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            اجراهای بعدی (به وقت تهران):
          </Typography>
          {entry.nextRuns.map((iso) => (
            <Typography key={iso} variant="caption" sx={{ color: 'text.primary' }}>
              {fRunTime(iso)}
            </Typography>
          ))}
        </Stack>
      ) : (
        <Typography variant="caption" sx={{ color: 'warning.main' }}>
          جمع‌آوری خودکار متوقف است؛ اجرایی انجام نمی‌شود.
        </Typography>
      )}
    </Box>
  );
}

function IngestSettingsTab() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useIngestSettings();
  const { data: schedule } = useIngestSchedule();
  const save = useSaveIngestSettings();

  const DEFAULT = {
    automaticCollectionEnabled: true,
    heavy:   { sampleSize: 100, range: 'day',  cron: '0 0,6,12,18 * * *', description: 'هر ۶ ساعت (۴ بار در روز)' },
    medium:  { sampleSize: 80,  range: 'week', cron: '0 3 * * *',          description: 'یک بار در روز (ساعت ۳ بامداد)' },
    light:   { sampleSize: 60,  range: 'week', cron: '0 4 */3 * *',        description: 'هر ۳ روز یک بار (ساعت ۴ بامداد)' },
    manualCooldownMinutes: 15,
    retentionDays: 90,
  };

  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Wait for the request to finish: seeding the form with DEFAULT while the
    // settings are still loading meant the saved values never showed up, and a
    // save would silently overwrite them with the defaults.
    if (isLoading || form) return;
    // Use settings from API if available, otherwise use defaults
    const base = (settings && typeof settings === 'object' && settings.heavy) ? settings : DEFAULT;
    setForm(base);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, isLoading]);

  const setTier = (tier, patch) => setForm((f) => ({ ...f, [tier]: { ...f[tier], ...patch } }));
  const setGlobal = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = async () => {
    try {
      await save.mutateAsync(form);
      // Re-reading the schedule re-registers the cron jobs on the server
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEY });
      toast.success('تنظیمات جمع‌آوری ذخیره شد');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      toast.error(getErrorText(e, 'خطا در ذخیره تنظیمات'));
    }
  };

  if (!form) return <AdminListState loading rows={3} />;

  const autoEnabled = form.automaticCollectionEnabled !== false;
  const savedAutoEnabled = settings?.automaticCollectionEnabled !== false;
  const autoDirty = !!settings?.heavy && autoEnabled !== savedAutoEnabled;
  const autoColor = autoEnabled ? 'success' : 'warning';

  return (
    <Box>
      {/* Automatic collection — master switch */}
      <Card
        variant="outlined"
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderWidth: 1.5,
          borderColor: alpha(theme.palette[autoColor].main, 0.4),
          bgcolor: alpha(theme.palette[autoColor].main, 0.06),
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              flexShrink: 0,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette[autoColor].main, 0.14),
              color: `${autoColor}.main`,
            }}
          >
            <Iconify icon={autoEnabled ? 'solar:play-circle-bold' : 'solar:stop-circle-bold'} width={28} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', gap: 1, mb: 0.75 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: 16, md: 18 } }}>
                جمع‌آوری خودکار
              </Typography>
              <Chip
                size="small"
                variant="soft"
                color={autoColor}
                label={autoEnabled ? 'روشن' : 'متوقف'}
                sx={{ fontSize: 12, fontWeight: 700 }}
              />
              {autoDirty && (
                <Chip size="small" variant="outlined" color="info" label="ذخیره نشده" sx={{ fontSize: 12 }} />
              )}
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.9 }}>
              وقتی روشن است، داده‌های همه پروفایل‌ها طبق زمان‌بندی هر سطح (پایین همین صفحه) به‌صورت خودکار جمع‌آوری می‌شوند
              و تحلیل «وضعیت کلان سیاسی» نیز دو بار در روز به‌صورت خودکار تولید می‌شود.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.9, mt: 0.5 }}>
              با خاموش کردن آن، هم اجراهای زمان‌بندی‌شده جمع‌آوری و هم تولید دوبار‌در‌روز وضعیت کلان متوقف می‌شوند؛
              اجرای دستی («اجرای فوری» در صفحه پروفایل‌ها) همچنان در دسترس است.
            </Typography>
          </Box>
          <Switch
            checked={autoEnabled}
            onChange={(e) => setGlobal({ automaticCollectionEnabled: e.target.checked })}
            color="success"
            slotProps={{ input: { 'aria-label': 'جمع‌آوری خودکار' } }}
            sx={{ flexShrink: 0, mt: 0.5 }}
          />
        </Stack>
        {autoDirty && (
          <Alert severity="info" sx={{ mt: 2 }}>
            برای اعمال این تغییر، دکمه «ذخیره تنظیمات» را در پایین صفحه بزنید.
          </Alert>
        )}
      </Card>

      {/* Tier configs */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        {['heavy', 'medium', 'light'].map((tier) => {
          const t = form[tier] || {};
          const color = theme.palette[TIER_COLORS[tier]].main;
          return (
            <Card key={tier} variant="outlined" sx={{ p: 2, borderColor: alpha(color, 0.3), bgcolor: alpha(color, 0.04) }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color }}>{TIER_LABELS[tier]}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12, mt: -1 }}>{TIER_DESCS[tier]}</Typography>

                <TextField
                  label="تعداد پست نمونه"
                  type="number"
                  value={t.sampleSize ?? ''}
                  onChange={(e) => setTier(tier, { sampleSize: parseInt(e.target.value) || 0 })}
                  size="small"
                  inputProps={{ min: 10, max: 500 }}
                  helperText="تعداد پست‌هایی که به پرامپت‌های AI ارسال می‌شوند"
                />

                <FormControl size="small">
                  <InputLabel>بازه زمانی جستجو</InputLabel>
                  <Select value={t.range || 'week'} label="بازه زمانی جستجو" onChange={(e) => setTier(tier, { range: e.target.value })}>
                    {RANGE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </FormControl>

                <TextField
                  label="زمان‌بندی (Cron)"
                  value={t.cron ?? ''}
                  onChange={(e) => setTier(tier, { cron: e.target.value })}
                  size="small"
                  placeholder="0 0,6,12,18 * * *"
                  helperText="فرمت: دقیقه ساعت روز‌ماه ماه روز‌هفته — به وقت تهران"
                  sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', direction: 'ltr', fontSize: 12 } }}
                />

                <TierScheduleInfo
                  entry={schedule?.tiers?.find((s) => s.tier === tier)}
                  dirty={(t.cron ?? '').trim() !== (settings?.[tier]?.cron ?? '').trim()}
                  enabled={schedule ? schedule.automaticCollectionEnabled : savedAutoEnabled}
                />
              </Stack>
            </Card>
          );
        })}
      </Box>

      {/* Global settings */}
      <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>تنظیمات عمومی</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="حداقل فاصله بین اجراهای دستی (دقیقه)"
            type="number"
            value={form.manualCooldownMinutes ?? 15}
            onChange={(e) => setGlobal({ manualCooldownMinutes: parseInt(e.target.value) || 15 })}
            size="small"
            inputProps={{ min: 1, max: 120 }}
            helperText="کاربران نمی‌توانند بیشتر از این تعداد دقیقه در یک بازه اجرا کنند"
          />
          <TextField
            label="نگهداری داده‌ها (روز)"
            type="number"
            value={form.retentionDays ?? 90}
            onChange={(e) => setGlobal({ retentionDays: parseInt(e.target.value) || 90 })}
            size="small"
            inputProps={{ min: 7, max: 365 }}
            helperText="پست‌ها، اجراها و کش تحلیل‌های قدیمی‌تر از این تعداد روز حذف می‌شوند (پاک‌سازی هفتگی، یکشنبه‌ها ساعت ۰۲:۰۰)"
          />
        </Box>
      </Card>

      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button variant="outlined" onClick={() => setForm((settings && settings.heavy) ? settings : DEFAULT)}>بازنشانی</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          loading={save.isPending}
          startIcon={saved ? <Iconify icon="solar:check-circle-bold" /> : null}
        >
          {saved ? 'ذخیره شد' : 'ذخیره تنظیمات'}
        </Button>
      </Stack>

      <Alert severity="info" sx={{ mt: 2 }}>
        تغییرات پس از ذخیره بلافاصله اعمال می‌شوند و نیازی به راه‌اندازی مجدد سرور نیست. همه زمان‌بندی‌ها به وقت تهران هستند.
      </Alert>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Edit dialog — structured for macro keys, textarea for plain text
// ----------------------------------------------------------------------

const EMPTY_EVENT = { title: '', summary: '', actor: '', severity: 'medium' };
const EMPTY_MACRO = {
  events: [],
  tensions: { domestic: '', foreign: '', economic: '' },
  media_atmosphere: '',
  forecast: '',
};

function MacroEditor({ value, onChange }) {
  const parsed = tryParseJson(value) || { ...EMPTY_MACRO };
  const events = parsed.events || [];
  const tensions = parsed.tensions || {};

  const update = (patch) => {
    onChange(JSON.stringify({ ...parsed, ...patch }, null, 2));
  };

  const updateEvent = (idx, patch) => {
    const updated = events.map((ev, i) => i === idx ? { ...ev, ...patch } : ev);
    update({ events: updated });
  };

  const addEvent = () => update({ events: [...events, { ...EMPTY_EVENT }] });

  const removeEvent = (idx) => update({ events: events.filter((_, i) => i !== idx) });

  const updateTension = (key, val) => update({ tensions: { ...tensions, [key]: val } });

  return (
    <Stack spacing={2.5}>
      {/* Events */}
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>رویدادها</Typography>
          <Button size="small" variant="outlined" onClick={addEvent} startIcon={<Iconify icon="eva:plus-fill" width={16} />} sx={{ fontSize: 12 }}>
            افزودن رویداد
          </Button>
        </Stack>
        <Stack spacing={1.5}>
          {events.map((ev, idx) => (
            <Box key={idx} sx={{ p: 1.5, borderRadius: 1.5, border: `1px solid`, borderColor: 'divider', position: 'relative' }}>
              <IconButton
                size="small"
                color="error"
                onClick={() => removeEvent(idx)}
                sx={{ position: 'absolute', top: 6, left: 6 }}
              >
                <Iconify icon="solar:close-circle-bold" width={16} />
              </IconButton>
              <Stack spacing={1} sx={{ pl: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    label="عنوان"
                    value={ev.title}
                    onChange={(e) => updateEvent(idx, { title: e.target.value })}
                    size="small"
                    fullWidth
                    sx={{ '& .MuiInputBase-root': { fontSize: 12 } }}
                  />
                  <FormControl size="small" sx={{ minWidth: 110 }}>
                    <InputLabel sx={{ fontSize: 12 }}>اهمیت</InputLabel>
                    <Select
                      value={ev.severity || 'medium'}
                      label="اهمیت"
                      onChange={(e) => updateEvent(idx, { severity: e.target.value })}
                      sx={{ fontSize: 12 }}
                    >
                      <MenuItem value="high">بحرانی</MenuItem>
                      <MenuItem value="medium">مهم</MenuItem>
                      <MenuItem value="low">قابل توجه</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                <TextField
                  label="خلاصه"
                  value={ev.summary}
                  onChange={(e) => updateEvent(idx, { summary: e.target.value })}
                  size="small"
                  fullWidth
                  multiline
                  maxRows={3}
                  sx={{ '& .MuiInputBase-root': { fontSize: 12 } }}
                />
                <TextField
                  label="منبع / بازیگر (اختیاری)"
                  value={ev.actor || ''}
                  onChange={(e) => updateEvent(idx, { actor: e.target.value })}
                  size="small"
                  fullWidth
                  sx={{ '& .MuiInputBase-root': { fontSize: 12 } }}
                />
              </Stack>
            </Box>
          ))}
          {events.length === 0 && (
            <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
              رویدادی ثبت نشده — برای افزودن دکمه بالا را بزنید.
            </Typography>
          )}
        </Stack>
      </Box>

      <Divider />

      {/* Tensions */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>تنش‌ها</Typography>
        <Stack spacing={1}>
          {[
            { key: 'domestic', label: 'داخلی' },
            { key: 'foreign',  label: 'خارجی' },
            { key: 'economic', label: 'اقتصادی' },
          ].map(({ key, label }) => (
            <TextField
              key={key}
              label={label}
              value={tensions[key] || ''}
              onChange={(e) => updateTension(key, e.target.value)}
              size="small"
              fullWidth
              multiline
              maxRows={2}
              sx={{ '& .MuiInputBase-root': { fontSize: 12 } }}
            />
          ))}
        </Stack>
      </Box>

      <Divider />

      {/* Media atmosphere */}
      <TextField
        label="فضای رسانه"
        value={parsed.media_atmosphere || ''}
        onChange={(e) => update({ media_atmosphere: e.target.value })}
        size="small"
        fullWidth
        multiline
        minRows={2}
        maxRows={4}
        sx={{ '& .MuiInputBase-root': { fontSize: 12 } }}
      />

      {/* Forecast */}
      <TextField
        label="پیش‌بینی ۴۸ ساعت"
        value={parsed.forecast || ''}
        onChange={(e) => update({ forecast: e.target.value })}
        size="small"
        fullWidth
        multiline
        minRows={2}
        maxRows={4}
        sx={{ '& .MuiInputBase-root': { fontSize: 12 } }}
      />
    </Stack>
  );
}

function ContextDialog({ value, onClose, onSave, saving }) {
  const [form, setForm] = useState({ key: '', value: '' });
  // For new items: 'plain' | 'macro' | 'json'
  const [newType, setNewType] = useState('plain');

  useEffect(() => {
    if (value) {
      if (value.isNew) {
        setNewType('plain');
        setForm({ key: '', value: '' });
        return;
      }

      let initialValue = value.value;

      if (MACRO_KEYS.includes(value.key)) {
        // Extract the most recent JSON segment from the multi-day log
        const segments = parseMacroValue(initialValue);
        const latestJson = segments.find((s) => s.parsed);
        if (latestJson) {
          // Edit only the latest day's JSON — save will overwrite the whole field
          initialValue = JSON.stringify(latestJson.parsed, null, 2);
        } else {
          // No valid JSON segment found — start fresh
          initialValue = JSON.stringify(EMPTY_MACRO, null, 2);
        }
      }

      setForm({ key: value.key, value: initialValue });
    }
  }, [value]);

  if (!value) return null;

  const isMacro = MACRO_KEYS.includes(value.isNew ? form.key : value.key);
  const effectiveType = value.isNew ? newType : (isMacro ? 'macro' : 'plain');

  const handleTypeChange = (t) => {
    setNewType(t);
    if (t === 'macro') {
      setForm((f) => ({ ...f, value: JSON.stringify(EMPTY_MACRO, null, 2) }));
    } else if (t === 'json') {
      setForm((f) => ({ ...f, value: JSON.stringify([{ key: '', value: '' }], null, 2) }));
    } else {
      setForm((f) => ({ ...f, value: '' }));
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={effectiveType === 'macro' ? 'md' : 'sm'}>
      <DialogTitle sx={{ pb: 1 }}>
        {value.isNew ? 'متغیر جدید' : `ویرایش: ${value.key}`}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {/* Key field — only for new items */}
          {value.isNew && (
            <TextField
              label="کلید (key)"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value.replace(/[^a-z0-9_]/g, '_') }))}
              fullWidth
              size="small"
              helperText="حروف کوچک، عدد و زیرخط. در prompt به شکل {{ global_KEY }} در دسترس است."
            />
          )}

          {/* Type selector — only for new items */}
          {value.isNew && (
            <FormControl size="small" fullWidth>
              <InputLabel>نوع مقدار</InputLabel>
              <Select
                value={newType}
                label="نوع مقدار"
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <MenuItem value="plain">متن ساده</MenuItem>
                <MenuItem value="macro">وضعیت کلان (رویدادها / تنش‌ها / رسانه / پیش‌بینی)</MenuItem>
                <MenuItem value="json">ساختار JSON سفارشی</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Editor based on type */}
          {effectiveType === 'macro' && (
            <MacroEditor
              value={form.value}
              onChange={(v) => setForm((f) => ({ ...f, value: v }))}
            />
          )}

          {effectiveType === 'json' && (
            <JsonBuilder
              value={form.value}
              onChange={(v) => setForm((f) => ({ ...f, value: v }))}
            />
          )}

          {effectiveType === 'plain' && (
            <TextField
              label="مقدار"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              multiline
              minRows={5}
              fullWidth
              size="small"
              placeholder="متن آزاد — در پرامپت‌ها به عنوان {{ global_KEY }} جایگزین می‌شود."
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>انصراف</Button>
        <Button
          variant="contained"
          onClick={() => onSave(form)}
          loading={saving}
          disabled={saving || !form.key}
        >
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------
// Generic JSON builder — for custom structured contexts
// Lets the user build a flat or nested key-value JSON object graphically.
// ----------------------------------------------------------------------

const EMPTY_JSON_FIELD = { key: '', value: '', type: 'string' };

function JsonBuilder({ value, onChange }) {
  // Parse the current JSON into an editable field list
  const parseFields = (raw) => {
    try {
      const obj = JSON.parse(raw);
      if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
        return Object.entries(obj).map(([k, v]) => ({
          key: k,
          value: typeof v === 'string' ? v : JSON.stringify(v),
          type: typeof v === 'string' ? 'string' : 'json',
        }));
      }
    } catch { /* ignore */ }
    return [{ ...EMPTY_JSON_FIELD }];
  };

  const [fields, setFields] = useState(() => parseFields(value));

  // Serialize fields back to JSON and notify parent
  const serialize = (updated) => {
    const obj = {};
    updated.forEach(({ key: k, value: v, type }) => {
      if (!k.trim()) return;
      if (type === 'json') {
        try { obj[k] = JSON.parse(v); } catch { obj[k] = v; }
      } else {
        obj[k] = v;
      }
    });
    onChange(JSON.stringify(obj, null, 2));
  };

  const updateField = (idx, patch) => {
    const updated = fields.map((f, i) => i === idx ? { ...f, ...patch } : f);
    setFields(updated);
    serialize(updated);
  };

  const addField = () => {
    const updated = [...fields, { ...EMPTY_JSON_FIELD }];
    setFields(updated);
    serialize(updated);
  };

  const removeField = (idx) => {
    const updated = fields.filter((_, i) => i !== idx);
    setFields(updated);
    serialize(updated);
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" fontWeight={700}>فیلدهای JSON</Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={addField}
          startIcon={<Iconify icon="eva:plus-fill" width={16} />}
          sx={{ fontSize: 12 }}
        >
          افزودن فیلد
        </Button>
      </Stack>

      {fields.map((f, idx) => (
        <Box
          key={idx}
          sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', position: 'relative' }}
        >
          <IconButton
            size="small"
            color="error"
            onClick={() => removeField(idx)}
            sx={{ position: 'absolute', top: 6, left: 6 }}
          >
            <Iconify icon="solar:close-circle-bold" width={16} />
          </IconButton>
          <Stack spacing={1} sx={{ pl: 4 }}>
            <Stack direction="row" spacing={1}>
              <TextField
                label="کلید"
                value={f.key}
                onChange={(e) => updateField(idx, { key: e.target.value.replace(/\s/g, '_') })}
                size="small"
                sx={{ flex: 1, '& .MuiInputBase-root': { fontSize: 12 } }}
                placeholder="field_name"
              />
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel sx={{ fontSize: 12 }}>نوع</InputLabel>
                <Select
                  value={f.type}
                  label="نوع"
                  onChange={(e) => updateField(idx, { type: e.target.value })}
                  sx={{ fontSize: 12 }}
                >
                  <MenuItem value="string">متن</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField
              label="مقدار"
              value={f.value}
              onChange={(e) => updateField(idx, { value: e.target.value })}
              size="small"
              fullWidth
              multiline
              minRows={f.type === 'json' ? 3 : 1}
              maxRows={6}
              sx={{ '& .MuiInputBase-root': { fontSize: 12, fontFamily: f.type === 'json' ? 'monospace' : 'inherit' } }}
              placeholder={f.type === 'json' ? '{"key": "value"}' : 'مقدار متنی'}
            />
          </Stack>
        </Box>
      ))}

      {fields.length === 0 && (
        <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
          فیلدی تعریف نشده — برای افزودن دکمه بالا را بزنید.
        </Typography>
      )}

      {/* Preview */}
      {fields.some((f) => f.key) && (
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary', display: 'block', mb: 0.5 }}>
            پیش‌نمایش JSON:
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 1.5, borderRadius: 1, bgcolor: 'background.neutral',
              fontSize: 12, fontFamily: 'monospace', overflowX: 'auto', direction: 'ltr', textAlign: 'left',
              maxHeight: 120, m: 0, color: 'text.secondary',
            }}
          >
            {value}
          </Box>
        </Box>
      )}
    </Stack>
  );
}
