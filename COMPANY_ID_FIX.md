# Company ID Fix for Project Creation

## Problem
The backend was expecting a `company_id` field in the request body when creating a project, but the frontend was not sending it. This caused a validation error.

## Solution
Added a company selection field to the project creation form and included the `company_id` in the request payload.

## Changes Made

### 1. Updated Project Interface (`src/stores/projects.ts`)
- Added `company_id: number` field to the `Project` interface
- Updated the `createProject` function parameter type to include `company_id`

### 2. Enhanced Project Creation Form (`src/components/Projects/CreateProjectInline.vue`)
- Added a company selection dropdown to the form
- Added `companyId` field to the form reactive object
- Added validation to ensure a company is selected before submission
- Updated the project data to include `company_id: parseInt(form.companyId)`

### 3. Created Companies Store (`src/stores/companies.ts`)
- Created a new store to manage company data
- Added `Company` interface with id, name, description, status, and timestamps
- Added functions to load companies and get individual company data
- This provides a scalable foundation for company management

### 4. Dynamic Company Loading
- The form now loads companies dynamically from the backend
- Added loading state for the company dropdown
- Companies are loaded when the component mounts

## Usage
1. When creating a new project, users must now select a company from the dropdown
2. The selected company ID is sent to the backend as `company_id`
3. If no company is selected, the form shows a validation error

## Backend Requirements
The backend should have:
- A `/api/v1/companies` endpoint that returns a list of companies
- Each company should have: `id`, `name`, `description`, `status`, `createdAt`, `updatedAt`
- The project creation endpoint should accept `company_id` as a required field

## Future Enhancements
- Add company creation/management functionality
- Add company-specific settings and branding
- Implement company-based access control
- Add company selection to other entities (specs, vendors, etc.) 