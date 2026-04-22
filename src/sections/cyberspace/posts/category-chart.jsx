import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const CATEGORY_COLORS = {
  'علم و فناوری': '#2196F3',
  'فرهنگ و هنر': '#9C27B0',
  'اقتصاد و کسب‌وکار': '#4CAF50',
  'سیاست و حکمرانی': '#F44336',
  'جامعه و سبک زندگی': '#FF9800',
  'ورزش و تناسب‌اندام': '#00BCD4',
  'آموزش و توسعه فردی': '#FFEB3B',
  'محیط زیست و پایداری': '#8BC34A',
  'سرگرمی و فرهنگ مجازی': '#E91E63',
};

function generateSubColors(baseHex, count) {
  if (count <= 0) return [];
  if (count === 1) return [baseHex];
  const r = parseInt(baseHex.slice(1, 3), 16);
  const g = parseInt(baseHex.slice(3, 5), 16);
  const b = parseInt(baseHex.slice(5, 7), 16);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + 6) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const colors = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const nh = (h + (t - 0.5) * 24 + 360) % 360;
    const ns = Math.min(1, s * (0.7 + t * 0.6));
    const nl = 0.35 + t * 0.3;
    const c = (1 - Math.abs(2 * nl - 1)) * ns;
    const x = c * (1 - Math.abs(((nh / 60) % 2) - 1));
    const m = nl - c / 2;
    let r1, g1, b1;
    if (nh < 60) { r1 = c; g1 = x; b1 = 0; }
    else if (nh < 120) { r1 = x; g1 = c; b1 = 0; }
    else if (nh < 180) { r1 = 0; g1 = c; b1 = x; }
    else if (nh < 240) { r1 = 0; g1 = x; b1 = c; }
    else if (nh < 300) { r1 = x; g1 = 0; b1 = c; }
    else { r1 = c; g1 = 0; b1 = x; }
    const hex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    colors.push(`#${hex(r1)}${hex(g1)}${hex(b1)}`);
  }
  return colors;
}

