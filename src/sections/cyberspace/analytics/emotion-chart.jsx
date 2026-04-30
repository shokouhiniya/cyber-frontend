import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const emotionConfig = {
  worry: { color: '#FF6B6B', darkColor: '#FF8787', label: '\u0646\u06AF\u0631\u0627\u0646\u06CC', emoji: '\uD83D\uDE1F' },
  concern: { color: '#FFA94D', darkColor: '#FFB86C', label: '\u062F\u063A\u062F\u063A\u0647', emoji: '\uD83D\uDE1E' },
  caution: { color: '#FF922B', darkColor: '#FFA94D', label: '\u0627\u062D\u062A\u06CC\u0627\u0637', emoji: '\u26A0\uFE0F' },
  frustration: { color: '#E03131', darkColor: '#FF6B6B', label: '\u062E\u0634\u0645', emoji: '\uD83D\uDE21' },
  joy: { color: '#51CF66', darkColor: '#69DB7C', label: '\u0634\u0627\u062F\u06CC', emoji: '\uD83D\uDE0A' },
  hope: { color: '#339AF0', darkColor: '#4DABF7', label: '\u0627\u0645\u06CC\u062F', emoji: '\uD83E\uDD17' },
  optimism: { color: '#20C997', darkColor: '#38D9A9', label: '\u062E\u0648\u0634\u200C\u0628\u06CC\u0646\u06CC', emoji: '\uD83C\uDF1F' },
  excitement: { color: '#845EF7', darkColor: '#9775FA', label: '\u0647\u06CC\u062C\u0627\u0646', emoji: '\uD83E\uDD29' },
  pride: { color: '#5C7CFA', darkColor: '#748FFC', label: '\u0627\u0641\u062A\u062E\u0627\u0631', emoji: '\uD83D\uDCAA' },
  interest: { color: '#74C0FC', darkColor: '#91D5FF', label: '\u0639\u0644\u0627\u0642\u0647', emoji: '\uD83E\uDDD0' },
  surprise: { color: '#20C997', darkColor: '#38D9A9', label: '\u0634\u06AF\u0641\u062A\u06CC', emoji: '\uD83D\uDE32' },
  neutral: { color: '#ADB5BD', darkColor: '#CED4DA', label: '\u062E\u0646\u062B\u06CC', emoji: '\uD83D\uDE10' },
  OTHER: { color: '#ADB5BD', darkColor: '#CED4DA', label: '\u0633\u0627\u06CC\u0631', emoji: '\uD83D\uDE10' },
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
              توزیع احساسات
            </Typography>
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
