# Backend Email Requirement for Checklist Status

## Issue
On hard refresh, the approver/rejecter email is disappearing from the UI. The frontend is trying to fetch emails from multiple sources, but they're not being returned by the backend APIs.

## Current Frontend Implementation

The frontend checks for emails in this priority order:

1. **`/api/v1/projects/{project_id}/checklists/with-status`** - This is the PRIMARY source on hard refresh
2. **`/api/v1/checklists/active/{checklist_id}`** - Fallback if email not found in with-status

## Required Backend Changes

### 1. `/api/v1/projects/{project_id}/checklists/with-status` Endpoint

**Current Issue**: This endpoint might not be returning `approved_by_email` or `rejected_by_email` fields.

**Required Response Format**:
```json
[
  {
    "id": 15,
    "template_id": 5,
    "name": "Checklist Name",
    "status": "approved",  // or "rejected" or "declined" or "pending"
    "active_checklist_id": 15,
    "approved_by_email": "user@example.com",  // ← REQUIRED if status is "approved"
    "approved_by": "user@example.com",        // ← Also include this for compatibility
    "rejected_by_email": null,                // ← REQUIRED if status is "rejected"
    "rejected_by": null,                      // ← Also include this for compatibility
    "created_at": "2026-01-24T10:00:00Z",
    "updated_at": "2026-01-24T10:05:00Z"
  }
]
```

**Fields to Include**:
- `approved_by_email` (string | null) - Email of the user who approved the checklist
- `approved_by` (string | null) - Same as approved_by_email (for compatibility)
- `rejected_by_email` (string | null) - Email of the user who rejected the checklist
- `rejected_by` (string | null) - Same as rejected_by_email (for compatibility)

### 2. `/api/v1/checklists/active/{checklist_id}` Endpoint

**Current Issue**: This endpoint might not be returning `approved_by_email` or `rejected_by_email` fields.

**Required Response Format**:
```json
{
  "id": 15,
  "template_id": 5,
  "linked_spec_id": "abc-123",
  "created_by": "user@example.com",
  "status": "approved",  // or "rejected" or "pending"
  "approved_by_email": "approver@example.com",  // ← REQUIRED if status is "approved"
  "approved_by": "approver@example.com",        // ← Also include this for compatibility
  "rejected_by_email": null,                    // ← REQUIRED if status is "rejected"
  "rejected_by": null,                          // ← Also include this for compatibility
  "created_at": "2026-01-24T10:00:00Z",
  "updated_at": "2026-01-24T10:05:00Z",
  "items": [...]
}
```

**Fields to Include**:
- `approved_by_email` (string | null) - Email of the user who approved the checklist
- `approved_by` (string | null) - Same as approved_by_email (for compatibility)
- `rejected_by_email` (string | null) - Email of the user who rejected the checklist
- `rejected_by` (string | null) - Same as rejected_by_email (for compatibility)

## Frontend Email Extraction Logic

The frontend checks for emails in this order (for each endpoint):

1. `approved_by_email`
2. `approved_by`
3. `approver_email`
4. `approver.email`
5. `approved_by_user.email`
6. `approver_user.email`
7. `user.email`
8. `created_by` (fallback)

For rejected checklists:
1. `rejected_by_email`
2. `rejected_by`
3. `rejecter_email`
4. `rejecter.email`
5. `rejected_by_user.email`
6. `rejecter_user.email`
7. `user.email`
8. `created_by` (fallback)

## Testing Checklist

- [ ] Approve a checklist → Check that `/api/v1/projects/{id}/checklists/with-status` returns `approved_by_email`
- [ ] Hard refresh → Check that `approved_by_email` is still in the response
- [ ] Reject a checklist → Check that `/api/v1/projects/{id}/checklists/with-status` returns `rejected_by_email`
- [ ] Hard refresh → Check that `rejected_by_email` is still in the response
- [ ] Check `/api/v1/checklists/active/{id}` returns `approved_by_email` for approved checklists
- [ ] Check `/api/v1/checklists/active/{id}` returns `rejected_by_email` for rejected checklists

## Priority

**HIGH** - This is blocking the user experience. Emails should persist after hard refresh.

