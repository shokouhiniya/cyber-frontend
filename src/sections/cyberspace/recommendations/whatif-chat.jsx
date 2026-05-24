'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import axios from 'src/lib/axios';
import { useProfile, useScenarioStarters } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const RISK_COLORS = {
  low:      '#51CF66',
  medium:   '#FFA94D',
  high:     '#FF6B6B',
  critical: '#C92A2A',
};

export function WhatIfChat() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setIsTyping(true);

    try {
      const orgId = profile?.promticIdentifier?.external_id;
      const params = orgId ? `?org_id=${orgId}` : '';
      const res = await axios.post(`/api/ai-content/scenario${params}`, { scenario: msg });
      const data = res.data;

      if (data.error) {
        setMessages((prev) => [...prev, { role: 'ai', text: `خطا: ${data.error}`, analysis: null }]);
      } else {
        const a = data.analysis;
        setMessages((prev) => [...prev, {
          role: 'ai',
          text: a?.summary || 'تحلیل دریافت شد.',
          analysis: a ? {
            riskLevel: a.risk_label || a.risk_level,
            riskColor: RISK_COLORS[a.risk_level] || '#FFA94D',
            sentimentShift: a.sentiment_shift ?? 0,
            expectedMentions: a.expected_volume || 'متوسط',
            peakTime: a.peak_time || '۲-۴ ساعت',
            breakdown: a.breakdown || { positive: 33, neutral: 34, negative: 33 },
            keyRisks: a.key_risks || [],
            recommendations: a.recommendations || [],
            suggestedResponse: a.suggested_response || null,
          } : null,
        }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'ai',
        text: 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.',
        analysis: null,
      }]);
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

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      {/* Header */}
      <Box sx={{ p: 2.5, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha('#845EF7', 0.08)} 100%)` }}>
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
      <Box ref={scrollRef} sx={{ height: 420, overflowY: 'auto', p: 2, bgcolor: alpha(theme.palette.grey[500], isDark ? 0.04 : 0.02) }}>
        {messages.length === 0 && !isTyping && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Iconify icon="solar:chat-round-dots-bold-duotone" width={40} sx={{ color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
              یک سناریو فرضی مطرح کنید تا تأثیر آن را تحلیل کنم
            </Typography>
            <Stack spacing={0.75}>
              {starters.map((scenario) => (
                <Box
                  key={scenario}
                  onClick={() => handleSend(scenario)}
                  sx={{
                    p: 1.25, borderRadius: 1.5, cursor: 'pointer',
                    direction: 'rtl', textAlign: 'right',
                    bgcolor: alpha('#845EF7', 0.04),
                    border: `1px solid ${alpha('#845EF7', 0.12)}`,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: alpha('#845EF7', 0.08), borderColor: alpha('#845EF7', 0.24) },
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: 11, color: 'text.primary', direction: 'rtl', textAlign: 'right', display: 'block' }}>
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
                  <Box sx={{ maxWidth: '90%' }}>
                    <Box sx={{ p: 1.5, borderRadius: '12px 12px 12px 4px', bgcolor: alpha(theme.palette.grey[500], isDark ? 0.12 : 0.08) }}>
                      <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.7, color: 'text.primary' }}>{msg.text}</Typography>
                    </Box>

                    {msg.analysis && (
                      <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, bgcolor: alpha('#845EF7', 0.04), border: `1px solid ${alpha('#845EF7', 0.12)}` }}>
                        {/* Risk + metrics */}
                        <Stack direction="row" spacing={0.75} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                          <Chip label={`ریسک: ${msg.analysis.riskLevel}`} size="small"
                            sx={{ height: 22, fontSize: 9, fontWeight: 700, bgcolor: alpha(msg.analysis.riskColor, 0.12), color: msg.analysis.riskColor, border: `1px solid ${alpha(msg.analysis.riskColor, 0.24)}` }} />
                          <Chip label={`تغییر احساسات: ${msg.analysis.sentimentShift > 0 ? '+' : ''}${msg.analysis.sentimentShift}٪`} size="small"
                            sx={{ height: 22, fontSize: 9, fontWeight: 700, bgcolor: alpha(msg.analysis.sentimentShift >= 0 ? '#51CF66' : '#FF6B6B', 0.1), color: msg.analysis.sentimentShift >= 0 ? '#51CF66' : '#FF6B6B' }} />
                          <Chip label={`حجم: ${msg.analysis.expectedMentions}`} size="small"
                            sx={{ height: 22, fontSize: 9, fontWeight: 700, bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }} />
                        </Stack>

                        {/* Sentiment bar */}
                        <Stack direction="row" spacing={0.25} sx={{ mb: 0.5, borderRadius: 1, overflow: 'hidden' }}>
                          <Box sx={{ flex: msg.analysis.breakdown.positive, height: 6, bgcolor: '#51CF66' }} />
                          <Box sx={{ flex: msg.analysis.breakdown.neutral, height: 6, bgcolor: '#ADB5BD' }} />
                          <Box sx={{ flex: msg.analysis.breakdown.negative, height: 6, bgcolor: '#FF6B6B' }} />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.25 }}>
                          <Typography variant="caption" sx={{ fontSize: 8, color: '#51CF66', fontWeight: 700 }}>{msg.analysis.breakdown.positive}٪ مثبت</Typography>
                          <Typography variant="caption" sx={{ fontSize: 8, color: '#ADB5BD', fontWeight: 700 }}>{msg.analysis.breakdown.neutral}٪ خنثی</Typography>
                          <Typography variant="caption" sx={{ fontSize: 8, color: '#FF6B6B', fontWeight: 700 }}>{msg.analysis.breakdown.negative}٪ منفی</Typography>
                        </Stack>

                        {/* Peak time */}
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.25 }}>
                          <Iconify icon="solar:clock-circle-bold" width={12} sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>اوج واکنش: {msg.analysis.peakTime}</Typography>
                        </Stack>

                        {/* Key risks */}
                        {msg.analysis.keyRisks?.length > 0 && (
                          <Box sx={{ mb: 1.25 }}>
                            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700, display: 'block', mb: 0.5, color: '#FF6B6B' }}>ریسک‌های کلیدی:</Typography>
                            <Stack spacing={0.25}>
                              {msg.analysis.keyRisks.map((risk, ri) => (
                                <Stack key={ri} direction="row" alignItems="flex-start" spacing={0.5}>
                                  <Iconify icon="solar:danger-triangle-bold" width={11} sx={{ color: '#FF6B6B', mt: 0.2, flexShrink: 0 }} />
                                  <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.5 }}>{risk}</Typography>
                                </Stack>
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {/* Recommendations */}
                        {msg.analysis.recommendations?.length > 0 && (
                          <Box sx={{ mb: msg.analysis.suggestedResponse ? 1.25 : 0 }}>
                            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700, display: 'block', mb: 0.5 }}>توصیه‌ها:</Typography>
                            <Stack spacing={0.25}>
                              {msg.analysis.recommendations.map((rec, ri) => (
                                <Stack key={ri} direction="row" alignItems="flex-start" spacing={0.5}>
                                  <Iconify icon="solar:check-read-bold" width={11} sx={{ color: '#51CF66', mt: 0.2, flexShrink: 0 }} />
                                  <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.5 }}>{rec}</Typography>
                                </Stack>
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {/* Suggested response */}
                        {msg.analysis.suggestedResponse && (
                          <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha('#51CF66', 0.06), border: `1px solid ${alpha('#51CF66', 0.16)}` }}>
                            <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, color: '#51CF66', display: 'block', mb: 0.25 }}>پیشنهاد واکنش:</Typography>
                            <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.6 }}>{msg.analysis.suggestedResponse}</Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Stack>
              )}
            </Box>
          ))}

          {isTyping && (
            <Stack direction="row" justifyContent="flex-start" spacing={1}>
              <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: alpha('#845EF7', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Iconify icon="solar:cpu-bolt-bold" width={16} sx={{ color: '#845EF7' }} />
              </Box>
              <Box sx={{ p: 1.5, borderRadius: '12px 12px 12px 4px', bgcolor: alpha(theme.palette.grey[500], isDark ? 0.12 : 0.08) }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {[0, 1, 2].map((dot) => (
                    <Box key={dot} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#845EF7',
                      animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${dot * 0.2}s`,
                      '@keyframes pulse': { '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.8)' }, '40%': { opacity: 1, transform: 'scale(1)' } },
                    }} />
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            fullWidth multiline maxRows={3}
            placeholder="یک سناریو فرضی بنویسید..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined" size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2, fontSize: 13,
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
              bgcolor: input.trim() && !isTyping ? '#845EF7' : alpha(theme.palette.grey[500], 0.12),
              color: input.trim() && !isTyping ? '#fff' : 'text.disabled',
              '&:hover': { bgcolor: input.trim() && !isTyping ? alpha('#845EF7', 0.85) : undefined },
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
