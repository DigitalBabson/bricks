import { Agent } from '@newrelic/browser-agent/loaders/agent'
import { Ajax } from '@newrelic/browser-agent/features/ajax'
import { GenericEvents } from '@newrelic/browser-agent/features/generic_events'
import { JSErrors } from '@newrelic/browser-agent/features/jserrors'
import { Metrics } from '@newrelic/browser-agent/features/metrics'
import { PageViewEvent } from '@newrelic/browser-agent/features/page_view_event'
import { PageViewTiming } from '@newrelic/browser-agent/features/page_view_timing'
import { SoftNav } from '@newrelic/browser-agent/features/soft_navigations'

// Babson's New Relic account. Each environment has its own Browser app
// (bricks-prod, bricks-test); its ID comes from the .env file.
const ACCOUNT_ID = '1659938'
const TRUST_KEY = '26315'

export interface NewRelicEnv {
  DEV_NEWRELIC_APP_ID?: string
  DEV_NEWRELIC_LICENSE_KEY?: string
}

/**
 * Starts the New Relic Browser agent (Pro + SPA) when the build's env file
 * names a Browser app. Builds without one (dev, stage2, GitHub Pages) skip it.
 *
 * Uses the composable loader without session replay and session trace, which
 * would add ~200 kB to the single bundle uploaded to T4.
 */
export function startNewRelic(env: NewRelicEnv): Agent | undefined {
  const applicationID = (env.DEV_NEWRELIC_APP_ID ?? '').trim()
  const licenseKey = (env.DEV_NEWRELIC_LICENSE_KEY ?? '').trim()
  if (!applicationID || !licenseKey) return undefined

  return new Agent({
    features: [Ajax, GenericEvents, JSErrors, Metrics, PageViewEvent, PageViewTiming, SoftNav],
    info: {
      applicationID,
      licenseKey,
      beacon: 'bam.nr-data.net',
      errorBeacon: 'bam.nr-data.net',
      sa: 1,
    },
    init: {
      ajax: { deny_list: ['bam.nr-data.net'] },
      // Drupal and SearchStax are cross-origin and Acquia doesn't support
      // distributed tracing, so trace headers would only trip CORS.
      distributed_tracing: { enabled: false },
      privacy: { cookies_enabled: true },
    },
    loader_config: {
      accountID: ACCOUNT_ID,
      trustKey: TRUST_KEY,
      agentID: applicationID,
      applicationID,
      licenseKey,
    },
  })
}
