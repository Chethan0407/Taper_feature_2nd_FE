import os from 'node:os'
import { Framework, Env, Paths } from '../config'

/** Allure / reporter environment metadata for the framework. */
export function allureEnvironmentInfo() {
  return {
    framework: Framework.name,
    framework_version: Framework.version,
    app: Framework.app,
    layer: Framework.layer,
    base_url: Env.baseURL,
    os_platform: os.platform(),
    os_release: os.release(),
    node_version: process.version,
    ci: String(Env.isCi),
  }
}

export function allureReporterConfig(): [string, Record<string, unknown>] {
  return [
    'allure-playwright',
    {
      resultsDir: Paths.allureResults,
      detail: true,
      suiteTitle: true,
      environmentInfo: allureEnvironmentInfo(),
    },
  ]
}
