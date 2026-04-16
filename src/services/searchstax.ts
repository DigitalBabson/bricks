import axios from 'axios'
import type { Brick, SearchstaxResponse } from '../types/index'

export interface SearchstaxParams {
  endpoint: string
  token: string
  keyword: string
  locationIds?: string[]
  pageSize: number
  offset: number
}

export interface SearchstaxResult {
  bricks: Brick[]
  numFound: number
}

function escapeSolrTerm(value: string): string {
  return value.replace(/([+\-!(){}[\]^"~*?:\\/]|&&|\|\|)/g, '\\$1')
}

function buildKeywordFilter(keyword: string): string {
  const normalized = keyword.trim().replace(/\s+/g, ' ').replace(/"/g, '')
  const escaped = escapeSolrTerm(normalized)
  return `tcngramm_X3b_en_description:"${escaped}"`
}

export async function searchBricks(params: SearchstaxParams): Promise<SearchstaxResult> {
  const { endpoint, token, keyword, locationIds, pageSize, offset } = params

  const url = new URL(endpoint)
  url.searchParams.set('q', '*:*')
  url.searchParams.append('fq', buildKeywordFilter(keyword))
  url.searchParams.set('rows', String(pageSize))
  url.searchParams.set('start', String(offset))
  url.searchParams.set('fl', 'ss_uuid,ss_zone_uuid,ss_file_img_uuid,tcngramm_X3b_en_description')
  url.searchParams.set('wt', 'json')

  if (locationIds && locationIds.length > 0) {
    const zoneFilter = locationIds.map(escapeSolrTerm).join(' OR ')
    url.searchParams.append('fq', `ss_zone_uuid:(${zoneFilter})`)
  }

  const response = await axios.get<SearchstaxResponse>(url.toString(), {
    headers: { Authorization: `Token ${token}` },
  })

  const data = response.data
  return {
    bricks: data.response.docs.map((doc) => ({
      id: doc.ss_uuid,
      inscription: doc['tcngramm_X3b_en_description'][0] ?? '',
      brickImage: doc.ss_file_img_uuid,
      brickParkLocation: doc.ss_zone_uuid,
    })),
    numFound: data.response.numFound,
  }
}
