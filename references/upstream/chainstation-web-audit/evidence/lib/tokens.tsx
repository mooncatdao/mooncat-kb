import { Address, erc721Abi, hexToNumber, numberToHex, pad, sha256, trim } from 'viem'
import {
  ACCLIMATOR_ADDRESS,
  API2_SERVER_ROOT,
  IPFS_GATEWAY,
  MOMENTS_ADDRESS,
  MOONCAT_TRAITS_ARB,
  ZWS,
  bytes32ToString,
  getAllMoments,
} from './util'
import { AttestationDoc } from './eas'
import React from 'react'
import getMoonCatData from './getMoonCatData'
import { multicall, readContract } from 'wagmi/actions'
import { config } from './wagmi-config'
import MomentThumbnail from 'components/MomentThumbnail'

const allMoments = getAllMoments()

const ENS_TOKEN_COLLECTION = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'

/**
 * A representation of an ERC721-ish token.
 * A simple state for representing a token that may or may not be part of the MoonCat ecosystem.
 */
export interface TokenMeta {
  collection: {
    chainId?: number
    address: Address
    label?: string
  }
  name?: string
  id: `0x${string}`
  imageSrc?: string
  dynamic?: React.ReactElement
  link?: string
  extra?: Record<string, any>
}

/**
 * Determine whether a given TokenMeta object is actually describing a token within the MoonCatRescue Ecosystem.
 *
 * Tokens that are MoonCatRescue-specific have pages within ChainStation that are more-detailed than basic on-chain ERC721 metadata.
 * This function updates the `link` property of the TokenMeta objects to point to the ChainStation pages that give more detail about them,
 * makes sure the `imageSrc` property is the best option, and sets the `dynamic` property if there is a custom viewer tool for them.
 *
 * Note, this function is not an async function as it should not be fetching any external data to make these determinations. If additional
 * data is needed about a token, that logic should be added to the `getTokenMeta` function instead.
 */
