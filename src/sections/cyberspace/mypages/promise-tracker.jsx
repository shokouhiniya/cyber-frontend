import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_CONFIG = {
  completed: { label: 'محقق شده', color: '#51CF66', icon: 'solar:check-circle-bold' },
  inProgress: { label: 'در حال انجام', color: '#339AF0', icon: 'solar:refresh-circle-bold-duotone' },
  stalled: { label: 'متوقف', color: '#FFA94D', icon: 'solar:pause-circle-bold' },
  failed: { label: 'ناموفق', color: '#FF6B6B', icon: 'solar:close-circle-bold' },
  disputed: { label: 'مورد مناقشه', color: '#845EF7', icon: 'solar:question-circle-bold' },
};

const PROMISES = [
  {
    id: 1,
    title: '\u067E\u0627\u06CC\u0627\u0646 \u062F\u0627\u062F\u0646 \u0628\u0647 \u062C\u0646\u06AF \u0648 \u062F\u0631\u06CC\u0627\u0641\u062A \u063A\u0631\u0627\u0645\u062A',
    date: '\u06F1\u06F4\u06F0\u06F5/\u06F0\u06F1/\u06F1\u06F5',
    status: 'inProgress',
    officialProgress: 40,
    publicPerception: 18,
    mentions: 2840,
    positiveMentions: 420,
    negativeMentions: 1890,
    neutralMentions: 530,
    publicVerdict: '\u0627\u06A9\u062B\u0631\u06CC\u062A \u0645\u0639\u062A\u0642\u062F\u0646\u062F \u0645\u0630\u0627\u06A9\u0631\u0627\u062A \u0628\u0647 \u0646\u0641\u0639 \u0627\u06CC\u0631\u0627\u0646 \u067E\u06CC\u0634 \u0646\u0645\u06CC\u200C\u0631\u0648\u062F',
    tags: ['\u0645\u0630\u0627\u06A9\u0631\u0627\u062A', '\u063A\u0631\u0627\u0645\u062A'],
  },
  {
    id: 2,
    title: '\u062D\u0641\u0638 \u0627\u0646\u0633\u062C\u0627\u0645 \u0645\u0644\u06CC \u062F\u0631 \u0628\u0631\u0627\u0628\u0631 \u062C\u0646\u06AF \u062A\u0631\u06A9\u06CC\u0628\u06CC',
    date: '\u06F1\u06F4\u06F0\u06F5/\u06F0\u06F2/\u06F0\u06F1',
    status: 'disputed',
    officialProgress: 75,
    publicPerception: 35,
    mentions: 1560,
    positiveMentions: 480,
    negativeMentions: 780,
    neutralMentions: 300,
    publicVerdict: '\u0628\u06CC\u0627\u0646\u06CC\u0647 \u06F2\u06F6\u06F1 \u0646\u0645\u0627\u06CC\u0646\u062F\u0647 \u0646\u0634\u0627\u0646 \u0648\u062D\u062F\u062A \u0627\u0645\u0627 \u0639\u062F\u0645 \u0627\u0645\u0636\u0627\u06CC \u06F7 \u0646\u0641\u0631 \u0634\u06A9\u0627\u0641 \u0631\u0627 \u0622\u0634\u06A9\u0627\u0631 \u06A9\u0631\u062F',
    tags: ['\u0627\u0646\u0633\u062C\u0627\u0645', '\u0628\u06CC\u0627\u0646\u06CC\u0647'],
  },
  {
    id: 3,
    title: '\u06A9\u0627\u0647\u0634 \u0642\u06CC\u0645\u062A \u0646\u0641\u062A \u0628\u0647 \u06F1\u06F2\u06F0 \u062F\u0644\u0627\u0631',
    date: '\u06F1\u06F4\u06F0\u06F5/\u06F0\u06F2/\u06F0\u06F8',
    status: 'failed',
    officialProgress: 10,
    publicPerception: 5,
    mentions: 890,
    positiveMentions: 45,
    negativeMentions: 720,
    neutralMentions: 125,
    publicVerdict: '\u0642\u06CC\u0645\u062A \u0646\u0641\u062A \u0647\u0645\u0686\u0646\u0627\u0646 \u0628\u0627\u0644\u0627\u0633\u062A \u0648 \u0645\u0631\u062F\u0645 \u0627\u06CC\u0646 \u0648\u0639\u062F\u0647 \u0631\u0627 \u0645\u062D\u0642\u0642 \u0646\u0634\u062F\u0647 \u0645\u06CC\u200C\u062F\u0627\u0646\u0646\u062F',
    tags: ['\u0646\u0641\u062A', '\u0642\u06CC\u0645\u062A'],
  },
  {
    id: 4,
    title: '\u0645\u0642\u0627\u0628\u0644\u0647 \u0628\u0627 \u062C\u0646\u06AF \u0634\u0646\u0627\u062E\u062A\u06CC \u062F\u0634\u0645\u0646',
    date: '\u06F1\u06F4\u06F0\u06F5/\u06F0\u06F1/\u06F2\u06F0',
    status: 'inProgress',
    officialProgress: 55,
    publicPerception: 42,
    mentions: 1120,
    positiveMentions: 380,
    negativeMentions: 450,
    neutralMentions: 290,
    publicVerdict: '\u062A\u0644\u0627\u0634\u200C\u0647\u0627\u06CC\u06CC \u0627\u0646\u062C\u0627\u0645 \u0634\u062F\u0647 \u0627\u0645\u0627 \u0641\u0636\u0627\u06CC \u0631\u0633\u0627\u0646\u0647\u200C\u0627\u06CC \u0647\u0645\u0686\u0646\u0627\u0646 \u062A\u062D\u062A \u062A\u0623\u062B\u06CC\u0631 \u0631\u0648\u0627\u06CC\u062A\u200C\u0647\u0627\u06CC \u0645\u0646\u0641\u06CC \u0627\u0633\u062A',
    tags: ['\u062C\u0646\u06AF_\u0634\u0646\u0627\u062E\u062A\u06CC', '\u0631\u0633\u0627\u0646\u0647'],
  },
  {
    id: 5,
    title: '\u062D\u0645\u0627\u06CC\u062A \u0627\u0632 \u062A\u06CC\u0645 \u062F\u06CC\u067E\u0644\u0645\u0627\u0633\u06CC \u0627\u0646\u0642\u0644\u0627\u0628\u06CC',
    date: '\u06F1\u06F4\u06F0\u06F5/\u06F0\u06F2/\u06F0\u06F5',
    status: 'completed',
    officialProgress: 100,
    publicPerception: 65,
    mentions: 2100,
    positiveMentions: 1260,
    negativeMentions: 520,
    neutralMentions: 320,
    publicVerdict: '\u0627\u06A9\u062B\u0631\u06CC\u062A \u0646\u0645\u0627\u06CC\u0646\u062F\u06AF\u0627\u0646 \u062D\u0645\u0627\u06CC\u062A \u06A9\u0631\u062F\u0646\u062F \u0627\u0645\u0627 \u0645\u0646\u062A\u0642\u062F\u0627\u0646 \u0647\u0645\u0686\u0646\u0627\u0646 \u0641\u0639\u0627\u0644 \u0647\u0633\u062A\u0646\u062F',
    tags: ['\u062F\u06CC\u067E\u0644\u0645\u0627\u0633\u06CC', '\u062D\u0645\u0627\u06CC\u062A'],
  },
];

