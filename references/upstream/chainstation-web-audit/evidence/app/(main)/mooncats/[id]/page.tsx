import type { Metadata } from 'next'
import { isValidViewPreference, MoonCatData, MoonCatViewPreference } from 'lib/types'
import { getSequenceListings } from 'lib/sequenceData'
import { API2_SERVER_ROOT } from 'lib/util'
import getMoonCatDetails from 'lib/getMoonCatDetails'
import { notFound } from 'next/navigation'
import MoonCatDetail from 'components/MoonCatDetail'

import _rawTraits from 'lib/mooncat_traits.json'
const moonCatTraits = _rawTraits as MoonCatData[]

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function ucFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params
  const moonCat = getMoonCatData(id)
  if (moonCat == null) return { title: 'MoonCat' }

  const details = await getMoonCatDetails(moonCat.rescueOrder)

  let displayName = ` (${moonCat.catId})`
  if (details !== null && details.isNamed != 'No' && details.name != null) {
    // If the API server metadata has a name for this MoonCat, use that
    displayName = `: ${details.name}`
  } else if (moonCat.name === true) {
    // If the MoonCat's name is not a valid string, use unknown character
    displayName = ': \ufffd'
  } else if (moonCat.name) {
    // MoonCat is named and the name is a UTF8 string
    displayName = `: ${moonCat.name}`
  }

  let description
  let type = moonCat.genesis ? 'Genesis MoonCat' : 'MoonCat'
  if (details == null) {
    // Loading details failed; give summary data
    description = `An adorable ${ucFirst(moonCat.pattern)} ${type}, rescued in ${moonCat.rescueYear}`
  } else {
    let coatDetail = `${ucFirst(details.hue)} ${ucFirst(moonCat.pattern)}`
    if (!details.genesis && details.isPale) coatDetail = 'Pale ' + coatDetail
    description = `An adorable ${coatDetail} ${type}, rescued in ${moonCat.rescueYear}`
  }

  let metaImage: MoonCatViewPreference = 'accessorized'
  const queryPreference = (await searchParams).view
  if (queryPreference && !Array.isArray(queryPreference) && isValidViewPreference(queryPreference)) {
    // Query parameter takes priority
    metaImage = queryPreference.toLowerCase() as MoonCatViewPreference
  }
  let metaImageSrc = ''
  switch (metaImage) {
    case 'mooncat':
      metaImageSrc = `${API2_SERVER_ROOT}/mooncat/image/${moonCat.catId}.png?acc=`
      break
    case 'face':
      metaImageSrc = `${API2_SERVER_ROOT}/mooncat/image/${moonCat.catId}.png?acc=&faceOnly=yes`
      break
    default:
      metaImageSrc = `${API2_SERVER_ROOT}/mooncat/image/${moonCat.catId}.png?costumes=true`
      break
  }

  return {
    title: `MoonCat #${moonCat.rescueOrder}${displayName}`,
    description: description,
    openGraph: {
      title: `MoonCat #${moonCat.rescueOrder}${displayName}`,
      description: description,
      images: [{ url: metaImageSrc }],
    },
    icons: {
      other: [
        {
          rel: 'canonical',
          url: `https://mooncatrescue.com/mooncats/${moonCat.rescueOrder}`,
        },
        {
          rel: 'alternate',
          type: 'application/json+oembed',
          url: `https://mooncatrescue.com/api/oembed?format=json&url=${encodeURIComponent(
            `https://mooncatrescue.com/mooncats/${moonCat.rescueOrder}`
          )}`,
        },
      ],
    },
  }
}

/**
 * Get metadata about a specific MoonCat identifier
 *
 * This function is different than the `lib/getMoonCatData` method, because it's operating on a user input that
 * is always a string (from the URL path), and so needs to be changed into a number if it looks like a rescue order
 * and more-aggressively sanitized because it's from a user rather than other processes.
 */
function getMoonCatData(id: string): MoonCatData | null {
  if (id.substring(0, 2) == '0x') {
    // ID is a hex ID
    const hexId = id.toLowerCase()
    const mc = moonCatTraits.find((d) => d.catId.toLowerCase() === hexId)
    return mc ?? null
  }

  const asNumber = Number(id)
  if (!Number.isNaN(asNumber) && asNumber >= 0) {
    // ID is the rescue order
    const mc = moonCatTraits.find((d) => d.rescueOrder === asNumber)
    return mc ?? null
  }

  return null
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const moonCat = getMoonCatData(id)
  if (moonCat == null) notFound()

  const [details, sequenceListings] = await Promise.all([getMoonCatDetails(moonCat.rescueOrder), getSequenceListings()])

  const listings = sequenceListings.filter((l) => l.moonCat == moonCat?.rescueOrder)

  return <MoonCatDetail moonCat={moonCat} details={details} listings={listings} />
}
