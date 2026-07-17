import { getAddress } from 'viem'
import { MoonCatDetails } from './types'
import { API_SERVER_ROOT } from './util'

/**
 * Fetch details about a MoonCat from the API server
 * This is for back-end services; it uses a raw `fetch` call rather than `useQuery` to get the data
 */
async function getMoonCatDetails(rescueOrder: number): Promise<MoonCatDetails | null> {
  const rs = await fetch(`${API_SERVER_ROOT}/traits/${rescueOrder}`, { next: { revalidate: 3600 } })
  if (!rs.ok) {
    console.error('API call returned', rs.status)
    return null
  }

  const jsonData = await rs.json()
  if (typeof jsonData == 'undefined') {
    console.error('Failed to parse JSON body')
    return null
  }

  const details = jsonData.details as MoonCatDetails
  if (details.owner) {
    // Old-wrapped MoonCats are not enumerated
    details.owner = getAddress(details.owner) // Ensure address is in checksummed format
  }
  if (details.rescuedBy) {
    details.rescuedBy = getAddress(details.rescuedBy) // Ensure address is in checksummed format
  }
  return details
}

export default getMoonCatDetails
