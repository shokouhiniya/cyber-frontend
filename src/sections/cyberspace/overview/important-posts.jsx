import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useTopPosts } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const sentimentConfig = {
  positive: { icon: 'solar:smile-circle-bold', color: '#51CF66', label: 'مثبت' },
  negative: { icon: 'solar:sad-circle-bold', color: '#FF6B6B', label: 'منفی' },
  neutral: { icon: 'solar:confounded-circle-bold', color: '#ADB5BD', label: 'خنثی' },
};

export function ImportantPosts() {
  const theme = useTheme();
  const { data: posts = [], isLoading } = useTopPosts(5);

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
          <Iconify icon="solar:star-bold-duotone" width={20} sx={{ color: theme.palette.warning.main }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>پربازدیدترین محتواها</Typography>
        </Stack>

        <Stack spacing={1.5}>
          {posts.map((post) => {
            const engagement = (post.likeCount || 0) + (post.retweetCount || 0) + (post.viewCount || 0);
            const reachScore = (post.likeCount || 0) + ((post.userFollowers || 0) * 0.1) + ((post.retweetCount || 0) * 5);
            const sentCfg = sentimentConfig[post.sentiment] || sentimentConfig.neutral;

            return (
              <Card
                key={post.id}
                sx={{
                  p: 1.5,
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.08) },
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.text}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                        @{post.screenName}
                      </Typography>
                    </Box>
                    <Chip
                      label={sentCfg.label}
                      size="small"
                      sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: alpha(sentCfg.color, 0.16), color: sentCfg.color }}
                    />
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1, borderTop: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}` }}>
                    <Box sx={{ px: 1.5, py: 0.75, borderRadius: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.16), border: `1.5px solid ${alpha(theme.palette.warning.main, 0.4)}` }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:chart-2-bold" width={16} sx={{ color: theme.palette.warning.main }} />
                        <Box>
                          <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: alpha(theme.palette.warning.main, 0.8), display: 'block', lineHeight: 1, mb: 0.25 }}>ضریب نفوذ</Typography>
                          <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 800, color: theme.palette.warning.main, display: 'block', lineHeight: 1 }}>
                            {Math.round(reachScore).toLocaleString('en-US')}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:eye-bold" width={13} sx={{ color: 'text.disabled' }} />
                        <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>
                          {(post.viewCount || 0).toLocaleString('en-US')}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:heart-bold" width={13} sx={{ color: 'text.disabled' }} />
                        <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>
                          {(post.likeCount || 0).toLocaleString('en-US')}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
}
