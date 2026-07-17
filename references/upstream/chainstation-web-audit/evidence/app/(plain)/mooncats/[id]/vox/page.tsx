/* eslint @next/next/no-sync-scripts: 0 */
import getMoonCatData from 'lib/getMoonCatData'
import { notFound } from 'next/navigation'
import Script from 'next/script'

const CID = 'bafybeifxqtzf635xy3q3lrp2cygrz2vatregvtnfe2dsl4jskjyuneexzu'
const IPFS_PATHS = [
  `https://${CID}.ipfs.dweb.link`,
  `https://ipfs.io/ipfs/${CID}`,
  `https://${CID}.ipfs.4everland.io`,
  `https://gateway.pinata.cloud/ipfs/${CID}`,
  `https://mooncats.myfilebase.com/ipfs/${CID}`,
]

async function getVox(rescueOrder: number) {
  for (const path of IPFS_PATHS) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000) // Wait up to ten seconds per gateway
    try {
      const rs = await fetch(`${path}/${rescueOrder}.vox`, { signal: controller.signal, next: { revalidate: 3600 } })
      if (rs.ok) return await rs.arrayBuffer()
      console.warn(`[IPFS] Failed to fetch VOX file from ${path}: ${rs.status} ${rs.statusText}`)
    } catch (err) {
      console.warn(`[IPFS] Failed to fetch VOX file from ${path}: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      clearTimeout(timeout)
    }
  }
  console.error(`[IPFS] Failed to fetch VOX file for ${rescueOrder} from all IPFS gateways`)
  return null
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const rescueOrder = parseInt(id)
  if (Number.isNaN(rescueOrder) || rescueOrder < 0) notFound()
  const vox = await getVox(rescueOrder)
  if (vox == null) notFound()
  const voxSerialized = Buffer.from(vox).toString('base64')

  const moonCat = getMoonCatData(rescueOrder)
  if (!moonCat) notFound()

  return (
    <>
      <script
        type="importmap"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            imports: {
              'three': 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js',
              'VOXLoader': '/VOXLoader.js',
              'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/',
            },
          }),
        }}
      />
      <div id="mooncat-data" data-pose={moonCat.pose} data-facing={moonCat.facing} data-vox={voxSerialized} />
      <Script strategy="lazyOnload" type="module" src="/vox.js" />
    </>
  )
}
