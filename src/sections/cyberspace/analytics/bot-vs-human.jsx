import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum, fPercent } from 'src/utils/format-number-fa';

import { useBotAnalysis } from 'src/api/dashboard';

import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard, WidgetToggle } from '../shared/widget-card';

// ----------------------------------------------------------------------

const TIME_FILTERS = [
  { value: '7d', label: '۷ روز' },
  { value: '30d', label: '۳۰ روز' },
  { value: 'all', label: 'همه' },
];

const TIMEFRAME_LABEL = {
  '7d': '۷ روز گذشته',
  '30d': '۳۰ روز گذشته',
  all: 'همه پست‌های ذخیره‌شده',
};

const PLATFORM_LABELS = {
  twitter: 'ایکس',
  telegram: 'تلگرام',
  instagram: 'اینستاگرام',
  news: 'خبرگزاری',
  newspaper: 'روزنامه',
  media: 'صدا و سیما',
  bale: 'بله',
  rubika: 'روبیکا',
  eitaa: 'ایتا',
  aparat: 'آپارات',
  forum: 'فروم',
};

const TOP_SHOWN = 5;

/**
 * Account-level bot analysis. The LLM scores every post's bot probability
 * (0–100); posts are grouped by account (handle + platform) and each account
 * is classified by its average: ≥ ۶۰ «احتمالاً ربات»، ۳۰–۵۹ «مشکوک»،
 * < ۳۰ «انسانی»؛ accounts with no scored post are «تحلیل‌نشده».
 */
export function BotVsHuman() {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('all');
  const { data, isLoading } = useBotAnalysis(timeframe);

  const botMin = data?.criterion?.botMin ?? 60;
  const suspiciousMin = data?.criterion?.suspiciousMin ?? 30;

  const META = {
    bot: { color: theme.palette.error.main, hint: `میانگین ${fPercent(botMin)} و بیشتر` },
    suspicious: { color: theme.palette.warning.main, hint: `میانگین ${fNum(suspiciousMin)} تا ${fPercent(botMin - 1)}` },
    human: { color: theme.palette.success.main, hint: `میانگین کمتر از ${fPercent(suspiciousMin)}` },
    unscored: { color: theme.palette.grey[500], hint: 'هنوز پستی از این حساب امتیاز نگرفته' },
  };

  const totalAccounts = Number(data?.totalAccounts) || 0;
  const totalPosts = Number(data?.totalPosts) || 0;
  const classes = (data?.classes || []).map((c) => ({ ...c, ...(META[c.key] || META.unscored) }));
  const top = (data?.topSuspicious || []).slice(0, TOP_SHOWN);
  const unattributed = Number(data?.unattributedPosts) || 0;

  const toggle = <WidgetToggle value={timeframe} onChange={setTimeframe} options={TIME_FILTERS} />;

  return (
    <WidgetCard
      title="حساب‌های ربات و انسانی"
      icon="solar:shield-user-bold-duotone"
      color="info"
      tooltip={WIDGET_TOOLTIPS.botVsHuman}
      subheader={`معیار: میانگین احتمال ربات‌بودنِ پست‌های هر حساب (امتیاز هوش مصنوعی) · ${TIMEFRAME_LABEL[timeframe]}`}
      action={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>{toggle}</Box>}
      contentSx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center' }}>{toggle}</Box>

      <WidgetCard
        // Inner, header-less card only for the shared loading / empty states.
        sx={{ border: 0, boxShadow: 'none', bgcolor: 'transparent', borderRadius: 0 }}
        contentSx={{ p: 0 }}
        loading={isLoading}
        empty={!totalAccounts}
        emptyIcon="solar:shield-user-bold-duotone"
        emptyText="در این بازه پستی با حساب مشخص ثبت نشده است."
      >
        {/* Share of accounts per class */}
        <Box sx={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', mb: 2 }}>
          {classes
            .filter((c) => c.accounts > 0)
            .map((c) => (
              <Tooltip key={c.key} title={`${c.label}: ${fNum(c.accounts)} حساب (${fPercent(c.accountPercent, { decimals: 1 })})`} arrow>
                <Box sx={{ width: `${c.accountPercent}%`, minWidth: 4, bgcolor: c.color }} />
              </Tooltip>
            ))}
        </Box>

        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          {classes.map((c) => (
            <Stack key={c.key} spacing={0.25} sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                  {c.label}
                </Typography>
              </Stack>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {fNum(c.accounts)}
                <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontSize: 12, mx: 0.5 }}>
                  حساب ({fPercent(c.accountPercent, { decimals: 1 })})
                </Typography>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12 }}>
                {fNum(c.posts)} پست ({fPercent(c.postPercent, { decimals: 1 })})
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11 }}>
                {c.hint}
              </Typography>
            </Stack>
          ))}
        </Box>

        {top.length > 0 && (
          <Box sx={{ mt: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              مشکوک‌ترین حساب‌ها
            </Typography>
            <Stack spacing={0.75}>
              {top.map((a) => {
                const color = a.avgProbability >= botMin ? theme.palette.error.main : theme.palette.warning.main;
                return (
                  <Stack
                    key={`${a.platform}-${a.handle}`}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ px: 1.25, py: 0.75, borderRadius: 1, bgcolor: alpha(color, 0.06) }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* dir attribute (not sx direction) so the RTL style plugin can't flip it; «end» = right in LTR */}
                      <Typography variant="body2" noWrap dir="ltr" sx={{ fontWeight: 600, textAlign: 'end' }}>
                        @{a.handle}
                      </Typography>
                      <Typography variant="caption" noWrap component="div" sx={{ color: 'text.secondary' }}>
                        {PLATFORM_LABELS[a.platform] || a.platform} · {fNum(a.postCount)} پست
                      </Typography>
                    </Box>
                    <Tooltip title="میانگین احتمال ربات‌بودن پست‌های این حساب" arrow>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color, flexShrink: 0 }}>
                        {fPercent(a.avgProbability)}
                      </Typography>
                    </Tooltip>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        )}

        <Typography variant="caption" component="div" sx={{ mt: 2, color: 'text.secondary', fontSize: 12 }}>
          مجموع: {fNum(totalAccounts)} حساب · {fNum(totalPosts)} پست
          {unattributed > 0 && ` · ${fNum(unattributed)} پست بدون حساب مشخص در شمارش نیست`}
        </Typography>
      </WidgetCard>
    </WidgetCard>
  );
}
