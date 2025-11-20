# SpecLint Page - API Calls Documentation

## When Clicking "SpecLint" in Sidebar:
**NO API CALL** - This is just navigation to `/speclint` route

## When SpecLint Page Loads (onMounted):
**TWO APIs are called automatically:**

1. **GET /api/v1/lint-results/speclint/rules?page=1&page_size=20**
   - Function: `fetchRules()`
   - Purpose: Load linting rules
   - Called in: `onMounted()` hook

2. **GET /api/v1/specifications/**
   - Function: `fetchAllSpecs()`
   - Purpose: Load available specs for dropdown
   - Called in: `onMounted()` hook

## When Clicking "Run Linter" Button:
**ONE API is called:**

3. **POST /api/v1/specs/{specId}/lint**
   - Function: `runLinter()`
   - Purpose: Run linter on selected spec
   - Body: None (empty)
   - Called when: User clicks "Run Linter" button

## Summary:
- **On page load**: 2 APIs called automatically
- **On "Run Linter" click**: 1 API called
- **Total**: 3 different API endpoints

## Current Issue:
The component is not loading, so NO APIs are being called.
The error: "Failed to fetch dynamically imported module" prevents the component from loading.

## Fix Applied:
✅ Removed invalid try-catch before imports
✅ Fixed TypeScript errors
✅ Component should now load

## Next Steps:
1. Restart Vite dev server
2. Hard refresh browser
3. Click SpecLint - should see APIs in Network tab
