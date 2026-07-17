import {
  isValidViewPreference,
  Moment,
  MomentMeta,
  MoonCatData,
  MoonCatFilterSettings,
  MoonCatViewPreference,
} from 'lib/types'
import { getAccount, multicall, switchChain } from 'wagmi/actions'
import { Address, hexToBytes, hexToString, parseAbi } from 'viem'
import { FetchStatus } from './useFetchStatus'
import { config } from './wagmi-config'

export const API_SERVER_ROOT = 'https://api.mooncat.community'
export const API2_SERVER_ROOT = 'https://api.mooncatrescue.com'
export const IPFS_GATEWAY = 'https://ipfs.io'
export const SIWE_LOGIN_STATEMENT = 'Authenticating into the ChainStation web application'
export const USER_SESSION_COLLECTION = 'user-sessions'
export const TREASURES_COLLECTION = 'treasures'
export const ZWS = '\u200B'

export const LOCALSTORAGE_MOONCATVIEW_KEY = 'mooncatview'
export const LOCALSTORAGE_VIEWCHANGE_KEY = 'mooncatviewchange'

// Time ranges in milliseconds
export const FIVE_MINUTES = 60 * 5 * 1000
export const ONE_HOUR = 60 * 60 * 1000
export const ONE_DAY = ONE_HOUR * 24

export const RESCUE_ADDRESS: Address = '0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6'
export const ACCLIMATOR_ADDRESS: Address = '0xc3f733ca98E0daD0386979Eb96fb1722A1A05E69'
export const ACCESSORIES_ADDRESS: Address = '0x8d33303023723dE93b213da4EB53bE890e747C63'
export const MOMENTS_ADDRESS: Address = '0x367721b332F4697d440EBBe6780262411Fd03409'
export const JUMPPORT_ADDRESS: Address = '0xF4d150F3D03Fa1912aad168050694f0fA0e44532'
export const WETH_ADDRESS: Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

export const MOONCAT_TRAITS_ARB = '0xf00e9cF6a96dFAd869f676022F49761632A3aA2C'

// Subset of chain names from https://github.com/ethereum-lists/chains that are used by the MoonCat ecosystem
export const CHAIN_IDS = {
  eth: {
    chainId: 1,
    label: 'Ethereum',
  },
  // alias
  arb: {
    chainId: 42161,
    label: 'Arbitrum',
  },
  arb1: {
    chainId: 42161,
    label: 'Arbitrum',
  },
}
export type ChainName = keyof typeof CHAIN_IDS
export function codeForChainId(id: number | bigint) {
  const e = Object.entries(CHAIN_IDS).find(([code, meta]) => meta.chainId == id)
  return e ? e[0] : String(id)
}

type AddressDetail =
  | {
      type: 'bridge' | 'marketplace' | 'wrapper' | 'website-redirect'
      label: string
      link: string
    }
  | {
      type: 'pool'
      label: string
      link?: string
    }
export const ADDRESS_DETAILS: Record<Address, AddressDetail> = {
  '0xD4fe01ce79C84C68f9307D415B8f392D140c242C': {
    type: 'pool',
    label: 'NFTX v3 MOONCAT pool',
    //link: 'https://v3.nftx.io/eth/collections/acclimatedmooncats/buy', // Discontinued as of January 2026: https://x.com/NFTX_/status/2003059462748205538
  },
  '0x98968f0747E0A261532cAcC0BE296375F5c08398': {
    type: 'pool',
    label: 'NFTX v2 MOONCAT pool',
    //link: 'https://nftx.io/vault/0x98968f0747e0a261532cacc0be296375f5c08398/buy/', // Discontinued as of January 2026: https://x.com/NFTX_/status/2003059462748205538
  },
  '0xA8b42C82a628DC43c2c2285205313e5106EA2853': {
    type: 'pool',
    label: 'NFTX MCAT17 pool',
    //link: 'https://nftx.io/vault/0xa8b42c82a628dc43c2c2285205313e5106ea2853/buy/', // Discontinued as of January 2026: https://x.com/NFTX_/status/2003059462748205538
  },
  '0x67BDcD02705CEcf08Cb296394DB7d6Ed00A496F9': {
    type: 'pool',
    label: 'NFT20 CAT20 pool',
    link: 'https://nft20.io/asset/0x67bdcd02705cecf08cb296394db7d6ed00a496f9',
  },
  '0x7C40c393DC0f283F318791d746d894DdD3693572': {
    type: 'wrapper',
    label: 'Unsupported wrapper',
    link: 'https://etherscan.io/address/0x7c40c393dc0f283f318791d746d894ddd3693572',
  },
  '0x6FFd7EdE62328b3Af38FCD61461Bbfc52F5651fE': {
    type: 'bridge',
    label: 'Wormhole Token Bridge',
    link: 'https://www.portalbridge.com/',
  },
  '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b': {
    type: 'marketplace',
    label: 'OpenSea: Wyvern Exchange v1',
    link: 'https://opensea.io/collection/acclimatedmooncats',
  },
  '0x7f268357A8c2552623316e2562D90e642bB538E5': {
    type: 'marketplace',
    label: 'OpenSea: Wyvern Exchange v2',
    link: 'https://opensea.io/collection/acclimatedmooncats',
  },
  '0x00000000006CEE72100D161c57ADA5Bb2be1CA79': {
    type: 'marketplace',
    label: 'Seaport 1.0',
    link: 'https://opensea.io/collection/acclimatedmooncats',
  },
  '0x00000000006c3852cbEf3e08E8dF289169EdE581': {
    type: 'marketplace',
    label: 'Seaport 1.1',
    link: 'https://opensea.io/collection/acclimatedmooncats',
  },
  '0x00000000000006c7676171937C444f6BDe3D6282': {
    type: 'marketplace',
    label: 'Seaport 1.2',
    link: 'https://opensea.io/collection/acclimatedmooncats',
  },
  '0x00000000000001ad428e4906aE43D8F9852d0dD6': {
    type: 'marketplace',
    label: 'Seaport 1.4',
    link: 'https://opensea.io/collection/acclimatedmooncats',
  },
  '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC': {
    type: 'marketplace',
    label: 'Seaport 1.5',
    link: 'https://opensea.io/collection/acclimatedmooncats',
  },
  '0x0000000000000068F116a894984e2DB1123eB395': {
    type: 'marketplace',
    label: 'Seaport 1.6',
    link: 'https://opensea.io/collection/acclimatedmooncats',
  },
  '0x59728544B08AB483533076417FbBB2fD0B17CE3a': {
    type: 'marketplace',
    label: 'LooksRare: Exchange',
    link: 'https://looksrare.org/collections/0xc3f733ca98E0daD0386979Eb96fb1722A1A05E69',
  },
  '0x0000000000E655fAe4d56241588680F86E3b2377': {
    type: 'marketplace',
    label: 'LooksRare: Exchange V2',
    link: 'https://looksrare.org/collections/0xc3f733ca98E0daD0386979Eb96fb1722A1A05E69',
  },
  '0x000000000000Ad05Ccc4F10045630fb830B95127': {
    type: 'marketplace',
    label: 'Blur.io: Marketplace',
    link: 'https://blur.io/collection/acclimatedmooncats',
  },
  '0x39da41747a83aeE658334415666f3EF92DD0D541': {
    type: 'marketplace',
    label: 'Blur.io: Marketplace 2',
    link: 'https://blur.io/collection/acclimatedmooncats',
  },
  '0xb2ecfE4E4D61f8790bbb9DE2D1259B9e2410CEA5': {
    type: 'marketplace',
    label: 'Blur.io: Marketplace 3',
    link: 'https://blur.io/collection/acclimatedmooncats',
  },
  '0x7206249809DfB38424FA1ae48dF4e7bee060bfc3': {
    type: 'website-redirect',
    label: 'OpenSea Reward Pool',
    link: 'https://opensea.io/0x7206249809DfB38424FA1ae48dF4e7bee060bfc3?collectionSlugs=acclimatedmooncats',
  },
}

