'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { fDateFa } from 'src/utils/format-number-fa';
import { buildReportHtml } from 'src/utils/report-templates';
import { generatePdfFromHtml } from 'src/utils/generate-pdf-report';

import axios from 'src/lib/axios';
import { useProfile } from 'src/api/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { WidgetCard } from '../shared/widget-card';
import { PageHeader } from '../shared/page-header';
import { GridItem, WidgetGrid } from '../shared/widget-grid';

// ----------------------------------------------------------------------

const REPORTS = [
  {
    id: 'daily',
    title: 'گزارش روزانه',
    period: '۲۴ ساعت گذشته',
    description: 'خلاصه فعالیت‌ها، احساسات و تأثیرگذاران ۲۴ ساعت گذشته، همراه با تحلیل‌های هوش مصنوعی.',
    icon: 'solar:calendar-bold-duotone',
    color: 'primary',
  },
  {
    id: 'weekly',
    title: 'گزارش هفتگی',
    period: '۷ روز گذشته',
    description: 'تحلیل جامع ۷ روز اخیر: آمار، احساسات، پلتفرم‌ها و پست‌های برتر هفته.',
    icon: 'solar:chart-2-bold-duotone',
    color: 'success',
  },
  {
    id: 'monthly',
    title: 'گزارش ماهانه',
    period: '۳۰ روز گذشته',
    description: 'گزارش کامل عملکرد ۳۰ روزه با تمرکز بر روندها و پست‌های اثرگذار.',
    icon: 'solar:document-text-bold-duotone',
    color: 'warning',
  },
  {
    id: 'quarterly',
    title: 'گزارش فصلی',
    period: '۹۰ روز گذشته',
    description: 'تحلیل جامع ۹۰ روزه برای مقایسه و جمع‌بندی دوره‌ای.',
    icon: 'solar:graph-up-bold-duotone',
    color: 'secondary',
  },
];

// Map report period to hours back
const PERIOD_HOURS = { daily: 24, weekly: 24 * 7, monthly: 24 * 30, quarterly: 24 * 90 };

// What each report contains, so the period's effect is visible before downloading.
const PERIOD_SECTIONS = [
  'آمار کلی (پست، بازدید، لایک، بازنشر)',
  'توزیع احساسات',
  'خلاصه پلتفرم‌ها',
  'هشتگ‌ها و واژگان پرتکرار',
  'پربازدیدترین، پربحث‌ترین و پرتکرارترین پست‌ها',
  'موافقان و مخالفان برتر',
  'تفکیک کاربران',
  'رصد وعده‌ها',
];

const DAILY_SECTIONS = [
  'خلاصه هوش مصنوعی',
  'سلامت اعتبار و رادار بحران (لحظه‌ای)',
  'طیف سیاسی و تحلیل شکاف روایت',
  'پیشنهادات واکنش هوشمند',
];

