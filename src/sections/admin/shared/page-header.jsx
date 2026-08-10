'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function AdminPageHeader({ title, subtitle, action }) {
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
      sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}
    >
      <div>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </div>
      {action}
    </Stack>
  );
}
