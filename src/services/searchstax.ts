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

/**
 * Checks if a keyword search will return no results due to single-letter words
 * being filtered out by the SearchStax field's LengthFilterFactory (min: 2).
 * Returns true if all words in the keyword are single letters.
 */
export function isAllSingleLetters(keyword: string): boolean {
  const words = keyword.trim().split(/\s+/)
  // Empty or whitespace-only string
  if (words.length === 0 || (words.length === 1 && words[0].length === 0)) {
    return false
  }
  // Check if ALL words are single letters (ignoring punctuation)
  // Use Unicode-aware pattern: \p{L} matches any Unicode letter
  return words.every((word) => word.replace(/\p{P}/gu, '').length <= 1)
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
  url.searchParams.set('fl', 'ss_uuid,ss_zone_uuid,ss_file_img_uuid,tcngramm_X3b_en_description,s_tcngramm_X3b_en_description')
  url.searchParams.set('wt', 'json')

  if (locationIds && locationIds.length > 0) {
    const zoneFilter = locationIds.map(escapeSolrTerm).join(' OR ')
    url.searchParams.append('fq', `ss_zone_uuid:(${zoneFilter})`)
  }

  // Sort by non-tokenized field if available, otherwise fall back to ss_uuid for stable sorting
  // Note: tcngramm_ fields are tokenized and may not sort alphabetically correctly
  url.searchParams.set('sort', 's_tcngramm_X3b_en_description asc,ss_uuid asc')

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
