# 0001 - Record Architecture Decisions
**Updated:** 19 Jun 2025

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
We need to record the architecture decisions made for this team and company. The MoonCatRescue project benefits from being open-source by having community members collaborate, but needs to remain organized. The process of using ADRs should not be so complicated that it takes developers longer to learn the ADR process than to make the actual decisions.

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
We will use Architecture Decision Records, as described by [this repository](https://github.com/joelparkerhenderson/architecture-decision-record).

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in any ADR document in this repository are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

ADRs will be written in Markdown and stored in the `dev-environment` repository (version-controlled by Git, stored in GitLab). They will be rendered into HTML on the GitLab site for browsing and review.

ADRs will be uniquely-identified by a number should be assigned in ascending order. Gaps in the identification sequence may happen (if an idea gets assigned a number, but then doesn't even become a Proposed document). ADRs shall not be renumbered after being Accepted.

ADR identifiers should be referred to as 4 digits long. This allows for the directory of Markdown files to order themselves properly. Merge Requests regarding ADRs should start with `ADRXXXX: ` as a prefix, with `XXXX` replaced with the ADR's identifier.

The process of creating a new ADR shall be:

- Ideas that the requester is not sure should be an ADR should start as an "Issue" in the GitLab project, using the "Propose ADR" template. It is recommended for ideas to start here, for a project maintainer to help assign a number/identifier for the ADR.
- New ADRs shall be created by copying the `0000-TEMPLATE.md` file and editing the relevant areas. New ADRs shall be created in a status of Proposed. The creator should create a Merge Request for that new file using the "Create ADR" template.
- The feedback given and edits made to the ADR before getting merged into the repository as Proposed should focus on ensuring the proposal is clear, accurate, and complete. The goal should not be to debate the merits of the decision (that will come when deciding to move from Proposed to Accepted or Rejected).
- If an ADR gets merged into the repository as Proposed, the original creator may then create a new Merge Request with the edit to change the ADR to "Accepted", and using the template "Accept ADR". Discussion on that merge request should be on the merits of the decision, and whether or not it's a good conclusion for the project.
- A Merge Request for moving an ADR to an "Accepted" status shall be left open for comments no shorter than 7 days. The final arbiters of whether or not an ADR is Accepted shall be the project maintainers.

The status values for each individual ADR must be one of the following:

Proposed
: A complete idea that is not yet active as an ADR. Developers are not required to act upon the decision for current development in any MoonCatRescue projects

Accepted
: An active ADR. All code submissions to projects in the MoonCatRescue code grouping should adhere to the decision in that document. Exceptions can be made by the maintaining team, and should be documented in the code where it is a known deviation and why.

Rejected
: An idea that was discussed, but decided to not be acted-upon by the maintaining team. These can be good to keep in the repository if they are a topic that may come up again in the future, as a way to capture the past discussion on the topic.

Deprecated
: A decision that is no longer relevant, and has a specific replacement. ADRs that are deprecated must indicate which ADR replaced them. Developers should use the ADR that replaced the deprecated one for current development, and any places in code found to be still following a deprecated ADR should be refactored to follow the ADR that replaced it.

Superseded
: A softer form of 'deprecated'. ADRs in this status must point to another ADR that is the preferred decision, but developers may continue to use the superseded ADR's logic in current development.

## Consequences
<!-- Outcomes, both positive and negative -->
See blog article linked under “Decision” for overall cons of using ADRs.

Interacting with GitLab requires having a user account, so visitors wishing to submit or comment on ADRs must have a GitLab account to give feedback here. This can be mitigated by contactcing the maintaining team via other communication channels, but because GitLab accounts are free, that shouldn't be a large hurdle for visitors to cross.

Adopting an ADR process is formal and slow, and that can be a deterrant to community members engaging with the process, or lamenting not being able to make rapid changes. The method by which the MoonCatRescue project is adopting ADRs is a balance between formality and efficiency. If in the future the project grows to a larger scope, a more-formal process like [MADR](https://adr.github.io/madr/) could be utilized, but at this point it would be overkill.