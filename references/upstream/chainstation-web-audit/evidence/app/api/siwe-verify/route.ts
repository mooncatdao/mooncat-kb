import { cookies } from 'next/headers'
import { Timestamp } from 'firebase-admin/firestore'
import { getIronSession, IronSessionData } from 'iron-session'
import { parseSiweMessage, SiweMessage, validateSiweMessage } from 'viem/siwe'
import { getAppFirestore } from 'lib/firebase'
import ironOptions from 'lib/ironOptions'
import { mainnetClient } from 'lib/publicClient'
import { SIWE_LOGIN_STATEMENT, USER_SESSION_COLLECTION } from 'lib/util'
import { LocalUserSession } from 'additional'

export async function POST(request: Request) {
  function finalize(rs: boolean) {
    return Response.json({ ok: rs })
  }
  const session = await getIronSession<IronSessionData>(await cookies(), ironOptions)
  try {
    const { message, signature } = await request.json()
    const siweMessage = parseSiweMessage(message)
    if (siweMessage.statement != SIWE_LOGIN_STATEMENT) {
      // Not the proper statement to sign
      console.error(`api/siwe-verify: User signed message ${siweMessage.statement}, which is not recognized`)
      return finalize(false)
    }

    // SIWE messages don't need to have an expiration time. For our implementation, force login messages to have one.
    if (typeof siweMessage.expirationTime == 'undefined') {
      // Needs to have some expiration time
      console.error(`api/siwe-verify: message without an expiration time presented for login`)
      return finalize(false)
    }
    // For our implementation, don't allow sessions to last longer than one month
    const expirationDate = new Date(siweMessage.expirationTime)
    const startDate = typeof siweMessage.issuedAt == 'undefined' ? new Date() : new Date(siweMessage.issuedAt)
    if (expirationDate.getTime() - startDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
      console.error(
        `api/siwe-verify: message with expiration time ${siweMessage.expirationTime} presented, which is longer than a month of valid time`
      )
      return finalize(false)
    }

    if (
      !validateSiweMessage({
        message: siweMessage,
        nonce: session.nonce,
        time: new Date(),
      })
    ) {
      console.error(`api/siwe-verify: Message is not valid`, message)
      return finalize(false)
    }

    if (!mainnetClient.verifySiweMessage({ message, signature })) {
      console.error(`api/siwe-verify: Message is not properly signed`, message, signature)
      return finalize(false)
    }

    // Save session to database, overwriting any existing session for this address, on this chain
    let sessionDoc: FirebaseFirestore.DocumentData = {
      address: siweMessage.address,
      statement: siweMessage.statement,
      nonce: siweMessage.nonce,
      requestId: siweMessage.requestId,
    }
    if (siweMessage.issuedAt) {
      sessionDoc.issuedAt = Timestamp.fromDate(new Date(siweMessage.issuedAt))
    }
    if (siweMessage.expirationTime) {
      sessionDoc.expirationTime = Timestamp.fromDate(new Date(siweMessage.expirationTime))
    }
    if (siweMessage.notBefore) {
      sessionDoc.notBefore = Timestamp.fromDate(new Date(siweMessage.notBefore))
    }
    const sessionKey = `${siweMessage.address}-${siweMessage.chainId}`
    const db = getAppFirestore()
    await db.collection(USER_SESSION_COLLECTION).doc(sessionKey).set(sessionDoc)
    console.log(`api/siwe-verify: Database session saved ${sessionKey}`)

    // Save session to user cookie
    const sessionMessage: LocalUserSession['siwe'] = {
      ...(siweMessage as SiweMessage),
      expirationTime: siweMessage.expirationTime.toISOString(),
      issuedAt: siweMessage.issuedAt?.toISOString(),
    }
    if (typeof session.keyring == 'undefined' || !Array.isArray(session.keyring)) {
      // No keyring yet. Add just this one
      session.keyring = [{ siwe: sessionMessage, signature: signature }]
    } else {
      // Remove any old session info for this address, on this chain
      session.keyring = session.keyring.filter(
        (k) => k.siwe.address != siweMessage.address || k.siwe.chainId != siweMessage.chainId
      )
      session.keyring.push({
        siwe: sessionMessage,
        signature: signature,
      })
    }
    await session.save()

    return finalize(true)
  } catch (err) {
    console.error('api/siwe-verify: Unknown error in SIWE flow', err)
    return finalize(false)
  }
}
