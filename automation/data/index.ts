/**
 * Framework data layer — users, BVA/ECP datasets, route matrices.
 * Specs import from `../data` or keep using fixtures re-exports.
 */
export { Users, type FrameworkUser } from '../config'
export {
  EMAIL_ECP,
  PASSWORD_BVA,
  COMPANY_NAME_BVA,
  COMPANY_DESC_BVA,
  NAME_ECP,
  LOGIN_ECP,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  SIDEBAR_FEATURES,
} from '../fixtures/test-data'

export { MOCK, seedFeatureData } from '../fixtures/seed'
