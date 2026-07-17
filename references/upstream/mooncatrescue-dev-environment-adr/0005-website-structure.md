
# 0005 - Website Structure
**Updated:** 13 Nov 2022

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Deprecated

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
In the Mar 2021 to Oct 2022 time frame, the MoonCat​Rescue project went through a “rediscovery” and growth phase, where many tools, sites, and applications were created, using multiple different technology stacks to experiment with what options were the best. This has lead to those applications being spread out across multiple different subdomains as multiple individual applications. Being deployed this way requires the user to log in/connect to each one individually, and makes cross-linking navigation between them harder to maintain.

## Decision
<!-- What is the change that we’re actually proposing or doing. -->

***This ADR was created as a way to organize a large shift in many areas of the MoonCatRescue web services, and that shift has now been implemented, so this ADR is deprecated. The way in which these services were shifted did vary slightly from this plan; more details about that are in the Consequences section***

Create a unified web application that hosts all MoonCat-related tools under one domain. Use [NextJS](https://nextjs.org/) as the main application infrastructure (so, using [React](https://reactjs.org/) and [Typescript](https://www.typescriptlang.org/) under-the-hood), with Web3 integrations added in ([ethers](https://www.npmjs.com/package/ethers) and [web3modal](https://www.npmjs.com/package/web3modal)).

- Focus on `mooncatrescue.com` being the key domain for the project. This is the domain that most relates to the core project, so is best for being intutive for users to navigate to.
- The current content of `mooncatrescue.com` is an archive of the original MoonCat​Rescue proeject website. This will get moved to `2017.mooncatrescue.com` to be an archival record.
  - Also, investigate deploying the static content to IPFS, arweave or similar, to have independent/decentralized preservation of that artifact.
- The main content users see when visiting `https://mooncatrescue.com` should be information useful to the general public to learn more about the project (targeting an intended audience who is not already a MoonCat holder, and may not be a cryptocurrency-user at all yet). The content on the `https://mooncat.community` site currently is geared toward that audience; that content will move over to the main content at `mooncatrescue.com ` (the blog, the FAQs, the “about us” info).
  - This site will be mostly “out of lore” communications; breaking the fourth wall of the story, to let newcomers know what to expect and how to start exploring on their own.
- A new subdomain to represent “the app” will be created. Many web services have followed this model, so users can generally understand when “in the app” the lore/experience will be different than the main/documentation site. The canonical URL for this app will be `chainstation.mooncatrescue.com`, but the subdomain `app.mooncatrescue.com` will be a redirect (as that subdomain is commonly used for this purpose, so people might type that in intuitively).
- The Chainstation application overall will not require the user to sign in or connect their wallet. If browsing without a connected wallet, it will show information about the whole collection and view-only information about each of the MoonCats.
- The Chainstation landing page will be seeing the whole collection of MoonCats (similar to The Adoption Center of the original project). Sideways navigation options from this “seeing all the MoonCats in list view” would be “seeing all Accessories” (what The Boutique website is currently), “seeing all Moments”, and “seeing all lootprints”.
- If the user logs in, their own Purrse interface would be visible. The way you pick a MoonCat in your purrse to get more detail about them would be the main way of selecting a MoonCat to do something else with. Once a MoonCat is selected, options like “download a picture of them” (Photobooth), “claim their ENS subdomain”, adjust their wardrobe, etc. would be available. 
  - That drill-down page for a specific MoonCat would also be browse-able by anyone (just they wouldn’t see the action buttons to interact with that MoonCat), and have a share-able URL for people to use to link others to details about their MoonCat. 
- The `mooncatrescue.eth` ENS domain shall be configured to redirect users to the web site and application (metadata set such that navigating with https://eth.link/ would work properly).

### Rollout order

### Phase 1
- Create new static site generator for blog and documentation pages.
  - Project started at https://gitlab.com/mooncatrescue/mooncatrescue-web-neo
- Migrate static content hosted on `mooncat.community` to the new generator.
- Migrate original project website to `2017.mooncatrescue.com`
- Deploy new static site to `mooncatrescue.com`
- Remove static content from `mooncat.community`

### Phase 2
- Create Chainstation application architecture to allow a unified wallet connection experience, and data-fetching fallback if the user isn’t logged in.
  - Project started at https://gitlab.com/mooncatrescue/chainstation-web
- Create gallery-style interface (like The Adoption Center) for browsing the collection
- Deploy to `chainstation.mooncatrescue.com`

### Phase 3
- Create new version of Purrse, working within the Chainstation app architecture. All MoonCats will have a detail page to browse to, not just Acclimated ones.
- Create new version of Acclimator UI, working within the Purrse structure. A general page for bulk-acclimation will exist, in addition to a quick option when visiting the detail page of any un-Acclimated MoonCat.
- Create new version of MoonCat​Name​Service UI, working within the Chainstation app architecture. A general page for bulk-announcments will exist, in addition to a quick option when visiting the detail page of any MoonCat.
- Create new version of JumpPort UI, working within the Chainstation app architecture. A general page for interacting with all travelers will exist, in addition to a quick option to travel to the JumPort when visiting the detail page of any MoonCat.
- Create a new verion of The Boutique UI, working within the Chainstation app architecture.

### Phase 4
- Create a new application section for browsing the lootprints (for MoonCats) collection and showing details about each asset in that collection
- Create a new application section for browsing the MoonCat​Moments collection and showing details about each Moment.
- Create a new sub-page under each MoonCat’s detail page showing their activity/history. This will include their on-chain actions (their Rescue, Acclimation, participation in any Moments, becoming a Spokescat, etc.) as well as integrating with external services like [Hyype](https://hyy.pe/).

## Consequences
<!-- Outcomes, both positive and negative -->
- The `mooncat.community` domain that has been the primary domain for the “rediscovery” period will be deprecated and redirected to new pages. Existing sites that link to `mooncat.community` will need to be updated.
- This overall plan will take a lot to fully-implement. However, this structure will allow rolling out in pieces, and the relevant old tools can be decommissioned in pieces through the process, so users will be able to see results over time, instead of waiting for one “big bang” release.
- Phases 1 and 2 need to be done first, and in order. Once those are in place, all the pieces of Phases 3 and 4 could be done in parallel (with the items in Phase 3 taking a little more priority than items in Phase 4)
- Developers helping with Phases 1-3 will need to be familir with both the coding language of the current tool, as well as the technology stack being converted to (requires a bit more experienced developers). Developers helping with Phase 4 items (creating new tools) will only need to know the technology stack used for the Chainstation app.

### Implementation variances
In the process of implementing this plan, it was not followed exactly in the following areas:

- It was decided to fully deprecate the `mooncat.community` domain as the benefit of having a separate domain for static content wasn't that helpful, and caused additional complexity of maintaining two web services.
- The `mooncatrescue-web-neo` project ended up not being used, as the `mooncat.community` domain no longer needed to be a static site. Instead the blog content was incorporated into the ChainStation web application as a static Markdown import into NextJS.
- `origin.mooncatrescue.com` was chosen over `2017.mooncatrescue.com` for hosting the historical MoonCatRescue site, as that focuses on what it is, versus when it was created.

Further changes to the ChainStation web application are now documented as issues in [that repository](https://gitlab.com/mooncatrescue/chainstation-web), rather than an ADR because they're small-enough features and changes to be individual units of work, and don't require significant coordination across multiple repositories and services.