export function formatMoonCatRescueTokens<T extends TokenMeta>(originalToken: T): T {
  const t = Object.assign({}, originalToken) // Don't mutate original parameter
  // Use collection address to determine if we know what sort of token that child token is
  switch (t.collection.address) {
    case ACCLIMATOR_ADDRESS:
      // Token is a MoonCat
      const rescueOrder = hexToNumber(t.id)
      t.collection.label = 'MoonCat'
      t.imageSrc = `${API2_SERVER_ROOT}/mooncat/image/${rescueOrder}.png?scale=3&costumes=true`
      t.link = `/mooncats/${rescueOrder}`
      return t
    case MOONCAT_TRAITS_ARB:
      const hexId = pad(trim(t.id), { size: 5 })
      t.collection.label = 'MoonCat'
      t.imageSrc = `${API2_SERVER_ROOT}/mooncat/image/${hexId}.png?scale=3&costumes=true`
      return t
    case MOMENTS_ADDRESS:
      // Token is a MoonCatMoment
      const tokenId = hexToNumber(t.id)
      let m = allMoments[Number(tokenId)]
      if (typeof m == 'undefined') {
        // Missing metadata for this MoonCatMoment
        t.collection.label = `MoonCat${ZWS}Moment`
        return t
      }
      t.collection.label = `MoonCat${ZWS}Moment`
      t.imageSrc = m.meta.image.replace(/^ipfs:\/\//, IPFS_GATEWAY + '/ipfs/')
      t.dynamic = <MomentThumbnail src={t.imageSrc} id={m.moment} />
      t.link = `/moments/${m.moment}`
      t.name = `${m.meta.name} #${tokenId}`
      return t
    default:
      // Token is an unknown token
      if (!t.imageSrc) {
        // Use a random anonymous image for this token
        const hash = sha256((t.collection.address + pad(t.id, { size: 32 })) as `0x${string}`, 'bytes')
        // Image is deterministic, based on collection and token IDs
        const num = (hash[0] % 3) + 1
        t.imageSrc = `/img/p${num}.png`
      }
      return t
  }
}

/**
 * Attempt to get the name of an ERC721 collection.
 * Takes the specified Ethereum address and assumes it's an ERC721 smart contract.
 * Blindly calls the `name` function on the contract and if successful, returns that result.
 */
export async function getCollectionName(contractAddress: Address) {
  try {
    // Fetch collection name
    return await readContract(config, {
      address: contractAddress as Address,
      abi: erc721Abi,
      functionName: 'name',
    })
  } catch (err) {
    // Collection name cannot be fetched
    console.warn('Failed to fetch name of collection', contractAddress, err)
    return null
  }
}

/**
 * Attempt to get the on-chain metadata of an ERC721 token.
 * Takes the specified Ethereum address and assumes it's an ERC721 smart contract.
 * Blindly calls the `ownerOf` and `tokenURI` functions on that contract.
 * The `ownerOf` function is required, so if it fails, the smart contract is not really ERC721-compliant.
 * The `tokenURI` function is optional, so if it fails, the collection may not have on-chain metadata recorded.
 */
export async function getOnchainTokenMeta(contractAddress: Address, tokenId: bigint, chainId: number = 1) {
  const [owner, tokenURI] = await multicall(config, {
    contracts: [
      {
        address: contractAddress as Address,
        abi: erc721Abi,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      },
      {
        address: contractAddress as Address,
        abi: erc721Abi,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
      },
    ],
    chainId: chainId,
    allowFailure: true,
  })
  if (owner.status == 'failure') console.warn('Failed to fetch token owner', contractAddress, tokenId, owner.error)
  if (tokenURI.status == 'failure') console.warn('Failed to fetch token URI', contractAddress, tokenId, tokenURI.error)

  return {
    owner: owner.status == 'success' ? owner.result : null,
    tokenURI: tokenURI.status == 'success' ? tokenURI.result : null,
  }
}

/**
 * Given an unknown address and ID, treat it as a generic ERC721 token and attempt to gather as much metadata about it as possible.
 * This function always runs the output through the `formatMoonCatRescueTokens` function to ensure links within the MoonCatRescue ecosystem are added.
 */
export async function getTokenMeta(contractAddress: Address, tokenId: bigint): Promise<TokenMeta | null> {
  const contractName = await getCollectionName(contractAddress)
  const { owner, tokenURI } = await getOnchainTokenMeta(contractAddress, tokenId)

  if (owner == null) {
    // Not a valid ERC721 collection
    return null
  }

  let meta: TokenMeta = {
    collection: {
      address: contractAddress,
      label: contractName ?? undefined,
    },
    id: numberToHex(tokenId),
    extra: { owner },
  }

  /**
   * Given a data blob that likely follows the OpenSea Metadata structure (https://docs.opensea.io/docs/metadata-standards#metadata-structure),
   * convert that data to our internal TokenMeta format
   */
  function parseJsonString(dataStr: string): TokenMeta {
    try {
      const data = JSON.parse(dataStr)
      console.debug('Found JSON metadata for token', tokenId, data)
      meta.imageSrc = data.image || data.image_url
      if (meta.imageSrc) meta.imageSrc = meta.imageSrc.replace(/^ipfs:\/\//, IPFS_GATEWAY + '/ipfs/')
      meta.link = data.external_url || data.animation_url || data.youtube_url
      meta.name = data.name
      return formatMoonCatRescueTokens(meta)
    } catch (err) {
      console.error(
        `Token URI data for token ${tokenId} from collection ${contractAddress} looks like JSON but does not parse properly`,
        dataStr,
        err
      )
      return formatMoonCatRescueTokens(meta)
    }
  }

  /**
   * Parse an input value that is in Data URI format
   * https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data
   */
  function parseDataURI(uri: string): TokenMeta {
    const commaPos = uri.indexOf(',')
    if (commaPos < 0) {
      // Nope, not actually formatted properly
      console.warn(
        `Found a "URI" for token ${tokenId} from collection ${contractAddress}, but it does not seem to be formatted properly`,
        uri
      )
      meta.link = uri
      return formatMoonCatRescueTokens(meta)
    }

    const [mimeType, format] = uri.substring(5, commaPos).split(';')
    const data = uri.substring(commaPos + 1)
    switch (mimeType.toLowerCase()) {
      case 'application/json':
        return parseJsonString(format == 'base64' ? atob(data) : data)
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/png':
      case 'image/svg+xml':
      case 'image/svg':
        meta.imageSrc = uri
        return formatMoonCatRescueTokens(meta)
      default:
        console.warn(
          `Found mime type ${mimeType};${format} for token ${tokenId} from collection ${contractAddress}, but don't know what to do with that format`,
          data
        )
        return formatMoonCatRescueTokens(meta)
    }
  }

  // Handle some known execptions to the ERC721 standard
  if (contractAddress == ENS_TOKEN_COLLECTION) {
    // ENS ERC721 token
    const rs = await fetch(`https://metadata.ens.domains/mainnet/${ENS_TOKEN_COLLECTION}/${tokenId}`)
    const body = await rs.text()
    if (!rs.ok) {
      console.error(`Failed to fetch metadata for ENS token`, rs.status, rs.statusText, body)
    } else {
      return parseJsonString(body)
    }
  }

  if (tokenURI == null) {
    // No extra metadata
    console.debug(`ERC721 collection ${contractAddress} call for tokenURI failed`)
    return formatMoonCatRescueTokens(meta)
  }

  if (tokenURI[0] == '{') {
    // This does not appear to be a URI, but raw JSON returned as a string
    return parseJsonString(tokenURI)
  }

  let parsedURI = tokenURI

  // Check if the URI is a Data URL string format
  if (parsedURI.startsWith('data:')) return parseDataURI(parsedURI)

  // Handle links to IPFS content
  if (parsedURI.startsWith('ipfs://')) parsedURI = `https://ipfs.io/ipfs/${parsedURI.substring(7)}`

  if (!parsedURI.startsWith('https://') && !parsedURI.startsWith('http://') && !parsedURI.startsWith('//')) {
    // No idea what this "URI" actually is...
    console.warn(
      `Found a "URI" for token ${tokenId} from collection ${contractAddress}, but it does not seem to be formatted properly`,
      parsedURI
    )
    meta.link = parsedURI
    return formatMoonCatRescueTokens(meta)
  }

  const rs = await fetch(parsedURI)
  if (!rs.ok) {
    console.error('Failed to fetch token URI content', parsedURI, rs.statusText)
    return formatMoonCatRescueTokens(meta)
  }

  try {
    const data = await rs.text()

    // If the data is JSON-formatted, parse it
    if (data.startsWith('{')) return parseJsonString(data)

    // Otherwise, this is likely an HTML page giving more details about the token
    meta.link = parsedURI
    return formatMoonCatRescueTokens(meta)
  } catch (err) {
    // The specified URI does not have valid JSON. Therefore assume the URI is a link to more data, but not structured data.
    meta.link = parsedURI
    return formatMoonCatRescueTokens(meta)
  }
}

/**
 * Given a list of token metadatas, search through it for MoonCats identified by their Hex ID and replace it with Rescue order
 */
export function parseTokenListMoonCats(tokens: UserListTokenMeta[]): UserListTokenMeta[] {
  const moonCatHexIds: Set<`0x${string}`> = new Set()
  // Find any MoonCats referenced in the list that are using Hex IDs instead of Rescue Orders
  for (const t of tokens) {
    if (t.collection.address == MOONCAT_TRAITS_ARB) {
      moonCatHexIds.add(pad(trim(t.id), { size: 5 }))
    }
  }
  if (moonCatHexIds.size == 0) return tokens

  // Fetch metadata info about all the MoonCat Hex IDs found, to map to rescue orders
  const mcTraits: Record<string, bigint> = {}
  getMoonCatData(Array.from(moonCatHexIds)).forEach((mc) => {
    if (mc) mcTraits[mc.catId] = BigInt(mc.rescueOrder)
  })

  return tokens.map((originalToken) => {
    const t = Object.assign({}, originalToken) // Don't mutate original parameter
    switch (t.collection.address) {
      case MOONCAT_TRAITS_ARB: {
        // Convert to standard MoonCat meta
        const hexId = pad(trim(t.id), { size: 5 })
        const rescueOrder = mcTraits[hexId]
        if (typeof rescueOrder == 'undefined') return t
        //t.id = numberToHex(rescueOrder)
        t.imageSrc = `${API2_SERVER_ROOT}/mooncat/image/${rescueOrder}.png?scale=3&costumes=true`
        t.link = `/mooncats/${rescueOrder}`
        t.name = `#${rescueOrder}`
        return t
      }
      default:
        return t
    }
  })
}

/**
 * When using the ID of the token for UI display, make sure it's formatted nicely to not overflow the grid
 */
function trimId(str: `0x${string}`) {
  const tokenNum = BigInt(str)
  if (tokenNum < 50_000) return '#' + tokenNum
  const trimmedId = trim(str)
  if (trimmedId.length > 10) {
    return <code title={trimmedId}>{trimmedId.substring(0, 10)}&hellip;</code>
  } else {
    return <code>{trimmedId}</code>
  }
}

/**
 * When using a string name for UI display, make sure it's formatted nicely to not overflow the grid
 */
function trimName(str: string | undefined): React.ReactNode {
  if (typeof str == 'string' && str.length > 80) {
    return (
      <>
        {str.substring(0, 15)}&hellip;{str.substring(str.length - 15)}
      </>
    )
  }
  return str
}

/**
 * Given a token's metadata, determine how it should be displayed.
 * If the token has a collection label or token name specified, use those. Otherwise, fall back to using a hex representation of the address and id values
 */
export function tokenDisplayLabel<T extends TokenMeta>(t: T) {
  const collectionLabel =
    typeof t.collection.label == 'undefined' ? (
      <code title={t.collection.address}>{t.collection.address.substring(0, 10)}&hellip;</code>
    ) : (
      t.collection.label
    )
  let tokenName: React.ReactNode
  if (typeof t.name == 'undefined') {
    tokenName = trimId(t.id)
  } else {
    tokenName = trimName(t.name)
  }
  return [collectionLabel, tokenName]
}

/**
 * An ERC721-ish token that is a member of a User List Attestation
 */
export type UserListTokenMeta = TokenMeta & {
  attUID: `0x${string}`
  ownerAddress: string
  listTitle: string
}

/**
 * Parse a set of Attestations defining tokens for a User List
 */
export function parseTokenListAttestations(rawAtts: AttestationDoc[]): UserListTokenMeta[] {
  const parsedTokens: UserListTokenMeta[] = []

  rawAtts.forEach((att: AttestationDoc) => {
    att.data.tokenIds.value.forEach((tokenId: `0x${string}`) => {
      parsedTokens.push({
        ...formatMoonCatRescueTokens({
          collection: { chainId: Number(att.sig.domain.chainId), address: att.sig.message.recipient as Address },
          id: tokenId,
        } as TokenMeta),
        attUID: att.sig.uid as `0x${string}`,
        ownerAddress: att.signer,
        listTitle: bytes32ToString(att.data.name.value),
      })
    })
  })

  return parsedTokens
}
