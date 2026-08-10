import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Small info icon with a Persian RTL tooltip.
 *
 * Touch-friendly: the invisible tap area is 44×44px (WCAG minimum) while
 * the visible icon stays small. The tooltip opens immediately on touch
 * (enterTouchDelay=0) and stays open for 4 seconds (leaveTouchDelay=4000).
 *
 * RTL: the Popper is rendered in a portal outside the app's RTL context,
 * so we force dir="rtl" on the tooltip content element directly.
 */
export function InfoTooltip({ title, sx }) {
  const theme = useTheme();

  return (
    <Tooltip
      title={
        // Wrap in a span with dir="rtl" — this is the only reliable way to
        // force RTL inside a MUI portal that escapes the app's direction context
        <span dir="rtl" style={{ display: 'block', textAlign: 'right', lineHeight: 1.7 }}>
          {title}
        </span>
      }
      arrow
      placement="bottom-start"
      enterTouchDelay={0}
      leaveTouchDelay={4000}
      slotProps={{
        tooltip: {
          sx: {
            maxWidth: 260,
            fontSize: 11,
            p: 1.25,
            bgcolor: alpha(theme.palette.grey[800], 0.92),
          },
        },
        arrow: {
          sx: { color: alpha(theme.palette.grey[800], 0.92) },
        },
      }}
    >
      {/*
        The outer span is the touch/click target — 44×44px invisible area.
        The inner span is the visible icon — 16×16px.
        This separates "what you see" from "what you tap" so it never
        overlaps with adjacent action buttons.
      */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          cursor: 'help',
          flexShrink: 0,
          ...sx,
        }}
      >
        <Iconify
          icon="solar:info-circle-bold"
          width={15}
          sx={{
            color: alpha(theme.palette.grey[500], 0.55),
            transition: 'color 0.15s',
            'span:hover > &': { color: theme.palette.grey[600] },
          }}
        />
      </span>
    </Tooltip>
  );
}
