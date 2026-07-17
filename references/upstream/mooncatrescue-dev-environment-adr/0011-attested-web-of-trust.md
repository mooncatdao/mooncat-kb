# 0011 - Attested Web of Trust
**Updated:** <!-- DD Mon YYYY --> 3 Apr 2024

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
When relating to other pepole within a blockchain/distributed infrastructure setting, a "trust, but verify" approach is encouraged. There are ways to earn trust for each individual transaction, but doing that level of checking every time can be tedius. Creating a [Web of Trust](https://en.wikipedia.org/wiki/Web_of_trust) is useful to establish once, and then benefit from for all future transactions.

For websites/applications that serve as social hubs for a specific group/community, the key things that would contribute to an address being "good" would be if they are who they say they are (self attestations like ENS metadata is accurate) and if they will truthfully evaluate others they encounter. Additionally, the key things that would identify a "bad" address would be if the person behind that address attempted to scam others or spread falsehoods about people/projects.

In traditional cryptography, each human only has one private key they have in active use at a time. But in Blockchain ecosystems, users are encouraged to have multiple (e.g. Bitcoin wallets use derived "change addresses" to rotate funds to fresh addresses each time a user transacts. Ethereum users can have "hot wallets", "cold wallets", "vault wallets", and more). So there's a need not just to trust between wallets, but also a way to optionally link multiple wallets together as belonging to the same person. The trust of the person generally flows to all addresses they control, but depending on how that person treats those addresses (e.g. a hot wallet that doesn't have the same level of security as vault wallets) they could be a lesser trust level.

