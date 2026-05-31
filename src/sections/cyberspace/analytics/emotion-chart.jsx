import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { InfoTooltip } from 'src/components/info-tooltip';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

// ----------------------------------------------------------------------

const emotionConfig = {
  anxious:       { color: '#FF6B6B', darkColor: '#FF8787', label: 'نگرانی',     emoji: '😟' },
  apprehensive:  { color: '#FFA94D', darkColor: '#FFB86C', label: 'تردید',      emoji: '😐' },
  neutral:       { color: '#ADB5BD', darkColor: '#CED4DA', label: 'خنثی',       emoji: '😶' },
  optimistic:    { color: '#51CF66', darkColor: '#69DB7C', label: 'امیدواری',    emoji: '🙂' },
  confident:     { color: '#339AF0', darkColor: '#4DABF7', label: 'اطمینان',     emoji: '💪' },
  // Legacy fallbacks (from old sentiment mapping)
  worry:         { color: '#FF6B6B', darkColor: '#FF8787', label: 'نگرانی',     emoji: '😟' },
  hope:          { color: '#51CF66', darkColor: '#69DB7C', label: 'امیدواری',    emoji: '🙂' },
  OTHER:         { color: '#ADB5BD', darkColor: '#CED4DA', label: 'سایر',       emoji: '😶' },
};

export function EmotionChart({ data, loading }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (loading) {
    return (
      <Card
        sx={{
          p: 2.5,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 120,
          borderRadius: 2.5,
          boxShadow: theme.shadows[2],
        }}
      >
        <CircularProgress />
      </Card>
    );
  }

  // Group emotions: keep top 3, merge rest into OTHER
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  const sortedEmotions = Object.entries(data)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count);

  const topEmotions = sortedEmotions.slice(0, 3);
  const otherEmotions = sortedEmotions.slice(3);
  const otherCount = otherEmotions.reduce((sum, item) => sum + item.count, 0);

  const groupedData = {};
  topEmotions.forEach((item) => {
    groupedData[item.emotion] = item.count;
  });
  if (otherCount > 0) {
    groupedData.OTHER = otherCount;
  }

  const emotions = Object.entries(groupedData)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
      config: emotionConfig[emotion] || emotionConfig.OTHER,
    }))
    .sort((a, b) => b.count - a.count);

  // Use dark colors in dark mode
  const getColor = (config) => (isDark ? config.darkColor : config.color);

  // Calculate donut chart
  const radius = 70;
  const centerX = 90;
  const centerY = 90;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90; // Start from top

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
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.16),
            }}
          >
            <Iconify
              icon="solar:chart-2-bold-duotone"
              width={24}
              sx={{ color: theme.palette.primary.main }}
            />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              چشم‌انداز عمومی
            </Typography>
            <InfoTooltip title={WIDGET_TOOLTIPS.emotionChart} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {total.toLocaleString('fa-IR')} پست تحلیل شده
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {/* Donut Chart */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Background circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke={alpha(theme.palette.grey[500], 0.08)}
              strokeWidth={strokeWidth}
            />

            {/* Emotion segments */}
            {emotions.map((item, index) => {
              const percentage = parseFloat(item.percentage);
              const segmentLength = (percentage / 100) * circumference;
              const angle = currentAngle;
              currentAngle += (percentage / 100) * 360;

              return (
                <g key={item.emotion}>
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke={getColor(item.config)}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${segmentLength} ${circumference}`}
                    strokeDashoffset={-((angle + 90) / 360) * circumference}
                    strokeLinecap="round"
                    style={{
                      transition: 'all 0.6s ease',
                    }}
                  />
                </g>
              );
            })}

            {/* Center text */}
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={theme.palette.text.primary}
              fontSize="24"
              fontWeight="800"
            >
              {emotions.length}
            </text>
            <text
              x={centerX}
              y={centerY + 15}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={theme.palette.text.secondary}
              fontSize="12"
              fontWeight="600"
            >
              احساس
            </text>
          </svg>
        </Box>

        {/* Legend with Gauges */}
        <Stack spacing={1.5}>
          {emotions.map((item) => (
            <Box key={item.emotion}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 0.75 }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(getColor(item.config), 0.12),
                      border: `2px solid ${alpha(getColor(item.config), isDark ? 0.4 : 0.24)}`,
                    }}
                  >
                    <Typography sx={{ fontSize: 18 }}>{item.config.emoji}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13 }}>
                      {item.config.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                      {item.count.toLocaleString('fa-IR')} پست
                    </Typography>
                  </Box>
                </Stack>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1.5,
                    bgcolor: alpha(getColor(item.config), isDark ? 0.2 : 0.12),
                    border: `1px solid ${alpha(getColor(item.config), isDark ? 0.4 : 0.24)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: getColor(item.config),
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {item.percentage}%
                  </Typography>
                </Box>
              </Stack>

              {/* Progress bar */}
              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  bgcolor: alpha(getColor(item.config), isDark ? 0.12 : 0.08),
                  borderRadius: 1,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    width: `${item.percentage}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${getColor(item.config)} 0%, ${alpha(getColor(item.config), 0.7)} 100%)`,
                    borderRadius: 1,
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 0 8px ${alpha(getColor(item.config), isDark ? 0.6 : 0.4)}`,
                  }}
                />
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
