'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { buildReportHtml } from 'src/utils/report-templates';
import { generatePdfFromHtml } from 'src/utils/generate-pdf-report';

import axios from 'src/lib/axios';
import { useProfile } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const REPORTS = [
  {
    id: 'daily',
    title: 'گزارش روزانه',
    description: 'خلاصه فعالیت‌ها، احساسات و تأثیرگذاران ۲۴ ساعت گذشته',
    icon: 'solar:calendar-bold-duotone',
    color: '#667eea',
  },
  {
    id: 'weekly',
    title: 'گزارش هفتگی',
    description: 'تحلیل جامع ۷ روز اخیر با نمودارها و تأثیرگذاران',
    icon: 'solar:chart-2-bold-duotone',
    color: '#51CF66',
  },
  {
    id: 'monthly',
    title: 'گزارش ماهانه',
    description: 'گزارش کامل عملکرد ۳۰ روزه',
    icon: 'solar:document-text-bold-duotone',
    color: '#FFA94D',
  },
  {
    id: 'quarterly',
    title: 'گزارش فصلی',
    description: 'تحلیل جامع ۹۰ روزه با روندها و مقایسه‌ها',
    icon: 'solar:graph-up-bold-duotone',
    color: '#845EF7',
  },
];

// Map report period to hours back
const PERIOD_HOURS = { daily: 24, weekly: 24 * 7, monthly: 24 * 30, quarterly: 24 * 90 };

// Sections that only make sense for daily (single-run AI prompts)
const DAILY_ONLY_SECTIONS = ['ai_summary', 'recommendations', 'political_spectrum', 'narrative_gap'];

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
  const isDaily = reportId === 'daily';

  const requests = [
    axios.get(`/api/stats${since ? `?since=${encodeURIComponent(since)}` : ''}`),
    axios.get(`/api/emotions${since ? `?since=${encodeURIComponent(since)}` : ''}`),
    axios.get(`/api/stats/top-posts?limit=10${sinceParam}`),
    axios.get(`/api/stats/top-commented?limit=8${sinceParam}`),
    axios.get(`/api/stats/top-forwarded?limit=8${sinceParam}`),
    axios.get('/api/influencers/map?limit=30'),           // all-time stance data
    axios.get(`/api/stats/sources${since ? `?since=${encodeURIComponent(since)}` : ''}`),
    isDaily ? axios.get('/api/ai-content/generate?section=ai_summary') : Promise.resolve(null),
    isDaily ? axios.get('/api/stats/crisis') : Promise.resolve(null),  // crisis is real-time
    axios.get('/api/stats/hashtags?limit=20'),
    axios.get('/api/stats/promise-perception'),
    axios.get('/api/admin/ingest/macro-context'),
    isDaily ? axios.get('/api/ai-content/generate?section=recommendations') : Promise.resolve(null),
    axios.get('/api/stats/user-distribution'),
    isDaily ? axios.get('/api/ai-content/generate?section=political_spectrum') : Promise.resolve(null),
    isDaily ? axios.get('/api/ai-content/generate?section=narrative_gap') : Promise.resolve(null),
  ];

  const [
    statsRes, emotionsRes, topPostsRes, topCommentedRes, topForwardedRes,
    influencersRes, sourcesRes, aiRes, crisisRes, hashtagsRes,
    promisesRes, macroRes, recsRes, userDistRes, spectrumRes, gapRes,
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
    userDistribution: userDistRes.status === 'fulfilled' ? userDistRes.value.data : {},
    politicalSpectrum: extractAi(spectrumRes),
    narrativeGap: extractAi(gapRes),
  };
}

export function TabReports() {
  const theme = useTheme();
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
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      {/* Header */}
      <Card
        sx={{
          p: 2.5, borderRadius: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.16) }}>
            <Iconify icon="solar:document-text-bold-duotone" width={28} sx={{ color: theme.palette.primary.main }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>گزارش‌گیری</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
              دریافت گزارش‌های PDF دوستونه برای {profile?.name || 'پروفایل انتخاب‌شده'}
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Reports Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
        {REPORTS.map((report) => {
          const isGenerating = generating === report.id;
          return (
            <Card
              key={report.id}
              sx={{
                borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2],
                border: `1px solid ${alpha(report.color, 0.16)}`,
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: theme.shadows[8], transform: 'translateY(-2px)' },
              }}
            >
              <Box sx={{ p: 2, background: `linear-gradient(135deg, ${alpha(report.color, 0.08)} 0%, ${alpha(report.color, 0.02)} 100%)` }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(report.color, 0.16) }}>
                      <Iconify icon={report.icon} width={22} sx={{ color: report.color }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{report.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>{report.description}</Typography>
                    </Box>
                  </Stack>

                  <Button
                    variant="contained"
                    size="small"
                    disabled={isGenerating}
                    onClick={() => handleGenerate(report.id)}
                    startIcon={isGenerating
                      ? <CircularProgress size={14} color="inherit" />
                      : <Iconify icon="solar:download-bold" width={16} />
                    }
                    sx={{
                      bgcolor: report.color, color: '#fff', fontWeight: 700, fontSize: 11, height: 32,
                      '&:hover': { bgcolor: alpha(report.color, 0.8) },
                      '&.Mui-disabled': { bgcolor: alpha(report.color, 0.4), color: '#fff' },
                    }}
                  >
                    {isGenerating ? 'در حال تولید...' : 'دریافت PDF'}
                  </Button>
                </Stack>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Stack>
  );
}
