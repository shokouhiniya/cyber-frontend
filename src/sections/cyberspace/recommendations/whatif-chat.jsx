'use client';

import { useState, useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const SUGGESTED_SCENARIOS = [
  'اگر قیمت اینترنت ۲۰٪ افزایش یابد چه اتفاقی می‌افتد؟',
  'اگر یک حمله سایبری بزرگ رخ دهد واکنش مردم چیست؟',
  'اگر وعده اشتغال فناوری محقق نشود چه تأثیری دارد؟',
  'اگر یک مصاحبه جنجالی منتشر شود چه باید کرد؟',
];

// Simulated AI responses for demo
const MOCK_RESPONSES = {
  default: {
    text: 'بر اساس تحلیل داده‌های موجود، این سناریو می‌تواند تأثیرات قابل توجهی داشته باشد. اجازه دهید جزئیات را بررسی کنم...',
    analysis: null,
  },
  'قیمت': {
    text: 'افزایش قیمت اینترنت یکی از حساس‌ترین موضوعات در فضای مجازی است. بر اساس الگوهای قبلی:',
    analysis: {
      sentimentShift: -32,
      expectedMentions: '۱۲,۰۰۰+',
      peakTime: '۲-۴ ساعت اول',
      riskLevel: 'بحرانی',
      riskColor: '#FF6B6B',
      recommendations: [
        'انتشار بیانیه توضیحی قبل از اعلام رسمی',
        'آماده‌سازی پاسخ‌های از پیش تعیین‌شده برای سوالات متداول',
        'هماهنگی با اینفلوئنسرهای همراه برای مدیریت روایت',
      ],
      breakdown: { positive: 8, negative: 72, neutral: 20 },
    },
  },
  'سایبری': {
    text: 'حملات سایبری معمولاً واکنش‌های دوگانه‌ای ایجاد می‌کنند. تحلیل سناریو:',
    analysis: {
      sentimentShift: -18,
      expectedMentions: '۸,۵۰۰+',
      peakTime: '۱-۳ ساعت اول',
      riskLevel: 'بالا',
      riskColor: '#FFA94D',
      recommendations: [
        'اطلاع‌رسانی سریع و شفاف درباره وضعیت',
        'تأکید بر اقدامات دفاعی انجام‌شده',
        'اجتناب از سکوت طولانی — هر ۲ ساعت به‌روزرسانی دهید',
      ],
      breakdown: { positive: 15, negative: 55, neutral: 30 },
    },
  },
  'اشتغال': {
    text: 'عدم تحقق وعده‌های اشتغال تأثیر تدریجی اما عمیقی دارد:',
    analysis: {
      sentimentShift: -25,
      expectedMentions: '۵,۲۰۰+',
      peakTime: 'تدریجی — طی ۱ هفته',
      riskLevel: 'متوسط-بالا',
      riskColor: '#FFA94D',
      recommendations: [
        'ارائه آمار دقیق از دستاوردهای جزئی',
        'معرفی برنامه جایگزین با زمان‌بندی مشخص',
        'مصاحبه با افرادی که از برنامه بهره‌مند شده‌اند',
      ],
      breakdown: { positive: 12, negative: 62, neutral: 26 },
    },
  },
  'مصاحبه': {
    text: 'مصاحبه‌های جنجالی معمولاً ویروسی می‌شوند. پیش‌بینی:',
    analysis: {
      sentimentShift: -40,
      expectedMentions: '۲۰,۰۰۰+',
      peakTime: '۳۰ دقیقه تا ۲ ساعت',
      riskLevel: 'بحرانی',
      riskColor: '#FF6B6B',
      recommendations: [
        'تهیه پاسخ رسمی ظرف ۱ ساعت',
        'عدم حذف یا سانسور — شفافیت کلید است',
        'استفاده از طنز هوشمندانه اگر محتوا اجازه دهد',
        'هدایت بحث به سمت موضوعات اصلی‌تر',
      ],
      breakdown: { positive: 5, negative: 80, neutral: 15 },
    },
  },
};

function findResponse(text) {
  const lower = text.toLowerCase();
  for (const [keyword, response] of Object.entries(MOCK_RESPONSES)) {
    if (keyword !== 'default' && lower.includes(keyword)) return response;
  }
  return MOCK_RESPONSES.default;
}

export function WhatIfChat() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = findResponse(msg);
      setMessages((prev) => [...prev, { role: 'ai', text: response.text, analysis: response.analysis }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha('#845EF7', 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#845EF7', 0.16) }}>
            <Iconify icon="solar:chat-round-dots-bold-duotone" width={24} sx={{ color: '#845EF7' }} />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>شبیه‌ساز سناریو</Typography>
              <Chip label="AI" size="small" sx={{ height: 20, fontSize: 9, fontWeight: 800, bgcolor: alpha('#845EF7', 0.12), color: '#845EF7' }} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              سناریوهای آینده را تست کنید و واکنش احتمالی افکار عمومی را ببینید
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Chat area */}
      <Box
        ref={scrollRef}
        sx={{
          height: 380,
          overflowY: 'auto',
          p: 2,
          bgcolor: alpha(theme.palette.grey[500], isDark ? 0.04 : 0.02),
        }}
      >
        {messages.length === 0 && !isTyping && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Iconify icon="solar:chat-round-dots-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              یک سناریو فرضی مطرح کنید تا تأثیر آن را تحلیل کنم
            </Typography>
            <Stack spacing={1}>
              {SUGGESTED_SCENARIOS.map((scenario) => (
                <Box
                  key={scenario}
                  onClick={() => handleSend(scenario)}
                  sx={{
                    p: 1.5, borderRadius: 1.5, cursor: 'pointer',
                    bgcolor: alpha('#845EF7', 0.04),
                    border: `1px solid ${alpha('#845EF7', 0.12)}`,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: alpha('#845EF7', 0.08), borderColor: alpha('#845EF7', 0.24) },
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: 11, color: 'text.primary' }}>
                    {scenario}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        <Stack spacing={2}>
          {messages.map((msg, i) => (
            <Box key={i}>
              {msg.role === 'user' ? (
                <Stack direction="row" justifyContent="flex-end">
                  <Box sx={{ maxWidth: '85%', p: 1.5, borderRadius: '12px 12px 4px 12px', bgcolor: theme.palette.primary.main, color: '#fff' }}>
                    <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.7 }}>{msg.text}</Typography>
                  </Box>
                </Stack>
              ) : (
                <Stack direction="row" justifyContent="flex-start" spacing={1}>
                  <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: alpha('#845EF7', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }}>
                    <Iconify icon="solar:cpu-bolt-bold" width={16} sx={{ color: '#845EF7' }} />
                  </Box>
                  <Box sx={{ maxWidth: '85%' }}>
                    <Box sx={{ p: 1.5, borderRadius: '12px 12px 12px 4px', bgcolor: alpha(theme.palette.grey[500], isDark ? 0.12 : 0.08) }}>
                      <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.7, color: 'text.primary' }}>{msg.text}</Typography>
                    </Box>

                    {/* Analysis card */}
                    {msg.analysis && (
                      <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, bgcolor: alpha('#845EF7', 0.04), border: `1px solid ${alpha('#845EF7', 0.12)}` }}>
                        {/* Risk + metrics */}
                        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.75 }}>
                          <Chip label={`ریسک: ${msg.analysis.riskLevel}`} size="small" sx={{ height: 22, fontSize: 9, fontWeight: 700, bgcolor: alpha(msg.analysis.riskColor, 0.12), color: msg.analysis.riskColor, border: `1px solid ${alpha(msg.analysis.riskColor, 0.24)}` }} />
                          <Chip label={`تغییر احساسات: ${msg.analysis.sentimentShift}٪`} size="small" sx={{ height: 22, fontSize: 9, fontWeight: 700, bgcolor: alpha('#FF6B6B', 0.1), color: '#FF6B6B' }} />
                          <Chip label={`حجم پیش‌بینی: ${msg.analysis.expectedMentions}`} size="small" sx={{ height: 22, fontSize: 9, fontWeight: 700, bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }} />
                        </Stack>

                        {/* Sentiment breakdown */}
                        <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
                          <Box sx={{ flex: msg.analysis.breakdown.positive, height: 6, bgcolor: '#51CF66', borderRadius: '3px 0 0 3px' }} />
                          <Box sx={{ flex: msg.analysis.breakdown.neutral, height: 6, bgcolor: '#ADB5BD' }} />
                          <Box sx={{ flex: msg.analysis.breakdown.negative, height: 6, bgcolor: '#FF6B6B', borderRadius: '0 3px 3px 0' }} />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontSize: 8, color: '#51CF66', fontWeight: 700 }}>{msg.analysis.breakdown.positive}٪ مثبت</Typography>
                          <Typography variant="caption" sx={{ fontSize: 8, color: '#ADB5BD', fontWeight: 700 }}>{msg.analysis.breakdown.neutral}٪ خنثی</Typography>
                          <Typography variant="caption" sx={{ fontSize: 8, color: '#FF6B6B', fontWeight: 700 }}>{msg.analysis.breakdown.negative}٪ منفی</Typography>
                        </Stack>

                        {/* Peak time */}
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.5 }}>
                          <Iconify icon="solar:clock-circle-bold" width={12} sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>اوج واکنش: {msg.analysis.peakTime}</Typography>
                        </Stack>

                        {/* Recommendations */}
                        <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700, display: 'block', mb: 0.75 }}>توصیه‌ها:</Typography>
                        <Stack spacing={0.5}>
                          {msg.analysis.recommendations.map((rec, ri) => (
                            <Stack key={ri} direction="row" alignItems="flex-start" spacing={0.75}>
                              <Iconify icon="solar:check-read-bold" width={12} sx={{ color: '#51CF66', mt: 0.25, flexShrink: 0 }} />
                              <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.5 }}>{rec}</Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Stack>
              )}
            </Box>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <Stack direction="row" justifyContent="flex-start" spacing={1}>
              <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: alpha('#845EF7', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Iconify icon="solar:cpu-bolt-bold" width={16} sx={{ color: '#845EF7' }} />
              </Box>
              <Box sx={{ p: 1.5, borderRadius: '12px 12px 12px 4px', bgcolor: alpha(theme.palette.grey[500], isDark ? 0.12 : 0.08) }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {[0, 1, 2].map((dot) => (
                    <Box
                      key={dot}
                      sx={{
                        width: 6, height: 6, borderRadius: '50%', bgcolor: '#845EF7',
                        animation: 'pulse 1.2s ease-in-out infinite',
                        animationDelay: `${dot * 0.2}s`,
                        '@keyframes pulse': {
                          '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                          '40%': { opacity: 1, transform: 'scale(1)' },
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Input area */}
      <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="یک سناریو فرضی بنویسید..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: 13,
                bgcolor: alpha(theme.palette.grey[500], isDark ? 0.08 : 0.04),
                '& fieldset': { borderColor: alpha(theme.palette.grey[500], 0.12) },
                '&:hover fieldset': { borderColor: alpha('#845EF7', 0.3) },
                '&.Mui-focused fieldset': { borderColor: '#845EF7' },
              },
            }}
          />
          <IconButton
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: input.trim() ? '#845EF7' : alpha(theme.palette.grey[500], 0.12),
              color: input.trim() ? '#fff' : 'text.disabled',
              '&:hover': { bgcolor: input.trim() ? alpha('#845EF7', 0.85) : undefined },
              '&.Mui-disabled': { bgcolor: alpha(theme.palette.grey[500], 0.08), color: 'text.disabled' },
            }}
          >
            <Iconify icon="solar:plain-bold" width={20} />
          </IconButton>
        </Stack>
      </Box>
    </Card>
  );
}
