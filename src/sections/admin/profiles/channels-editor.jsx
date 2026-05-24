'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';

import { PlatformIcon } from 'src/sections/cyberspace/mypages/platform-icon';
import { PLATFORMS, platformById } from 'src/sections/cyberspace/mypages/platform-config';

// ----------------------------------------------------------------------

const EMPTY_CHANNEL = {
  platform: 'telegram',
  handle: '',
  verified: false,
  active: true,
};

/**
 * Minimal add/edit dialog.
 * Only asks for platform + handle (username/channel id).
 * Followers, posts, and display name will be fetched automatically later.
 */
function ChannelDialog({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial ?? EMPTY_CHANNEL);

  useEffect(() => {
    if (open) setForm(initial ?? EMPTY_CHANNEL);
  }, [open, initial]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const cfg = platformById[form.platform] ?? PLATFORMS[0];

  const save = () => {
    onSave({
      platform: form.platform,
      handle: form.handle.trim(),
      verified: !!form.verified,
      active: !!form.active,
      // preserve existing stats if editing
      ...(initial?.followers != null ? { followers: initial.followers } : {}),
      ...(initial?.posts != null ? { posts: initial.posts } : {}),
      ...(initial?.displayName ? { displayName: initial.displayName } : {}),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{initial ? 'ویرایش کانال' : 'افزودن کانال'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>پلتفرم</InputLabel>
            <Select
              value={form.platform}
              label="پلتفرم"
              onChange={(e) => set({ platform: e.target.value })}
            >
              {PLATFORMS.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 24, height: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <PlatformIcon cfg={p} size={20} />
                    </Box>
                    <span>{p.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="نام کاربری / آدرس کانال"
            value={form.handle}
            onChange={(e) => set({ handle: e.target.value })}
            fullWidth
            required
            autoFocus
            placeholder={cfg.placeholder}
            helperText={`مثال: ${cfg.urlPrefix}${cfg.placeholder}`}
            slotProps={{ input: { style: { direction: 'ltr' } } }}
          />

          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={<Switch checked={!!form.verified} onChange={(e) => set({ verified: e.target.checked })} />}
              label="تأیید شده"
            />
            <FormControlLabel
              control={<Switch checked={!!form.active} onChange={(e) => set({ active: e.target.checked })} />}
              label="فعال"
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={save} disabled={!form.handle.trim()}>
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

/**
 * Inline editor for the `officialChannels` array on a profile.
 * Receives `value` (array) and `onChange` (setter).
 */
export function ChannelsEditor({ value = [], onChange }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);

  const openNew = () => {
    setEditingIdx(null);
    setDialogOpen(true);
  };

  const openEdit = (idx) => {
    setEditingIdx(idx);
    setDialogOpen(true);
  };

  const handleSave = (ch) => {
    if (editingIdx !== null) {
      const next = [...value];
      next[editingIdx] = ch;
      onChange(next);
    } else {
      onChange([...value, ch]);
    }
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  const toggle = (idx) => {
    const next = [...value];
    next[idx] = { ...next[idx], active: !next[idx].active };
    onChange(next);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          صفحات رسمی
        </Typography>
        <Button size="small" startIcon={<Iconify icon="eva:plus-fill" />} onClick={openNew}>
          افزودن
        </Button>
      </Stack>

      {value.length === 0 ? (
        <Card
          variant="outlined"
          sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          onClick={openNew}
        >
          <Typography variant="body2" color="text.secondary">
            هنوز صفحه‌ای اضافه نشده — کلیک کنید
          </Typography>
        </Card>
      ) : (
        <Stack spacing={1}>
          {value.map((ch, idx) => {
            const cfg = platformById[ch.platform] ?? {
              label: ch.platform,
              iconType: 'iconify',
              icon: 'solar:global-bold-duotone',
              color: '#607D8B',
            };
            const isActive = ch.active !== false;

            return (
              <Card
                key={idx}
                variant="outlined"
                sx={{
                  p: 1.5,
                  opacity: isActive ? 1 : 0.55,
                  bgcolor: alpha(cfg.color, 0.04),
                  borderColor: alpha(cfg.color, 0.2),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  {/* Platform icon */}
                  <Box
                    sx={{
                      width: 32, height: 32, borderRadius: 1,
                      bgcolor: alpha(cfg.color, 0.14),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <PlatformIcon cfg={cfg} size={20} />
                  </Box>

                  {/* Label + handle */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="caption" fontWeight={700}>{cfg.label}</Typography>
                      {ch.verified && (
                        <Iconify icon="solar:verified-check-bold" width={14} sx={{ color: '#1DA1F2' }} />
                      )}
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ direction: 'ltr', display: 'block' }}
                    >
                      {ch.handle}
                    </Typography>
                  </Box>

                  {/* Active toggle */}
                  <Switch
                    size="small"
                    checked={isActive}
                    onChange={() => toggle(idx)}
                    sx={{ flexShrink: 0 }}
                  />

                  {/* Edit */}
                  <IconButton size="small" onClick={() => openEdit(idx)}>
                    <Iconify icon="solar:pen-bold" width={16} />
                  </IconButton>

                  {/* Remove */}
                  <IconButton size="small" onClick={() => remove(idx)}>
                    <Iconify icon="solar:trash-bin-2-bold" width={16} />
                  </IconButton>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}

      <ChannelDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initial={editingIdx !== null ? value[editingIdx] : null}
      />
    </Box>
  );
}