export const COSTUME_ACCESSORIES = [
  387, 475, 513, 514, 516, 517, 519, 520, 521, 522, 534, 535, 536, 538, 539, 540, 541, 544, 584, 695, 696, 702, 704,
  714, 717, 718, 719, 767, 776, 777, 778, 781, 783, 842, 850, 861, 920, 928, 1007, 1016, 1030, 1032, 1052, 1061, 1076,
  1078, 1080, 1084, 1085, 1087, 1091, 1096, 1112, 1116, 1123, 1135, 1147, 1162, 1169, 1186, 1187,
]

/**
 * Obtained from `paletteOf(0x0000ff0000)` and `colorAlpha()` functions on 0x2fd7E0c38243eA15700F45cfc38A7a7f66df1deC
 */
export const COLORS = [
  { r: 255, g: 255, b: 255, a: 0, label: 'Transparent Background' },
  { r: 255, g: 255, b: 255, a: 255, label: 'White' },
  { r: 212, g: 212, b: 212, a: 255, label: 'Pale Grey' },
  { r: 170, g: 170, b: 170, a: 255, label: 'Light Grey' },
  { r: 128, g: 128, b: 128, a: 255, label: 'Grey' },
  { r: 85, g: 85, b: 85, a: 255, label: 'Dark Grey' },
  { r: 42, g: 42, b: 42, a: 255, label: 'Deep Grey' },
  { r: 0, g: 0, b: 0, a: 255, label: 'Black' },
  { r: 249, g: 134, b: 134, a: 255, label: 'Light Red' },
  { r: 242, g: 13, b: 13, a: 255, label: 'Red' },
  { r: 161, g: 8, b: 8, a: 255, label: 'Dark Red' },
  { r: 249, g: 178, b: 134, a: 255, label: 'Light Orange' },
  { r: 242, g: 101, b: 13, a: 255, label: 'Orange' },
  { r: 161, g: 67, b: 8, a: 255, label: 'Dark Orange' },
  { r: 249, g: 220, b: 134, a: 255, label: 'Light Gold' },
  { r: 242, g: 185, b: 13, a: 255, label: 'Gold' },
  { r: 161, g: 123, b: 8, a: 255, label: 'Dark Gold' },
  { r: 249, g: 249, b: 134, a: 255, label: 'Light Yellow' },
  { r: 242, g: 242, b: 13, a: 255, label: 'Yellow' },
  { r: 161, g: 161, b: 8, a: 255, label: 'Dark Yellow' },
  { r: 210, g: 249, b: 134, a: 255, label: 'Light Chartreuse' },
  { r: 166, g: 242, b: 13, a: 255, label: 'Chartreuse' },
  { r: 110, g: 161, b: 8, a: 255, label: 'Dark Chartreuse' },
  { r: 134, g: 249, b: 134, a: 255, label: 'Light Green' },
  { r: 13, g: 242, b: 13, a: 255, label: 'Green' },
  { r: 8, g: 161, b: 8, a: 255, label: 'Dark Green' },
  { r: 134, g: 249, b: 205, a: 255, label: 'Light Teal' },
  { r: 13, g: 242, b: 154, a: 255, label: 'Teal' },
  { r: 8, g: 161, b: 103, a: 255, label: 'Dark Teal' },
  { r: 134, g: 249, b: 249, a: 255, label: 'Light Cyan' },
  { r: 13, g: 242, b: 242, a: 255, label: 'Cyan' },
  { r: 8, g: 161, b: 161, a: 255, label: 'Dark Cyan' },
  { r: 134, g: 205, b: 249, a: 255, label: 'Light Sky Blue' },
  { r: 13, g: 154, b: 242, a: 255, label: 'Sky Blue' },
  { r: 8, g: 103, b: 161, a: 255, label: 'Dark Sky Blue' },
  { r: 134, g: 134, b: 249, a: 255, label: 'Light Blue' },
  { r: 13, g: 13, b: 242, a: 255, label: 'Blue' },
  { r: 8, g: 8, b: 161, a: 255, label: 'Dark Blue' },
  { r: 182, g: 134, b: 249, a: 255, label: 'Light Indigo' },
  { r: 108, g: 13, b: 242, a: 255, label: 'Indigo' },
  { r: 72, g: 8, b: 161, a: 255, label: 'Dark Indigo' },
  { r: 210, g: 134, b: 249, a: 255, label: 'Light Purple' },
  { r: 166, g: 13, b: 242, a: 255, label: 'Purple' },
  { r: 110, g: 8, b: 161, a: 255, label: 'Dark Purple' },
  { r: 235, g: 134, b: 249, a: 255, label: 'Light Violet' },
  { r: 215, g: 13, b: 242, a: 255, label: 'Violet' },
  { r: 144, g: 8, b: 161, a: 255, label: 'Dark Violet' },
  { r: 249, g: 134, b: 210, a: 255, label: 'Light Pink' },
  { r: 242, g: 13, b: 166, a: 255, label: 'Pink' },
  { r: 161, g: 8, b: 110, a: 255, label: 'Dark Pink' },
  { r: 65, g: 22, b: 22, a: 255, label: 'Deep Red' },
  { r: 65, g: 54, b: 22, a: 255, label: 'Deep Yellow' },
  { r: 43, g: 65, b: 22, a: 255, label: 'Deep Green' },
  { r: 22, g: 65, b: 48, a: 255, label: 'Deep Teal' },
  { r: 22, g: 33, b: 65, a: 255, label: 'Deep Blue' },
  { r: 43, g: 22, b: 65, a: 255, label: 'Deep Purple' },
  { r: 65, g: 22, b: 54, a: 255, label: 'Deep Pink' },
  { r: 236, g: 198, b: 198, a: 255, label: 'Pale Red' },
  { r: 236, g: 221, b: 198, a: 255, label: 'Pale Yellow' },
  { r: 202, g: 236, b: 198, a: 255, label: 'Pale Green' },
  { r: 198, g: 236, b: 236, a: 255, label: 'Pale Teal' },
  { r: 198, g: 217, b: 236, a: 255, label: 'Pale Blue' },
  { r: 217, g: 198, b: 236, a: 255, label: 'Pale Purple' },
  { r: 236, g: 198, b: 226, a: 255, label: 'Pale Pink' },
  { r: 56, g: 43, b: 31, a: 255, label: 'Umber' },
  { r: 72, g: 47, b: 25, a: 255, label: 'Mocha' },
  { r: 101, g: 62, b: 29, a: 255, label: 'Cinnamon' },
  { r: 130, g: 79, b: 35, a: 255, label: 'Brown' },
  { r: 153, g: 96, b: 46, a: 255, label: 'Peanut' },
  { r: 184, g: 132, b: 86, a: 255, label: 'Tortilla' },
  { r: 218, g: 192, b: 169, a: 255, label: 'Beige' },
  { r: 255, g: 255, b: 255, a: 200, label: 'White Glass' },
  { r: 212, g: 212, b: 212, a: 200, label: 'Pale Grey Glass' },
  { r: 170, g: 170, b: 170, a: 200, label: 'Light Grey Glass' },
  { r: 128, g: 128, b: 128, a: 200, label: 'Grey Glass' },
  { r: 85, g: 85, b: 85, a: 200, label: 'Dark Grey Glass' },
  { r: 42, g: 42, b: 42, a: 200, label: 'Deep Grey Glass' },
  { r: 0, g: 0, b: 0, a: 200, label: 'Black Glass' },
  { r: 242, g: 13, b: 13, a: 200, label: 'Vibrant Red Smoked Glass' },
  { r: 108, g: 19, b: 19, a: 200, label: 'Dull Red Smoked Glass' },
  { r: 242, g: 185, b: 13, a: 200, label: 'Vibrant Yellow Smoked Glass' },
  { r: 108, g: 86, b: 19, a: 200, label: 'Dull Yellow Smoked Glass' },
  { r: 128, g: 242, b: 13, a: 200, label: 'Vibrant Green Smoked Glass' },
  { r: 64, g: 108, b: 19, a: 200, label: 'Dull Green Smoked Glass' },
  { r: 13, g: 242, b: 154, a: 200, label: 'Vibrant Teal Smoked Glass' },
  { r: 19, g: 108, b: 74, a: 200, label: 'Dull Teal Smoked Glass' },
  { r: 13, g: 70, b: 242, a: 200, label: 'Vibrant Blue Smoked Glass' },
  { r: 19, g: 41, b: 108, a: 200, label: 'Dull Blue Smoked Glass' },
  { r: 127, g: 13, b: 242, a: 200, label: 'Vibrant Purple Smoked Glass' },
  { r: 64, g: 19, b: 108, a: 200, label: 'Dull Purple Smoked Glass' },
  { r: 242, g: 13, b: 185, a: 200, label: 'Vibrant Pink Smoked Glass' },
  { r: 108, g: 19, b: 86, a: 200, label: 'Dull Pink Smoked Glass' },
  { r: 242, g: 13, b: 13, a: 128, label: 'Vibrant Red Stained Glass' },
  { r: 108, g: 19, b: 19, a: 128, label: 'Dull Red Stained Glass' },
  { r: 242, g: 185, b: 13, a: 128, label: 'Vibrant Yellow Stained Glass' },
  { r: 108, g: 86, b: 19, a: 128, label: 'Dull Yellow Stained Glass' },
  { r: 128, g: 242, b: 13, a: 128, label: 'Vibrant Green Stained Glass' },
  { r: 64, g: 108, b: 19, a: 128, label: 'Dull Green Stained Glass' },
  { r: 13, g: 242, b: 154, a: 128, label: 'Vibrant Teal Stained Glass' },
  { r: 19, g: 108, b: 74, a: 128, label: 'Dull Teal Stained Glass' },
  { r: 13, g: 70, b: 242, a: 128, label: 'Vibrant Blue Stained Glass' },
  { r: 19, g: 41, b: 108, a: 128, label: 'Dull Blue Stained Glass' },
  { r: 127, g: 13, b: 242, a: 128, label: 'Vibrant Purple Stained Glass' },
  { r: 64, g: 19, b: 108, a: 128, label: 'Dull Purple Stained Glass' },
  { r: 242, g: 13, b: 185, a: 128, label: 'Vibrant Pink Stained Glass' },
  { r: 108, g: 19, b: 86, a: 128, label: 'Dull Pink Stained Glass' },
  { r: 247, g: 171, b: 171, a: 200, label: 'Red Tinted Glass' },
  { r: 247, g: 228, b: 171, a: 200, label: 'Yellow Tinted Glass' },
  { r: 180, g: 247, b: 171, a: 200, label: 'Green Tinted Glass' },
  { r: 171, g: 247, b: 247, a: 200, label: 'Teal Tinted Glass' },
  { r: 171, g: 209, b: 247, a: 200, label: 'Blue Tinted Glass' },
  { r: 209, g: 171, b: 247, a: 200, label: 'Purple Tinted Glass' },
  { r: 247, g: 171, b: 228, a: 200, label: 'Pink Tinted Glass' },
  { r: 255, g: 0, b: 0, a: 255, label: 'MoonCat Glow Color' },
  { r: 51, g: 0, b: 0, a: 255, label: 'MoonCat Border (glows)' },
  { r: 102, g: 0, b: 0, a: 255, label: 'MoonCat Pattern' },
  { r: 230, g: 0, b: 0, a: 255, label: 'MoonCat Coat' },
  { r: 255, g: 102, b: 102, a: 255, label: 'MoonCat Belly/Whiskers' },
  { r: 255, g: 153, b: 221, a: 255, label: 'MoonCat Nose/Ears/Feet' },
  { r: 51, g: 0, b: 0, a: 255, label: 'MoonCat Eyes' },
  { r: 0, g: 230, b: 230, a: 255, label: 'MoonCat Complement 1' },
  { r: 0, g: 230, b: 230, a: 127, label: 'MoonCat C1 Smoked Glass' },
  { r: 0, g: 230, b: 230, a: 102, label: 'MoonCat C1 Stained Glass' },
  { r: 0, g: 230, b: 230, a: 76, label: 'MoonCat C1 Tinted Glass' },
  { r: 153, g: 255, b: 255, a: 255, label: 'MoonCat Complement 2' },
  { r: 153, g: 255, b: 255, a: 127, label: 'MoonCat C2 Smoked Glass' },
  { r: 153, g: 255, b: 255, a: 102, label: 'MoonCat C2 Stained Glass' },
  { r: 153, g: 255, b: 255, a: 76, label: 'MoonCat C2 Tinted Glass' },
]

