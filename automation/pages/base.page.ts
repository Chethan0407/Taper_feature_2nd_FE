/**
 * Compatibility shim — Page Objects should prefer `import { BasePage } from '../core'`.
 * Existing pages import from `./base.page`; keep that path working.
 */
export { BasePage, BaseComponent } from '../core/base.page'
