import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useHashtags } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function HotTopics() {
  const theme = useTheme();
  const { data: topics = [], isLoading } = useHashtags(15);

  if (isLoading) {
    return (
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[2], display: 'flex', justifyContent: 'center', minHeight: 80 }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Iconify icon="solar:fire-bold-duotone" width={20} sx={{ color: theme.palette.error.main }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>هشتگ‌های داغ</Typography>
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          {topics.map((topic) => (
            <Chip
              key={topic.label}
              label={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary' }}>
                    #{topic.label}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                    ({topic.count.toLocaleString('fa-IR')})
                  </Typography>
                </Stack>
              }
              sx={{
                height: 32,
                bgcolor: alpha(theme.palette.grey[500], 0.08),
                border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
                '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.12) },
              }}
            />
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
