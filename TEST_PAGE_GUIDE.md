# Test Page Guide

## Overview
The Test page allows you to test connections to the four configured data source APIs:
- Dataak (دیتاک)
- 8tag (هشتک)
- Datami (دیتامی)
- Mahta (مهتا)

## Accessing the Test Page
1. Navigate to the dashboard at http://localhost:3033/dashboard
2. Click on "تست API" (Test API) in the sidebar navigation
3. You'll see four cards, one for each data source

## Using the Test Page

### Input Fields
Each data source card has the following input fields:

1. **کلمه کلیدی (Keyword)**: Search keyword (e.g., سیاست، اقتصاد، ورزش)
2. **تاریخ شروع (Start Date)**: Start date for data collection
3. **تاریخ پایان (End Date)**: End date for data collection
4. **تعداد نتایج (Limit)**: Number of results to fetch

### Testing a Data Source
1. Fill in the desired parameters in the input fields
2. Click the "تست اتصال" (Test Connection) button
3. Wait for the response (the button will show "در حال تست..." while loading)
4. View the results:
   - **Success**: Green alert with success message and JSON response data
   - **Error**: Red alert with error message

### Response Display
The response data is displayed in a scrollable JSON viewer below the test button, showing:
- Status of the connection
- Parameters sent
- Data returned from the API
- Any error messages

## Current Implementation Status

⚠️ **Note**: The current implementation includes placeholder API integrations. The actual API calls need to be implemented based on each data source's API documentation.

### Next Steps for Full Implementation:
1. Obtain API documentation for each data source
2. Implement authentication mechanisms (login, tokens, etc.)
3. Implement actual data fetching endpoints
4. Add proper error handling for each API
5. Map the response data to the application's data model

## Backend Endpoints

The test functionality uses the following backend endpoint:
- `POST /api/data-sources/:id/test` - Test connection to a specific data source

## Files Modified/Created

### Frontend:
- `src/sections/cyberspace/view/test/test-view.jsx` - Main test page component
- `src/app/dashboard/test/page.jsx` - Next.js page route
- `src/routes/paths.js` - Added test path
- `src/layouts/nav-config-dashboard.jsx` - Added test navigation item
- `src/lib/axios.js` - Added test endpoint

### Backend:
- `src/modules/data-source/data-source.controller.ts` - Added test endpoint
- `src/modules/data-source/data-source.service.ts` - Added testConnection method
- `src/modules/data-source/data-source-api.service.ts` - API integration service
- `src/modules/data-source/data-source.module.ts` - Updated module imports

## Troubleshooting

### "Data source not found" error
- Ensure the data sources are seeded in the database
- Check that the backend server is running

### Connection timeout
- Verify the API endpoints are accessible
- Check network connectivity
- Review API credentials in the `.env` file

### No data returned
- Verify the input parameters match the API requirements
- Check the backend logs for detailed error messages
