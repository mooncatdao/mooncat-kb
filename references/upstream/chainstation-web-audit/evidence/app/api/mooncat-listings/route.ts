import { getCombinedListings } from 'lib/marketplaceUtils'
import { getQueryInt } from 'lib/util'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  console.debug(`[mooncat-listings route] Starting processing...`)

  const query = new URL(request.url).searchParams
  const limit = getQueryInt(query.get('limit'), -1)

  try {
    const listings = await getCombinedListings()
    return Response.json(limit > 0 ? listings.slice(0, limit) : listings)
  } catch (error) {
    console.error('[mooncat-listings route] Failed to fetch listing data', error)
    return Response.json(
      {
        ok: false,
        error: 'Failed to retrieve listing data',
      },
      { status: 500 }
    )
  }
}
