'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum, fShort, fPercent } from 'src/utils/format-number-fa';

import { useInfluencerMap } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { SENTIMENT_COLORS } from 'src/components/chart';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { getPlatform, PlatformIcon } from './platforms';
import { WidgetCard, WidgetToggle } from '../shared/widget-card';

// ----------------------------------------------------------------------

const SUPPORTER_COLOR = SENTIMENT_COLORS.positive;
const CRITIC_COLOR = SENTIMENT_COLORS.negative;
const PER_SIDE = 8;

const TIME_FILTERS = [
  { value: '7d', label: '۷ روز' },
  { value: '30d', label: '۳۰ روز' },
  { value: 'all', label: 'همه' },
];

const TIMEFRAME_LABEL = { '7d': '۷ روز گذشته', '30d': '۳۰ روز گذشته', all: 'کل دوره' };

function getProfileUrl(username, platform) {
  if (!platform.urlPrefix || !username) return null;
  return `${platform.urlPrefix}${username.replace(/^@/, '')}`;
}

// ----------------------------------------------------------------------

function AccountRow({ account, accentColor, rank }) {
  const theme = useTheme();
  const platform = getPlatform(account.sourceType);
  const profileUrl = getProfileUrl(account.username, platform);

  const sentTotal = account.sentimentTotal || 0;
  const posW = sentTotal > 0 ? Math.round(((account.posCount || 0) / sentTotal) * 100) : 0;
  const negW = sentTotal > 0 ? Math.round(((account.negCount || 0) / sentTotal) * 100) : 0;
  const neuW = Math.max(0, 100 - posW - negW);

  const handle = account.username ? `@${account.username.replace(/^@/, '')}` : '—';
  const handleSx = {
    fontWeight: 600,
    fontSize: 13,
    color: 'text.primary',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    direction: 'ltr',
    textAlign: 'right',
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: 1.5,
        bgcolor: alpha(accentColor, 0.05),
        border: `1px solid ${alpha(accentColor, 0.14)}`,
        transition: theme.transitions.create('background-color'),
        '&:hover': { bgcolor: alpha(accentColor, 0.1) },
      }}
    >
      <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>
        {fNum(rank)}
      </Typography>

      <Tooltip title={platform.label} arrow>
        <Box
          sx={{
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(platform.color ?? theme.palette.grey[500], 0.12),
          }}
        >
          <PlatformIcon platform={platform} width={16} />
        </Box>
      </Tooltip>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {profileUrl ? (
          <Link href={profileUrl} target="_blank" rel="noopener noreferrer" underline="hover" sx={handleSx}>
            {handle}
          </Link>
        ) : (
          <Typography sx={handleSx}>{handle}</Typography>
        )}

        {sentTotal > 0 ? (
          <Tooltip
            title={`مثبت ${fPercent(posW)} · خنثی ${fPercent(neuW)} · منفی ${fPercent(negW)} (از ${fNum(sentTotal)} پست تحلیل‌شده)`}
            placement="top"
            arrow
          >
            <Box
              sx={{
                display: 'flex',
                height: 6,
                mt: 0.75,
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: alpha(theme.palette.grey[500], 0.16),
              }}
            >
              <Box sx={{ width: `${posW}%`, bgcolor: SUPPORTER_COLOR }} />
              <Box sx={{ width: `${neuW}%`, bgcolor: alpha(SENTIMENT_COLORS.neutral, 0.5) }} />
              <Box sx={{ width: `${negW}%`, bgcolor: CRITIC_COLOR }} />
            </Box>
          </Tooltip>
        ) : (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{platform.label}</Typography>
        )}
      </Box>

      <Stack alignItems="flex-end" sx={{ flexShrink: 0, minWidth: 56 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
          {fPercent(accentColor === SUPPORTER_COLOR ? posW : negW)}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.375} sx={{ color: 'text.secondary' }}>
          <Iconify icon="solar:eye-linear" width={13} />
          <Typography sx={{ fontSize: 12 }}>{fShort(account.totalViews || 0)}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function StanceColumn({ title, icon, color, accounts, total, emptyText }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.25 }}>
        <Iconify icon={icon} width={18} sx={{ color }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          ({fNum(total)})
        </Typography>
      </Stack>
      <Stack spacing={0.75}>
        {accounts.length > 0 ? (
          accounts.map((a, i) => (
            <AccountRow key={`${a.username}-${a.sourceType}`} account={a} accentColor={color} rank={i + 1} />
          ))
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
            {emptyText}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function InfluencerMapping() {
  const [timeframe, setTimeframe] = useState('all');
  const { data: allAccounts = [], isLoading } = useInfluencerMap(40, timeframe);

  // Only accounts with a clear stance (≥60% of analysed posts in one direction)
  const supporters = allAccounts.filter((a) => a.stance === 'supporter');
  const critics = allAccounts.filter((a) => a.stance === 'critic');
  const neutralCount = allAccounts.length - supporters.length - critics.length;

  const totalReach = allAccounts.reduce((s, a) => s + (a.totalViews || 0), 0);
  const hasData = supporters.length > 0 || critics.length > 0;

  return (
    <WidgetCard
      title="نقشه تأثیرگذاران"
      icon="solar:users-group-two-rounded-bold-duotone"
      color="warning"
      tooltip={WIDGET_TOOLTIPS.influencerMapping}
      subheader={`${TIMEFRAME_LABEL[timeframe]} · موافق: دست‌کم ۶۰٪ پست‌های تحلیل‌شده مثبت · مخالف: دست‌کم ۶۰٪ منفی`}
      action={<WidgetToggle value={timeframe} onChange={setTimeframe} options={TIME_FILTERS} />}
      loading={isLoading}
      empty={!hasData}
      emptyIcon="solar:users-group-rounded-line-duotone"
      emptyText="داده کافی برای تحلیل موضع‌گیری وجود ندارد. پس از تحلیل احساسات پست‌های بیشتر، نتایج اینجا نمایش داده می‌شود."
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 2, flexWrap: 'wrap', rowGap: 0.5, color: 'text.secondary' }}
      >
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {fNum(supporters.length)}
          </Box>{' '}
          موافق
        </Typography>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {fNum(critics.length)}
          </Box>{' '}
          مخالف
        </Typography>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {fShort(totalReach)}
          </Box>{' '}
          بازدید مجموع حساب‌ها
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: { xs: 2.5, md: 3 },
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <StanceColumn
          title="موافقان"
          icon="solar:like-bold"
          color={SUPPORTER_COLOR}
          accounts={supporters.slice(0, PER_SIDE)}
          total={supporters.length}
          emptyText="موافقی یافت نشد"
        />
        <StanceColumn
          title="مخالفان"
          icon="solar:dislike-bold"
          color={CRITIC_COLOR}
          accounts={critics.slice(0, PER_SIDE)}
          total={critics.length}
          emptyText="مخالفی یافت نشد"
        />
      </Box>

      {neutralCount > 0 && (
        <Typography variant="caption" component="div" sx={{ color: 'text.secondary', mt: 2, textAlign: 'center', fontSize: 12 }}>
          {fNum(neutralCount)} حساب بدون موضع روشن نمایش داده نمی‌شوند.
        </Typography>
      )}
    </WidgetCard>
  );
}
