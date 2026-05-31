'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { useProfile, usePromisePerception } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { InfoTooltip } from 'src/components/info-tooltip';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

// ----------------------------------------------------------------------

// Score thresholds for perception label
function getPerceptionLabel(score) {
  if (score === null || score === undefined) return { label: 'داده کافی نیست', color: '#868E96' };
  if (score >= 65) return { label: 'دیدگاه مثبت',   color: '#00AB55' };
  if (score >= 40) return { label: 'دیدگاه خنثی',   color: '#FFAB00' };
  return                  { label: 'دیدگاه منفی',   color: '#FF5630' };
}

export function PromiseTracker() {
  const theme = useTheme();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: perceptions = [], isLoading: perceptionLoading } = usePromisePerception();
  const [open, setOpen] = useState(false);

  const promises = profile?.promises || [];
  const isLoading = profileLoading;

  if (isLoading) {
    return (
      <Card sx={{ p: 2.5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80, borderRadius: 2.5, boxShadow: theme.shadows[2] }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  // Build a map from promise text to perception data
  const perceptionMap = {};
  for (const p of perceptions) {
    perceptionMap[p.text] = p;
  }

  // Summary stats
  const withData = perceptions.filter(p => p.score !== null);
  const avgScore = withData.length > 0
    ? Math.round(withData.reduce((s, p) => s + p.score, 0) / withData.length)
    : null;
  const overallPerception = getPerceptionLabel(avgScore);

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <ButtonBase
        component="div"
        onClick={() => setOpen(p => !p)}
        sx={{
          width: '100%', p: 2.5, display: 'block', textAlign: 'start',
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.warning.main, 0.16) }}>
              <Iconify icon="solar:checklist-bold-duotone" width={24} sx={{ color: theme.palette.warning.main }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>رصد وعده‌ها</Typography>
              <InfoTooltip title={WIDGET_TOOLTIPS.promiseTracker} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {promises.length === 0
                  ? 'وعده عمومی ثبت‌شده‌ای وجود ندارد'
                  : `${promises.length} وعده عمومی`}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            {avgScore !== null && (
              <Chip
                size="small"
                label={overallPerception.label}
                sx={{ height: 20, fontSize: 9, fontWeight: 700, bgcolor: alpha(overallPerception.color, 0.12), color: overallPerception.color }}
              />
            )}
            <Iconify icon={open ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={18} sx={{ color: 'text.secondary' }} />
          </Stack>
        </Stack>
      </ButtonBase>

      <Collapse in={open} timeout={300}>
        <Box sx={{ p: 2 }}>
          {promises.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Iconify icon="solar:checklist-bold-duotone" width={36} sx={{ color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                وعده عمومی ثبت‌شده‌ای برای این پروفایل وجود ندارد.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.25}>
              {promises.map((promise, idx) => {
                const perc = perceptionMap[promise.text];
                const perception = getPerceptionLabel(perc?.score);
                const hasData = perc && perc.postCount > 0;

                return (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5, borderRadius: 1.5,
                      bgcolor: alpha(perception.color, 0.04),
                      border: `1px solid ${alpha(perception.color, 0.14)}`,
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1.25}>
                      <Iconify
                        icon="solar:checklist-minimalistic-bold"
                        width={15}
                        sx={{ color: perception.color, flexShrink: 0, mt: 0.3 }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.7, mb: hasData ? 1 : 0 }}>
                          {promise.text}
                        </Typography>

                        {/* Perception bar */}
                        {perceptionLoading ? (
                          <LinearProgress sx={{ height: 3, borderRadius: 2 }} />
                        ) : hasData ? (
                          <>
                            <Tooltip
                              title={`مثبت ${perc.breakdown.positive}% · خنثی ${perc.breakdown.neutral}% · منفی ${perc.breakdown.negative}% (${perc.postCount} پست)`}
                              placement="top"
                              arrow
                            >
                              <Box sx={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden', cursor: 'default' }}>
                                <Box sx={{ width: `${perc.breakdown.positive}%`, bgcolor: '#00AB55' }} />
                                <Box sx={{ width: `${perc.breakdown.neutral}%`, bgcolor: alpha('#868E96', 0.4) }} />
                                <Box sx={{ width: `${perc.breakdown.negative}%`, bgcolor: '#FF5630' }} />
                              </Box>
                            </Tooltip>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                              <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled' }}>
                                {perc.postCount.toLocaleString('fa-IR')} پست مرتبط
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, color: perception.color }}>
                                {perception.label}
                              </Typography>
                            </Stack>
                          </>
                        ) : (
                          <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled' }}>
                            داده کافی برای تحلیل وجود ندارد
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Card>
  );
}
