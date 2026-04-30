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
    title: 'راه‌اندازی شبکه ملی اطلاعات',
    date: '۱۴۰۴/۰۳/۱۵',
    status: 'inProgress',
    officialProgress: 65,
    publicPerception: 35,
    mentions: 1240,
    positiveMentions: 310,
    negativeMentions: 680,
    neutralMentions: 250,
    publicVerdict: 'مردم معتقدند پیشرفت واقعی کمتر از ادعای رسمی است',
    tags: ['زیرساخت', 'اینترنت'],
  },
  {
    id: 2,
    title: 'کاهش ۳۰٪ قیمت اینترنت',
    date: '۱۴۰۴/۰۶/۰۱',
    status: 'failed',
    officialProgress: 20,
    publicPerception: 8,
    mentions: 3420,
    positiveMentions: 120,
    negativeMentions: 2890,
    neutralMentions: 410,
    publicVerdict: 'اکثریت قاطع معتقد به عدم تحقق این وعده هستند',
    tags: ['اینترنت', 'قیمت'],
  },
  {
    id: 3,
    title: 'ایجاد ۵۰ هزار شغل در حوزه فناوری',
    date: '۱۴۰۴/۰۱/۰۱',
    status: 'inProgress',
    officialProgress: 45,
    publicPerception: 28,
    mentions: 890,
    positiveMentions: 210,
    negativeMentions: 390,
    neutralMentions: 290,
    publicVerdict: 'دیدگاه عمومی نسبتاً منفی، اما برخی پیشرفت‌ها مورد تأیید است',
    tags: ['اشتغال', 'فناوری'],
  },
  {
    id: 4,
    title: 'مقابله با حملات سایبری خارجی',
    date: '۱۴۰۴/۰۴/۲۰',
    status: 'completed',
    officialProgress: 100,
    publicPerception: 72,
    mentions: 2100,
    positiveMentions: 1260,
    negativeMentions: 420,
    neutralMentions: 420,
    publicVerdict: 'اکثریت این وعده را محقق شده می‌دانند',
    tags: ['امنیت', 'سایبری'],
  },
  {
    id: 5,
    title: 'شفاف‌سازی بودجه سازمان‌های دولتی',
    date: '۱۴۰۴/۰۷/۱۰',
    status: 'stalled',
    officialProgress: 30,
    publicPerception: 12,
    mentions: 1560,
    positiveMentions: 140,
    negativeMentions: 1100,
    neutralMentions: 320,
    publicVerdict: 'عدم شفافیت همچنان مورد انتقاد شدید است',
    tags: ['شفافیت', 'بودجه'],
  },
  {
    id: 6,
    title: 'توسعه دولت الکترونیک',
    date: '۱۴۰۴/۰۲/۰۱',
    status: 'inProgress',
    officialProgress: 55,
    publicPerception: 48,
    mentions: 670,
    positiveMentions: 280,
    negativeMentions: 190,
    neutralMentions: 200,
    publicVerdict: 'استقبال نسبی از سامانه‌های جدید، اما انتقاد از سرعت اجرا',
    tags: ['دولت_الکترونیک', 'خدمات'],
  },
  {
    id: 7,
    title: 'حمایت از استارتاپ‌های دانش‌بنیان',
    date: '۱۴۰۴/۰۵/۱۵',
    status: 'disputed',
    officialProgress: 70,
    publicPerception: 40,
    mentions: 980,
    positiveMentions: 350,
    negativeMentions: 380,
    neutralMentions: 250,
    publicVerdict: 'نظرات متفاوت: برخی از حمایت‌ها راضی و برخی معتقد به ناکافی بودن',
    tags: ['استارتاپ', 'حمایت'],
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
