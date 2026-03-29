import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function InfluencerMapping({ data, loading }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          boxShadow: theme.shadows[2],
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 100,
        }}
      >
        <CircularProgress size={24} />
      </Card>
    );
  }

  // Analyze influencers from data
  const influencers = data
    .filter((post) => post.userFollowers > 0)
    .map((post) => ({
      username: post.screenName,
      followers: post.userFollowers,
      sentiment: post.emotion || 'OTHER',
      text: post.text,
    }))
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 5);

  // Calculate stats
  const highInfluencers = influencers.filter((i) => i.followers > 10000).length;
  const negativeInfluencers = influencers.filter((i) =>
    ['ANGRY', 'SAD'].includes(i.sentiment)
  ).length;

  const getInfluencerLevel = (followers) => {
    if (followers > 50000) return { label: 'جریان‌ساز', color: theme.palette.error.main };
    if (followers > 10000) return { label: 'تأثیرگذار', color: theme.palette.warning.main };
    return { label: 'عادی', color: theme.palette.info.main };
  };

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
      }}
    >
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.error.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.warning.main, 0.16),
              }}
            >
              <Iconify
                icon="solar:users-group-two-rounded-bold-duotone"
                width={24}
                sx={{ color: theme.palette.warning.main }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                نقشه تأثیرگذاران
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                Influencer Mapping
              </Typography>
            </Box>
          </Stack>

          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              bgcolor: alpha(theme.palette.grey[500], 0.08),
              transition: 'transform 0.3s ease',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <Iconify icon="solar:alt-arrow-down-bold" width={20} />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ px: 2.5, pb: 2.5, pt: 1.5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.08),
              border: `1.5px solid ${alpha(theme.palette.error.main, 0.24)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.error.main, 0.12),
              }}
            />
            <Stack spacing={0.5} sx={{ position: 'relative' }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify
                  icon="solar:fire-bold"
                  width={16}
                  sx={{ color: theme.palette.error.main }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, fontWeight: 600 }}>
                  جریان‌ساز
                </Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.error.main }}>
                {highInfluencers}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.08),
              border: `1.5px solid ${alpha(theme.palette.warning.main, 0.24)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.warning.main, 0.12),
              }}
            />
            <Stack spacing={0.5} sx={{ position: 'relative' }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify
                  icon="solar:danger-triangle-bold"
                  width={16}
                  sx={{ color: theme.palette.warning.main }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, fontWeight: 600 }}>
                  منتقد
                </Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.warning.main }}>
                {negativeInfluencers}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Collapse in={expanded} timeout="auto">
        <Box
          sx={{
            px: 2.5,
            pb: 2.5,
            pt: 0,
            borderTop: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1.5, mt: 2 }}
          >
            برترین تأثیرگذاران
          </Typography>
          <Stack spacing={1.5}>
            {influencers.map((influencer, index) => {
              const level = getInfluencerLevel(influencer.followers);
              const emotionColor =
                influencer.sentiment === 'ANGRY'
                  ? theme.palette.error.main
                  : influencer.sentiment === 'HAPPY'
                    ? theme.palette.success.main
                    : theme.palette.info.main;

              return (
                <Stack
                  key={index}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.grey[500], 0.04),
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: level.color,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {influencer.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 12,
                      }}
                    >
                      @{influencer.username}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>
                        {influencer.followers.toLocaleString('fa-IR')} فالوور
                      </Typography>
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          bgcolor: 'text.disabled',
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: level.color,
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        {level.label}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(emotionColor, 0.12),
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: emotionColor,
                      }}
                    />
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </Collapse>
    </Card>
  );
}
