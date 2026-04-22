'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';
import axiosInstance, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export function TestView() {
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState({});
  const [testLoading, setTestLoading] = useState({});
  const [testInputs, setTestInputs] = useState({});

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      const response = await axiosInstance.get(endpoints.dataSources);
      setDataSources(response.data);
    } catch (error) {
      console.error('Error fetching data sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (sourceId, field, value) => {
    setTestInputs((prev) => ({
      ...prev,
      [sourceId]: {
        ...prev[sourceId],
        [field]: value,
      },
    }));
  };

  const handleTest = async (source) => {
    setTestLoading((prev) => ({ ...prev, [source.id]: true }));
    setTestResults((prev) => ({ ...prev, [source.id]: null }));

    try {
      const params = testInputs[source.id] || {};
      
      // Validate date range
      if (params.startDate && params.endDate) {
        const start = new Date(params.startDate);
        const end = new Date(params.endDate);
        if (start > end) {
          setTestResults((prev) => ({
            ...prev,
            [source.id]: {
              success: false,
              error: 'تاریخ شروع باید قبل از تاریخ پایان باشد',
            },
          }));
          setTestLoading((prev) => ({ ...prev, [source.id]: false }));
          return;
        }
      }

      // Trim pageId if present
      if (params.pageId) {
        params.pageId = params.pageId.trim();
      }
      
      const response = await axiosInstance.post(`/api/data-sources/${source.id}/test`, params);
      
      setTestResults((prev) => ({
        ...prev,
        [source.id]: {
          success: true,
          data: response.data,
        },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [source.id]: {
          success: false,
          error: error.message || 'خطا در اتصال به API',
        },
      }));
    } finally {
      setTestLoading((prev) => ({ ...prev, [source.id]: false }));
    }
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 3 }}>
        تست منابع داده
      </Typography>

      <Stack spacing={3}>
        {dataSources.map((source) => (
          <Card key={source.id}>
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {source.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {source.apiEndpoint}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    نوع: {source.type} | وضعیت: {source.isActive ? 'فعال' : 'غیرفعال'}
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="شناسه صفحه (Page ID)"
                    placeholder="مثال: 231521"
                    value={testInputs[source.id]?.pageId || ''}
                    onChange={(e) => handleInputChange(source.id, 'pageId', e.target.value)}
                    helperText="برای دریافت داده‌های یک صفحه خاص، شناسه آن را وارد کنید"
                  />

                  <TextField
                    fullWidth
                    label="نام صفحه (Page Name)"
                    placeholder="مثال: دکتر آقامیری"
                    value={testInputs[source.id]?.pageName || ''}
                    onChange={(e) => handleInputChange(source.id, 'pageName', e.target.value)}
                    helperText="یا نام صفحه را برای جستجو وارد کنید"
                  />

                  <TextField
                    fullWidth
                    label="کلمه کلیدی"
                    placeholder="مثال: سیاست، اقتصاد، ورزش"
                    value={testInputs[source.id]?.keyword || ''}
                    onChange={(e) => handleInputChange(source.id, 'keyword', e.target.value)}
                  />
                  
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      label="تاریخ شروع"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={testInputs[source.id]?.startDate || ''}
                      onChange={(e) => handleInputChange(source.id, 'startDate', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="تاریخ پایان"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={testInputs[source.id]?.endDate || ''}
                      onChange={(e) => handleInputChange(source.id, 'endDate', e.target.value)}
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    label="تعداد نتایج"
                    type="number"
                    placeholder="50"
                    value={testInputs[source.id]?.limit || ''}
                    onChange={(e) => handleInputChange(source.id, 'limit', e.target.value)}
                  />

                  <TextField
                    fullWidth
                    select
                    label="مرتب‌سازی"
                    value={testInputs[source.id]?.sort || 'recent'}
                    onChange={(e) => handleInputChange(source.id, 'sort', e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="recent">جدیدترین</option>
                    <option value="popular">محبوب‌ترین</option>
                  </TextField>
                </Stack>

                {testResults[source.id] && (
                  <Box>
                    {testResults[source.id].success ? (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        اتصال موفق! داده‌ها دریافت شد.
                      </Alert>
                    ) : (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {testResults[source.id].error}
                      </Alert>
                    )}

                    {testResults[source.id].data && (
                      <Stack spacing={2}>
                        {/* Summary Statistics */}
                        {testResults[source.id].data.data?.selectedPage && (
                          <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              صفحه انتخاب شده:
                            </Typography>
                            <Typography variant="body2">
                              نام: {testResults[source.id].data.data.selectedPage.name}
                            </Typography>
                            <Typography variant="body2">
                              شناسه: {testResults[source.id].data.data.selectedPage.id}
                            </Typography>
                            <Typography variant="body2">
                              منبع: {testResults[source.id].data.data.selectedPage.source}
                            </Typography>
                          </Box>
                        )}

                        {testResults[source.id].data.data?.posts && (
                          <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              خلاصه آمار:
                            </Typography>
                            <Typography variant="body2">
                              تعداد پست‌ها: {testResults[source.id].data.data.posts.count}
                            </Typography>
                            
                            {/* Statistics Breakdown */}
                            {testResults[source.id].data.data.statistics && 
                             testResults[source.id].data.data.statistics.count && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="error.main">
                                  منفی: {testResults[source.id].data.data.statistics.count[0] || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  خنثی: {testResults[source.id].data.data.statistics.count[1] || 0}
                                </Typography>
                                <Typography variant="body2" color="success.main">
                                  مثبت: {testResults[source.id].data.data.statistics.count[2] || 0}
                                </Typography>
                                {testResults[source.id].data.data.statistics.impression && (
                                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    بازدید کل: {
                                      (testResults[source.id].data.data.statistics.impression[0] || 0) +
                                      (testResults[source.id].data.data.statistics.impression[1] || 0) +
                                      (testResults[source.id].data.data.statistics.impression[2] || 0)
                                    }
                                  </Typography>
                                )}
                              </Box>
                            )}
                            
                            {testResults[source.id].data.data.posts.filters && (
                              <>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  فیلتر احساسات: 
                                  {testResults[source.id].data.data.posts.filters.sentiments.positive && ' مثبت'}
                                  {testResults[source.id].data.data.posts.filters.sentiments.neutral && ' خنثی'}
                                  {testResults[source.id].data.data.posts.filters.sentiments.negative && ' منفی'}
                                </Typography>
                                <Typography variant="body2">
                                  مرتب‌سازی: {testResults[source.id].data.data.posts.filters.sort}
                                </Typography>
                              </>
                            )}
                            {testResults[source.id].data.data.availablePages && (
                              <Typography variant="body2">
                                صفحات در دسترس: {testResults[source.id].data.data.availablePages.count}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* Full JSON Response */}
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: 'background.neutral',
                            borderRadius: 1,
                            maxHeight: 400,
                            overflow: 'auto',
                          }}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            پاسخ کامل API:
                          </Typography>
                          <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(testResults[source.id].data, null, 2)}
                          </pre>
                        </Box>
                      </Stack>
                    )}
                  </Box>
                )}
              </Stack>
            </CardContent>

            <CardActions>
              <Button
                variant="contained"
                onClick={() => handleTest(source)}
                disabled={testLoading[source.id] || !source.isActive}
                startIcon={testLoading[source.id] && <CircularProgress size={20} />}
              >
                {testLoading[source.id] ? 'در حال تست...' : 'تست اتصال'}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>
    </DashboardContent>
  );
}