The trust model used by GnuPG and similar cryptography setups has [four levels of trust](https://www.gnupg.org/gph/en/manual/x334.html):

- Unknown: Default level.
- None: Don't trust this node.
- Marginal: Generally trust this node.
- Full: Trust his node as if it were you.

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
The [Ethereum Attestation Service (EAS)](https://attest.sh/) is designed to make lightweight structured statements ("Attestations"), and the built-in EAS infrastructure gives some helpful defaults for all Attestations (a target/to address, able to be revoked, able to point to other Attestations as reference, etc.). Therefore it was chosen as the platform for storing trust links between addresses. The EAS infrastructure gives many options to make many different types of implementations, but for using it for the purpose of managing user trust attestations, the following requirements must be met:

- Use Off-Chain Attestations. EAS can have on-chain Attestations, but the key benefit of having an Attestation on-chain is other smart contracts can access the data directly. Most use-cases for a Web of Trust are human-facing web interfaces, so don't need smart contracts to access them. 
- For assigning trust to another address:
    - Use the "to" address of the Attestation as the address having its trust level set
    - Use an EAS Schema with the following properties:
        - Is Self: `boolean` flag to publicly attest that the link is to another address owned by the same owner of the attesting address
        - Trust Level: `uint8` numeric level of trust you have for the target address. This is the smallest numeric field that EAS supports, which can hold integers from zero to 255. The lowest values have specific meanings:
            - A value of zero shall mean "Unknown"
            - A value of 1 shall mean "No trust" (a warning flag; do not trust this address)
            - A value of 2 shall mean "Marginal trust"
            - A value of 3 shall mean "Full trust"
            - Values of 4-99 shall be reserved for future expansion of the standard. Applications wishing to create custom ratings with meanings specific to their application should use values 100-255 for their custom meanings.
        - Detail URI: `string` optional field to allow a reason or detail to be referenced. The value stored here should be formatted as a URI, so could be a standard web link (e.g. `https:` as scheme prefix), permaweb link (e.g. `ipfs:` as scheme prefix) or other. If the data is directly embedded in this field, it should be stored as a [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme) (e.g. for a plain-text comment, it should be stored like `data:,Hi%20there` (Data URI's default media type is `text/plain;charset=US-ASCII`) or `data:text/plain;charset=UTF-8,Hello%20World%20%F0%9F%8C%90` (explicitly set charset for emoji/unicode inclusion)).
    - If the trust level is "Full trust", the expiration field should be set to a value no more than five years in the future.

The flag for "is self" is a separate annotation and not an additional "level" above "Full trust" because while it's expected a person trusts themselves completely, because different wallet keys are guarded differently, some are more likely to be compromised than others. With this structure, a user who has a Cold Wallet (Address C) and a Hot wallet (Address H) can create an attestation for "Address C 'marginal trust' Address H (is self)" and "Address H 'full trust' Address C (is self)" as a way to express that both addresses are owned by the same person, but if Address H starts firing off a whole bunch of "full trust" attestations, the general community should first consider the address got compromised, rather than first assuming the person suddenly got a whole lot of new friends.

In evaluating the Web of Trust formed by these Attestations, an application should use the following logic to determine the validity (which can be "marginal validity" or "full validity") of an address:

- From the pool of Trust Attestations, remove any that are expired or revoked. If a "Full Trust" Attestation was created with no expiration date, consider it expired after five years from its origination date. If an individual address has attested multiple times to the same target address, only keep the most-recently-created one (consider all the others revoked).
- Start at a specific address. If there is a logged-in user, start at their address.
- Addresses are considered valid if the path to that address via trust Attestation links is five steps or shorter (Attestations that have the "is self" flag set count as a zero-length step) and is attested to as "marginal trust" or "full trust" by any one of the following:
    - The starting address directly
    - An address that is "fully valid"
    - Any three "marginally valid" addresses
- To determine the level of validity for a target address, the inbound links shall be evaluated:
    - If the target address has an inbound link from the starting address attesting a "full trust" level, the target address is "fully valid"
    - If the target address has at least two inbound links from "fully valid" addresses attesting a "full trust" level, the target address is "fully valid"
    - If the target address has at least five inbound links from "marginally valid" addresses attesting a "full trust" level, the target address is "fully valid"
    - Any other valid addresses are considered "marginally valid"
- Finally, "no trust" attestations shall be evaluated to change the validity level, or flag as expliclitly "invalid":
    - If the target address has an inbound link from the starting address attesting a "no trust" level, the target address is changed to "invalid".
    - For every inbound link from a "fully valid" address attesting a "no trust" level, the target address is dropped down a validity level (if they were "fully valid", they become "marginally valid". If they were "marginally valid" they become "invalid")
    - For every five inbound links from "marginally valid" addresses attesting a "no trust level", the target address is dropped down a validity level

## Consequences
<!-- Outcomes, both positive and negative -->
Webs of Trust are supposed to be evaluated from a single starting point (typically, the "current user"). But for a website representing a community/project and give general information to public visitors, a determination needs to be made for where the starting point is. The visitor themselves if they're anonymous or a visitor from the general public have made no trust attestations themselves. Therefore, the website logic needs to decide how to evaluate the web of trust. For this specification, it's left up to the website/application to decide, but a possible option is to choose several trusted 'seed' users (team maintainers, moderators, trusted community members), and evaluate the Web of Trust from those user-perspectives, and then merge the results together. If multiple 'seed' users all consider a specific Address at least "marginally valid", then it's likely truthful to tell an anonymous visitor any of the "is self" links from that address as truth. Just having the text "this other address represents this person..." isn't the same as the blockchain actually granting access to assets in that address, so is slighly more acceptable if it turns out to not actually be the truth (and should be relatively easy to correct, by any one of the 'seed' users creating a 'no trust' attestation for the address).

Addresses that are evaluated as "invalid" in the web of trust when evaluated from a seed user can show a warning to anonymous visitors, and if multiple seed users' webs evaluate it to be "invalid", the application may proactively prevent visitors from interacting with it (and give a stronger warning to the visitor to explain why). Addresses that seed users don't have any link to can have some notice indicating it's unknown.

A system like that doesn't have to create proactive safeguards against spammers since the network is opt-in. A spammer could create dozens of addressess all attempting to boost their own address, or attempting to tear down another address, but that won't have any effect on the community's web of trust until a seed user or someone else trusted thinks the spammer's address is to be trusted. That means this system is not immune from social-engineering attacks, but it is able to heal from them relatively easily (if someone you thought was trustworthy betrays that trust, just create a new Attestation indicating "no trust" to be your new evaluation for them).

Requiring "full trust" Attestations to expire after a few years is a way to combat dead links in the system. In a decentralized ecosystem, it's expected that users will go through bursts of activity, possibly separated by long periods of inactivity. For users that do go inactive, the system needs to guard against scammers playing a "long con" of gaining people's friendship, waiting for interest to wane, and then turning on the community when their reputation is assured by users who are no longer paying active attention.

Navigating the Web of Trust is similar to GnuPG, but because GnuPG has different actions for "signing a key" (attesting the name/email on a key really is the human behind that key) and "trusting a key" (attesting the human behind that key practices good signing practices), the propogation of trust is slightly different. In GnuPG, you can "trust" a key you have not "signed". That technique is needed for allowing the web to grow beyond two levels. In [the example used in the GnuPG handbook](https://www.gnupg.org/gph/en/manual/x334.html), the maximum path length is set to three (so Geoff is never considered "valid", being four steps away). The only scenarios where Elena is considered valid at all is if Alice has set a level of trust for Chloe. But Alice has not signed Chloe's key. There's a direct _trust_ link from Alice to Chloe, but not a direct _signing_ link. This proposal only has "trust" links, so the evaluation is slightly different.

With this setup, humans can attest their trust level of smart contracts the same as they would human-controlled addresses. And smart contracts themselves could be programmed to allow for attesting about other addresses and be an active part of the web rather than a leaf/dead-end. The Detail URI field may be helpful to determine how/why a smart contract is trusted (a link to an audit report).

Incidentally, this setup allows for users to declare an address of theirs as compromised (e.g. "Address C 'no trust' Address H (is self)" to indicate from their Cold Wallet that their Hot Wallet is now compromised. It's still "their address" in the sense that they know the private key to it, but is no longer trusted, since now a bad actor also knows that key).

Storing trust attestations as offchain messages allows the flexibility of a user to broadcast them or not. But that means some form of storage mechanism is needed for keeping a user's trust links. For setups like Bitcoin, a user may not wish to have it be publicly known which addresses are all "theirs" to preserve their anonymity. But likely there are some that they use as primary identifiers that they do want people to know about. Websites using this structure should make it clear to the end user whether the user's trust links (especially "is self" links) will be shared with others.

For ChainStation use, the goal is for all submitted trust links to be publicly-available, as their primary use-case will be to show which assets are owned by the same human, even if they're spread out among multiple wallets. 