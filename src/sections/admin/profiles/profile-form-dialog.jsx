'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
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
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { fNum } from 'src/utils/format-number-fa';

import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';
import {
  useAdminUsers,
  useUpdateUser,
  useCreateProfile,
  useUpdateProfile,
  useUploadProfileAvatar,
  useRemoveProfileAvatar,
} from 'src/api/admin';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { getErrorText } from '../shared/admin-ui';
import { ChannelsEditor, ChannelsGridEditor } from './channels-editor';

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

// Higher first in every profile list. Stored as an integer (migration 016).
const PRIORITY_OPTIONS = [
  { value: 100, label: 'ویژه', desc: 'همیشه بالای فهرست', icon: 'solar:star-bold', color: 'warning.main' },
  { value: 50,  label: 'بالا', desc: 'پس از ویژه‌ها',      icon: 'solar:star-bold-duotone', color: 'info.main' },
  { value: 0,   label: 'عادی', desc: 'ترتیب الفبایی',      icon: 'solar:star-bold-duotone', color: 'text.disabled' },
];

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

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
            sx={{ fontSize: 12, minWidth: 0, px: 1 }}
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
                <Typography variant="caption" sx={{ flex: 1, fontWeight: 600, fontSize: 12 }}>
                  {src.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 12, fontWeight: 700, minWidth: 52, textAlign: 'left',
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

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, fontSize: 12 }}>
        ۱.۰ = پیش‌فرض سیستم | ۰ = حذف از نمونه | بیشتر از ۱ = افزایش سهم
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

// ── Widget registry ───────────────────────────────────────────────────────────

export const DASHBOARD_WIDGETS = [
  { key: 'reputation_gauge',   label: 'شاخص سلامت اعتبار',        tab: 'داشبورد' },
  { key: 'ai_summary',         label: 'خلاصه هوش مصنوعی',          tab: 'داشبورد' },
  { key: 'crisis_radar',       label: 'رادار بحران',                tab: 'داشبورد' },
  { key: 'trend_chart',        label: 'روند احساسات',               tab: 'داشبورد' },
  { key: 'political_spectrum', label: 'طیف سیاسی',                  tab: 'داشبورد' },
  { key: 'hot_topics',         label: 'هشتگ‌های داغ',               tab: 'داشبورد' },
  { key: 'important_posts',    label: 'پربازدیدترین محتواها',        tab: 'داشبورد' },
  { key: 'macro_context',      label: 'وضعیت کلان',                 tab: 'تحلیل' },
  { key: 'emotion_chart',      label: 'چشم‌انداز عمومی',            tab: 'تحلیل' },
  { key: 'semantic_cloud',     label: 'ابر واژگان هوشمند',           tab: 'تحلیل' },
  { key: 'bot_vs_human',       label: 'تفکیک کاربران',              tab: 'تحلیل' },
  { key: 'narrative_gap',      label: 'تحلیل شکاف روایت',           tab: 'تحلیل' },
  { key: 'platforms_chart',    label: 'منابع داده',                  tab: 'تحلیل' },
  { key: 'official_accounts',  label: 'صفحات رسمی',                 tab: 'رسانه' },
  { key: 'official_timeline',  label: 'تایم‌لاین یکپارچه',           tab: 'رسانه' },
  { key: 'content_analysis',   label: 'تحلیل محتوای منتشرشده',       tab: 'رسانه' },
  { key: 'promise_tracker',    label: 'رصد وعده‌ها',                 tab: 'رسانه' },
  { key: 'recommendations',    label: 'پیشنهادات واکنش هوشمند',      tab: 'پیشنهادها' },
];

// ── User access editor ────────────────────────────────────────────────────────

