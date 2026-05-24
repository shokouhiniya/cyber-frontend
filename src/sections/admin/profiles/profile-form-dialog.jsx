'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';

import { useAdminUsers, useCreateProfile, useUpdateProfile } from 'src/api/admin';

import { Iconify } from 'src/components/iconify';

import { ChannelsEditor } from './channels-editor';

// ----------------------------------------------------------------------

const EMPTY = {
  name: '',
  sortName: '',
  role: '',
  organization: '',
  avatar: '',
  keywords: [],
  excludedKeywords: [],
  sortCriteria: 'recent',
  primaryColor: '#1e6091',
  isActive: true,
  officialChannels: [],
  tier: 'medium',
  dailyAvgPosts: null,
  sourceWeights: {},
};

// Default quota per source (system baseline, before weight multipliers)
const SOURCE_DEFAULTS = [
  { key: 'telegram',  label: 'تلگرام',           quota: 12, icon: 'ic:baseline-telegram',                  color: '#0088cc' },
  { key: 'news',      label: 'خبرگزاری',          quota: 12, icon: 'solar:document-text-bold',              color: '#4CAF50' },
  { key: 'twitter',   label: 'ایکس',              quota: 10, icon: 'ri:twitter-x-fill',                    color: '#000000' },
  { key: 'instagram', label: 'اینستاگرام',        quota: 8,  icon: 'mdi:instagram',                        color: '#E4405F' },
  { key: 'newspaper', label: 'روزنامه',            quota: 8,  icon: 'solar:global-bold-duotone',            color: '#78909C' },
  { key: 'media',     label: 'صدا و سیما',        quota: 8,  icon: 'solar:tv-bold-duotone',                color: '#FF5722' },
  { key: 'bale',      label: 'بله',               quota: 6,  icon: 'solar:chat-round-bold',                color: '#00A86B' },
  { key: 'rubika',    label: 'روبیکا',             quota: 4,  icon: 'solar:chat-square-bold',               color: '#7C3AED' },
  { key: 'aparat',    label: 'پلتفرم‌های ویدئویی', quota: 4,  icon: 'solar:videocamera-record-bold-duotone', color: '#FF5722' },
  { key: 'forum',     label: 'فروم',              quota: 4,  icon: 'solar:chat-square-bold-duotone',       color: '#795548' },
  { key: 'eitaa',     label: 'ایتا',              quota: 0,  icon: 'solar:chat-line-bold',                 color: '#F57C00' },
];

const TIER_OPTIONS = [
  { value: 'heavy',  label: 'سنگین (Heavy)',  desc: '>۱۰k پست/روز — ۴ بار در روز', color: '#E03131' },
  { value: 'medium', label: 'متوسط (Medium)', desc: '۵۰۰–۱۰k پست/روز — روزانه',    color: '#F08C00' },
  { value: 'light',  label: 'سبک (Light)',    desc: '<۵۰۰ پست/روز — هر ۳ روز',     color: '#2F9E44' },
];

// ----------------------------------------------------------------------
// Source weights editor
// ----------------------------------------------------------------------

