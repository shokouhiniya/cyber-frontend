'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAuditLog, useAdminUsers, useAdminProfiles } from 'src/api/admin';

import { AdminPageHeader } from '../shared/page-header';

// ----------------------------------------------------------------------

export function AdminAuditLogView() {
  const [filters, setFilters] = useState({ limit: 50, offset: 0 });

  const { data: entries, isLoading } = useAuditLog(filters);
  const { data: profiles = [] } = useAdminProfiles();
  const { data: users = [] } = useAdminUsers();

  const profileById = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);
  const userById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);

  const rows = entries?.data ?? [];
  const total = entries?.pagination?.total ?? 0;
  const hasMore = entries?.pagination?.hasMore;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <AdminPageHeader
        title="ثبت رویدادهای مدیریتی"
        subtitle="هر تغییر در پنل ادمین اینجا با جزئیات ذخیره می‌شود (credential ها مخفی‌اند)."
      />

      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            label="عملیات"
            placeholder="profiles.post, users.patch..."
            size="small"
            value={filters.action || ''}
            onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value, offset: 0 }))}
          />
          <TextField
            label="از تاریخ"
            type="date"
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            value={filters.from || ''}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value, offset: 0 }))}
          />
          <TextField
            label="تا تاریخ"
            type="date"
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            value={filters.to || ''}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value, offset: 0 }))}
          />
          <Button onClick={() => setFilters({ limit: 50, offset: 0 })}>پاک کردن</Button>
        </Stack>
      </Card>

      {isLoading ? (
        <Card sx={{ p: 3 }}>در حال بارگذاری...</Card>
      ) : rows.length === 0 ? (
        <Card sx={{ p: 3 }}>رویدادی یافت نشد.</Card>
      ) : (
        <Stack spacing={1}>
          {rows.map((row) => (
            <Card key={row.id} sx={{ p: 2 }}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Chip
                  label={row.action}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontFamily: 'monospace', flexShrink: 0 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {new Date(row.createdAt).toLocaleString('fa-IR')}
                    {row.userId && userById[row.userId] && ` — ${userById[row.userId].name}`}
                    {row.profileId && profileById[row.profileId] && ` • پروفایل: ${profileById[row.profileId].name}`}
                  </Typography>
                  {row.entityType && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <strong>{row.entityType}</strong>
                      {row.entityId && <> → {row.entityId}</>}
                    </Typography>
                  )}
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      p: 1,
                      bgcolor: (t) => t.palette.grey[100],
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: 11,
                      maxHeight: 200,
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {JSON.stringify(row.diff, null, 2)}
                  </Box>
                </Box>
              </Stack>
            </Card>
          ))}

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {rows.length} از {total}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                disabled={!filters.offset}
                onClick={() =>
                  setFilters((f) => ({ ...f, offset: Math.max(0, (f.offset || 0) - (f.limit || 50)) }))
                }
              >
                قبلی
              </Button>
              <Button
                size="small"
                disabled={!hasMore}
                onClick={() => setFilters((f) => ({ ...f, offset: (f.offset || 0) + (f.limit || 50) }))}
              >
                بعدی
              </Button>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Container>
  );
}