export function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, delay * 1000)
  })
}

/**
 * Convert a moment in time to a human-friendly date
 * Shows as MM.DD.YYYY
 */
export function formatAsDate(ts: Date | number) {
  const d = typeof ts == 'number' ? new Date(ts * 1000) : ts
  return d.toISOString().split('T')[0].replaceAll('-', '.')
}

/**
 * Convert a moment in time to a human-friendly time
 * Shows as HH:MM
 */
export function formatAsTime(ts: Date | number): string {
  const d = typeof ts == 'number' ? new Date(ts * 1000) : ts
  const timePieces = d.toISOString().split('T')[1].split(':')
  timePieces.pop()
  return timePieces.join(':')
}

/**
 * Convert a UTF8 string that was stored as a Bytes32 in solitity back to a string.
 */
export function bytes32ToString(hexString: `0x${string}`) {
  const str = hexToString(hexString)
  const nullPos = str.indexOf('\u0000')
  return nullPos >= 0 ? str.substring(0, nullPos) : str
}

/**
 * Convert a string to a URI-usable label.
 */
export function nameToUriSlug(name: string) {
  return name.replaceAll(' ', '-').toLowerCase()
}

/**
 * Validate a value supplied via URLSearchParams to an integer value
 */
export function getQueryInt(rawValue: string | null, defaultValue: number): number {
  if (rawValue == null) return defaultValue
  const rawInt = parseInt(rawValue)
  if (Number.isNaN(rawInt) || rawInt <= 0) return defaultValue
  return rawInt
}

