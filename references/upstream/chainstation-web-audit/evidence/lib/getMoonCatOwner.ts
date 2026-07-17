import { Address } from 'viem'
import { ACCLIMATOR_ADDRESS, API2_SERVER_ROOT, JUMPPORT_ADDRESS, RESCUE_ADDRESS } from './util'

export const getMoonCatOwner = async function (rescueOrder: number | bigint): Promise<false | Address> {
  const rs = await fetch(`${API2_SERVER_ROOT}/mooncat/traits/${Number(rescueOrder)}`, { next: { revalidate: 3600 } })
  if (!rs.ok) {
    return false
  }
  const traits = await rs.json()

  if (typeof traits.owner == 'undefined') {
    console.error('No owner information for MoonCat', rescueOrder)
  } else if (traits.owner.value?.value) {
    // Use aggregated owner from back-end
    return traits.owner.value.value
  } else if (traits.owner[RESCUE_ADDRESS] && traits.owner[RESCUE_ADDRESS].value != ACCLIMATOR_ADDRESS) {
    // MoonCat is not Acclimated; use ownership from original contract
    return traits.owner[RESCUE_ADDRESS].value
  } else if (traits.owner[ACCLIMATOR_ADDRESS] && traits.owner[ACCLIMATOR_ADDRESS].value != JUMPPORT_ADDRESS) {
    // MoonCat is Acclimated, and not in the JumpPort; use the Acclimator ownership value
    return traits.owner[ACCLIMATOR_ADDRESS].value
  } else if (traits.owner[JUMPPORT_ADDRESS]) {
    // Use the JumpPort ownership value
    return traits.owner[JUMPPORT_ADDRESS].value
  }
  return false
}
