import { MoonCatData } from 'lib/types'
import { filterMoonCatList, getQueryInt, queryToFilterSettings } from 'lib/util'
import { NextRequest } from 'next/server'
import _rawTraits from 'lib/mooncat_traits.json'
import moonCatRescues from 'lib/mooncat_rescues.json'
import { getCombinedListings } from 'lib/marketplaceUtils'

interface RescueMeta {
  txHash: string
  blockHeight: number
  timestamp: number
  rescueOrder: number
  seed: string
  catId: string
  rescuer: string
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return await doFilter(body)
}

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams
  return await doFilter(Object.fromEntries(query))
}

async function doFilter(inputData: Record<string, string>) {
  const filters = queryToFilterSettings(inputData)
  if (filters == null) return Response.json({ ok: false }, { status: 400 })

  let totalList: MoonCatData[] = _rawTraits as MoonCatData[]
  if (inputData.mooncats && inputData.mooncats !== 'all') {
    // Limit the result to a specific set of MoonCats
    const requestedMoonCats: string[] = inputData.mooncats.split(',')
    totalList = totalList
      .filter((moonCat) => {
        return requestedMoonCats.includes(String(moonCat.rescueOrder)) || requestedMoonCats.includes(moonCat.catId)
      })
      .sort((a, b) => {
        // Set the order of the returned data to be the order of the requested IDs
        const aPos = requestedMoonCats.indexOf(String(a.rescueOrder))
        const bPos = requestedMoonCats.indexOf(String(b.rescueOrder))
        return aPos - bPos
      })
  } else if (inputData.rescuedby && inputData.rescuedby != '') {
    // Limit the results to only MoonCats rescued by a specific address or set of addresses
    const rescuers: string[] = inputData.rescuedby.split(',')
    totalList = totalList.filter((moonCat) => {
      const rescueData = (moonCatRescues as Record<string, RescueMeta>)[moonCat.catId]
      if (typeof rescueData == 'undefined') return false
      return rescuers.includes(rescueData.rescuer)
    })
  }
  if (inputData.onlynamed && inputData.onlynamed !== '') {
    // Only keep named MoonCats, and sort by named order
    totalList = totalList.filter((moonCat) => moonCat.nameRaw).sort((a, b) => a.namedOrder! - b.namedOrder!)
  }

  let adoptable: Set<number> = new Set()
  if (typeof filters.adoptable != 'undefined') {
    // Fetch which MoonCats are currently adoptable, to be able to filter on it.
    const listings = await getCombinedListings()
    adoptable = new Set(listings.map((l) => l.moonCat))
  }

  // Filter the list of MoonCats as the request indicates
  const filteredList = filterMoonCatList(totalList, filters, adoptable)

  // Slice to the desired offset and limit
  const limit = getQueryInt(inputData.limit, 50)
  const offset = getQueryInt(inputData.offset, 0)

  return Response.json({
    length: filteredList.length,
    totalLength: totalList.length,
    moonCats: filteredList.slice(offset, offset + limit),
  })
}