/**
 * Enable bigint values to be encoded with JSON.stringify()
 *
 * This is a "lossy" function meant to make human-friendly values. It converts bigints into numbers if they are within
 * the safe integer range, and otherwise converts them to strings. Deserializing these values will not give the original bigint.
 */
export function stringifyBigints(key: string, value: any) {
  if (typeof value !== 'bigint') return value
  if (value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER) {
    return Number(value)
  } else {
    return value.toString()
  }
}

/**
 * Serialize a bigint value for storage in JSON.stringify().
 *
 * This flags input values that are bigints with a __type property, so the `deserializeBigint` function knows to convert them back.
 */
export function serializeBigints(key: string, value: any) {
  return typeof value === 'bigint' ? { __type: 'bigint', value: value.toString() } : value
}

/**
 * Deserialize a bigint value from storage in JSON.parse().
 *
 * This checks for a __type property, and if found, converts the value back to a bigint.
 */
export function deserializeBigints(key: string, value: any) {
  if (value === null || typeof value !== 'object' || value.__type !== 'bigint') return value
  return BigInt(value.value)
}

/**
 * Given an array of items, add a separator between every one of them.
 * This is a replacement for Array.join() on a list of JSX elements
 */
export function interleave(arr: string[], glue: string): string[]
export function interleave(arr: JSX.Element[], glue: string): (JSX.Element | string)[]
export function interleave(arr: (JSX.Element | string)[], glue: string = ', '): (JSX.Element | string)[] {
  let formatted: (JSX.Element | string)[] = []
  arr.forEach((field, index) => {
    formatted.push(field)
    if (index < arr.length - 1) formatted.push(glue)
  })
  return formatted
}

