/**
 * Framework helpers — API mocking, network faults, auth seeding.
 * Implementation lives in fixtures/api for now; this is the public API.
 */
export {
  TEST_USER,
  ENGINEER_USER,
  mockApi,
  seedAuth,
  failApi,
  abortApi,
  type MockUser,
} from '../fixtures/api'

export { loginLive, type LiveSession } from './live-auth'
export { authForModule } from './module-auth'
