import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const SECTIONS = [
  { key: 'what', label: 'چه چیزی را نشان می‌دهد' },
  { key: 'how', label: 'نحوه محاسبه' },
  { key: 'source', label: 'منبع داده' },
  { key: 'period', label: 'بازه زمانی' },
];

function TooltipBody({ title }) {
  // Plain string: a single paragraph
  if (typeof title === 'string') {
    return <span style={{ display: 'block' }}>{title}</span>;
  }

  // Structured: { what, how, source, period } — each rendered as a labelled block
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {SECTIONS.filter((s) => title?.[s.key]).map((s) => (
        <span key={s.key} style={{ display: 'block' }}>
          <span style={{ display: 'block', fontWeight: 700, opacity: 0.7, fontSize: 11, marginBottom: 2 }}>
            {s.label}
          </span>
          {title[s.key]}
        </span>
      ))}
    </span>
  );
}

/**
 * Small info icon with a Persian RTL tooltip.
 *
 * `title` is either a string or a structured description
 * `{ what, how, source, period }` (see widget-tooltips.js) so every widget
 * explains what it shows, how it is computed, where the data comes from and
 * which time range it covers.
 *
 * Touch-friendly: opens immediately on touch and stays open for 6 seconds.
 * RTL: the Popper renders in a portal outside the app's RTL context, so the
 * content is wrapped in an explicit dir="rtl" element.
 */
export function InfoTooltip({ title, sx }) {
  const theme = useTheme();

  if (!title) return null;

  return (
    <Tooltip
      title={
        <span dir="rtl" style={{ display: 'block', textAlign: 'right', lineHeight: 1.8 }}>
          <TooltipBody title={title} />
        </span>
      }
      arrow
      placement="bottom-start"
      enterTouchDelay={0}
      leaveTouchDelay={6000}
      slotProps={{
        tooltip: {
          sx: {
            maxWidth: 340,
            fontSize: 12.5,
            fontWeight: 400,
            p: 1.5,
            borderRadius: 1.25,
            bgcolor: alpha(theme.palette.grey[900], 0.94),
            boxShadow: theme.vars?.customShadows?.dropdown,
          },
        },
        arrow: {
          sx: { color: alpha(theme.palette.grey[900], 0.94) },
        },
      }}
    >
      {/*
        The outer span is the touch/click target; the inner icon stays small,
        so the tap area never overlaps adjacent header actions.
      */}
      <span
        role="button"
        tabIndex={0}
        aria-label="توضیحات"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          cursor: 'help',
          flexShrink: 0,
          ...sx,
        }}
      >
        <Iconify
          icon="solar:info-circle-linear"
          width={16}
          sx={{
            // Amber info icon, as in the organisation's UI kit
            color: 'secondary.main',
            transition: 'color 0.15s',
            'span:hover > &, span:focus-visible > &': { color: 'secondary.dark' },
          }}
        />
      </span>
    </Tooltip>
  );
}
