import { NFTX_POOL_CONFIG, NftxAdoptType, splitNftxId, VAULT_TOKENS_RANDOM, VAULT_TOKENS_SPECIFIC } from 'lib/nftxUtils'
import { getQueryInt } from 'lib/util'
import zeroxPrice from 'lib/zeroxPrice'
import zeroxQuote from 'lib/zeroxQuote'
import { NextRequest } from 'next/server'
import { isAddress, parseEther } from 'viem'

const API_KEY = process.env['ZEROX_API_KEY']

const headers = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
}

/**
 * Take the requested adoption type and quantity, and return the amount of vault tokens that will be needed to make that adoption
 */
function parseAdoptType(adoptType: NftxAdoptType, searchParams: URLSearchParams): bigint {
  let quantity = BigInt(getQueryInt(searchParams.get('quantity'), 1))
  switch (adoptType) {
    case 'specific':
      // Adopt specific MoonCat(s) from the vault
      return VAULT_TOKENS_SPECIFIC * quantity
    case 'random':
      // Adopt random MoonCat(s) from the vault
      return VAULT_TOKENS_RANDOM * quantity
    default: {
      // Purchase an exact amount of tokens. The request then needs to specify the amount as a parameter
      const amount = searchParams.get('amount')
      if (amount == null) return VAULT_TOKENS_SPECIFIC
      return parseEther(amount)
    }
  }
}

export async function GET(request: NextRequest, ctx: RouteContext<'/api/nftx-price/[id]'>) {
  const { id } = await ctx.params
  if (typeof API_KEY == 'undefined' || API_KEY == '') {
    console.error('[nftx-price] No 0x API key set!')
    return Response.json({ ok: false }, { status: 500 })
  }
  console.log('[nftx-price] Fetching from 0x API...', API_KEY.slice(0,5))
  const searchParams = request.nextUrl.searchParams

  // What currency should be exchanged for vault tokens?
  const rawCurrency = searchParams.get('currency')
  const sellCurrency = rawCurrency == null ? 'eth' : rawCurrency.toLowerCase() == 'weth' ? 'weth' : 'eth'

  const adoptTypeSlug = id
  if (typeof adoptTypeSlug == 'undefined' || Array.isArray(adoptTypeSlug)) {
    return Response.json({ ok: false }, { status: 400 })
  }
  const [tokenName, adoptType] = splitNftxId(adoptTypeSlug)
  if (tokenName == null || adoptType == null) {
    return Response.json({ ok: false }, { status: 400 })
  }
  const tokenAmount = parseAdoptType(adoptType, searchParams)

  // First get a price quote for this token
  // https://0x.org/docs/0x-swap-api/guides/swap-tokens-with-0x-swap-api#1-get-an-indicative-price
  let jsonData
  try {
    jsonData = await zeroxPrice(API_KEY, NFTX_POOL_CONFIG[tokenName].address, tokenAmount.toString(), sellCurrency)
  } catch (err) {
    console.error('Error fetching 0x price:', err)
    return Response.json({ ok: false }, { status: 502 })
  }

  const commit = searchParams.get('commit')
  if (!commit || commit.toLowerCase()[0] !== 'y') {
    // User is not committing to the purchase, so just return the quote
    return Response.json(
      {
        blockNumber: jsonData.blockNumber,
        WETH: jsonData.sellAmount,
      },
      { headers }
    )
  }

  // User is wanting a swap commitment. Turn this into an actual quote
  // https://0x.org/docs/0x-swap-api/guides/swap-tokens-with-0x-swap-api#3-fetch-a-firm-quote
  const taker = searchParams.get('taker')
  if (taker == null || !isAddress(taker)) {
    return Response.json({ ok: false }, { status: 400 })
  }
  try {
    jsonData = await zeroxQuote(API_KEY, NFTX_POOL_CONFIG[tokenName].address, jsonData.sellAmount, taker, sellCurrency)
  } catch (err) {
    console.error('Error fetching 0x quote:', err)
    return Response.json({ ok: false }, { status: 502 })
  }
  if (BigInt(jsonData.minBuyAmount) < tokenAmount) {
    console.error('0x quote is too low', tokenAmount - BigInt(jsonData.minBuyAmount))
    return Response.json({ ok: false }, { status: 500 })
  }

  return Response.json(jsonData, { headers })
}
