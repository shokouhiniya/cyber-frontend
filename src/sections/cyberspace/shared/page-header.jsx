import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useProfile } from 'src/api/dashboard';

// ----------------------------------------------------------------------

/**
 * Page title row for the cyberspace pages: title, one-line description and
 * the profile being viewed, with an optional actions slot on the far side.
 */
export function PageHeader({ title, description, actions, showProfile = true, sx }) {
  const { data: profile } = useProfile();

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'flex-end' }}
      justifyContent="space-between"
      spacing={2}
      sx={[
        { mb: { xs: 2.5, md: 3 }, pb: { xs: 2, md: 2.5 }, borderBottom: 1, borderColor: 'divider' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ minWidth: 0 }}>
        {showProfile && profile?.name && (
          <Typography
            variant="overline"
            component="div"
            sx={(theme) => ({
              color: 'primary.main',
              letterSpacing: 0,
              fontSize: 12,
              fontWeight: 700,
              mb: 0.5,
              ...theme.applyStyles('dark', { color: 'primary.light' }),
            })}
          >
            {profile.name}
          </Typography>
        )}
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, fontSize: { xs: 22, md: 28 } }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, maxWidth: 720 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
