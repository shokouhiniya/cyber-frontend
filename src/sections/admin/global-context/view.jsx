'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import {
  useGlobalContext,
  useDeleteGlobalContext,
  useUpsertGlobalContext,
} from 'src/api/admin';

import { Iconify } from 'src/components/iconify';

import { MacroRawContent, parseMacroValue } from 'src/sections/cyberspace/shared/macro-parsed-content';

import { AdminPageHeader } from '../shared/page-header';

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

  const [dialog, setDialog] = useState(null);

  const openEdit = (r) => setDialog({ key: r.key, value: r.value ?? '', isNew: false });
  const openNew  = () => setDialog({ key: '', value: '', isNew: true });

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
                        label={`global_${r.key}`}
                        sx={{ fontFamily: 'monospace', fontSize: 11 }}
                      />
                      {isMacro && (
                        <Chip size="small" label="وضعیت کلان" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                      )}
                      {r.updatedAt && (
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
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
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <IconButton size="small" onClick={() => openEdit(r)} title="ویرایش">
                      <Iconify icon="solar:pen-bold" width={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
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
            );
          })}
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
  const theme = useTheme();

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
          <Button size="small" variant="outlined" onClick={addEvent} startIcon={<Iconify icon="eva:plus-fill" width={14} />} sx={{ fontSize: 11, height: 28 }}>
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
              <Stack spacing={1} sx={{ pr: 0.5 }}>
                <Stack direction="row" spacing={1}>
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
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
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
          disabled={saving || !form.key}
        >
          {saving ? 'در حال ذخیره...' : 'ذخیره'}
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
          startIcon={<Iconify icon="eva:plus-fill" width={14} />}
          sx={{ fontSize: 11, height: 28 }}
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
          <Stack spacing={1}>
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
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
          فیلدی تعریف نشده — برای افزودن دکمه بالا را بزنید.
        </Typography>
      )}

      {/* Preview */}
      {fields.some((f) => f.key) && (
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, display: 'block', mb: 0.5 }}>
            پیش‌نمایش JSON:
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 1.5, borderRadius: 1, bgcolor: 'grey.100',
              fontSize: 10, fontFamily: 'monospace', overflowX: 'auto',
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
