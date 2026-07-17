import { Abi, Address, ContractFunctionArgs, ContractFunctionName } from 'viem'
import { readContract, WriteContractParameters, SendTransactionParameters } from 'wagmi/actions'
import { AttestationDraft } from './eas'
import { config } from './wagmi-config'
import { useContext } from 'react'
import { ActionQueueContext } from './ActionsQueueProvider'
import useTxStatus from './useTxStatus'
import { usePublicClient } from 'wagmi'

/**
 * Core parameters for a step that triggers a `writeContract` or `sendTransaction` action
 */
export interface ContractActionStepBase<
  abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> = ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  >
> {
  type: 'CONTRACT'
  label: string
  config:
    | WriteContractParameters<
        abi,
        functionName,
        ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
        typeof config,
        (typeof config)['chains'][number]['id']
      >
    | SendTransactionParameters<typeof config, (typeof config)['chains'][number]['id']>
  /**
   * Optional precheck function. If provided, it will be called, passing in an instance of the readContract function.
   * If the precheck function returns true, the step will be considered complete.
   *
   * @example
   * precheck: async (rc) => {
   *   const allowance = await rc({
   *     address: TOKEN_ADDRESS,
   *     abi: erc20Abi,
   *     functionName: 'allowance',
   *     args: [userAddress, spenderAddress]
   *   })
   *   return allowance >= amountNeeded
   * }
   */
  precheck?: (rc: typeof readContract) => Promise<boolean>
  userAddress: Address
}

/**
 * A ContractStep that is not finalized.
 * If it has a `txPending` property, it has been submitted to the mempool, but is not yet on-chain.
 */
export interface ContractStepPending<
  abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> = ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  >
> extends ContractActionStepBase<abi, functionName> {
  txPending?: {
    hash: `0x${string}`
    timestamp: number
  }
}

/**
 * A ContractStep that was skipped because the precheck returned true.
 */
export interface ContractStepSkipped<
  abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> = ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  >
> extends ContractActionStepBase<abi, functionName> {
  skipped: true
}

/**
 * A ContractStep that was executed and is now on-chain.
 */
export interface ContractStepComplete<
  abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> = ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  >
> extends ContractActionStepBase<abi, functionName> {
  tx: {
    hash: `0x${string}`
    timestamp: number
  }
}

/**
 * Helper function for Contract Steps
 *
 * Typescript only infers generic types from arguments to functions, so in order to not be so verbose with types
 * when saving an object separately from using it in a function, this function can be used.
 *
 * See ADR0014 for further details.
 */
export function constructContractStep<
  const abi extends Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>
>(step: ContractStepPending<abi, functionName>): ContractStepPending<abi, functionName> {
  return step
}

export interface AttestationStepPending {
  type: 'ATTEST'
  label: string
  msg: AttestationDraft
  chainId: number
  userAddress: Address
}
export interface AttestationStepComplete extends AttestationStepPending {
  uid: `0x${string}`
  timestamp: number
}

export interface RevokeAttestationsStepPending {
  type: 'REVOKE'
  label: string
  uids: `0x${string}`[]
  chainId: number
  userAddress: Address
}
export interface RevokeAttestationsStepComplete extends RevokeAttestationsStepPending {
  timestamp: number
}

export type ActionStep<
  abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> = ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  >
> =
  | ContractStepPending<abi, functionName>
  | ContractStepSkipped<abi, functionName>
  | ContractStepComplete<abi, functionName>
  | AttestationStepPending
  | AttestationStepComplete
  | RevokeAttestationsStepPending
  | RevokeAttestationsStepComplete

interface BaseAction<
  abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> = ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  >
> {
  id: string
  label: string
  fromAddress: Address
  steps: ActionStep<abi, functionName>[]
}
export interface ModifyUserListAction extends BaseAction {
  listTitle: string
}
export interface ContractAction<
  abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> = ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  >
> extends BaseAction<abi, functionName> {
  steps: (
    | ContractStepPending<abi, functionName>
    | ContractStepSkipped<abi, functionName>
    | ContractStepComplete<abi, functionName>
  )[]
}

export type Action<
  abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> = ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  >
> = BaseAction | ModifyUserListAction | ContractAction<abi, functionName>

export function actionIsComplete<
  abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> = ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  >
>(action: BaseAction<abi, functionName>) {
  return !action.steps.some((s) => !stepIsComplete<abi, functionName>(s))
}

export function stepIsComplete<
  const abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> = ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  >
>(step: ActionStep<abi, functionName>) {
  switch (step.type) {
    case 'CONTRACT': {
      return 'tx' in step || 'skipped' in step
    }
    case 'ATTEST': {
      return 'uid' in step
    }
    case 'REVOKE': {
      return 'timestamp' in step
    }
    default: {
      throw new Error(`Unknown step type '${(step as any).type}'`)
    }
  }
}

/**
 * Worker utility that can process a ContractAction and all its included steps.
 * Processes the steps sequentially, handling prechecks, transactions, and state updates. Integrates with ActionQueueContext for state management.
 */
export function useContractActionProcessor() {
  const { dispatch, actions } = useContext(ActionQueueContext)
  const { viewMessage, isProcessing, setStatus, processTransaction } = useTxStatus()
  const publicClient = usePublicClient()

  async function doAction(action: ContractAction): Promise<boolean> {
    if (!publicClient) {
      setStatus('error', 'No connection to mission control! Please check network connection.')
      return false
    }

    dispatch({
      type: 'UPDATE',
      payload: action,
    })
    setStatus('building')
    for (let i = 0; i < action.steps.length; i++) {
      const step = action.steps[i]
      if (stepIsComplete(step)) continue

      if (step.type !== 'CONTRACT') {
        setStatus('error', 'Cosmic microwave interference! Failed to parse that action')
        return false
      }

      // Do the Contract interaction

      // First, if there is a precheck, check it
      if (step.precheck && (await step.precheck(readContract))) {
        // Precheck passed, so this step can be skipped
        action.steps[i] = { ...step, skipped: true }
        dispatch({
          type: 'UPDATE',
          payload: action,
        })
        continue
      }

      // No precheck, or precheck failed. Do the transaction.
      try {
        const rs = await processTransaction(step.config)
        if (!rs) {
          setStatus('error', 'Communications jammed! Transaction could not be sent')
          return false
        }
        if (rs.status == 'reverted') {
          setStatus('error', 'Signal lost... Transaction was added to the blockchain, but reverted.')
          return false
        }

        // Interaction was successful. Mark this step as complete
        const block = await publicClient.getBlock({ blockNumber: rs.blockNumber })
        action.steps[i] = {
          ...step,
          tx: {
            hash: rs.transactionHash,
            timestamp: Number(block.timestamp),
          },
        }
        dispatch({
          type: 'UPDATE',
          payload: action,
        })
      } catch (err) {
        setStatus('error', `Unexpected failure: ${(err as Error).message}`)
        return false
      }
    }
    return true
  }

  async function continueAction(id: string) {
    const action = actions.find((a) => a.id == id)
    if (typeof action == 'undefined') {
      setStatus('error', 'Cosmic microwave interference! Failed to find that action')
      return false
    }
    const rs = action.steps.findIndex((s) => s.type !== 'CONTRACT')
    if (rs >= 0) {
      setStatus(
        'error',
        `Cosmic microwave interference! Unable to parse ${action.steps[rs].type} steps in these actions`
      )
      return false
    }
    return doAction(action as ContractAction)
  }

  return {
    viewMessage,
    isProcessing,
    doAction,
    continueAction,
  }
}
