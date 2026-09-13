/**
 * Data-driven domain visibility matrix.
 * Same domain / company_id users should see each other's created records.
 * Cross-domain users should not.
 */
export type DomainVisibilityRow = {
  id: string
  module: 'projects' | 'specs' | 'vendors' | 'companies' | 'checklists'
  path: string
  /** Text that creator left in the shared company dataset */
  createdLabel: string | RegExp
  /** Creator identity (for mock metadata) */
  createdBy: string
}

/** Records created by admin@tapeoutops — visible to peer@tapeoutops */
export const SAME_DOMAIN_SHARED: DomainVisibilityRow[] = [
  {
    id: 'DDT-SD-01',
    module: 'projects',
    path: '/projects',
    createdLabel: /Shared Domain Project/i,
    createdBy: 'e2e@tapeoutops.com',
  },
  {
    id: 'DDT-SD-02',
    module: 'specs',
    path: '/specs',
    createdLabel: /Shared Spec/i,
    createdBy: 'e2e@tapeoutops.com',
  },
  {
    id: 'DDT-SD-03',
    module: 'vendors',
    path: '/vendors',
    createdLabel: /Shared Domain Vendor/i,
    createdBy: 'e2e@tapeoutops.com',
  },
  {
    id: 'DDT-SD-04',
    module: 'companies',
    path: '/companies',
    createdLabel: /E2E Tapeout Corp/i,
    createdBy: 'e2e@tapeoutops.com',
  },
  {
    id: 'DDT-SD-05',
    module: 'checklists',
    path: '/checklists',
    createdLabel: /Shared Domain Template/i,
    createdBy: 'e2e@tapeoutops.com',
  },
]

/** Same modules — outsider must not see shared labels */
export const CROSS_DOMAIN_HIDDEN = SAME_DOMAIN_SHARED.map((row) => ({
  ...row,
  id: row.id.replace('SD', 'XD'),
}))