const formatNum = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString('fa-IR');
};

export function PromiseTracker() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  // Summary stats
  const total = PROMISES.length;
  const completed = PROMISES.filter((p) => p.status === 'completed').length;
  const failed = PROMISES.filter((p) => p.status === 'failed').length;
  const avgPerception = Math.round(PROMISES.reduce((s, p) => s + p.publicPerception, 0) / total);

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.warning.main, 0.16) }}>
            <Iconify icon="solar:checklist-bold-duotone" width={24} sx={{ color: theme.palette.warning.main }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>رصد وعده‌ها</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {total.toLocaleString('fa-IR')} وعده · میانگین درک عمومی {avgPerception}٪
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Summary chips */}
      <Box sx={{ px: 2.5, pt: 2 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = PROMISES.filter((p) => p.status === key).length;
            if (count === 0) return null;
            return (
              <Chip
                key={key}
                icon={<Iconify icon={cfg.icon} width={14} />}
                label={`${cfg.label}: ${count.toLocaleString('fa-IR')}`}
                size="small"
                sx={{
                  height: 26, fontSize: 10, fontWeight: 700,
                  bgcolor: alpha(cfg.color, 0.1),
                  color: cfg.color,
                  border: `1px solid ${alpha(cfg.color, 0.2)}`,
                  '& .MuiChip-icon': { color: cfg.color },
                }}
              />
            );
          })}
        </Stack>
      </Box>

      {/* Promise list */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Stack spacing={1.5}>
          {PROMISES.map((promise) => {
            const status = STATUS_CONFIG[promise.status];
            const isExpanded = expandedId === promise.id;
            const gap = promise.officialProgress - promise.publicPerception;

            return (
              <Card
                key={promise.id}
                sx={{
                  overflow: 'hidden',
                  border: `1px solid ${alpha(status.color, 0.16)}`,
                  borderRight: `4px solid ${status.color}`,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: alpha(status.color, 0.02) },
                }}
              >
                {/* Clickable header */}
                <ButtonBase
                  component="div"
                  onClick={() => toggleExpand(promise.id)}
                  sx={{ width: '100%', p: 2, display: 'block', textAlign: 'start' }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: alpha(status.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Iconify icon={status.icon} width={16} sx={{ color: status.color }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {promise.title}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9 }}>{promise.date}</Typography>
                          <Chip label={status.label} size="small" sx={{ height: 18, fontSize: 8, fontWeight: 700, bgcolor: alpha(status.color, 0.1), color: status.color }} />
                        </Stack>
                      </Box>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10, color: 'text.secondary' }}>
                        {formatNum(promise.mentions)} ذکر
                      </Typography>
                      <Iconify icon={isExpanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={16} sx={{ color: 'text.disabled' }} />
                    </Stack>
                  </Stack>
                </ButtonBase>

                {/* Expandable detail */}
                <Collapse in={isExpanded} timeout={250}>
                  <Box sx={{ px: 2, pb: 2 }}>
                    {/* Dual progress bars */}
                    <Stack spacing={1.5} sx={{ mb: 2 }}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600 }}>اعلام رسمی</Typography>
                          <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700, color: theme.palette.primary.main }}>{promise.officialProgress}٪</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={promise.officialProgress} sx={{ height: 6, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.08), '& .MuiLinearProgress-bar': { bgcolor: theme.palette.primary.main, borderRadius: 1 } }} />
                      </Box>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600 }}>درک عمومی</Typography>
                          <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700, color: status.color }}>{promise.publicPerception}٪</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={promise.publicPerception} sx={{ height: 6, borderRadius: 1, bgcolor: alpha(status.color, 0.08), '& .MuiLinearProgress-bar': { bgcolor: status.color, borderRadius: 1 } }} />
                      </Box>
                      {gap > 10 && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon="solar:danger-triangle-bold" width={12} sx={{ color: '#FFA94D' }} />
                          <Typography variant="caption" sx={{ fontSize: 9, color: '#FFA94D', fontWeight: 600 }}>
                            شکاف {gap} درصدی بین ادعای رسمی و درک عمومی
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    {/* Sentiment breakdown */}
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                      <Box sx={{ flex: 1, p: 1, borderRadius: 1, bgcolor: alpha('#51CF66', 0.06), textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontSize: 13, fontWeight: 800, color: '#51CF66', display: 'block' }}>{formatNum(promise.positiveMentions)}</Typography>
                        <Typography variant="caption" sx={{ fontSize: 8, color: 'text.disabled' }}>مثبت</Typography>
                      </Box>
                      <Box sx={{ flex: 1, p: 1, borderRadius: 1, bgcolor: alpha('#FF6B6B', 0.06), textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontSize: 13, fontWeight: 800, color: '#FF6B6B', display: 'block' }}>{formatNum(promise.negativeMentions)}</Typography>
                        <Typography variant="caption" sx={{ fontSize: 8, color: 'text.disabled' }}>منفی</Typography>
                      </Box>
                      <Box sx={{ flex: 1, p: 1, borderRadius: 1, bgcolor: alpha('#ADB5BD', 0.06), textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontSize: 13, fontWeight: 800, color: '#ADB5BD', display: 'block' }}>{formatNum(promise.neutralMentions)}</Typography>
                        <Typography variant="caption" sx={{ fontSize: 8, color: 'text.disabled' }}>خنثی</Typography>
                      </Box>
                    </Stack>

                    {/* Public verdict */}
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.info.main, 0.06), border: `1px solid ${alpha(theme.palette.info.main, 0.12)}` }}>
                      <Stack direction="row" spacing={1}>
                        <Iconify icon="solar:users-group-rounded-bold" width={14} sx={{ color: theme.palette.info.main, flexShrink: 0, mt: 0.25 }} />
                        <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.6 }}>
                          {promise.publicVerdict}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Tags */}
                    <Stack direction="row" spacing={0.75} sx={{ mt: 1.5 }}>
                      {promise.tags.map((tag) => (
                        <Chip key={tag} label={`#${tag}`} size="small" sx={{ height: 20, fontSize: 9, fontWeight: 600, bgcolor: alpha(theme.palette.grey[500], 0.08), color: 'text.secondary' }} />
                      ))}
                    </Stack>
                  </Box>
                </Collapse>
              </Card>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
}
