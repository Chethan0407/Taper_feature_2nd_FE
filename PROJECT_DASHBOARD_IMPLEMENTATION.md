# Project Dashboard Implementation

## Overview
The Project Dashboard provides a comprehensive view of project status, including specifications, checklists, spec lints, and quality scores. It displays real-time data from multiple API endpoints and allows users to refresh the data.

## Frontend Implementation

### Location
- **File**: `src/views/ProjectDetailsPage.vue`
- **Route**: `/projects/:id`

### Key Features

#### 1. Authentication
- Uses JWT token from `useAuthStore`
- Automatically includes Authorization header in all API calls
- Handles authentication errors gracefully

#### 2. Dashboard Data Loading
- Fetches data from 4 API endpoints in parallel:
  - `GET /api/v1/projects/{project_id}/specs/with-status`
  - `GET /api/v1/projects/{project_id}/checklists/with-status`
  - `GET /api/v1/projects/{project_id}/spec-lints/with-status`
  - `GET /api/v1/projects/{project_id}/quality-score`

#### 3. UI Components

##### Loading State
- Shows spinner while fetching dashboard data
- Separate from project loading state

##### Error State
- Displays error message if API calls fail
- Provides retry button to reload data

##### Dashboard Sections
1. **Metric Summary Cards**
   - Total Specs count
   - Total Checklists count
   - Spec Lints count
   - Quality Score percentage

2. **Quality Score Breakdown**
   - Approval Rate
   - Completion Rate
   - Pass Rate

3. **Specifications with Status**
   - Lists all specs with their review status
   - Shows reviewer, timestamp, and comments
   - Color-coded status indicators

4. **Checklists with Status**
   - Lists all checklists with their review status
   - Shows reviewer, timestamp, and comments
   - Color-coded status indicators

5. **Spec Lints with Status**
   - Lists all spec lints with their status
   - Shows reviewer, timestamp, and comments
   - Color-coded status indicators

#### 4. Helper Functions
- `getStatusColor()`: Returns appropriate CSS class for status colors
- `formatDate()`: Formats timestamps for display
- `loadDashboardData()`: Fetches all dashboard data

#### 5. Refresh Functionality
- Manual refresh button in dashboard header
- Disabled during loading to prevent multiple requests
- Shows "Refreshing..." text during load

## API Endpoints

### 1. Specs with Status
```
GET /api/v1/projects/{project_id}/specs/with-status
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "string|number",
    "name": "string",
    "file_name": "string",
    "status": "string",
    "reviewer": "string",
    "timestamp": "string",
    "comments": "string"
  }
]
```

### 2. Checklists with Status
```
GET /api/v1/projects/{project_id}/checklists/with-status
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "string|number",
    "name": "string",
    "status": "string",
    "reviewer": "string",
    "timestamp": "string",
    "comments": "string"
  }
]
```

### 3. Spec Lints with Status
```
GET /api/v1/projects/{project_id}/spec-lints/with-status
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "string|number",
    "name": "string",
    "status": "string",
    "reviewer": "string",
    "timestamp": "string",
    "comments": "string"
  }
]
```

### 4. Quality Score
```
GET /api/v1/projects/{project_id}/quality-score
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "overall_score": "number",
  "approval_rate": "number",
  "completion_rate": "number",
  "pass_rate": "number"
}
```

## Error Handling

### Frontend Error Handling
- Network errors are caught and displayed to user
- Authentication errors redirect to login
- Individual API failures show specific error messages
- Retry functionality allows users to reload data

### Error States
1. **Network Error**: Shows error message with retry button
2. **Authentication Error**: Redirects to login page
3. **API Error**: Shows specific error message from backend
4. **Loading Error**: Shows loading spinner with error message

## Status Color Coding

The dashboard uses color-coded status indicators:

- **Green**: Approved, Passed, Completed
- **Yellow**: Pending, In Review, Review
- **Red**: Rejected, Failed, Error
- **Blue**: Draft, In Progress
- **Gray**: Unknown/Other statuses

## Usage Instructions

### For Users
1. Navigate to a project detail page (`/projects/{id}`)
2. Wait for dashboard data to load
3. View metrics and status information
4. Click "Refresh" button to reload latest data
5. Click on section headers to navigate to related pages

### For Developers
1. Ensure backend API endpoints are implemented
2. Verify JWT authentication is working
3. Test error scenarios (network, auth, API errors)
4. Check that all required fields are returned by APIs

## Technical Implementation

### TypeScript Interfaces
```typescript
interface DashboardItem {
  id: string | number
  name?: string
  file_name?: string
  status: string
  reviewer?: string
  timestamp?: string
  comments?: string
}

interface QualityScore {
  overall_score: number
  approval_rate: number
  completion_rate: number
  pass_rate: number
}
```

### Utility Functions
- `fetchProjectDashboard()`: Centralized API call function
- `authenticatedFetch()`: Handles authentication headers
- `getAuthHeaders()`: Creates authorization headers

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live updates
2. **Filtering**: Add filters for status, reviewer, date range
3. **Export**: Add export functionality for dashboard data
4. **Charts**: Add visual charts for quality metrics
5. **Notifications**: Add notifications for status changes 