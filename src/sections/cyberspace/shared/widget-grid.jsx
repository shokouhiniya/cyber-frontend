import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

/**
 * 12-column responsive grid for dashboard pages. One column on phones,
 * the real layout from md up.
 *
 *   <WidgetGrid>
 *     <GridItem span={{ md: 6, lg: 4 }}>…</GridItem>
 *     <GridItem span={{ lg: 8 }}>…</GridItem>
 *     <GridItem>…full width…</GridItem>
 *   </WidgetGrid>
 *
 * `span` is the number of columns (out of 12) per breakpoint; anything not
 * given falls back to the next smaller breakpoint, and xs is always 12.
 */
export function WidgetGrid({ children, sx, ...other }) {
  return (
    <Box
      sx={[
        {
          display: 'grid',
          gap: { xs: 2, md: 2.5, lg: 3 },
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          alignItems: 'stretch',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </Box>
  );
}

const BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl'];

export function GridItem({ span = {}, children, sx, ...other }) {
  const gridColumn = {};
  let current = 12;
  BREAKPOINTS.forEach((bp) => {
    if (span[bp]) current = span[bp];
    gridColumn[bp] = `span ${current}`;
  });

  return (
    <Box sx={[{ gridColumn, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      {children}
    </Box>
  );
}
