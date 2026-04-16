import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import { searchBricks } from '../searchstax'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

const baseParams = {
  endpoint: 'https://search.example.com/emselect',
  token: 'test-token-123',
  keyword: 'bruce',
  pageSize: 20,
  offset: 0,
}

function mockSearchstaxResponse(docs: object[], numFound: number) {
  return {
    data: {
      response: {
        numFound,
        start: 0,
        docs,
      },
    },
  }
}

function makeDoc(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ss_uuid: 'brick-uuid-1',
    ss_zone_uuid: 'zone-uuid-1',
    ss_file_img_uuid: 'img-uuid-1',
    ss_body: 'Zone A',
    'tcngramm_X3b_en_description': ['BRUCE SMITH'],
    'tm_X3b_en_title': ['BRUCE SMITH'],
    its_fid: 100,
    its_id: 200,
    ...overrides,
  }
}

describe('searchBricks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds the correct URL for keyword-only search', async () => {
    mockedAxios.get.mockResolvedValue(mockSearchstaxResponse([], 0))

    await searchBricks(baseParams)

    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('q=*%3A*')
    expect(url).toContain('fq=tcngramm_X3b_en_description%3A%22bruce%22')
    expect(url).toContain('rows=20')
    expect(url).toContain('start=0')
    expect(url).toContain('fl=ss_uuid%2Css_zone_uuid%2Css_file_img_uuid%2Ctcngramm_X3b_en_description')
    expect(url).toContain('wt=json')
  })

  it('wraps multi-word keywords in a quoted phrase filter', async () => {
    mockedAxios.get.mockResolvedValue(mockSearchstaxResponse([], 0))

    await searchBricks({ ...baseParams, keyword: 'Michael James Pace' })

    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('fq=tcngramm_X3b_en_description%3A%22Michael+James+Pace%22')
  })

  it('sends the Authorization header with Token prefix', async () => {
    mockedAxios.get.mockResolvedValue(mockSearchstaxResponse([], 0))

    await searchBricks(baseParams)

    const config = mockedAxios.get.mock.calls[0][1] as { headers: Record<string, string> }
    expect(config.headers.Authorization).toBe('Token test-token-123')
  })

  it('adds zone UUID filter for single location', async () => {
    mockedAxios.get.mockResolvedValue(mockSearchstaxResponse([], 0))

    await searchBricks({ ...baseParams, locationIds: ['zone-1'] })

    const url = decodeURIComponent(mockedAxios.get.mock.calls[0][0] as string)
    // escapeSolrTerm escapes hyphens: zone-1 → zone\-1
    expect(url).toContain('ss_zone_uuid')
    expect(url).toContain('zone\\-1')
  })

  it('adds OR-joined zone UUID filter for multiple locations', async () => {
    mockedAxios.get.mockResolvedValue(mockSearchstaxResponse([], 0))

    await searchBricks({ ...baseParams, locationIds: ['zone-1', 'zone-2'] })

    const url = decodeURIComponent(mockedAxios.get.mock.calls[0][0] as string)
    expect(url).toContain('ss_zone_uuid')
    expect(url).toContain('zone\\-1')
    expect(url).toContain('zone\\-2')
  })

  it('maps SearchStax fields to Brick objects correctly', async () => {
    const doc = makeDoc({
      ss_uuid: 'my-brick-id',
      ss_zone_uuid: 'my-zone',
      ss_file_img_uuid: 'my-image',
      'tcngramm_X3b_en_description': ['JOHN DOE MEMORIAL'],
    })
    mockedAxios.get.mockResolvedValue(mockSearchstaxResponse([doc], 1))

    const result = await searchBricks(baseParams)

    expect(result.bricks).toHaveLength(1)
    expect(result.bricks[0]).toEqual({
      id: 'my-brick-id',
      inscription: 'JOHN DOE MEMORIAL',
      brickImage: 'my-image',
      brickParkLocation: 'my-zone',
    })
    expect(result.numFound).toBe(1)
  })

  it('returns empty results for zero matches', async () => {
    mockedAxios.get.mockResolvedValue(mockSearchstaxResponse([], 0))

    const result = await searchBricks(baseParams)

    expect(result.bricks).toEqual([])
    expect(result.numFound).toBe(0)
  })

  it('throws on network error (does not catch)', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'))

    await expect(searchBricks(baseParams)).rejects.toThrow('Network Error')
  })

  it('applies correct offset for pagination', async () => {
    mockedAxios.get.mockResolvedValue(mockSearchstaxResponse([], 0))

    await searchBricks({ ...baseParams, offset: 40, pageSize: 20 })

    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toContain('start=40')
    expect(url).toContain('rows=20')
  })
})