function getSince(reportId) {
  const hours = PERIOD_HOURS[reportId];
  if (!hours) return undefined;
  const d = new Date(Date.now() - hours * 3600_000);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

async function fetchReportData(reportId) {
  const since = getSince(reportId);
  const sinceParam = since ? `&since=${encodeURIComponent(since)}` : '';
  const sinceQuery = since ? `?since=${encodeURIComponent(since)}` : '';
  const isDaily = reportId === 'daily';

  const requests = [
    axios.get(`/api/stats${sinceQuery}`),
    axios.get(`/api/emotions${sinceQuery}`),
    axios.get(`/api/stats/top-posts?limit=10${sinceParam}`),
    axios.get(`/api/stats/top-commented?limit=8${sinceParam}`),
    axios.get(`/api/stats/top-forwarded?limit=8${sinceParam}`),
    axios.get(`/api/influencers/map?limit=30${sinceParam}`),
    axios.get(`/api/stats/sources${sinceQuery}`),
    isDaily ? axios.get('/api/ai-content/generate?section=ai_summary') : Promise.resolve(null),
    isDaily ? axios.get('/api/stats/crisis') : Promise.resolve(null), // crisis is real-time
    axios.get(`/api/stats/hashtags?limit=20${sinceParam}`),
    axios.get(`/api/stats/promise-perception${sinceQuery}`),
    axios.get('/api/admin/ingest/macro-context'),
    isDaily ? axios.get('/api/ai-content/generate?section=recommendations') : Promise.resolve(null),
    axios.get(`/api/stats/bot-analysis${sinceQuery}`),
    isDaily ? axios.get('/api/ai-content/generate?section=political_spectrum') : Promise.resolve(null),
    isDaily ? axios.get('/api/ai-content/generate?section=narrative_gap') : Promise.resolve(null),
  ];

  const [
    statsRes, emotionsRes, topPostsRes, topCommentedRes, topForwardedRes,
    influencersRes, sourcesRes, aiRes, crisisRes, hashtagsRes,
    promisesRes, macroRes, recsRes, botRes, spectrumRes, gapRes,
  ] = await Promise.allSettled(requests);

  const extractAi = (res) => {
    if (res.status !== 'fulfilled' || !res.value) return null;
    const parsed = res.value.data?.debug?.llm_parsed;
    if (typeof parsed === 'string') return parsed;
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return JSON.stringify(parsed);
    return null;
  };

  return {
    stats: statsRes.status === 'fulfilled' ? statsRes.value.data : {},
    emotions: emotionsRes.status === 'fulfilled' ? emotionsRes.value.data : {},
    topPosts: topPostsRes.status === 'fulfilled' ? topPostsRes.value.data : [],
    topCommented: topCommentedRes.status === 'fulfilled' ? topCommentedRes.value.data : [],
    topForwarded: topForwardedRes.status === 'fulfilled' ? topForwardedRes.value.data : [],
    influencers: influencersRes.status === 'fulfilled' ? influencersRes.value.data : [],
    sourceTotals: sourcesRes.status === 'fulfilled' ? sourcesRes.value.data : [],
    aiSummary: extractAi(aiRes),
    crisisMetrics: isDaily && crisisRes.status === 'fulfilled' ? crisisRes.value?.data : null,
    hashtags: hashtagsRes.status === 'fulfilled' ? hashtagsRes.value.data : [],
    promises: promisesRes.status === 'fulfilled' ? promisesRes.value.data : [],
    macroContext: macroRes.status === 'fulfilled' ? macroRes.value.data?.today : null,
    recommendations: extractAi(recsRes),
    botAnalysis: botRes.status === 'fulfilled' ? botRes.value.data : {},
    politicalSpectrum: extractAi(spectrumRes),
    narrativeGap: extractAi(gapRes),
  };
}

// ----------------------------------------------------------------------

export function TabReports() {
  const { data: profile } = useProfile();
  const [generating, setGenerating] = useState(null);

  const handleGenerate = async (reportId) => {
    setGenerating(reportId);
    try {
      const profileName = profile?.name || 'پروفایل';
      const data = await fetchReportData(reportId);
      const html = buildReportHtml(reportId, { profileName, ...data });
      const filename = `گزارش-${reportId}-${profileName}`;
      await generatePdfFromHtml(html, filename);
    } catch (err) {
      console.error('Report generation failed:', err);
      toast.error(typeof err === 'string' ? err : 'تولید گزارش با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <>
      <PageHeader
        title="گزارش‌گیری"
        description={`دریافت گزارش PDF دوستونه برای ${profile?.name || 'پروفایل انتخاب‌شده'}. هر گزارش داده‌های بازه خودش را نشان می‌دهد.`}
      />

      <WidgetGrid sx={{ pb: { xs: 10, lg: 4 } }}>
        {REPORTS.map((report) => (
          <GridItem key={report.id} span={{ sm: 6, lg: 3 }}>
            <ReportCard
              report={report}
              generating={generating === report.id}
              disabled={!!generating}
              onGenerate={() => handleGenerate(report.id)}
            />
          </GridItem>
        ))}

        <GridItem>
          <ReportContents />
        </GridItem>
      </WidgetGrid>
    </>
  );
}

// ----------------------------------------------------------------------

function ReportCard({ report, generating, disabled, onGenerate }) {
  const theme = useTheme();
  const tone = theme.palette[report.color].main;
  const since = getSince(report.id);

  return (
    <WidgetCard
      title={report.title}
      icon={report.icon}
      color={report.color}
      subheader={`بازه: ${report.period}`}
      contentSx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, flex: 1 }}>
        {report.description}
      </Typography>

      <Stack spacing={0.75}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:calendar-date-bold" width={16} sx={{ color: 'text.disabled', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12 }}>
            از {fDateFa(since)} تا امروز
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Iconify icon="solar:eye-linear" width={16} sx={{ color: 'text.disabled', flexShrink: 0, mt: 0.25 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12, lineHeight: 1.7 }}>
            پست‌های برتر: پربازدیدترین پست‌ها از ابتدای این بازه
          </Typography>
        </Stack>
        {report.id === 'daily' && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:cpu-bolt-bold" width={16} sx={{ color: 'text.disabled', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12 }}>
              شامل تحلیل‌های هوش مصنوعی
            </Typography>
          </Stack>
        )}
      </Stack>

      <Button
        fullWidth
        variant="contained"
        color={report.color}
        disabled={disabled}
        onClick={onGenerate}
        startIcon={
          generating ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <Iconify icon="solar:download-bold" width={18} />
          )
        }
        sx={{
          fontWeight: 700,
          '&.Mui-disabled': generating ? { bgcolor: alpha(tone, 0.4), color: 'common.white' } : {},
        }}
      >
        {generating ? 'در حال تولید…' : 'دریافت PDF'}
      </Button>
    </WidgetCard>
  );
}

// ----------------------------------------------------------------------

function SectionList({ title, caption, items, color, icon }) {
  const theme = useTheme();
  const tone = theme.palette[color].main;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {caption && (
          <Chip
            label={caption}
            size="small"
            sx={{ height: 22, fontSize: 12, fontWeight: 700, color: tone, bgcolor: alpha(tone, 0.12) }}
          />
        )}
      </Stack>
      <Stack spacing={0.75} sx={{ mt: 1.25 }}>
        {items.map((item) => (
          <Stack key={item} direction="row" alignItems="flex-start" spacing={1}>
            <Iconify icon={icon} width={16} sx={{ color: tone, flexShrink: 0, mt: 0.375 }} />
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              {item}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function ReportContents() {
  return (
    <WidgetCard
      title="محتوای گزارش‌ها"
      icon="solar:checklist-bold-duotone"
      color="info"
      subheader="کدام بخش‌ها در هر گزارش آمده‌اند"
    >
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <SectionList
          title="بر اساس بازه گزارش"
          caption="همه گزارش‌ها"
          items={PERIOD_SECTIONS}
          color="success"
          icon="solar:check-circle-bold"
        />
        <SectionList
          title="فقط در گزارش روزانه"
          caption="روزانه"
          items={DAILY_SECTIONS}
          color="primary"
          icon="solar:star-bold"
        />
      </Box>

      <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />

      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
        همه بخش‌های جدول‌ها و آمار فقط پست‌های منتشرشده در بازه گزارش را در نظر می‌گیرند. رادار بحران
        لحظه‌ای است و وضعیت کلان همیشه مربوط به امروز است.
      </Typography>
    </WidgetCard>
  );
}
