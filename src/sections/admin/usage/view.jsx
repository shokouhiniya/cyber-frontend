'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';

import {
  useUsageDaily,
  useUsageSummary,
  useAdminProfiles,
  useUsageFeaturesRanking,
  useUsageProfilesRanking,
} from 'src/api/admin';

import { AdminPageHeader } from '../shared/page-header';

// ----------------------------------------------------------------------

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function AdminUsageView() {
  const [filters, setFilters] = useState(() => ({ ...defaultRange(), profileId: '' }));

  const { data: profiles = [] } = useAdminProfiles();
  const { data: summary } = useUsageSummary(filters);
  const { data: profilesRanking = [] } = useUsageProfilesRanking(filters);
  const { data: featuresRanking = [] } = useUsageFeaturesRanking(filters);
  const { data: daily = [] } = useUsageDaily(filters);

  const profileById = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);
  const maxDaily = Math.max(1, ...daily.map((d) => d.count));
  const maxFeature = Math.max(1, ...featuresRanking.map((f) => f.count));
  const maxProfile = Math.max(1, ...profilesRanking.map((p) => p.count));

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <AdminPageHeader
        title="تحلیل مصرف"
        subtitle="از رویدادهای فرانت (page_view, feature_use) جمع‌آوری شده تا ببینیم کدام کلاینت‌ها و قابلیت‌ها بیشترین استفاده را دارند."
      />

      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            label="از"
            type="date"
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          />
          <TextField
            label="تا"
            type="date"
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>پروفایل</InputLabel>
            <Select
              label="پروفایل"
              value={filters.profileId}
              onChange={(e) => setFilters((f) => ({ ...f, profileId: e.target.value }))}
            >
              <MenuItem value="">همه</MenuItem>
              {profiles.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              مجموع رویدادها در بازه
            </Typography>
            <Typography variant="h3" fontWeight={800}>
              {summary?.total?.toLocaleString('fa-IR') ?? '—'}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              روند روزانه
            </Typography>
            <Stack direction="row" alignItems="flex-end" spacing={0.5} sx={{ height: 140 }}>
              {daily.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  داده‌ای برای نمایش نیست.
                </Typography>
              ) : (
                daily.map((d) => (
                  <Box
                    key={d.day}
                    title={`${new Date(d.day).toLocaleDateString('fa-IR')} — ${d.count}`}
                    sx={{
                      flex: 1,
                      height: `${(d.count / maxDaily) * 100}%`,
                      minHeight: 4,
                      bgcolor: 'primary.main',
                      borderRadius: 0.5,
                      opacity: 0.7,
                      '&:hover': { opacity: 1 },
                    }}
                  />
                ))
              )}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              فعال‌ترین کلاینت‌ها
            </Typography>
            {profilesRanking.length === 0 ? (
              <Typography variant="body2" color="text.secondary">—</Typography>
            ) : (
              <Stack spacing={1.5}>
                {profilesRanking.map((p) => {
                  const prof = profileById[p.profileId];
                  return (
                    <Box key={p.profileId}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {prof?.name || p.profileId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.count.toLocaleString('fa-IR')} رویداد • {p.uniqueUsers} کاربر
                        </Typography>
                      </Stack>
                      <Box sx={{ height: 6, bgcolor: 'grey.200', borderRadius: 3 }}>
                        <Box
                          sx={{
                            width: `${(p.count / maxProfile) * 100}%`,
                            height: '100%',
                            bgcolor: 'primary.main',
                            borderRadius: 3,
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              پربازدیدترین قابلیت‌ها
            </Typography>
            {featuresRanking.length === 0 ? (
              <Typography variant="body2" color="text.secondary">—</Typography>
            ) : (
              <Stack spacing={1.5}>
                {featuresRanking.map((f) => (
                  <Box key={f.eventName}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {f.eventName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {f.count.toLocaleString('fa-IR')} • {f.uniqueUsers} کاربر
                      </Typography>
                    </Stack>
                    <Box sx={{ height: 6, bgcolor: 'grey.200', borderRadius: 3 }}>
                      <Box
                        sx={{
                          width: `${(f.count / maxFeature) * 100}%`,
                          height: '100%',
                          bgcolor: 'success.main',
                          borderRadius: 3,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
