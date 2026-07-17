import { MoonCatData } from './types'
import _rawTraits from 'lib/mooncat_traits.json'
const moonCatData = _rawTraits as MoonCatData[]

type SingleIdentifier = number | bigint | string | undefined | MoonCatData

/**
 * Parse a MoonCat identifier and return a matching MoonCatData structure, if it exists
 *
 * Identifiers can be:
 * - Rescue Order (number or bigint)
 * - Hex ID (string)
 */
function parseIndividual(moonCatIdentifier: SingleIdentifier): MoonCatData | undefined {
  if (typeof moonCatIdentifier == 'undefined') return undefined
  if (typeof moonCatIdentifier == 'object' && 'rescueOrder' in moonCatIdentifier && 'catId' in moonCatIdentifier) {
    // Identifier is already a MoonCatData structure
    return moonCatIdentifier
  }
  const asNumber = Number(moonCatIdentifier)
  const asString = String(moonCatIdentifier).toLowerCase()
  return moonCatData.find((d) => d.rescueOrder == asNumber || d.catId == asString)
}

/**
 * Given a set of MoonCat identifiers, get metadata about all of them.
 *
 * Identifiers can be:
 * - Rescue Order (number or bigint)
 * - Hex ID (string)
 *
 * If a singular identifier is passed in, a singular result is returned.
 */
export default function getMoonCatData(moonCatIdentifiers: SingleIdentifier[]): (MoonCatData | undefined)[]
export default function getMoonCatData(moonCatIdentifiers: SingleIdentifier): MoonCatData | undefined
export default function getMoonCatData(
  moonCatIdentifiers: SingleIdentifier | SingleIdentifier[]
): (MoonCatData | undefined)[] | MoonCatData | undefined {
  return Array.isArray(moonCatIdentifiers)
    ? moonCatIdentifiers.map(parseIndividual)
    : parseIndividual(moonCatIdentifiers)
}
