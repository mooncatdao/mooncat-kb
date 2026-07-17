import { useQuery } from '@tanstack/react-query'
import { ACCLIMATOR_ADDRESS, API2_SERVER_ROOT, FIVE_MINUTES, MOMENTS_ADDRESS } from './util'
import { OwnerProfile, OwnedMoonCat } from './types'
import { TokenMeta, formatMoonCatRescueTokens } from './tokens'
import { numberToHex } from 'viem'

interface UseOwnedTokensResult {
  ownedTokens: TokenMeta[]
  isLoading: boolean
  isError: boolean
}

/**
 * Get a list of tokens from the MoonCatRescue ecosystem that a given address owns, formatted as TokenMeta objects
 */
const useOwnedTokens = (connectedAddress: string | undefined): UseOwnedTokensResult => {
  const ownerProfileQuery = useQuery({
    queryKey: ['owner-profile', connectedAddress],
    queryFn: async (): Promise<OwnerProfile> => {
      const rs = await fetch(`${API2_SERVER_ROOT}/owner-profile/${connectedAddress}`)
      if (!rs.ok) throw new Error('Failed to fetch owner information')
      return await rs.json()
    },
    staleTime: FIVE_MINUTES,
    enabled: !!connectedAddress,
  })

  const ownedTokensQuery = useQuery({
    queryKey: ['owned-tokens', connectedAddress, ownerProfileQuery.data],
    queryFn: async (): Promise<TokenMeta[]> => {
      if (!ownerProfileQuery.data) {
        return []
      }

      const tokens: TokenMeta[] = ownerProfileQuery.data.ownedMoonCats
        .map((mc) => {
          return formatMoonCatRescueTokens({
            collection: { address: ACCLIMATOR_ADDRESS },
            id: numberToHex(mc.rescueOrder),
          } as TokenMeta)
        })
        .concat(
          ownerProfileQuery.data.ownedMoments
            .filter((m) => typeof m.moonCat == 'undefined')
            .map((m) => {
              return formatMoonCatRescueTokens({
                collection: { address: MOMENTS_ADDRESS },
                id: numberToHex(m.momentId),
              } as TokenMeta)
            })
        )

      return tokens
    },
    enabled: !!connectedAddress && !!ownerProfileQuery.data,
  })

  return {
    ownedTokens: ownedTokensQuery.data || [],
    isLoading: ownerProfileQuery.isLoading || ownedTokensQuery.isLoading,
    isError: ownerProfileQuery.isError || ownedTokensQuery.isError,
  }
}

export default useOwnedTokens
