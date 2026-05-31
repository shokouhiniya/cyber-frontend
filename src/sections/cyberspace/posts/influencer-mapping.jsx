'use client';


import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useInfluencerMap } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { InfoTooltip } from 'src/components/info-tooltip';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

// ----------------------------------------------------------------------

const SUPPORTER_COLOR = '#51CF66';
const CRITIC_COLOR    = '#FF6B6B';

const SOURCE_META = {
  telegram:  { icon: 'ic:baseline-telegram',                  color: '#0088cc', urlPrefix: 'https://t.me/' },
  twitter:   { icon: 'ri:twitter-x-fill',                    color: '#000000', urlPrefix: 'https://x.com/' },
  instagram: { icon: 'mdi:instagram',                         color: '#E4405F', urlPrefix: 'https://instagram.com/' },
  news:      { icon: 'solar:document-text-bold',              color: '#4CAF50', urlPrefix: null },
  newspaper: { icon: 'solar:global-bold-duotone',             color: '#78909C', urlPrefix: null },
  media:     { icon: 'solar:tv-bold-duotone',                 color: '#FF5722', urlPrefix: null },
  bale:      { icon: 'solar:chat-round-bold-duotone',         color: '#00A86B', urlPrefix: null },
  rubika:    { icon: 'solar:play-circle-bold-duotone',        color: '#7C3AED', urlPrefix: null },
  forum:     { icon: 'solar:chat-square-bold-duotone',        color: '#795548', urlPrefix: null },
  aparat:    { icon: 'solar:videocamera-record-bold-duotone', color: '#FF5722', urlPrefix: 'https://aparat.com/' },
};

const formatNum = (n) => {
  if (!n) return '۰';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return n.toLocaleString('fa-IR');
};

function getProfileUrl(username, sourceType) {
  const meta = SOURCE_META[sourceType];
  if (!meta?.urlPrefix || !username) return null;
  // Strip leading @ if present
  const handle = username.replace(/^@/, '');
  return `${meta.urlPrefix}${handle}`;
}

// ----------------------------------------------------------------------

function AccountRow({ account, accentColor, rank }) {
  const theme = useTheme();
  const src = SOURCE_META[account.sourceType] || { icon: 'solar:global-bold', color: '#868E96' };
  const profileUrl = getProfileUrl(account.username, account.sourceType);

  const sentTotal = account.sentimentTotal || 0;
  const posW = sentTotal > 0 ? Math.round((account.posCount / sentTotal) * 100) : 0;
  const negW = sentTotal > 0 ? Math.round((account.negCount / sentTotal) * 100) : 0;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        p: 1, borderRadius: 1.5,
        bgcolor: alpha(accentColor, 0.04),
        border: `1px solid ${alpha(accentColor, 0.1)}`,
        '&:hover': { bgcolor: alpha(accentColor, 0.08) },
        transition: 'background 0.15s',
      }}
    >
      {/* Rank */}
      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, fontWeight: 700, minWidth: 14, textAlign: 'center' }}>
        {rank}
      </Typography>

      {/* Source icon */}
      <Iconify icon={src.icon} width={13} sx={{ color: src.color, flexShrink: 0 }} />

      {/* Username + bar */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {profileUrl ? (
          <Link
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ fontWeight: 600, fontSize: 10, color: 'text.primary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'right' }}
          >
            @{account.username}
          </Link>
        ) : (
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 10, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'right' }}>
            @{account.username}
          </Typography>
        )}

        {/* Sentiment bar */}
        {sentTotal > 0 && (
          <Tooltip title={`مثبت ${posW}% · منفی ${negW}%`} placement="top" arrow>
            <Box sx={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden', mt: 0.4, cursor: 'default' }}>
              <Box sx={{ width: `${posW}%`, bgcolor: SUPPORTER_COLOR }} />
              <Box sx={{ width: `${100 - posW - negW}%`, bgcolor: alpha('#868E96', 0.3) }} />
              <Box sx={{ width: `${negW}%`, bgcolor: CRITIC_COLOR }} />
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* Views */}
      <Stack direction="row" alignItems="center" spacing={0.3} sx={{ flexShrink: 0 }}>
        <Iconify icon="solar:eye-bold" width={9} sx={{ color: 'text.disabled' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 9, fontWeight: 600 }}>
          {formatNum(account.totalViews)}
        </Typography>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function InfluencerMapping() {
  const theme = useTheme();

  const { data: allAccounts = [], isLoading } = useInfluencerMap(40);

  // Only show accounts with a clear stance (≥60% in one direction)
  const supporters = allAccounts.filter((a) => a.stance === 'supporter');
  const critics    = allAccounts.filter((a) => a.stance === 'critic');

  const totalReach = allAccounts.reduce((s, a) => s + (a.totalViews || 0), 0);

  // Show top 8 per side
  const topSupporters = supporters.slice(0, 8);
  const topCritics    = critics.slice(0, 8);

  const hasData = supporters.length > 0 || critics.length > 0;

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      {/* Header */}
      <Box sx={{ p: 2, background: `linear-gradient(135deg, ${alpha(SUPPORTER_COLOR, 0.07)} 0%, ${alpha(CRITIC_COLOR, 0.07)} 100%)` }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.warning.main, 0.14) }}>
            <Iconify icon="solar:users-group-two-rounded-bold-duotone" width={22} sx={{ color: theme.palette.warning.main }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>نقشه تأثیرگذاران</Typography>
            <InfoTooltip title={WIDGET_TOOLTIPS.influencerMapping} />
            {!isLoading && hasData && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                {supporters.length} موافق · {critics.length} مخالف · {formatNum(totalReach)} بازدید
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!isLoading && !hasData && (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            داده کافی برای تحلیل موضع‌گیری وجود ندارد.
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
            پس از تحلیل احساسات پست‌های بیشتر، نتایج اینجا نمایش داده می‌شود.
          </Typography>
        </Box>
      )}

      {!isLoading && hasData && (
        <Box sx={{ p: 2 }}>
          {/* Two-column grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {/* Supporters column */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                <Iconify icon="solar:like-bold" width={14} sx={{ color: SUPPORTER_COLOR }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: SUPPORTER_COLOR, fontSize: 11 }}>
                  موافقان ({supporters.length})
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                {topSupporters.length > 0 ? (
                  topSupporters.map((a, i) => (
                    <AccountRow key={`${a.username}-${a.sourceType}`} account={a} accentColor={SUPPORTER_COLOR} rank={i + 1} />
                  ))
                ) : (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, py: 1, textAlign: 'center', display: 'block' }}>
                    موافقی یافت نشد
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Critics column */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                <Iconify icon="solar:dislike-bold" width={14} sx={{ color: CRITIC_COLOR }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: CRITIC_COLOR, fontSize: 11 }}>
                  مخالفان ({critics.length})
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                {topCritics.length > 0 ? (
                  topCritics.map((a, i) => (
                    <AccountRow key={`${a.username}-${a.sourceType}`} account={a} accentColor={CRITIC_COLOR} rank={i + 1} />
                  ))
                ) : (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, py: 1, textAlign: 'center', display: 'block' }}>
                    مخالفی یافت نشد
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>

          {/* Note about neutral accounts */}
          {allAccounts.length > supporters.length + critics.length && (
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1.5, textAlign: 'center', fontSize: 9 }}>
              {(allAccounts.length - supporters.length - critics.length).toLocaleString('fa-IR')} حساب با موضع خنثی نمایش داده نمی‌شوند
            </Typography>
          )}
        </Box>
      )}
    </Card>
  );
}
