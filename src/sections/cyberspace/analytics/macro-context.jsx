import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/lib/axios';
import { useMacroContext } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { InfoTooltip } from 'src/components/info-tooltip';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { useAuthContext } from 'src/auth/hooks';

import { SectionLabel, MacroRawContent } from '../shared/macro-parsed-content';

// ----------------------------------------------------------------------

export function MacroContext() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { data, isLoading, refetch } = useMacroContext();
  const [generating, setGenerating] = useState(false);
  const [showRolling, setShowRolling] = useState(false);

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

  const raw       = data?.today || null;
  const raw7d     = data?.rolling7d || null;
  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

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
              <InfoTooltip title={WIDGET_TOOLTIPS.macroContext} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>بستر سیاسی-اجتماعی حاکم بر فضای رصد</Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
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

        {/* Today — structured or plain text */}
        {!isLoading && raw && <MacroRawContent raw={raw} />}

        {/* Rolling 7-day section */}
        {!isLoading && raw7d && (
          <>
            <Divider sx={{ my: 2, opacity: 0.4 }} />
            <Button
              size="small"
              variant="text"
              onClick={() => setShowRolling((p) => !p)}
              endIcon={
                <Iconify
                  icon={showRolling ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
                  width={14}
                />
              }
              sx={{ fontSize: 10, color: 'text.secondary', px: 0, mb: showRolling ? 1.5 : 0 }}
            >
              {showRolling ? 'بستن' : 'نمایش'} روند ۷ روزه
            </Button>

            <Collapse in={showRolling}>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.04), border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}>
                <SectionLabel icon="solar:history-bold-duotone" label="خلاصه ۷ روز گذشته" color={theme.palette.info.main} />
                <MacroRawContent raw={raw7d} />
              </Box>
            </Collapse>
          </>
        )}
      </Box>
    </Card>
  );
}
