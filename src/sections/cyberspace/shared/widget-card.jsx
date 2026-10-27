import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { InfoTooltip } from 'src/components/info-tooltip';

// ----------------------------------------------------------------------

/**
 * The standard dashboard widget: one card look, one header layout, one
 * loading and one empty state. Every widget on the cyberspace pages should
 * render inside this so the dashboard reads as one system.
 *
 *   <WidgetCard
 *     title="هشتگ‌های داغ"
 *     icon="solar:fire-bold-duotone"
 *     color="error"                         // palette key for the icon tile
 *     tooltip={WIDGET_TOOLTIPS.hotTopics}
 *     subheader="۷ روز گذشته"
 *     action={<TimeframeToggle … />}        // right-aligned header slot (RTL: left)
 *     loading={isLoading}
 *     empty={!items.length}
 *   >
 *     …content…
 *   </WidgetCard>
 */
export function WidgetCard({
  title,
  icon,
  color = 'primary',
  tooltip,
  subheader,
  action,
  loading = false,
  loadingHeight = 160,
  empty = false,
  emptyText = 'داده‌ای برای این بازه وجود ندارد.',
  emptyIcon = 'solar:chart-square-line-duotone',
  disablePadding = false,
  children,
  sx,
  contentSx,
  ...other
}) {
  const theme = useTheme();
  const tone = theme.palette[color]?.main ?? color;

  const renderHeader = () =>
    title || action ? (
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          position: 'relative',
          px: 2.5,
          py: 2,
          borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          // Brand accent bar at the start edge of the title, as in the organisation's UI kit
          '&::before': {
            content: '""',
            position: 'absolute',
            insetInlineStart: 0,
            top: 20,
            width: 4,
            height: 28,
            borderStartEndRadius: 4,
            borderEndEndRadius: 4,
            bgcolor: 'primary.main',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tone,
                bgcolor: alpha(tone, 0.12),
              }}
            >
              <Iconify icon={icon} width={20} />
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.4 }} noWrap>
                {title}
              </Typography>
              {tooltip && <InfoTooltip title={tooltip} />}
            </Stack>
            {subheader && (
              <Typography variant="caption" component="div" sx={{ color: 'text.secondary', mt: 0.25 }}>
                {subheader}
              </Typography>
            )}
          </Box>
        </Stack>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
    ) : null;

  const renderBody = () => {
    if (loading) {
      return (
        <Stack spacing={1.25}>
          <Skeleton variant="rounded" height={loadingHeight * 0.6} />
          <Skeleton variant="rounded" height={12} width="70%" />
          <Skeleton variant="rounded" height={12} width="45%" />
        </Stack>
      );
    }
    if (empty) {
      return (
        <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ py: 4, color: 'text.disabled' }}>
          <Iconify icon={emptyIcon} width={40} />
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            {emptyText}
          </Typography>
        </Stack>
      );
    }
    return children;
  };

  return (
    <Card
      sx={[
        {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 1.75,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          boxShadow: theme.vars?.customShadows?.card ?? theme.shadows[1],
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {renderHeader()}
      <Box
        sx={[
          { flex: 1, minWidth: 0, ...(disablePadding ? {} : { p: 2.5 }) },
          ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
        ]}
      >
        {renderBody()}
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

/**
 * Small segmented toggle for widget headers (time ranges, count/percent…).
 *
 *   <WidgetToggle value={tf} onChange={setTf}
 *     options={[{ value: '7d', label: '۷ روز' }, { value: '30d', label: '۳۰ روز' }]} />
 */
export function WidgetToggle({ value, onChange, options, size = 'small' }) {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      sx={{
        p: 0.375,
        borderRadius: 1.25,
        bgcolor: alpha(theme.palette.grey[500], 0.08),
        gap: 0.25,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Box
            key={opt.value}
            component="button"
            type="button"
            onClick={() => onChange(opt.value)}
            sx={{
              border: 0,
              cursor: 'pointer',
              font: 'inherit',
              px: size === 'small' ? 1.25 : 1.75,
              py: size === 'small' ? 0.5 : 0.75,
              borderRadius: 1,
              fontSize: size === 'small' ? 12 : 13,
              fontWeight: active ? 700 : 500,
              whiteSpace: 'nowrap',
              color: active ? 'text.primary' : 'text.secondary',
              bgcolor: active ? 'background.paper' : 'transparent',
              boxShadow: active ? theme.vars?.customShadows?.z1 ?? theme.shadows[1] : 'none',
              transition: theme.transitions.create(['background-color', 'color']),
              '&:hover': { color: 'text.primary' },
              '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
            }}
          >
            {opt.label}
          </Box>
        );
      })}
    </Stack>
  );
}
