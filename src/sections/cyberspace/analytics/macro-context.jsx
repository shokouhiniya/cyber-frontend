import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { fRelativeFa } from 'src/utils/format-number-fa';

import axios from 'src/lib/axios';
import { useMacroContext } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { useAuthContext } from 'src/auth/hooks';

import { WidgetCard } from '../shared/widget-card';
import { SectionLabel, MacroRawContent } from '../shared/macro-parsed-content';

// ----------------------------------------------------------------------

function formatExact(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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

  const raw = data?.today || null;
  const raw7d = data?.rolling7d || null;
  const updatedAt = data?.updatedAt || null;

  const renderAction = () => (
    <Stack direction="row" alignItems="center" spacing={1}>
      {updatedAt && (
        <Tooltip title={`آخرین به‌روزرسانی: ${formatExact(updatedAt)}`} arrow>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              px: 1,
              py: 0.5,
              borderRadius: 1,
              color: 'text.secondary',
              bgcolor: alpha(theme.palette.grey[500], 0.08),
            }}
          >
            <Iconify icon="solar:clock-circle-linear" width={14} />
            <Typography variant="caption" sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              {fRelativeFa(updatedAt)}
            </Typography>
          </Stack>
        </Tooltip>
      )}
      {isSuperAdmin && (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={handleGenerate}
          disabled={generating}
          startIcon={
            generating ? <CircularProgress size={14} color="inherit" /> : <Iconify icon="solar:refresh-bold" width={16} />
          }
          sx={{ fontSize: 12, whiteSpace: 'nowrap' }}
        >
          {generating ? 'در حال تولید…' : 'بروزرسانی'}
        </Button>
      )}
    </Stack>
  );

  return (
    <WidgetCard
      title="وضعیت کلان کشور"
      icon="solar:globe-bold-duotone"
      color="primary"
      tooltip={WIDGET_TOOLTIPS.macroContext}
      subheader={
        updatedAt
          ? `گزارش مشترک برای همه شخصیت‌ها · به‌روزشده در ${formatExact(updatedAt)}`
          : 'گزارش مشترک برای همه شخصیت‌ها'
      }
      action={renderAction()}
      loading={isLoading}
      empty={!raw}
      emptyIcon="solar:globe-bold-duotone"
      emptyText="گزارش وضعیت کلان هنوز تولید نشده است."
    >
      <MacroRawContent raw={raw} />

      {raw7d && (
        <>
          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
          <Button
            size="small"
            color="inherit"
            onClick={() => setShowRolling((p) => !p)}
            endIcon={
              <Iconify icon={showRolling ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} width={16} />
            }
            sx={{ fontSize: 13, color: 'text.secondary', mb: showRolling ? 1.5 : 0 }}
          >
            {showRolling ? 'بستن روند ۷ روزه' : 'نمایش روند ۷ روزه'}
          </Button>

          <Collapse in={showRolling} unmountOnExit>
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.grey[500], 0.04),
                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
              }}
            >
              <SectionLabel icon="solar:history-bold-duotone" label="خلاصه ۷ روز گذشته" color={theme.palette.info.main} />
              <MacroRawContent raw={raw7d} />
            </Box>
          </Collapse>
        </>
      )}
    </WidgetCard>
  );
}
