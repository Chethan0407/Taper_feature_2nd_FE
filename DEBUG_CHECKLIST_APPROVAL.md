# Checklist Approval Debugging Guide

## Endpoints Called by Frontend

### 1. **Approve Endpoint** (POST)
**URL:** `POST /api/v1/checklists/active/{active_checklist_id}/approve`

**When:** When user clicks "Approve" button

**What to check in Network tab:**
- **Request URL:** Should be `/api/v1/checklists/active/{id}/approve` (not `/null/approve`)
- **Request Method:** `POST`
- **Status Code:** Should be `200 OK` (not 400 or 500)
- **Response Body:** Should contain:
  ```json
  {
    "id": 123,
    "status": "approved",  // ← CRITICAL: Should be "approved" (lowercase)
    "approved_by_email": "user@example.com",  // ← Should be present
    "approved_by": "user@example.com",
    "template_id": 5,
    "active_checklist_id": 123,
    ...
  }
  ```

**If response shows:**
- `status: "pending"` → Backend not updating status correctly
- `status: null` or missing → Backend not returning status
- `approved_by_email: null` → Backend not returning email

---

### 2. **GET Linked Content** (GET - After Approval)
**URL:** `GET /api/v1/projects/{project_id}/linked-content?t={timestamp}`

**When:** 
- Immediately after page load
- 2 seconds after approval (delayed refresh)
- When user clicks refresh

**What to check in Network tab:**
- **Request URL:** Should be `/api/v1/projects/{project_id}/linked-content?t=...`
- **Request Method:** `GET`
- **Status Code:** Should be `200 OK`
- **Response Body:** Should be an array with checklist objects:
  ```json
  [
    {
      "id": 5,
      "type": "checklist",
      "name": "test",
      "status": "approved",  // ← CRITICAL: Should be "approved" after approval
      "approved_by_email": "user@example.com",  // ← Should be present
      "approved_by": "user@example.com",
      "rejected_by": null,
      "rejected_by_email": null,
      ...
    }
  ]
  ```

**If response shows:**
- `status: "pending"` → Backend not persisting status correctly
- `status: null` or missing → Backend not returning status in linked-content
- `approved_by_email: null` → Backend not returning email in linked-content

---

## Debugging Steps

1. **Open Chrome DevTools** (F12)
2. **Go to Network tab**
3. **Filter by "Fetch/XHR"**
4. **Approve a checklist**
5. **Check these requests in order:**

### Request 1: POST approve
- Look for: `checklists/active/{id}/approve`
- Check Response tab:
  - Does it have `"status": "approved"`?
  - Does it have `"approved_by_email"`?
  - Copy the full response JSON

### Request 2: GET linked-content (after 2 seconds)
- Look for: `projects/{id}/linked-content`
- Check Response tab:
  - Find the checklist you just approved
  - Does it have `"status": "approved"`?
  - Does it have `"approved_by_email"`?
  - Copy the full response JSON

---

## Expected Flow

1. User clicks "Approve"
2. Frontend calls: `POST /api/v1/checklists/active/{id}/approve`
3. Backend responds with: `{ status: "approved", approved_by_email: "..." }`
4. Frontend immediately updates UI (status → "approved", buttons hide)
5. After 2 seconds, frontend calls: `GET /api/v1/projects/{id}/linked-content`
6. Backend responds with checklist having: `status: "approved"`
7. Frontend updates UI with persisted status

---

## Common Issues

### Issue 1: Status still "pending" after approval
**Check:** POST approve response
- If response has `status: "pending"` → Backend issue
- If response has `status: "approved"` but UI shows pending → Frontend reactivity issue

### Issue 2: Buttons not hiding
**Check:** 
- Is `checklist.status === 'approved'` in the GET response?
- Are buttons using `v-if="status === 'pending'"`? (They should)

### Issue 3: Status reverts after refresh
**Check:** GET linked-content response
- If response has `status: "pending"` → Backend not persisting
- If response has `status: "approved"` but UI shows pending → Frontend not reading correctly

---

## What to Share

If issue persists, share:
1. **POST approve response** (full JSON)
2. **GET linked-content response** (full JSON, find the approved checklist)
3. **Console logs** (look for "✅ Updated checklist status in UI")
4. **Screenshot** of Network tab showing both requests