function UserAccessEditor({ profileId, allUsers, linkedUsers }) {
  const updateUser = useUpdateUser();
  const [saving, setSaving] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const linkedIds = new Set(linkedUsers.map((u) => u.id));
  const addableUsers = allUsers.filter((u) => u.role !== 'super_admin' && u.isActive && !linkedIds.has(u.id));

  const remove = async (user) => {
    setSaving(user.id);
    try {
      await updateUser.mutateAsync({ id: user.id, profileIds: (user.profileIds || []).filter((id) => id !== profileId) });
      toast.success(`دسترسی «${user.name}» حذف شد`);
    } catch (e) {
      toast.error(getErrorText(e, 'خطا در حذف دسترسی کاربر'));
    } finally { setSaving(null); }
  };

  const add = async (user) => {
    setSaving(user.id);
    try {
      await updateUser.mutateAsync({ id: user.id, profileIds: [...(user.profileIds || []), profileId] });
      toast.success(`دسترسی به «${user.name}» داده شد`);
    } catch (e) {
      toast.error(getErrorText(e, 'خطا در افزودن کاربر'));
    } finally { setSaving(null); setAddOpen(false); }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>کاربران دارای دسترسی</Typography>
        <IconButton size="small" onClick={() => setAddOpen(true)} title="افزودن کاربر">
          <Iconify icon="solar:add-circle-bold" width={18} sx={{ color: 'primary.main' }} />
        </IconButton>
      </Stack>

      {linkedUsers.length === 0 ? (
        <Alert severity="info" sx={{ fontSize: 12, py: 0.5 }}>هنوز کاربری به این پروفایل متصل نشده است.</Alert>
      ) : (
        <Stack spacing={0.5}>
          {linkedUsers.map((u) => {
            const isSaving = saving === u.id;
            return (
              <Stack key={u.id} direction="row" alignItems="center" spacing={1.5}
                sx={{ px: 1.5, py: 0.75, borderRadius: 1.5, border: '1px solid', borderColor: 'primary.light', bgcolor: 'primary.lighter', opacity: isSaving ? 0.6 : 1 }}>
                <Avatar sx={{ width: 26, height: 26, fontSize: 12, fontWeight: 700, bgcolor: 'primary.main', color: '#fff' }}>{u.name?.charAt(0)}</Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: 12, display: 'block' }}>{u.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>@{u.username}</Typography>
                </Box>
                <IconButton size="small" onClick={() => !isSaving && remove(u)} sx={{ p: 0.25 }}>
                  <Iconify icon={isSaving ? 'solar:refresh-bold' : 'solar:close-circle-bold'} width={16} sx={{ color: 'error.light' }} />
                </IconButton>
              </Stack>
            );
          })}
        </Stack>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>افزودن کاربر به پروفایل</DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          {addableUsers.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>همه کاربران فعال دسترسی دارند.</Typography>
          ) : (
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              {addableUsers.map((u) => (
                <Stack key={u.id} direction="row" alignItems="center" spacing={1.5}
                  sx={{ px: 1.5, py: 0.75, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', cursor: 'pointer', transition: 'all 0.15s', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lighter' }, opacity: saving === u.id ? 0.6 : 1 }}
                  onClick={() => saving !== u.id && add(u)}>
                  <Avatar sx={{ width: 26, height: 26, fontSize: 12, fontWeight: 700, bgcolor: 'action.selected', color: 'text.secondary' }}>{u.name?.charAt(0)}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: 12, display: 'block' }}>{u.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>@{u.username}</Typography>
                  </Box>
                  <Iconify icon={saving === u.id ? 'solar:refresh-bold' : 'solar:add-circle-bold'} width={16} sx={{ color: 'primary.main' }} />
                </Stack>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// ── Widget visibility editor ──────────────────────────────────────────────────

function WidgetVisibilityEditor({ hiddenWidgets, onChange }) {
  const [open, setOpen] = useState(false);
  const hiddenSet = new Set(hiddenWidgets || []);
  const hiddenCount = hiddenSet.size;

  const toggle = (key) => {
    const next = new Set(hiddenSet);
    if (next.has(key)) next.delete(key); else next.add(key);
    onChange([...next]);
  };

  // Group by tab
  const tabs = [...new Set(DASHBOARD_WIDGETS.map((w) => w.tab))];

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="solar:eye-bold" width={15} />}
        onClick={() => setOpen(true)}
        sx={{ fontSize: 12, alignSelf: 'flex-start' }}
      >
        مدیریت نمایش بخش‌ها
        {hiddenCount > 0 && (
          <Box component="span" sx={{ ml: 0.75, px: 0.75, py: 0.1, borderRadius: 1, bgcolor: (t) => alpha(t.palette.error.main, 0.14), color: 'error.main', fontSize: 12, fontWeight: 700 }}>
            {hiddenCount} پنهان
          </Box>
        )}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:eye-bold" width={18} sx={{ color: 'primary.main' }} />
            <span>مدیریت نمایش بخش‌ها</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontSize: 12 }}>
            بخش‌های پنهان برای کاربران این پروفایل نمایش داده نمی‌شوند.
          </Typography>
          {tabs.map((tab) => (
            <Box key={tab} sx={{ mb: 2 }}>
              <Typography variant="caption" fontWeight={800} sx={{ color: 'text.disabled', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1, display: 'block', mb: 0.75 }}>
                {tab}
              </Typography>
              <Stack spacing={0.5}>
                {DASHBOARD_WIDGETS.filter((w) => w.tab === tab).map((w) => {
                  const hidden = hiddenSet.has(w.key);
                  return (
                    <Stack key={w.key} direction="row" alignItems="center" spacing={1.5}
                      sx={{ px: 1.25, py: 0.6, borderRadius: 1.25, border: '1px solid', borderColor: hidden ? 'error.light' : 'divider', bgcolor: hidden ? 'error.lighter' : 'transparent', cursor: 'pointer', transition: 'all 0.12s', '&:hover': { borderColor: hidden ? 'error.main' : 'primary.main' } }}
                      onClick={() => toggle(w.key)}>
                      <Iconify icon={hidden ? 'solar:eye-closed-bold' : 'solar:eye-bold'} width={15} sx={{ color: hidden ? 'error.main' : 'success.main', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ fontSize: 12, flex: 1, color: hidden ? 'error.dark' : 'text.primary', fontWeight: hidden ? 600 : 400 }}>{w.label}</Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button size="small" onClick={() => setOpen(false)} variant="contained">بستن</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------
// Main form dialog
// ----------------------------------------------------------------------

export function ProfileFormDialog({ open, onClose, profile, mode = 'admin' }) {
  const theme = useTheme();
  const { desktopMode } = useAdminDesktopMode();
  const [form, setForm] = useState({ name:'',sortName:'',role:'',organization:'',avatar:'',keywords:[],excludedKeywords:[],sortCriteria:'recent',primaryColor:'#1e6091',isActive:true,officialChannels:[],tier:'medium',dailyAvgPosts:null,sourceWeights:{},hiddenWidgets:[] });
  const [error, setError] = useState(null);
  const [showWeights, setShowWeights] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);

  const isAdminMode = mode === 'admin';
  const create = useCreateProfile();
  const update = useUpdateProfile();
  const uploadAvatar = useUploadProfileAvatar();
  const removeAvatar = useRemoveProfileAvatar();
  const { data: allUsers = [] } = useAdminUsers();
  const linkedUsers = profile?.id ? allUsers.filter((u) => u.profileIds?.includes(profile.id)) : [];

  useEffect(() => {
    if (open) {
      setError(null);
      setShowWeights(false);
      setPendingAvatar(null);
      setPendingPreview(null);
      setForm(profile ? { name:'',sortName:'',role:'',organization:'',avatar:'',keywords:[],excludedKeywords:[],sortCriteria:'recent',primaryColor:'#1e6091',isActive:true,officialChannels:[],tier:'medium',dailyAvgPosts:null,sourceWeights:{},hiddenWidgets:[], ...profile } : { name:'',sortName:'',role:'',organization:'',avatar:'',keywords:[],excludedKeywords:[],sortCriteria:'recent',primaryColor:'#1e6091',isActive:true,officialChannels:[],tier:'medium',dailyAvgPosts:null,sourceWeights:{},hiddenWidgets:[] });
    }
  }, [open, profile]);

  // Release the object URL used for a not-yet-uploaded avatar preview.
  useEffect(() => () => { if (pendingPreview) URL.revokeObjectURL(pendingPreview); }, [pendingPreview]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    setError(null);
    try {
      if (profile?.id) { await update.mutateAsync({ id: profile.id, ...form }); }
      else {
        const created = await create.mutateAsync(form);
        if (pendingAvatar && created?.id) {
          try { await uploadAvatar.mutateAsync({ id: created.id, file: pendingAvatar }); }
          catch (e) { toast.error(getErrorText(e, 'پروفایل ایجاد شد ولی بارگذاری تصویر ناموفق بود')); }
        }
      }
      toast.success(profile?.id ? 'پروفایل ذخیره شد' : 'پروفایل جدید ایجاد شد');
      onClose();
    } catch (e) { setError(getErrorText(e, 'خطا در ذخیره‌سازی')); }
  };

  const submitting = create.isPending || update.isPending || uploadAvatar.isPending;
  const tierConfig = TIER_OPTIONS.find((t) => t.value === form.tier) || TIER_OPTIONS[1];

  // ── Avatar upload ──────────────────────────────────────────────────────────
  // Existing profiles upload immediately (POST /admin/profiles/:id/avatar); new
  // profiles keep the file until the profile is created.
  const avatarSrc = pendingPreview || form.avatar || undefined;
  const hasAvatar = Boolean(pendingPreview || form.avatar);
  const avatarBusy = uploadAvatar.isPending || removeAvatar.isPending;

  const handleAvatarPick = async (file) => {
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) { toast.error('فقط تصاویر JPG، PNG یا WEBP مجاز است'); return; }
    if (file.size > AVATAR_MAX_BYTES) { toast.error('حجم تصویر باید حداکثر ۲ مگابایت باشد'); return; }
    if (!profile?.id) {
      setPendingAvatar(file);
      setPendingPreview(URL.createObjectURL(file));
      return;
    }
    try {
      const res = await uploadAvatar.mutateAsync({ id: profile.id, file });
      set({ avatar: res?.avatar ?? '' });
      toast.success('تصویر پروفایل به‌روزرسانی شد');
    } catch (e) { toast.error(getErrorText(e, 'خطا در بارگذاری تصویر')); }
  };

  const handleAvatarRemove = async () => {
    if (pendingAvatar) { setPendingAvatar(null); setPendingPreview(null); return; }
    if (!profile?.id) { set({ avatar: '' }); return; }
    try {
      await removeAvatar.mutateAsync(profile.id);
      set({ avatar: '' });
      toast.success('تصویر پروفایل حذف شد');
    } catch (e) { toast.error(getErrorText(e, 'خطا در حذف تصویر')); }
  };

  const avatarUpload = (
    <Stack spacing={1} alignItems="center" sx={{ flexShrink: 0, width: 104 }}>
      <Box sx={{ position: 'relative' }}>
        <Avatar src={avatarSrc} alt={form.name} sx={{ width: 88, height: 88, color: 'common.white', bgcolor: form.primaryColor || 'primary.main', fontSize: 32, fontWeight: 700 }}>{form.name?.charAt(0)}</Avatar>
        <Box component="label" htmlFor="avatar-upload" sx={{ position: 'absolute', inset: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.45)', opacity: avatarBusy ? 1 : 0, cursor: avatarBusy ? 'wait' : 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 1 } }}>
          {avatarBusy ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : <Iconify icon="solar:camera-add-bold" width={24} sx={{ color: '#fff' }} />}
        </Box>
        <input id="avatar-upload" type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} disabled={avatarBusy}
          onChange={(e) => { handleAvatarPick(e.target.files?.[0]); e.target.value = ''; }}
        />
      </Box>
      {hasAvatar && (
        <Button size="small" color="error" variant="text" disabled={avatarBusy} onClick={handleAvatarRemove}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} />} sx={{ fontSize: 12 }}>
          حذف تصویر
        </Button>
      )}
    </Stack>
  );

  // ── Identity section ───────────────────────────────────────────────────────
  const identitySection = (
    <Stack spacing={2}>
      {desktopMode && <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>هویت</Typography>}
      <Stack direction="row" spacing={2} alignItems="center">
        {avatarUpload}
        <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            برای کیفیت بهتر، تصویر مربعی با عرض حداقل ۴۰۰ پیکسل بارگذاری کنید (JPG، PNG یا WEBP — حداکثر ۲ مگابایت).
          </Typography>
          <TextField label="یا آدرس تصویر (URL)" value={pendingPreview || form.avatar?.startsWith('data:') ? '' : (form.avatar ?? '')} onChange={(e) => set({ avatar: e.target.value })} fullWidth size="small" placeholder="https://..." disabled={Boolean(pendingPreview)} helperText={form.avatar?.startsWith('data:') ? 'تصویر قدیمی (کم‌کیفیت) — برای بهبود، تصویر جدید بارگذاری کنید' : undefined} />
        </Stack>
      </Stack>
      <TextField label="نام" value={form.name} onChange={(e) => set({ name: e.target.value })} fullWidth required size="small" />
      {isAdminMode && <TextField label="نام خانوادگی (مرتب‌سازی)" value={form.sortName ?? ''} onChange={(e) => set({ sortName: e.target.value })} fullWidth size="small" placeholder="مثال: قالیباف" helperText="اگر خالی باشد آخرین کلمه نام استفاده می‌شود" />}
      <Stack direction="row" spacing={2}>
        <TextField label="نقش / سمت" value={form.role ?? ''} onChange={(e) => set({ role: e.target.value })} fullWidth size="small" />
        <TextField label="سازمان" value={form.organization ?? ''} onChange={(e) => set({ organization: e.target.value })} fullWidth size="small" />
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField label="رنگ اصلی" value={form.primaryColor ?? ''} onChange={(e) => set({ primaryColor: e.target.value })} fullWidth size="small" />
        <Box sx={{ width: 32, height: 32, borderRadius: 1, flexShrink: 0, bgcolor: form.primaryColor || 'transparent', border: '1px solid', borderColor: 'divider' }} />
      </Stack>
      {isAdminMode && <FormControlLabel control={<Switch checked={!!form.isActive} onChange={(e) => set({ isActive: e.target.checked })} size="small" />} label="فعال" />}
      {isAdminMode && (
        <FormControl size="small" fullWidth>
          <InputLabel>اولویت</InputLabel>
          <Select value={form.priority ?? 0} label="اولویت" onChange={(e) => set({ priority: Number(e.target.value) })}>
            {PRIORITY_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon={o.icon} width={16} sx={{ color: o.color }} />
                  <Typography variant="body2" fontWeight={600}>{o.label}</Typography>
                  <Typography variant="caption" color="text.disabled">{o.desc}</Typography>
                </Stack>
              </MenuItem>
            ))}
            {!PRIORITY_OPTIONS.some((o) => o.value === (form.priority ?? 0)) && (
              <MenuItem value={form.priority}>سفارشی ({fNum(form.priority)})</MenuItem>
            )}
          </Select>
        </FormControl>
      )}
      {isAdminMode && (
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>سطح پروفایل (Tier)</InputLabel>
            <Select value={form.tier || 'medium'} label="سطح پروفایل (Tier)" onChange={(e) => set({ tier: e.target.value })}>
              {TIER_OPTIONS.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: t.color, flexShrink: 0 }} />
                    <Typography variant="caption" fontWeight={700}>{t.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flex: 1, p: 1, borderRadius: 1.5, bgcolor: alpha(tierConfig.color, 0.06), border: `1px solid ${alpha(tierConfig.color, 0.2)}` }}>
            <Typography variant="caption" sx={{ color: tierConfig.color, fontWeight: 700, fontSize: 12, display: 'block' }}>{tierConfig.desc}</Typography>
            {form.dailyAvgPosts != null && <Typography variant="caption" color="text.disabled" sx={{ fontSize: 12 }}>میانگین: {Math.round(form.dailyAvgPosts).toLocaleString('fa-IR')} پست/روز</Typography>}
          </Box>
        </Stack>
      )}
      {isAdminMode && profile?.id && (
        <>
          <Divider />
          <UserAccessEditor profileId={profile.id} allUsers={allUsers} linkedUsers={linkedUsers} />
          <Divider />
          <WidgetVisibilityEditor hiddenWidgets={form.hiddenWidgets || []} onChange={(w) => set({ hiddenWidgets: w })} />
          <Divider />
          <Button size="small" variant="outlined" startIcon={<Iconify icon="solar:document-text-bold" width={16} />}
            onClick={() => { onClose(); window.location.href = `/dashboard/admin/global-context?tab=1&profile=${profile.id}`; }}
            sx={{ fontSize: 12, alignSelf: 'flex-start' }}>
            ویرایش زمینه تحلیل
          </Button>
        </>
      )}
    </Stack>
  );

  // ── Data section ───────────────────────────────────────────────────────────
  const dataSection = (
    <Stack spacing={2}>
      {desktopMode && <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>جمع‌آوری داده</Typography>}
      <Autocomplete multiple freeSolo options={[]} value={form.keywords || []} onChange={(_, val) => set({ keywords: val })} size="small"
        renderTags={(val, props) => val.map((opt, i) => { const { key, ...tagProps } = props({ index: i }); return <Chip key={key} label={opt} size="small" {...tagProps} />; })}
        renderInput={(params) => <TextField {...params} label="کلیدواژه‌ها (include)" placeholder="Enter برای افزودن" />}
      />
      <Autocomplete multiple freeSolo options={[]} value={form.excludedKeywords || []} onChange={(_, val) => set({ excludedKeywords: val })} size="small"
        renderTags={(val, props) => val.map((opt, i) => { const { key, ...tagProps } = props({ index: i }); return <Chip key={key} label={opt} size="small" {...tagProps} />; })}
        renderInput={(params) => <TextField {...params} label="کلیدواژه‌های حذف‌شده (exclude)" placeholder="Enter برای افزودن" />}
      />
      {isAdminMode && (
        <>
          <Divider />
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight={700}>وزن منابع داده</Typography>
              <Button size="small" variant="text" endIcon={<Iconify icon={showWeights ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={14} />} onClick={() => setShowWeights((p) => !p)} sx={{ fontSize: 12 }}>{showWeights ? 'بستن' : 'تنظیم'}</Button>
            </Stack>
            {!showWeights && (
              <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.75 }}>
                {SOURCE_DEFAULTS.map((src) => { const w = (form.sourceWeights || {})[src.key] ?? 1.0; if (w === 1.0) return null; return <Chip key={src.key} size="small" label={`${src.label}: ×${w.toFixed(1)}`} sx={{ height: 20, fontSize: 12, bgcolor: alpha(src.color, 0.1), color: src.color, border: `1px solid ${alpha(src.color, 0.3)}` }} />; })}
                {Object.keys(form.sourceWeights || {}).length === 0 && <Typography variant="caption" color="text.disabled" sx={{ fontSize: 12 }}>همه منابع روی پیش‌فرض سیستم</Typography>}
              </Stack>
            )}
            {showWeights && <Box sx={{ mt: 1.5 }}><SourceWeightsEditor weights={form.sourceWeights || {}} onChange={(w) => set({ sourceWeights: w })} /></Box>}
          </Box>
        </>
      )}
      <Divider />
      {desktopMode ? (
        <ChannelsGridEditor value={form.officialChannels ?? []} onChange={(channels) => set({ officialChannels: channels })} />
      ) : (
        <ChannelsEditor value={form.officialChannels ?? []} onChange={(channels) => set({ officialChannels: channels })} />
      )}
      <Divider />
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>وعده‌های عمومی</Typography>
          <Button size="small" variant="outlined" startIcon={<Iconify icon="solar:add-circle-bold" width={14} />} onClick={() => set({ promises: [...(form.promises || []), { text: '', addedAt: new Date().toISOString() }] })} sx={{ fontSize: 12, height: 26 }}>افزودن</Button>
        </Stack>
        {(form.promises || []).length === 0 ? (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 12 }}>وعده‌ای ثبت نشده است.</Typography>
        ) : (
          <Stack spacing={1}>
            {(form.promises || []).map((p, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                <TextField value={p.text} onChange={(e) => { const updated = [...(form.promises || [])]; updated[idx] = { ...updated[idx], text: e.target.value }; set({ promises: updated }); }} fullWidth size="small" multiline maxRows={3} placeholder="متن وعده..." sx={{ '& .MuiInputBase-root': { fontSize: 12 } }} />
                <IconButton size="small" color="error" onClick={() => set({ promises: (form.promises || []).filter((_, i) => i !== idx) })} sx={{ mt: 0.5, flexShrink: 0 }}><Iconify icon="solar:trash-bin-2-bold" width={16} /></IconButton>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
      {error && <Box sx={{ color: 'error.main', fontSize: 13 }}>{error}</Box>}
    </Stack>
  );

  // ── Desktop: two-pane Dialog ───────────────────────────────────────────────
  if (desktopMode) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { height: '90vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column' } }}>
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={700}>{profile?.id ? 'ویرایش پروفایل' : 'پروفایل جدید'}</Typography>
            <IconButton size="small" onClick={onClose}><Iconify icon="solar:close-circle-bold" width={22} /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, flex: 1, overflow: 'hidden', display: 'flex' }}>
          <Box sx={{ width: '40%', flexShrink: 0, borderLeft: '1px solid', borderColor: 'divider', overflow: 'auto', p: 3 }}>{identitySection}</Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>{dataSection}</Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
          <Button variant="outlined" onClick={onClose} sx={{ minWidth: 100 }}>انصراف</Button>
          <Button variant="contained" onClick={submit} disabled={submitting || !form.name} sx={{ minWidth: 120 }}>{profile?.id ? 'ذخیره تغییرات' : 'ایجاد پروفایل'}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // ── Mobile: bottom Drawer ──────────────────────────────────────────────────
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92vh' } } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
        <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.3) }} />
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>{profile?.id ? 'ویرایش پروفایل' : 'پروفایل جدید'}</Typography>
        <IconButton size="small" onClick={onClose}><Iconify icon="solar:close-circle-bold" width={22} /></IconButton>
      </Stack>
      <Box sx={{ overflow: 'auto', px: 2.5, pb: 3 }}>
        <Stack spacing={2}>
          {identitySection}
          <Divider />
          {dataSection}
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
            <Button variant="outlined" onClick={onClose} fullWidth>انصراف</Button>
            <Button variant="contained" onClick={submit} disabled={submitting || !form.name} fullWidth>{profile?.id ? 'ذخیره' : 'ایجاد'}</Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}
