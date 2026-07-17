import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createSiweMessage, SiweMessage, validateSiweMessage } from 'viem/siwe'
import { mainnetClient } from 'lib/publicClient'
import { MomentFilterSettings, MoonCatFilterSettings } from 'lib/types'
import { TREASURES_COLLECTION, USER_SESSION_COLLECTION } from 'lib/util'

// Use the Firebase Admin SDK to access Firestore.
export function getAppFirestore(): FirebaseFirestore.Firestore {
  const existingApps = getApps()
  if (existingApps.length > 0) {
    return getFirestore(existingApps[0])
  } else {
    initializeApp()
    const db = getFirestore()
    db.settings({ ignoreUndefinedProperties: true })
    return db
  }
}

export async function isSessionValid(siwe: SiweMessage, signature: `0x${string}`): Promise<boolean> {
  const db = getAppFirestore()

  // Get the expected nonce from the database, not the user session
  const dbSession = await db.collection(USER_SESSION_COLLECTION).doc(`${siwe.address}-${siwe.chainId}`).get()
  if (!dbSession.exists) {
    // No saved session on the server-side
    return false
  }
  const expectedNonce = dbSession.get('nonce')
  if (!expectedNonce) {
    console.error('Corrupted user session in database', dbSession.data())
    return false
  }

  // Verify the SIWE message is still valid (nonce as expected, not expired, etc.)
  if (
    !validateSiweMessage({
      message: siwe,
      nonce: expectedNonce,
      time: new Date(),
    })
  ) {
    return false
  }
  if (!siwe.address) return false
  if (!mainnetClient.verifySiweMessage({ message: createSiweMessage(siwe), signature })) {
    return false
  }

  return true
}

export interface SearchTreasure {
  type: 'search'
  label: string
  icon?: string
  details?: string
  ipfs: string
  criteria:
    | {
        moonCat: MoonCatFilterSettings[]
      }
    | {
        moment: MomentFilterSettings[]
      }
}

interface TreasureMapping {
  [assedId: number]: string
}
export interface MappedTreasure {
  type: 'mapped'
  label: string
  icon?: string
  details?: string
  mapping:
    | {
        moonCat: TreasureMapping
      }
    | {
        moment: TreasureMapping
      }
}

export type Treasure = SearchTreasure | MappedTreasure

export async function getTreasures() {
  const db = getAppFirestore()

  const snapshot = await db.collection(TREASURES_COLLECTION).get()
  return snapshot.docs.map((d) => d.data()) as Treasure[]
}