/**
 * Given an array of items, make a comma-separated list of them, including ", and" for the joiningof the last item,
 * to make a grammatically-correct English phrase.
 */
export function makeCommaList(arr: (string | number)[] | readonly (string | number)[]): string
export function makeCommaList(arr: JSX.Element[]): JSX.Element[]
export function makeCommaList(
  arr: (JSX.Element | string | number)[] | readonly (string | number)[]
): (JSX.Element | string)[] | string {
  const parsed = arr.map((r) => (typeof r == 'number' ? String(r) : r))
  if (parsed.length == 0) return []
  if (parsed.length == 1) {
    return typeof parsed[0] == 'string' ? parsed[0] : [parsed[0]]
  }
  if (parsed.length == 2) {
    return typeof parsed[0] == 'string' && typeof parsed[1] == 'string'
      ? `${parsed[0]} and ${parsed[1]}`
      : [parsed[0], 'and', parsed[1]]
  }
  let formatted: (JSX.Element | string)[] = []
  let onlyStrings = true
  arr.forEach((field, index) => {
    if (typeof field !== 'string' && typeof field !== 'number') onlyStrings = false
    formatted.push(typeof field == 'number' ? String(field) : field)
    if (index < arr.length - 2) {
      formatted.push(', ')
    } else if (index == arr.length - 2) {
      formatted.push(', and ')
    }
  })
  return onlyStrings ? formatted.join('') : formatted
}

export function debounce<T extends (...args: any) => void>(func: T, timeout = 300) {
  let timer: number
  return (...args: Parameters<T>): void => {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      func.apply(null, args)
    }, timeout)
  }
}

/**
 * Pick a random element from an array
 */
export function pluck<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('Cannot pluck from an empty array!')
  }
  return arr[Math.floor(Math.random() * arr.length)]
}

interface VerifiedAddressMeta {
  address: Address
  chainId: number
  issued?: string
  expires: string
}

interface BaseCartItem {
  type: string
  id: string
  label: string
}
export interface AccessoryCartItem extends BaseCartItem {
  type: 'ACCESSORY'
  accessory: {
    id: number
    name: string
    background: boolean
    price: string
  }
  moonCat: number
  palette: number
  zIndex: number
}

/**
 * Placeholder type; we expect there to be more in the future,
 * so this forces all code to expect that right away.
 */
interface MockCartItem extends BaseCartItem {
  type: 'MOCK'
}

export type CartItem = AccessoryCartItem | MockCartItem

export interface AppGlobalState {
  verifiedAddresses: {
    status: FetchStatus
    value: VerifiedAddressMeta[]
  }
  viewPreference: MoonCatViewPreference
  awokenMoonCats: Set<number>
}

/**
 * Keys used to identify application-wide actions that can be passed through the global state reducer.
 */
export enum AppGlobalActionType {
  SET_VIEW_PREFERENCE = 'Meow',
  UPDATE_VERIFIED_ADDRESSES = 'I like space!',
  AWAKEN = 'Here kitty, kitty, kitty!',
  UPDATE_ACTION = 'Something to do',
  DELETE_ACTION = 'I changed my mind',
  RESET_ACTIONS = 'More actions to take!',
  AWARDED_PRIZE = 'Anyone solved the Accessory 572 riddle yet?',
  USE_ATOB = 'SGVsbG8gdGhlcmUh',
}

/**
 * Reducer Action to signify the user has changed their preferred MoonCat view style
 */
export interface AppGlobalViewAction {
  type: AppGlobalActionType.SET_VIEW_PREFERENCE
  payload: AppGlobalState['viewPreference']
}

/**
 * Reducer Action to signify the user has signed in or out, updating which addresses are currently verified
 */
export interface AppGlobalVerifiedAddressesAction {
  type: AppGlobalActionType.UPDATE_VERIFIED_ADDRESSES
  payload: AppGlobalState['verifiedAddresses']
}

/**
 * Reducer Action to signify a MoonCat should awaken and start walking around!
 */
export interface AppGlobalAwakenAction {
  type: AppGlobalActionType.AWAKEN
  payload: number
}

/**
 * Application-wide Reducer Action
 */
export type AppGlobalAction = AppGlobalViewAction | AppGlobalVerifiedAddressesAction | AppGlobalAwakenAction

/**
 * Determine if a the visitor has signed in fully with any addresses
 */