export function CategoryChart({ data, loading }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [detailOpen, setDetailOpen] = useState(false);

  if (loading) {
    return (
      <Card sx={{ p: 2.5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, borderRadius: 2.5, boxShadow: theme.shadows[2] }}>
        <CircularProgress />
      </Card>
    );
  }

  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <Card sx={{ p: 2.5, borderRadius: 2.5, boxShadow: theme.shadows[2] }}>
        <Typography variant="body2" color="text.secondary" align="center">داده‌ای برای نمایش وجود ندارد</Typography>
      </Card>
    );
  }

  const { categories, subcategories } = data;
  const totalPosts = categories.reduce((sum, cat) => sum + cat.count, 0);

  const subcategoryByCategory = {};
  subcategories.forEach((sub) => {
    if (!subcategoryByCategory[sub.category]) subcategoryByCategory[sub.category] = [];
    subcategoryByCategory[sub.category].push(sub);
  });

  const subColorMap = {};
  Object.entries(subcategoryByCategory).forEach(([catName, subs]) => {
    const base = CATEGORY_COLORS[catName] || '#757575';
    const palette = generateSubColors(base, subs.length);
    subs.forEach((sub, i) => { subColorMap[`${catName}::${sub.name}`] = palette[i]; });
  });

  const categoryData = categories.map((cat) => ({
    ...cat,
    percentage: totalPosts > 0 ? ((cat.count / totalPosts) * 100).toFixed(1) : 0,
    color: CATEGORY_COLORS[cat.name] || '#757575',
  }));

  const size = 210;
  const outerR = 88, innerR = 58;
  const cx = size / 2, cy = size / 2;
  const outerC = 2 * Math.PI * outerR;
  const innerC = 2 * Math.PI * innerR;

  let angle = -90;
  const catSegs = [];
  const subSegs = [];

  categoryData.forEach((cat) => {
    const pct = parseFloat(cat.percentage);
    const span = (pct / 100) * 360;
    catSegs.push({ percentage: cat.percentage, color: cat.color, startAngle: angle });
    const subs = subcategoryByCategory[cat.name] || [];
    const catTotal = subs.reduce((s, sub) => s + sub.count, 0);
    let sa = angle;
    subs.forEach((sub) => {
      const sp = catTotal > 0 ? (sub.count / catTotal) * pct : 0;
      const ss = (sp / 100) * 360;
      subSegs.push({
        percentage: ((sub.count / totalPosts) * 100).toFixed(1),
        color: subColorMap[`${cat.name}::${sub.name}`] || cat.color,
        startAngle: sa,
      });
      sa += ss;
    });
    angle += span;
  });

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.16) }}>
            <Iconify icon="solar:pie-chart-2-bold-duotone" width={24} sx={{ color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>دسته‌بندی پست‌ها</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {totalPosts.toLocaleString('fa-IR')} پست در {categories.length.toLocaleString('fa-IR')} دسته
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={alpha(theme.palette.grey[500], 0.08)} strokeWidth={16} />
          <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={alpha(theme.palette.grey[500], 0.08)} strokeWidth={16} />

          {catSegs.map((seg, i) => {
            const p = parseFloat(seg.percentage);
            const len = (p / 100) * outerC;
            const off = -((seg.startAngle + 90) / 360) * outerC;
            return <circle key={`c${i}`} cx={cx} cy={cy} r={outerR} fill="none" stroke={isDark ? alpha(seg.color, 0.85) : seg.color} strokeWidth={16} strokeDasharray={`${len} ${outerC}`} strokeDashoffset={off} strokeLinecap="butt" style={{ transition: 'all 0.6s ease' }} />;
          })}

          {subSegs.map((seg, i) => {
            const p = parseFloat(seg.percentage);
            const len = (p / 100) * innerC;
            const off = -((seg.startAngle + 90) / 360) * innerC;
            return <circle key={`s${i}`} cx={cx} cy={cy} r={innerR} fill="none" stroke={isDark ? alpha(seg.color, 0.75) : seg.color} strokeWidth={16} strokeDasharray={`${len} ${innerC}`} strokeDashoffset={off} strokeLinecap="butt" style={{ transition: 'all 0.6s ease' }} />;
          })}

          <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle" fill={theme.palette.text.primary} fontSize="22" fontWeight="800">
            {totalPosts.toLocaleString('fa-IR')}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" fill={theme.palette.text.secondary} fontSize="11" fontWeight="600">
            پست
          </text>
        </svg>

        {/* Toggle */}
        <ButtonBase
          onClick={() => setDetailOpen((prev) => !prev)}
          sx={{
            width: '100%', mt: 2, py: 1, px: 1.5, borderRadius: 1.5,
            bgcolor: alpha(theme.palette.grey[500], isDark ? 0.12 : 0.06),
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
            transition: 'background 0.2s',
            '&:hover': { bgcolor: alpha(theme.palette.grey[500], isDark ? 0.2 : 0.1) },
          }}
        >
          <Iconify icon={detailOpen ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={16} sx={{ color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 11 }}>
            {detailOpen ? 'بستن جزئیات' : 'جزئیات زیردسته‌ها'}
          </Typography>
        </ButtonBase>

        {/* Collapsible subcategory breakdown */}
        <Collapse in={detailOpen} timeout={300} sx={{ width: '100%' }}>
          <Stack spacing={1.5} sx={{ mt: 1.5 }}>
            {categoryData.map((cat) => {
              const subs = subcategoryByCategory[cat.name] || [];
              if (subs.length === 0) return null;
              return (
                <Box key={cat.name}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cat.color, flexShrink: 0, boxShadow: `0 0 6px ${alpha(cat.color, 0.4)}` }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 12, color: cat.color }}>
                      {cat.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, fontWeight: 600 }}>
                      ({cat.percentage}%)
                    </Typography>
                  </Stack>
                  <Stack spacing={0.25} sx={{ mr: 2.5 }}>
                    {subs.map((sub) => {
                      const subColor = subColorMap[`${cat.name}::${sub.name}`] || cat.color;
                      const subPct = ((sub.count / totalPosts) * 100).toFixed(1);
                      return (
                        <Stack key={sub.name} direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: subColor, flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10.5 }}>{sub.name}</Typography>
                          </Stack>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
                            {subPct}%
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Collapse>
      </Box>
    </Card>
  );
}