function SourceWeightsEditor({ weights, onChange }) {
  const theme = useTheme();

  const effectiveQuota = (src) => {
    const w = weights[src.key] ?? 1.0;
    return Math.round(src.quota * w);
  };

  const totalQuota = SOURCE_DEFAULTS.reduce((s, src) => s + effectiveQuota(src), 0);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          وزن منابع داده
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="caption" color="text.secondary">
            مجموع نمونه:
          </Typography>
          <Chip size="small" label={`${totalQuota} پست`} color="primary" variant="outlined" />
          <Button
            size="small"
            variant="text"
            sx={{ fontSize: 10, minWidth: 0, px: 1 }}
            onClick={() => onChange({})}
          >
            بازنشانی
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        {SOURCE_DEFAULTS.map((src) => {
          const w = weights[src.key] ?? 1.0;
          const quota = effectiveQuota(src);
          return (
            <Box key={src.key}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                <Iconify icon={src.icon} width={14} sx={{ color: src.color, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ flex: 1, fontWeight: 600, fontSize: 11 }}>
                  {src.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 10, fontWeight: 700, minWidth: 52, textAlign: 'left',
                    color: quota === 0 ? 'text.disabled' : quota > src.quota ? 'success.main' : quota < src.quota ? 'warning.main' : 'text.secondary',
                  }}
                >
                  {quota === 0 ? 'غیرفعال' : `${quota} پست`}
                  {w !== 1.0 && quota > 0 && (
                    <Box component="span" sx={{ color: 'text.disabled', fontWeight: 400 }}>
                      {' '}(×{w.toFixed(1)})
                    </Box>
                  )}
                </Typography>
              </Stack>
              <Slider
                value={w}
                min={0}
                max={3}
                step={0.1}
                size="small"
                onChange={(_, val) => onChange({ ...weights, [src.key]: val })}
                sx={{
                  color: src.color,
                  '& .MuiSlider-thumb': { width: 14, height: 14 },
                  '& .MuiSlider-rail': { opacity: 0.2 },
                  py: 0.5,
                }}
                marks={[
                  { value: 0, label: '۰' },
                  { value: 1, label: 'پیش‌فرض' },
                  { value: 2, label: '×۲' },
                  { value: 3, label: '×۳' },
                ]}
              />
            </Box>
          );
        })}
      </Stack>

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, fontSize: 10 }}>
        ۱.۰ = پیش‌فرض سیستم | ۰ = حذف از نمونه | بیشتر از ۱ = افزایش سهم
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Main form dialog
// ----------------------------------------------------------------------