export async function doUserCheck(dispatch: Function | null) {
  if (dispatch == null) return
  dispatch({
    type: AppGlobalActionType.UPDATE_VERIFIED_ADDRESSES,
    payload: {
      status: 'pending',
      value: [],
    },
  } as AppGlobalVerifiedAddressesAction)
  try {
    let res = await fetch('/api/me')
    let data = await res.json()
    dispatch({
      type: AppGlobalActionType.UPDATE_VERIFIED_ADDRESSES,
      payload: {
        status: 'done',
        value: data.addresses,
      },
    } as AppGlobalVerifiedAddressesAction)
  } catch (err) {
    console.error(err)
    dispatch({
      type: AppGlobalActionType.UPDATE_VERIFIED_ADDRESSES,
      payload: {
        status: 'error',
        value: [],
      },
    } as AppGlobalVerifiedAddressesAction)
  }
}

export async function switchToChain(targetChain: number): Promise<boolean> {
  if (process.env.NODE_ENV == 'development') return true // In development, don't take action, so custom networks can override
  const { chain } = getAccount(config)
  if (typeof chain == 'undefined' || chain.id == targetChain) return true

  try {
    await switchChain(config, { chainId: targetChain })
  } catch (err) {
    return false
  }
  return true
}

export const PREFERENCE_MOONCATVIEW_KEY = 'mooncatview'
export const PREFERENCE_MOONCATVIEWCHANGE_KEY = 'mooncatviewchange'
export const PREFERENCE_CART_KEY = 'cart'
export function getViewPreference(): MoonCatViewPreference {
  if (typeof window == 'undefined') return 'accessorized'
  const params = new URLSearchParams(window.location.search)

  // Set MoonCat view style preference
  const queryPreference = params.get('view')
  if (queryPreference !== null && isValidViewPreference(queryPreference)) {
    // Query parameter takes priority
    return queryPreference as MoonCatViewPreference
  } else {
    // Check local storage
    let savedPreference = localStorage.getItem(PREFERENCE_MOONCATVIEW_KEY) as MoonCatViewPreference | null
    if (savedPreference != null) {
      console.debug('Setting view preference:', savedPreference)
      return savedPreference
    } else {
      console.debug('Setting default view preference')
      return 'accessorized'
    }
  }
}

export interface EcosystemEvent {
  label: string
  start: string
  end: string
}
/**
 * Query the API server to see if there's a MoonCatRescue-wide ecosystem party/event going on
 */
export async function getCurrentEvent(): Promise<EcosystemEvent | null> {
  let jsonData = null
  try {
    let rs = await fetch(`${API_SERVER_ROOT}/events`, { next: { revalidate: 3600 } })
    jsonData = await rs.json()
  } catch (err) {
    console.error('Failed to fetch events', err)
  }
  if (!Array.isArray(jsonData)) {
    console.error('Failed to fetch event data', jsonData)
    return null
  }
  const now = new Date()
  const activeEvents = jsonData.filter((e) => {
    return new Date(e.start) < now && new Date(e.end) > now
  })
  if (activeEvents.length == 0) {
    return null
  }
  return activeEvents[0]
}

interface MomentToken {
  id: number
  moment: number
  tokenURI: string
  eventDate: number
  meta: MomentMeta
}
/**
 * Assemble a listing of all known Moment token IDs, and the associated Moment group they belong to
 */
export function getAllMoments() {
  const moments: Moment[] = require('lib/moments_meta.json')
  let allMoments: MomentToken[] = []
  for (let m of moments) {
    for (let i = 0; i < m.issuance; i++) {
      const id = i + m.startingTokenId
      allMoments[id] = {
        id,
        moment: m.momentId,
        tokenURI: m.tokenURI,
        eventDate: m.eventDate,
        meta: m.meta,
      }
    }
  }
  return allMoments
}

const filterEnumProps: string[] = ['classification', 'pale', 'facing', 'named', 'adoptable']

const filterArrayProps: string[] = ['hue', 'expression', 'pattern', 'pose']

const filterNumberArrayProps: string[] = ['hueInt', 'accessories', 'namedYear', 'rescueYear']

/**
 * Type predicate for MoonCatFilterSettings
 *
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 * Checks a bare object to ensure it follows the Type of a MoonCatFilterSettings object,
 * so it can be cast to it safely with Typescript after that point.
 */
function validateFilterSettings(arg: any): arg is MoonCatFilterSettings {
  if (typeof arg != 'object') return false

  // Check all properties that should be simple, single string values
  for (const k of filterEnumProps) {
    if (typeof arg[k] != 'undefined') {
      if (typeof arg[k] != 'string') return false // These properties should be single, string values. If they're an array or number, that's invalid
      if (arg[k].toLowerCase() != arg[k]) return false // These properties should have values that are all lower-case (to make query strings consistent)
    }
  }

  // Check all properties that can be multi-selected
  for (const k of filterArrayProps) {
    if (typeof arg[k] != 'undefined') {
      if (!Array.isArray(arg[k])) return false
    }
  }

  // Check all properties that should be lists of numbers
  for (const k of filterNumberArrayProps) {
    if (typeof arg[k] !== 'undefined') {
      if (!Array.isArray(arg[k])) return false
      for (const r of arg[k]) {
        if (typeof r !== 'number') return false
      }
    }
  }

  // Check other types of properties
  if (typeof arg.nameKeyword != 'undefined' && typeof arg.nameKeyword != 'string') return false // Name Keyword filter may have upper-case letters

  return true
}

