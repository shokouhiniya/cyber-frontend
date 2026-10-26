'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { fDelta, fPercent, toFaDigits } from 'src/utils/format-number-fa';

import axios from 'src/lib/axios';
import { useProfile, useScenarioStarters } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { SENTIMENT_COLORS } from 'src/components/chart';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard } from '../shared/widget-card';

// ----------------------------------------------------------------------

// Set to false when the feature is ready to ship
const DISABLED = true;

const UNDER_DEV_MSG = 'این قابلیت در دست توسعه است.';

const FALLBACK_ERROR = 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.';

// Palette keys, so risk colors follow the theme in light and dark mode
const RISK_TONES = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  critical: 'error',
};

export function WhatIfChat() {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const { data: profile } = useProfile();
  const starters = useScenarioStarters();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');

    if (DISABLED) {
      setMessages((prev) => [...prev, { role: 'ai', text: UNDER_DEV_MSG, analysis: null }]);
      return;
    }

    setIsTyping(true);
    try {
      const orgId = profile?.promticIdentifier?.external_id;
      const params = orgId ? `?org_id=${encodeURIComponent(orgId)}` : '';
      const res = await axios.post(`/api/ai-content/scenario${params}`, { scenario: msg });
      const a = res.data?.analysis;
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: a?.summary || 'تحلیل دریافت شد.',
          analysis: a
            ? {
                riskLevel: a.risk_label || a.risk_level,
                riskTone: RISK_TONES[a.risk_level] || 'warning',
                sentimentShift: a.sentiment_shift ?? 0,
                expectedMentions: a.expected_volume || 'متوسط',
                peakTime: a.peak_time || '۲-۴ ساعت',
                breakdown: a.breakdown || { positive: 33, neutral: 34, negative: 33 },
                keyRisks: a.key_risks || [],
                recommendations: a.recommendations || [],
                suggestedResponse: a.suggested_response || null,
              }
            : null,
        },
      ]);
    } catch (err) {
      // The axios interceptor rejects with a plain (already localized) message string
      const message = typeof err === 'string' && err ? err : err?.message || FALLBACK_ERROR;
      setMessages((prev) => [...prev, { role: 'error', text: message }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = !!input.trim() && !isTyping;

  return (
    <WidgetCard
      title="شبیه‌ساز سناریو"
      icon="solar:chat-round-dots-bold-duotone"
      color="secondary"
      tooltip={WIDGET_TOOLTIPS.whatIfChat}
      subheader="سناریوهای فرضی را تست کنید و واکنش احتمالی افکار عمومی را ببینید"
      action={
        <Chip
          label={DISABLED ? 'در دست توسعه' : 'هوش مصنوعی'}
          size="small"
          color={DISABLED ? 'default' : 'secondary'}
          variant="soft"
          sx={{ height: 24, fontSize: 12, fontWeight: 700 }}
        />
      }
      disablePadding
      sx={{ height: { xs: 560, lg: 'calc(100vh - 160px)' }, minHeight: { lg: 560 }, maxHeight: { lg: 760 } }}
      contentSx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      {DISABLED && (
        <Alert severity="info" variant="outlined" sx={{ mx: 2, mb: 1.5, py: 0.25, fontSize: 13 }}>
          این بخش هنوز به سرویس تحلیل متصل نیست و پاسخ‌ها نمایشی هستند.
        </Alert>
      )}

      {/* Messages */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 2,
          py: 2,
          bgcolor: alpha(theme.palette.grey[500], 0.04),
          borderTop: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        }}
      >
        {messages.length === 0 && !isTyping && (
          <Stack alignItems="center" sx={{ textAlign: 'center', py: 2 }}>
            <Iconify icon="solar:chat-round-dots-bold-duotone" width={40} sx={{ color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              یک سناریوی فرضی مطرح کنید یا از پیشنهادهای زیر شروع کنید.
            </Typography>
            <Stack spacing={1} sx={{ width: 1 }}>
              {starters.map((scenario) => (
                <Box
                  key={scenario}
                  component="button"
                  type="button"
                  onClick={() => handleSend(scenario)}
                  sx={{
                    font: 'inherit',
                    fontSize: 13,
                    lineHeight: 1.8,
                    color: 'text.primary',
                    textAlign: 'start',
                    cursor: 'pointer',
                    p: 1.25,
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                    transition: theme.transitions.create(['border-color', 'background-color']),
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                    '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
                  }}
                >
                  {toFaDigits(scenario)}
                </Box>
              ))}
            </Stack>
          </Stack>
        )}

        <Stack spacing={2}>
          {messages.map((msg, i) => {
            if (msg.role === 'user') return <UserBubble key={i} text={msg.text} />;
            return <AiBubble key={i} msg={msg} />;
          })}

          {isTyping && <TypingBubble />}
        </Stack>
      </Box>

      {/* Input, pinned to the bottom of the card */}
      <Box sx={{ p: 1.5, borderTop: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`, bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="یک سناریوی فرضی بنویسید…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            size="small"
            slotProps={{ htmlInput: { 'aria-label': 'متن سناریو' } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 14 } }}
          />
          <IconButton
            aria-label="ارسال"
            onClick={() => handleSend()}
            disabled={!canSend}
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 1.5,
              color: 'primary.contrastText',
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: alpha(theme.palette.grey[500], 0.12), color: 'text.disabled' },
            }}
          >
            <Iconify icon="solar:plain-bold" width={20} />
          </IconButton>
        </Stack>
        <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'text.disabled', fontSize: 11 }}>
          Enter برای ارسال · Shift+Enter برای خط جدید
        </Typography>
      </Box>
    </WidgetCard>
  );
}

// ----------------------------------------------------------------------

function UserBubble({ text }) {
  return (
    <Stack direction="row" justifyContent="flex-end">
      <Box
        sx={{
          maxWidth: '85%',
          px: 1.75,
          py: 1.25,
          borderRadius: 2,
          borderEndEndRadius: 4,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {toFaDigits(text)}
        </Typography>
      </Box>
    </Stack>
  );
}

function BotAvatar({ tone }) {
  const theme = useTheme();
  const color = theme.palette[tone].main;
  return (
    <Box
      sx={{
        width: 30,
        height: 30,
        flexShrink: 0,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        bgcolor: alpha(color, 0.12),
      }}
    >
      <Iconify icon={tone === 'error' ? 'solar:danger-triangle-bold' : 'solar:cpu-bolt-bold'} width={16} />
    </Box>
  );
}

function TypingBubble() {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1} alignItems="flex-end" aria-live="polite" aria-label="در حال تحلیل">
      <BotAvatar tone="secondary" />
      <Box
        sx={{
          px: 1.75,
          py: 1.5,
          borderRadius: 2,
          borderEndStartRadius: 4,
          bgcolor: 'background.paper',
          border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          {[0, 1, 2].map((dot) => (
            <Box
              key={dot}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'text.secondary',
                animation: 'whatif-typing 1.2s ease-in-out infinite',
                animationDelay: `${dot * 0.2}s`,
                '@keyframes whatif-typing': {
                  '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                  '40%': { opacity: 1, transform: 'scale(1)' },
                },
              }}
            />
          ))}
          <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
            در حال تحلیل…
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

function AiBubble({ msg }) {
  const theme = useTheme();
  const isError = msg.role === 'error';

  return (
    <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1}>
      <BotAvatar tone={isError ? 'error' : 'secondary'} />
      <Box sx={{ maxWidth: '88%', minWidth: 0 }}>
        <Box
          sx={{
            px: 1.75,
            py: 1.25,
            borderRadius: 2,
            borderStartStartRadius: 4,
            bgcolor: isError ? alpha(theme.palette.error.main, 0.08) : 'background.paper',
            border: `1px solid ${isError ? alpha(theme.palette.error.main, 0.24) : alpha(theme.palette.grey[500], 0.16)}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{ lineHeight: 1.8, color: isError ? 'error.main' : 'text.primary', wordBreak: 'break-word' }}
          >
            {toFaDigits(msg.text)}
          </Typography>
        </Box>

        {msg.analysis && <AnalysisCard analysis={msg.analysis} />}
      </Box>
    </Stack>
  );
}

function AnalysisCard({ analysis }) {
  const theme = useTheme();
  const riskColor = theme.palette[analysis.riskTone].main;
  const shiftColor = analysis.sentimentShift >= 0 ? theme.palette.success.main : theme.palette.error.main;
  const { breakdown } = analysis;

  const chipSx = (color) => ({ height: 24, fontSize: 12, fontWeight: 700, color, bgcolor: alpha(color, 0.12) });

  return (
    <Box
      sx={{
        mt: 1,
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
      }}
    >
      <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1.5 }}>
        <Chip size="small" label={`ریسک: ${toFaDigits(analysis.riskLevel)}`} sx={chipSx(riskColor)} />
        <Chip size="small" label={`تغییر احساسات: ${fDelta(analysis.sentimentShift)}`} sx={chipSx(shiftColor)} />
        <Chip
          size="small"
          label={`حجم: ${toFaDigits(analysis.expectedMentions)}`}
          sx={chipSx(theme.palette.info.main)}
        />
      </Stack>

      <Stack direction="row" spacing={0.25} sx={{ mb: 0.75, borderRadius: 1, overflow: 'hidden' }}>
        <Box sx={{ flex: breakdown.positive || 0, height: 8, bgcolor: SENTIMENT_COLORS.positive }} />
        <Box sx={{ flex: breakdown.neutral || 0, height: 8, bgcolor: SENTIMENT_COLORS.neutral }} />
        <Box sx={{ flex: breakdown.negative || 0, height: 8, bgcolor: SENTIMENT_COLORS.negative }} />
      </Stack>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
        {[
          ['positive', 'مثبت'],
          ['neutral', 'خنثی'],
          ['negative', 'منفی'],
        ].map(([key, label]) => (
          <Typography key={key} variant="caption" sx={{ fontSize: 12, fontWeight: 700, color: SENTIMENT_COLORS[key] }}>
            {fPercent(breakdown[key])} {label}
          </Typography>
        ))}
      </Stack>

      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
        <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: 'text.disabled' }} />
        <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
          اوج واکنش: {toFaDigits(analysis.peakTime)}
        </Typography>
      </Stack>

      {analysis.keyRisks?.length > 0 && (
        <BulletList
          title="ریسک‌های کلیدی"
          items={analysis.keyRisks}
          icon="solar:danger-triangle-bold"
          color={theme.palette.error.main}
        />
      )}

      {analysis.recommendations?.length > 0 && (
        <BulletList
          title="توصیه‌ها"
          items={analysis.recommendations}
          icon="solar:check-read-bold"
          color={theme.palette.success.main}
        />
      )}

      {analysis.suggestedResponse && (
        <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.08) }}>
          <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 700, color: 'success.main', display: 'block', mb: 0.5 }}>
            پیشنهاد واکنش
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 13, color: 'text.primary', lineHeight: 1.8 }}>
            {toFaDigits(analysis.suggestedResponse)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function BulletList({ title, items, icon, color }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 700, display: 'block', mb: 0.5, color }}>
        {title}
      </Typography>
      <Stack spacing={0.5}>
        {items.map((item, i) => (
          <Stack key={i} direction="row" alignItems="flex-start" spacing={0.75}>
            <Iconify icon={icon} width={14} sx={{ color, mt: 0.5, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.7 }}>
              {toFaDigits(item)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
