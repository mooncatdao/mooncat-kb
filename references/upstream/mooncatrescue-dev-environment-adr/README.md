Documents in this folder are the Architecture Decision Records (ADRs) for the MoonCat​Rescue project. The concept of ADRs are used by multiple software packages as a way to organize desicions. For a technical definition, see [this writeup](https://github.com/joelparkerhenderson/architecture-decision-record#what-is-an-architecture-decision-record).

For the non-coders in the audience, "architecture" here doesn't refer to building a physical building, but rather building digital software. In this modern era, there's lots of programming languages, and so if you want to make "a computer program that does X", there's many, many ways to arrive at that destination (most outcomes can be achieved by multiple different programming languages. So which do you use to get to that goal?).

# What ADRs document
Software has lots of different types of documentation, from comments in the code itself (good for developers), to user guides/FAQs (good for end-users). What role do ADRs play? They're primarily for developers, and for situations where there needs to be consensus among multiple developers, and when what is needed information is not just "the result" but "the process of getting to the result" (they record "the decision" not just "the result").

## Documenting internal tools
When working on a large software application, in order to create a new feature, generally there's only one obvious way to add that feature into the code, and the approach used will be just for that feature. If a new feature is instead laying the groundwork for more features to be "built on top of it", then developers should take more time to make sure what's built will serve the future needs. Documenting what the new capabilities are and how to use them in that one feature's code might get lost over time, so it's helpful to have that Architecture documented in a central place (here, as an ADR) to point future developers to.

## Documenting what didn't work
Sometimes when working on a project, it's useful to "refactor" code, which means to change the underlying foundations or organizations of the code, but not change the output of the code. Many times projects use "third party library" code, which is logic created by other developers which is brought into the project to make things easier or more standardized. But third-party libraries can have security issues, and if the other developers stop maintaining them, those security issues then become part of your project. Refactoring code and changing to other third-party libraries can be helpful to fix security issues by using a more-maintained library.

When a developer starts working on a project, and they see its using third-party library X, they might propose "We should use library Y instead; I've worked with it before and it's so much better". But what if when the project was evaluating libraries in the first place, "Library Y was considered, and found to not work, which was why X was chosen" (even if in most other evaluations, it's inferior to Y).

Documenting "we tried other ways, and they didn't work, so we're doing it like this" is hard to do in the code itself, and so documenting it as an ADR is a good way to share that knowledge with developers who join the project after the decision was made. ADRs can be updated, and so if that hypothetical "library Y" changes in the future to now have the features the project needs, a developer can propose re-evaluating it, and marking the prior ADR as "deprecated".

# ADR Process for MoonCatRescue
ADRs are a general process, and each project can implement them in slightly different ways. For the MoonCatRescue project, the general approach is:

- Anyone can create an ADR in "Proposed" status. If you're not confident your idea actually needs an ADR, create an "Issue" using the "Propose ADR" template to create a discussion area for the idea first.
- Weekly the maintaining team will review proposals for completeness and merge them in
- After awaiting feedback (generally between one week to one month), the ADR can be moved to "Accepted" status.

For more details, [ADR0001](./0001-record-architecture-decisions.md) covers the decision to use ADRs, and documents how they are to be used.