export function queryToFilterSettings(query: Record<string, string>): MoonCatFilterSettings | null {
  const filters: any = {}

  // Parse any properties that are simple, single string values
  for (const prop of filterEnumProps) {
    if (typeof query[prop] != 'undefined' && query[prop] !== '') {
      filters[prop] = query[prop]
    }
  }

  // Parse any properties that are multi-select options
  for (const prop of filterArrayProps) {
    if (typeof query[prop] != 'undefined' && query[prop] !== '') {
      filters[prop] = query[prop].split(',')
    }
  }

  // Parse any properties that should be min/max number pairs
  for (const prop of filterNumberArrayProps) {
    if (typeof query[prop] !== 'undefined' && query[prop] !== '') {
      filters[prop] = query[prop].split(',').map((n) => parseInt(n))
    }
  }

  // Parse other types of properties
  if (typeof query.nameKeyword != 'undefined' && query.nameKeyword !== '') {
    filters.nameKeyword = query.nameKeyword
  }

  if (!validateFilterSettings(filters)) return null
  return filters
}

export function filterMoonCatList(
  mooncats: MoonCatData[],
  filters: MoonCatFilterSettings,
  adoptable: Set<number> = new Set()
) {
  return mooncats.filter((moonCat) => {
    if (typeof filters.rescueYear != 'undefined') {
      if (!filters.rescueYear.includes(moonCat.rescueYear)) return false
    }
    if (typeof filters.classification != 'undefined') {
      if (filters.classification == 'genesis' && typeof moonCat.genesis == 'undefined') return false
      if (filters.classification == 'rescue' && moonCat.genesis == true) return false
    }
    if (typeof filters.hue != 'undefined') {
      if (!filters.hue.includes(moonCat.hueName)) return false
    }
    if (typeof filters.hueInt != 'undefined') {
      if (moonCat.hueInt < filters.hueInt[0]) return false
      if (moonCat.hueInt > filters.hueInt[1]) return false
    }
    if (typeof filters.pale != 'undefined') {
      switch (filters.pale) {
        case 'no':
          if (moonCat.pale === true) return false
          break
        case 'yes':
          if (typeof moonCat.pale == 'undefined' || moonCat.pale === false) return false
          break
      }
    }
    if (typeof filters.facing != 'undefined') {
      if (filters.facing != moonCat.facing) return false
    }
    if (typeof filters.expression != 'undefined') {
      if (!filters.expression.includes(moonCat.expression)) return false
    }
    if (typeof filters.pattern != 'undefined') {
      if (!filters.pattern.includes(moonCat.pattern)) return false
    }
    if (typeof filters.pose != 'undefined') {
      if (!filters.pose.includes(moonCat.pose)) return false
    }
    if (typeof filters.named != 'undefined') {
      switch (filters.named) {
        case 'no':
          if (typeof moonCat.nameRaw != 'undefined') return false
          break
        case 'yes':
          if (typeof moonCat.nameRaw == 'undefined') return false
          break
        case 'valid':
          if (typeof moonCat.nameRaw == 'undefined') return false
          if (moonCat.name === true) return false
          break
        case 'invalid':
          if (typeof moonCat.nameRaw == 'undefined') return false
          if (moonCat.name !== true) return false
          break
      }
    }
    if (typeof filters.nameKeyword != 'undefined') {
      if (typeof moonCat.nameRaw == 'undefined') return false // Has no name
      if (filters.nameKeyword.substring(0, 2) == '0x') {
        // Search the raw name
        if (moonCat.nameRaw.substring(2).indexOf(filters.nameKeyword.substring(2).toLowerCase()) < 0) return false
      } else {
        // Search the parsed name
        if (moonCat.name === true) return false
        if (moonCat.name!.toLowerCase().indexOf(filters.nameKeyword.toLowerCase()) < 0) return false
      }
    }
    if (typeof filters.namedYear != 'undefined') {
      if (typeof moonCat.namedYear == 'undefined' || !filters.namedYear.includes(moonCat.namedYear)) return false
    }
    if (typeof filters.accessories != 'undefined') {
      const ownedAccessories = moonCat.ownedAccessories ?? 0
      if (ownedAccessories < filters.accessories[0]) return false
      if (ownedAccessories > filters.accessories[1]) return false
    }
    if (typeof filters.adoptable != 'undefined') {
      if (filters.adoptable[0].toLowerCase() === 'y' && !adoptable.has(moonCat.rescueOrder)) return false
      if (filters.adoptable[0].toLowerCase() === 'n' && adoptable.has(moonCat.rescueOrder)) return false
    }
    return true
  })
}

/**
 * Turn a numeric HSL hue value into a human-friendly color label
 */
export function getMoonCatColorLabel(hue: number) {
  if (hue == 2000) {
    return 'White'
  } else if (hue == 1000) {
    return 'Black'
  } else if (hue < 16) {
    return 'Red'
  } else if (hue < 46) {
    return 'Orange'
  } else if (hue < 76) {
    return 'Yellow'
  } else if (hue < 106) {
    return 'Chartreuse'
  } else if (hue < 136) {
    return 'Green'
  } else if (hue < 166) {
    return 'Teal'
  } else if (hue < 196) {
    return 'Cyan'
  } else if (hue < 226) {
    return 'Sky Blue'
  } else if (hue < 256) {
    return 'Blue'
  } else if (hue < 286) {
    return 'Purple'
  } else if (hue < 316) {
    return 'Magenta'
  } else if (hue < 346) {
    return 'Fuchsia'
  } else {
    return 'Red'
  }
}

interface ParsedMoonCatK {
  pale: boolean
  facing: MoonCatData['facing']
  expression: MoonCatData['expression']
  pattern: MoonCatData['pattern']
  pose: MoonCatData['pose']
}

