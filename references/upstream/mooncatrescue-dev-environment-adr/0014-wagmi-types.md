# 0014 - wagmi Types
**Updated:** <!-- DD Mon YYYY --> 25 Feb 2025

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
The `wagmi` and `viem` function `writeContract` expects a configuration object with the properties:

- `address` string that is the address of the smart contract
- `abi` constant value that is structured in Solidity JSON ABI export format
- `functionName` the string name of the function within the ABI that will be triggerred
- `args` the parameters to pass to the function
- `chainId` what EVM chain to call on

When called in one action, Typescript is very robust and can tell when the `functionName` [is not in](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAJQKYEMDG8BmUIjgcilQ3wChRJY4BvOMFKAZyQEEAjYOAXzm1wIBuwJCDIVo8WgFdmyFABMAwhAB2MKOng8+efAHcUAcxDAypNKsbwAsgE9l4VUjVwAvHAAUASjcA+GqRwcBYqVnBMbnAySHJKquqaHtSBQXAK8kSMjABccAAGAAwAHgBsBWjyABwlAExoAJyKJZUA7Cz18gCiACz1KEgVigDM7fVsLd0s3ZhoAKzdKABCJXkANClBKBy59EysHB4A2viYUioYwKp0zvLAKoYA6sAwABYZKAYANowe6ZmMcAgehUSCgPiQRRgoJUKE+cCESD04SQMCkUFCnikdxgNVmJS8+AAul51qleGcLqoAHIoEBIXL4MA3O6GVmPZ5vDRfRj4UmpAD0-LgAD0APwbNJQQw5ODHYqzLosMpIToAMRqbFVijVQxQlQKlRQNQAjPVFniTd1ZgARY1sfVseQta1EvlcLykFJEVHozwSgA8twEvgAEkhPp8IHAHtBPvJ-fyg74Uh6uJ6gA) the supplied `abi`, or if the given `args` [don't match](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAJQKYEMDG8BmUIjgcilQ3wChRJY4BvOMFKAZyQEEAjYOAXzm1wIBuwJCDIVo8WgFdmyFABMAwhAB2MKOng8+efAHcUAcxDAypNKsbwAsgE9l4VUjVwAvHAAUASjcA+GqRwcBYqVnBMbnAySHJKquqaHtSBQXAK8kSMjABccAAGAAwAHgBsBWjyABwlAExoAJyKJZUA7Cz18gCiACz1KEgVigDM7fVsLd0s3ZhoAKzdKABCJXkANClBKBy59EysHB4A2viYUioYwKp0zvLAKoYA6sAwABYZKAYANowe6ZmMcAgehUSCgPiQRRgoJUKE+cCESD04SQMCkUFCnikdxgNVmJS8+AAul51qleGcLqoAHIoEBIXL4MA3O6PZ5vDRfRj4UmpBiGHJwY7FWZdFhlJCdABiNTYksUUqGKEqBUqKBqAEZ6os8RrurMACLqtjKtjyFr67lwdRSJCEnlBAD0DrgAD0APwpLheUgpIio9GeDZwAA8twEvgAEkhPp8IHAHtBPvJgw6w74Ut6uKQgA) the designated `functionName`, even when no explicit types are defined on the object being passed into the function.

However, that is due to Typescript being able to do inferring of generics when it's [part of a function call](https://www.typescriptlang.org/docs/handbook/2/generics.html#using-type-parameters-in-generic-constraints), but when it's a standalone object, the generics need to be explicitly named. **So a problem arises when** we want to define a contract call **separately** and pass it into the `wagmi` function later, but still want these strong type hints to help us avoid bugs in the code.

The definition of the `writeContract` function in `wagmi` looks like this in v2:

```typescript
export async function writeContract<
  config extends Config,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  chainId extends config['chains'][number]['id'],
>(
  config: config,
  parameters: WriteContractParameters<abi, functionName, args, config, chainId>,
): Promise<WriteContractReturnType> { /*...*/ }
```

To define the `parameters` input object, it takes **FIVE** generic types being specified. Every time we want to specify an object that's going to be a `parameters` object, explicitly giving all five parameters is tedious, and repetitive (as things like the `functionName` would need to be given in the generics specification and in the object itself), which could lead to more bugs rather than less.

So, how can that be reduced to not get the benefits of the strong ABI typing, without introducing more bugs trying to specify object type generics throughout the codebase?

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
The `wagmi` documentation references the [ABI project](https://abitype.dev/guide/walkthrough) as the sub-structure for how it manages enforcing checks between those parameter properties, and using that guide as a base, this structure is derived:

When typing an object that contains data that will be used to call a `wagmi` or `viem` contract call, the following general structure is used:

```typescript
import { config } from './wagmi-config'

export interface MyConfigObject<
  abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> = ContractFunctionName<abi, 'nonpayable' | 'payable'>
> {
  myLabel: 'foo',
  config: WriteContractParameters<
    abi,
    functionName,
    ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
    typeof config,
    (typeof config)['chains'][number]['id']
  >
}
```

The core of this structure is that the `WriteContractParameters` type takes five different generics (`abi`, `functionName`, `args`, `config`, and `chainId`). Rather than specifying all five all the time, we derive those that we can. Wagmi has to keep their structure very generic, to allow many third parties to use them. But for our use case, we can drop some of that with some assumptions:

- We know within our own applications, only one `config` will be used, so we can use that directly.
- We won't override argument types to a function, so that can be derived from the named function directly.
- The `abi` generic definition drops the `readonly unknown[]` because for our application, we should never be constructing an invalid contract call. Making `unknown[]` not an option, it becomes a compile-time error rather than run-time.

That reduces the needed generics from five down to two, but still would need to be explicitly given as generics, and that includes duplication:

```typescript
const myConfig: MyConfigObject<
  typeof parseAbi(['function pendingWithdrawals(address owner) external view returns (uint256)']), // <-- Repeat A
  'pendingWithdrawals' // <-- Repeat B
> = {
  myLabel: 'foo',
  config: {
    address: `0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6`,
    abi: parseAbi(['function pendingWithdrawals(address owner) external view returns (uint256)']), // <-- Repeat A
    functionName: 'pendingWithdrawals', // <-- Repeat B
    args: ['0x5dEA60eEF2bFCEF3a808a219B562145D1b80bd7D'],
  }
}
```

To solve this, use constructor/builder functions. A function of this type doesn't do anything other than return its input, but allows for Typescript to do generic inferring:

```typescript
export function constructMyConfig<
  const abi extends Abi,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>
>(config: MyConfigObject<abi, functionName>): MyConfigObject<abi, functionName> {
  return config
}
```

Note this is not a ["type predicate"](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) style function (which has a broad type as input, and a narrow type as output), but rather has the same input and output type. The generics that describe the input parameters also do not have "=" clauses at the end to specify a default, forcing them to be derived from the input value.


## Consequences
<!-- Outcomes, both positive and negative -->

This is very specific to the typing of the `wagmi` and `viem` v2 libraries. If [./0009-ethereum-interface-library.md](ADR0009) is updated to use a different library, this ADR will need to be deprecated or rejected.

The definitions of the `abi` and `functionName` generics is rather verbose, but hopefully only has to be defined a few times in utility files, rather than repeated throughout the codebase, thanks to the builder functions. If Typescript ever gets the ability to define an "alias" for a specific "generics definition", that could be swapped in for better modularity.

Having a constructor/builder function is a useless function from the JavaScript perspective (only helping Typescript), so if Typescript ever got a way to do generic-inferring on objects, that should be investigated as a replacement to this method.
