import { describe, it, expect, vi, beforeEach } from 'vitest'

const Agent = vi.fn()
vi.mock('@newrelic/browser-agent/loaders/agent', () => ({ Agent }))

const { startNewRelic } = await import('../newRelic')
const { SoftNav } = await import('@newrelic/browser-agent/features/soft_navigations')
const { SessionReplay } = await import('@newrelic/browser-agent/features/session_replay')

describe('startNewRelic', () => {
  beforeEach(() => Agent.mockClear())

  it('starts the agent for the configured Browser app', () => {
    startNewRelic({ DEV_NEWRELIC_APP_ID: '1120575188', DEV_NEWRELIC_LICENSE_KEY: 'abc123' })

    expect(Agent).toHaveBeenCalledTimes(1)
    const options = Agent.mock.calls[0][0]
    expect(options.info.applicationID).toBe('1120575188')
    expect(options.loader_config).toMatchObject({ accountID: '1659938', agentID: '1120575188', licenseKey: 'abc123' })
    expect(options.init.distributed_tracing.enabled).toBe(false)
    expect(options.features).toContain(SoftNav)
    expect(options.features).not.toContain(SessionReplay)
  })

  it.each([
    {},
    { DEV_NEWRELIC_APP_ID: '1120575188' },
    { DEV_NEWRELIC_LICENSE_KEY: 'abc123' },
    { DEV_NEWRELIC_APP_ID: ' ', DEV_NEWRELIC_LICENSE_KEY: 'abc123' },
  ])('skips the agent when the env is incomplete: %j', (env) => {
    expect(startNewRelic(env)).toBeUndefined()
    expect(Agent).not.toHaveBeenCalled()
  })
})
