import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/lib/axios';
import { useMacroContext } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const SEVERITY = {
  high:   { color: '#FF6B6B', label: 'بحرانی',     icon: 'solar:danger-triangle-bold-duotone' },
  medium: { color: '#FFA94D', label: 'مهم',         icon: 'solar:shield-warning-bold-duotone' },
  low:    { color: '#51CF66', label: 'قابل توجه',   icon: 'solar:info-circle-bold-duotone' },
};

function SectionLabel({ icon, label, color }) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
      <Iconify icon={icon} width={14} sx={{ color: color || theme.palette.text.secondary }} />
      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10, color: color || 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function MacroContext() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { data, isLoading, refetch } = useMacroContext();
  const [generating, setGenerating] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await axios.post('/api/admin/ingest/macro-context/generate');
      await refetch();
    } catch (e) {
      console.error('Generate failed:', e);
    } finally {
      setGenerating(false);
    }
  };

  const raw = data?.today || null;
  const updatedAt = data?.updatedAt ? new Date(data.updatedAt).toLocaleString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  // Try to parse JSON
  let parsed = null;
  if (raw) {
    try { parsed = JSON.parse(raw); } catch { /* plain text fallback */ }
  }

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      {/* Header */}
      <Box sx={{ p: 2, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.07)} 100%)` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.14) }}>
              <Iconify icon="solar:globe-bold-duotone" width={22} sx={{ color: theme.palette.primary.main }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>وضعیت کلان</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>بستر سیاسی-اجتماعی حاکم بر فضای رصد</Typography>
            </Box>
          </Stack>
          {updatedAt && (
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9 }}>
              {updatedAt}
            </Typography>
          )}
          {isSuperAdmin && (
            <Button
              size="small"
              variant="outlined"
              onClick={handleGenerate}
              disabled={generating}
              startIcon={generating ? <CircularProgress size={12} /> : <Iconify icon="solar:refresh-bold" width={14} />}
              sx={{ fontSize: 9, height: 26, minWidth: 0, px: 1 }}
            >
              {generating ? 'در حال تولید...' : 'بروزرسانی'}
            </Button>
          )}
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!isLoading && !raw && (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Iconify icon="solar:globe-bold-duotone" width={36} sx={{ color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">گزارش وضعیت کلان هنوز تولید نشده است.</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
              هر ۱۲ ساعت به‌صورت خودکار تولید می‌شود.
            </Typography>
          </Box>
        )}

        {/* JSON structured display */}
        {!isLoading && parsed && (
          <Stack spacing={2}>
            {/* Events */}
            {parsed.events?.length > 0 && (
              <Box>
                <SectionLabel icon="solar:calendar-bold-duotone" label="رویدادها" />
                <Stack spacing={0.75}>
                  {parsed.events.map((ev, i) => {
                    const sev = SEVERITY[ev.severity] || SEVERITY.medium;
                    return (
                      <Stack key={i} direction="row" alignItems="flex-start" spacing={1}
                        sx={{ p: 1.25, borderRadius: 1.5, bgcolor: alpha(sev.color, 0.05), borderRight: `3px solid ${sev.color}` }}>
                        <Iconify icon={sev.icon} width={16} sx={{ color: sev.color, mt: 0.2, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11, display: 'block' }}>{ev.title}</Typography>
                          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.5 }}>{ev.summary}</Typography>
                          {ev.actor && (
                            <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled', display: 'block', mt: 0.25 }}>
                              {ev.actor}
                            </Typography>
                          )}
                        </Box>
                        <Chip label={sev.label} size="small" sx={{ height: 18, fontSize: 8, fontWeight: 700, flexShrink: 0, bgcolor: alpha(sev.color, 0.12), color: sev.color }} />
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* Tensions */}
            {parsed.tensions && (
              <>
                <Divider sx={{ opacity: 0.4 }} />
                <Box>
                  <SectionLabel icon="solar:danger-bold-duotone" label="تنش‌ها" color={theme.palette.error.main} />
                  <Stack spacing={0.5}>
                    {[
                      { key: 'domestic', label: 'داخلی',   icon: 'solar:home-bold',           color: '#868E96' },
                      { key: 'foreign',  label: 'خارجی',   icon: 'solar:global-bold',          color: '#4DABF7' },
                      { key: 'economic', label: 'اقتصادی', icon: 'solar:chart-bold',            color: '#FFA94D' },
                    ].map(({ key, label, icon, color }) => parsed.tensions[key] ? (
                      <Stack key={key} direction="row" alignItems="flex-start" spacing={1} sx={{ py: 0.5 }}>
                        <Iconify icon={icon} width={13} sx={{ color, mt: 0.3, flexShrink: 0 }} />
                        <Box>
                          <Typography component="span" variant="caption" sx={{ fontWeight: 700, fontSize: 10, color }}>{label}: </Typography>
                          <Typography component="span" variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>{parsed.tensions[key]}</Typography>
                        </Box>
                      </Stack>
                    ) : null)}
                  </Stack>
                </Box>
              </>
            )}

            {/* Media atmosphere */}
            {parsed.media_atmosphere && (
              <>
                <Divider sx={{ opacity: 0.4 }} />
                <Box>
                  <SectionLabel icon="solar:tv-bold-duotone" label="فضای رسانه" />
                  <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.6 }}>
                    {parsed.media_atmosphere}
                  </Typography>
                </Box>
              </>
            )}

            {/* Forecast */}
            {parsed.forecast && (
              <>
                <Divider sx={{ opacity: 0.4 }} />
                <Box>
                  <SectionLabel icon="solar:clock-circle-bold-duotone" label="پیش‌بینی ۴۸ ساعت" color={theme.palette.warning.main} />
                  <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.6 }}>
                    {parsed.forecast}
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        )}

        {/* Plain text fallback */}
        {!isLoading && raw && !parsed && (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 2, fontSize: 11, color: 'text.primary', direction: 'rtl' }}>
            {raw}
          </Typography>
        )}
      </Box>
    </Card>
  );
}
