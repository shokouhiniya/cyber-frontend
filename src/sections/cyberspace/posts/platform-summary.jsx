import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum, fShort } from 'src/utils/format-number-fa';

import { useSourceStats } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard, WidgetToggle } from '../shared/widget-card';
import { getPlatform, PlatformIcon, PLATFORM_ORDER } from './platforms';

// ----------------------------------------------------------------------

const TIMEFRAMES = [
  { value: 'day', label: 'امروز' },
  { value: 'week', label: '۷ روز' },
  { value: 'month', label: '۳۰ روز' },
  { value: 'quarter', label: 'فصل' },
];

// ----------------------------------------------------------------------

function SourcePill({ source, count, onClick, active, dimmed }) {
  const theme = useTheme();
  const hasData = count > 0;
  const disabled = source.disabled || !onClick;
  // Brand colour, or neutral grey for platforms without one (X)
  const tint = source.color ?? theme.palette.grey[500];
  const ink = source.color ?? 'text.primary';

  return (
    <ButtonBase
      onClick={source.disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={`${source.label}: ${fNum(count)} پست`}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        px: 1,
        py: 1.25,
        minWidth: 0,
        borderRadius: 1.5,
        font: 'inherit',
        border: `${active ? 2 : 1}px solid ${active ? tint : alpha(theme.palette.grey[500], 0.16)}`,
        bgcolor: active ? alpha(tint, 0.14) : hasData ? alpha(tint, 0.05) : 'transparent',
        opacity: source.disabled ? 0.4 : dimmed ? 0.55 : hasData ? 1 : 0.7,
        transition: theme.transitions.create(['background-color', 'border-color', 'opacity']),
        '&:hover': disabled
          ? {}
          : { bgcolor: alpha(tint, active ? 0.18 : 0.1), borderColor: tint, opacity: 1 },
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
      }}
    >
      {active && (
        <Iconify
          icon="solar:check-circle-bold"
          width={16}
          sx={{ position: 'absolute', top: 4, left: 4, color: ink }}
        />
      )}

      <PlatformIcon platform={source} width={22} color={hasData || active ? undefined : 'text.disabled'} />

      <Typography
        component="span"
        sx={{
          fontWeight: 800,
          fontSize: 15,
          lineHeight: 1.2,
          color: hasData ? 'text.primary' : 'text.disabled',
        }}
      >
        {source.disabled ? '—' : fShort(count)}
      </Typography>

      <Typography
        component="span"
        noWrap
        sx={{ fontSize: 12, color: active ? 'text.primary' : 'text.secondary', fontWeight: active ? 700 : 500, maxWidth: '100%' }}
      >
        {source.label}
      </Typography>
    </ButtonBase>
  );
}

// ----------------------------------------------------------------------

export function PlatformSummary({ onPlatformFilter, activePlatform }) {
  const [timeframe, setTimeframe] = useState('week');

  const { data: sources = [], isLoading } = useSourceStats(timeframe);

  // Build a lookup: source key → stats
  const statsMap = {};
  sources.forEach((s) => {
    statsMap[s.source] = s;
  });

  const totalPosts = sources.reduce((sum, s) => sum + (s.count || 0), 0);
  const active = activePlatform ? getPlatform(activePlatform) : null;

  const toggle = <WidgetToggle value={timeframe} onChange={setTimeframe} options={TIMEFRAMES} />;

  return (
    <WidgetCard
      title="خلاصه پلتفرم‌ها"
      icon="solar:widget-5-bold-duotone"
      color="primary"
      tooltip={WIDGET_TOOLTIPS.platformSummary}
      subheader={
        isLoading
          ? 'در حال بارگذاری…'
          : `${fNum(totalPosts)} پست در بازه انتخابی · برای فیلتر کردن فهرست‌ها روی یک پلتفرم بزنید`
      }
      action={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>{toggle}</Box>}
      loading={isLoading && !sources.length}
    >
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, mb: 2 }}>{toggle}</Box>

      {active && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            فهرست‌های پایین فقط برای این پلتفرم:
          </Typography>
          <Chip
            size="small"
            color="primary"
            icon={<PlatformIcon platform={active} width={16} color="inherit" />}
            label={active.label}
            onDelete={() => onPlatformFilter?.(activePlatform)}
            deleteIcon={<Iconify icon="solar:close-circle-bold" width={18} />}
            sx={{ fontWeight: 700, fontSize: 12 }}
          />
        </Stack>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: {
            xs: 'repeat(3, minmax(0, 1fr))',
            sm: 'repeat(4, minmax(0, 1fr))',
            md: 'repeat(6, minmax(0, 1fr))',
          },
          opacity: isLoading ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {PLATFORM_ORDER.map((key) => {
          const src = getPlatform(key);
          return (
            <SourcePill
              key={key}
              source={src}
              count={statsMap[key]?.count || 0}
              active={activePlatform === key}
              dimmed={!!activePlatform && activePlatform !== key}
              onClick={onPlatformFilter ? () => onPlatformFilter(key) : undefined}
            />
          );
        })}
      </Box>

      {!isLoading && totalPosts === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 2 }}>
          در این بازه زمانی پستی ثبت نشده است.
        </Typography>
      )}
    </WidgetCard>
  );
}