export function ProfileFormDialog({ open, onClose, profile, mode = 'admin' }) {
  const theme = useTheme();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [showWeights, setShowWeights] = useState(false);

  const isAdminMode = mode === 'admin';

  const create = useCreateProfile();
  const update = useUpdateProfile();
  const { data: allUsers = [] } = useAdminUsers();

  const linkedUsers = profile?.id
    ? allUsers.filter((u) => u.profileIds?.includes(profile.id))
    : [];

  useEffect(() => {
    if (open) {
      setError(null);
      setShowWeights(false);
      setForm(profile ? { ...EMPTY, ...profile } : EMPTY);
    }
  }, [open, profile]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    setError(null);
    try {
      if (profile?.id) {
        await update.mutateAsync({ id: profile.id, ...form });
      } else {
        await create.mutateAsync(form);
      }
      onClose();
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.message || 'خطا در ذخیره‌سازی');
    }
  };

  const submitting = create.isPending || update.isPending;
  const tierConfig = TIER_OPTIONS.find((t) => t.value === form.tier) || TIER_OPTIONS[1];

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '92vh',
          },
        },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
        <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.3) }} />
      </Box>

      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {profile?.id ? 'ویرایش پروفایل' : 'پروفایل جدید'}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <Iconify icon="solar:close-circle-bold" width={22} />
        </IconButton>
      </Stack>

      {/* Scrollable form body */}
      <Box sx={{ overflow: 'auto', px: 2.5, pb: 3 }}>
        <Stack spacing={2}>
          {/* Avatar preview + URL + upload */}
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={form.avatar}
                sx={{ width: 56, height: 56, bgcolor: form.primaryColor || 'primary.main', fontSize: 22, fontWeight: 700 }}
              >
                {form.name?.charAt(0)}
              </Avatar>
              {/* Upload overlay */}
              <Box
                component="label"
                htmlFor="avatar-upload"
                sx={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.45)', opacity: 0, cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 1 },
                }}
              >
                <Iconify icon="solar:camera-bold" width={20} sx={{ color: '#fff' }} />
              </Box>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  // Resize + convert to base64
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      const MAX = 200;
                      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
                      canvas.width = img.width * ratio;
                      canvas.height = img.height * ratio;
                      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                      set({ avatar: canvas.toDataURL('image/jpeg', 0.85) });
                    };
                    img.src = ev.target.result;
                  };
                  reader.readAsDataURL(file);
                  // Reset input so same file can be re-selected
                  e.target.value = '';
                }}
              />
            </Box>
            <Stack spacing={1} sx={{ flex: 1 }}>
              <TextField
                label="آدرس تصویر پروفایل (URL)"
                value={form.avatar?.startsWith('data:') ? '' : (form.avatar ?? '')}
                onChange={(e) => set({ avatar: e.target.value })}
                fullWidth
                size="small"
                placeholder="https://example.com/photo.jpg"
                helperText={form.avatar?.startsWith('data:') ? 'تصویر آپلود شده' : 'یا روی تصویر کلیک کنید تا آپلود کنید'}
              />
            </Stack>
          </Stack>

          <TextField
            label="نام"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            fullWidth
            required
            size="small"
          />
          {isAdminMode && (
            <TextField
              label="نام خانوادگی (برای مرتب‌سازی)"
              value={form.sortName ?? ''}
              onChange={(e) => set({ sortName: e.target.value })}
              fullWidth
              size="small"
              placeholder="مثال: قالیباف، حداد عادل"
              helperText="نام خانوادگی برای مرتب‌سازی الفبایی — اگر خالی باشد آخرین کلمه نام استفاده می‌شود"
            />
          )}
          <Stack direction="row" spacing={2}>
            <TextField
              label="نقش / سمت"
              value={form.role ?? ''}
              onChange={(e) => set({ role: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="سازمان"
              value={form.organization ?? ''}
              onChange={(e) => set({ organization: e.target.value })}
              fullWidth
              size="small"
            />
          </Stack>

          <Autocomplete
            multiple freeSolo options={[]}
            value={form.keywords || []}
            onChange={(_, val) => set({ keywords: val })}
            size="small"
            renderTags={(val, props) =>
              val.map((opt, i) => {
                const { key, ...tagProps } = props({ index: i });
                return <Chip key={key} label={opt} size="small" {...tagProps} />;
              })
            }
            renderInput={(params) => (
              <TextField {...params} label="کلیدواژه‌ها (include)" placeholder="Enter برای افزودن" />
            )}
          />

          <Autocomplete
            multiple freeSolo options={[]}
            value={form.excludedKeywords || []}
            onChange={(_, val) => set({ excludedKeywords: val })}
            size="small"
            renderTags={(val, props) =>
              val.map((opt, i) => {
                const { key, ...tagProps } = props({ index: i });
                return <Chip key={key} label={opt} size="small" {...tagProps} />;
              })
            }
            renderInput={(params) => (
              <TextField {...params} label="کلیدواژه‌های حذف‌شده (exclude)" placeholder="Enter برای افزودن" />
            )}
          />

          <Stack direction="row" spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
              <TextField
                label="رنگ اصلی"
                value={form.primaryColor ?? ''}
                onChange={(e) => set({ primaryColor: e.target.value })}
                fullWidth
                size="small"
              />
              <Box
                sx={{
                  width: 32, height: 32, borderRadius: 1, flexShrink: 0,
                  bgcolor: form.primaryColor || 'transparent',
                  border: '1px solid', borderColor: 'divider',
                }}
              />
            </Stack>
          </Stack>

          {isAdminMode && (
            <FormControlLabel
              control={
                <Switch
                  checked={!!form.isActive}
                  onChange={(e) => set({ isActive: e.target.checked })}
                  size="small"
                />
              }
              label="فعال"
            />
          )}

          <Divider />

          {/* ── Ingest tier ── */}
          {isAdminMode && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                تنظیمات جمع‌آوری داده
              </Typography>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>سطح پروفایل (Tier)</InputLabel>
                  <Select
                    value={form.tier || 'medium'}
                    label="سطح پروفایل (Tier)"
                    onChange={(e) => set({ tier: e.target.value })}
                  >
                    {TIER_OPTIONS.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: t.color, flexShrink: 0 }} />
                          <Box>
                            <Typography variant="caption" fontWeight={700} sx={{ display: 'block', lineHeight: 1.2 }}>
                              {t.label}
                            </Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
                              {t.desc}
                            </Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Tier badge */}
                <Box
                  sx={{
                    flex: 1, p: 1.5, borderRadius: 1.5,
                    bgcolor: alpha(tierConfig.color, 0.06),
                    border: `1px solid ${alpha(tierConfig.color, 0.2)}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: tierConfig.color, fontWeight: 700, fontSize: 10 }}>
                    {tierConfig.desc}
                  </Typography>
                  {form.dailyAvgPosts != null && (
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: 9, mt: 0.25 }}>
                      میانگین مشاهده‌شده: {Math.round(form.dailyAvgPosts).toLocaleString('fa-IR')} پست/روز
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
          )}

          {/* ── Source weights ── */}
          {isAdminMode && (
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight={700}>
                  وزن منابع داده
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  endIcon={<Iconify icon={showWeights ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={14} />}
                  onClick={() => setShowWeights((p) => !p)}
                  sx={{ fontSize: 11 }}
                >
                  {showWeights ? 'بستن' : 'تنظیم'}
                </Button>
              </Stack>

              {/* Summary chips when collapsed */}
              {!showWeights && (
                <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.75 }}>
                  {SOURCE_DEFAULTS.map((src) => {
                    const w = (form.sourceWeights || {})[src.key] ?? 1.0;
                    if (w === 1.0) return null;
                    return (
                      <Chip
                        key={src.key}
                        size="small"
                        label={`${src.label}: ×${w.toFixed(1)}`}
                        sx={{
                          height: 20, fontSize: 9,
                          bgcolor: alpha(src.color, 0.1),
                          color: src.color,
                          border: `1px solid ${alpha(src.color, 0.3)}`,
                        }}
                      />
                    );
                  })}
                  {Object.keys(form.sourceWeights || {}).length === 0 && (
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                      همه منابع روی پیش‌فرض سیستم
                    </Typography>
                  )}
                </Stack>
              )}

              {showWeights && (
                <Box sx={{ mt: 1.5 }}>
                  <SourceWeightsEditor
                    weights={form.sourceWeights || {}}
                    onChange={(w) => set({ sourceWeights: w })}
                  />
                </Box>
              )}
            </Box>
          )}

          {isAdminMode && <Divider />}

          <ChannelsEditor
            value={form.officialChannels ?? []}
            onChange={(channels) => set({ officialChannels: channels })}
          />

          {/* Linked users section */}
          {isAdminMode && profile?.id && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    کاربران دارای دسترسی
                  </Typography>
                  <Link
                    href={paths.dashboard.admin.users}
                    underline="hover"
                    variant="caption"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    مدیریت کاربران
                    <Iconify icon="solar:arrow-left-bold" width={12} />
                  </Link>
                </Stack>

                {linkedUsers.length === 0 ? (
                  <Alert severity="info" sx={{ fontSize: 12, py: 0.5 }}>
                    هنوز کاربری به این پروفایل متصل نشده است.
                  </Alert>
                ) : (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {linkedUsers.map((u) => (
                      <Chip
                        key={u.id}
                        avatar={<Avatar src={u.avatar}>{u.name?.charAt(0)}</Avatar>}
                        label={`${u.name} (${u.role === 'super_admin' ? 'سوپر ادمین' : u.role === 'admin' ? 'ادمین' : 'کاربر'})`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </>
          )}

          {error && (
            <Box sx={{ color: 'error.main', fontSize: 13 }}>{error}</Box>
          )}

          {/* ── Promises ── */}
          <Divider />
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>وعده‌های عمومی</Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:add-circle-bold" width={14} />}
                onClick={() => set({ promises: [...(form.promises || []), { text: '', addedAt: new Date().toISOString() }] })}
                sx={{ fontSize: 10, height: 26 }}
              >
                افزودن وعده
              </Button>
            </Stack>
            {(form.promises || []).length === 0 ? (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                وعده‌ای ثبت نشده است.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {(form.promises || []).map((p, idx) => (
                  <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                    <TextField
                      value={p.text}
                      onChange={(e) => {
                        const updated = [...(form.promises || [])];
                        updated[idx] = { ...updated[idx], text: e.target.value };
                        set({ promises: updated });
                      }}
                      fullWidth
                      size="small"
                      multiline
                      maxRows={3}
                      placeholder="متن وعده..."
                      sx={{ '& .MuiInputBase-root': { fontSize: 12 } }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        const updated = (form.promises || []).filter((_, i) => i !== idx);
                        set({ promises: updated });
                      }}
                      sx={{ mt: 0.5, flexShrink: 0 }}
                    >
                      <Iconify icon="solar:trash-bin-2-bold" width={16} />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
            <Button variant="outlined" onClick={onClose} fullWidth>انصراف</Button>
            <Button
              variant="contained"
              onClick={submit}
              disabled={submitting || !form.name}
              fullWidth
            >
              {profile?.id ? 'ذخیره' : 'ایجاد'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}