export function parseMoonCatK(k: number): ParsedMoonCatK {
  /**
   * Each bit of the "K" byte is a flag value to represent different traits of the MoonCat:
   * ┌──────────────── pale colors (0: no, 1: yes)
   * │ ┌────────────── facing (0: left, 1: right)
   * │ │   ┌────────── expression (00: smiling, 01: grumpy, 10: pouting, 11: shy)
   * │ │   │   ┌────── pattern (00: pure, 01: tabby, 10: spotted, 11: tortie)
   * │ │   │   │   ┌── pose (00: standing, 01: sleeping, 10: pouncing, 11: stalking)
   * │ │ ┌─┤ ┌─┤ ┌─┤
   * 0 1 2 3 4 5 6 7
   */
  const kBinary = ('00000000' + k.toString(2)).slice(-8)
  const expressions = ['smiling', 'grumpy', 'pouting', 'shy'] as const
  const patterns = ['pure', 'tabby', 'spotted', 'tortie'] as const
  const poses = ['standing', 'sleeping', 'pouncing', 'stalking'] as const
  return {
    pale: kBinary[0] == '1',
    facing: kBinary[1] == '1' ? 'right' : 'left',
    expression: expressions[parseInt(kBinary.slice(2, 4), 2)],
    pattern: patterns[parseInt(kBinary.slice(4, 6), 2)],
    pose: poses[parseInt(kBinary.slice(6, 8), 2)],
  }
}
export function formatMoonCatK(k: ParsedMoonCatK): number {
  const expressions = ['smiling', 'grumpy', 'pouting', 'shy'] as const
  const patterns = ['pure', 'tabby', 'spotted', 'tortie'] as const
  const poses = ['standing', 'sleeping', 'pouncing', 'stalking'] as const
  const kBinary =
    (k.pale ? '1' : '0') +
    (k.facing == 'right' ? '1' : '0') +
    ('00' + expressions.indexOf(k.expression).toString(2)).slice(-2) +
    ('00' + patterns.indexOf(k.pattern).toString(2)).slice(-2) +
    ('00' + poses.indexOf(k.pose).toString(2)).slice(-2)
  return parseInt(kBinary, 2)
}

export function parseAccessoryMetabyte(meta: number) {
  /**
   * Each bit of the "meta" property is a flag value to represent different behaviors for the Accessory:
   * ┌──────────────── verified
   * │ ┌────────────── unused
   * │ │ ┌──────────── unused
   * │ │ │   ┌──────── content rating (00: everyone, 01: teen, 10: mature, 11: adult)
   * │ │ │   │ ┌────── mirror accessory placement for left/right-facing MoonCats
   * │ │ │   │ │ ┌──── mirror accessory visual for left/right-facing MoonCats
   * │ │ │ ┌─┤ │ │ ┌── is a background accessory (drawn behind the MoonCat)
   * 0 1 2 3 4 5 6 7
   */
  const metaBinary = ('00000000' + meta.toString(2)).slice(-8)
  return {
    verified: metaBinary[0] == '1',
    audience: parseInt(metaBinary.slice(3, 5), 2),
    mirrorPlacement: metaBinary[5] == '1',
    mirrorAccessory: metaBinary[6] == '1',
    background: metaBinary[7] == '1',
  }
}

export function formatAccessoryMetabyte({
  verified,
  audience,
  mirrorPlacement,
  mirrorAccessory,
  background,
}: {
  verified: boolean
  audience: number
  mirrorPlacement: boolean
  mirrorAccessory: boolean
  background: boolean
}) {
  if (audience > 3) throw new Error('Audience value out of bounds')
  const metaBinary =
    (verified ? '1' : '0') +
    '00' +
    ('00' + audience.toString(2)).slice(-2) +
    (mirrorPlacement ? '1' : '0') +
    (mirrorAccessory ? '1' : '0') +
    (background ? '1' : '0')
  return parseInt(metaBinary, 2)
}

/**
 * Type structure for LibMoonCat functions
 */
export interface AccessoryImageDetails {
  id: number
  idat: string
  palettes: number[][]
  positions: [number, number][]
  width: number
  height: number
  meta: number
  paletteIndex?: number
  zIndex?: number
}

export async function getAccessoryImageDetails(
  accessories: (bigint | number | string)[]
): Promise<AccessoryImageDetails[]> {
  const ACCESSORIES = {
    address: ACCESSORIES_ADDRESS,
    abi: parseAbi([
      'function accessoryImageData(uint256 accessoryId) external view returns (bytes2[4] positions, bytes8[7] palettes, uint8 width, uint8 height, uint8 meta, bytes IDAT)',
    ]),
    chainId: 1,
  } as const

  const imageCalls = accessories.map(
    (id) =>
      ({
        ...ACCESSORIES,
        functionName: 'accessoryImageData',
        args: [BigInt(id)],
      } as const)
  )
  const accImage = await multicall(config, { contracts: imageCalls, chainId: 1, allowFailure: false })
  return accessories.map((id, index) => ({
    id: Number(id),
    idat: accImage[index][5],
    palettes: accImage[index][1].map((hex) => Array.from(hexToBytes(hex))),
    positions: accImage[index][0].map((hex) => Array.from(hexToBytes(hex)) as [number, number]),
    width: accImage[index][2],
    height: accImage[index][3],
    meta: accImage[index][4],
  }))
}

/**
 * Convert an Accessory Eligible list into a list of MoonCats that are allowed.
 */
export function getEligibleMoonCats(eligibleList: `0x${string}`[], forceActive: boolean = false) {
  const eligibleListIsActive = BigInt(eligibleList[99]) & 1n
  if (!eligibleListIsActive && !forceActive) return false
  const eligibleMoonCats = []
  for (let rescueOrder = 0; rescueOrder < 25440; rescueOrder++) {
    const wordIndex = Math.floor(rescueOrder / 256)
    const bitIndex = rescueOrder % 256
    const isEligible = BigInt(eligibleList[wordIndex]) & (1n << BigInt(255 - bitIndex))
    if (isEligible) eligibleMoonCats.push(rescueOrder)
  }
  return eligibleMoonCats
}
