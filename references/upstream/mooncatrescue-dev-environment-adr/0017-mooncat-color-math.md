# 0017 - MoonCat Color Math
**Updated:** <!-- DD Mon YYYY -->17 Sep 2025

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
A fundamental feature of MoonCats are that they are vibrantly-colored, and randomly-colored. Each MoonCat has as part of their Hex ID “DNA” a literal color encoded as a Red-Green-Blue value. That's very clear for describing the color in computer terms, but there's a few complicating factors when describing “what color a MoonCat is”:

- A MoonCat's DNA color gets transformed to be more saturated (more “vibrant”) before it's used to render that MoonCat
- The original MoonCatRescue parser script is written in JavaScript, which has [quirks](https://medium.com/@kaushalsinh73/why-javascript-floating-point-math-is-weird-4b914d8caabc) when working with floating-point (fractional) numbers
- MoonCats that have a “pure” coat pattern use four colors when rendered, while all other MoonCats use five colors

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
All MoonCatRescue projects shall treat the original JavaScript `mooncatparser` script as canon for what a MoonCat's true color is. That includes the output of the `RGBToHSL` function (which in the original website was not surfaced to the end-user, but only used internally).

All MoonCat hue values shall be *truncated* to an integer value before being used. Human visual perception and digital monitor representation of the colors can't really discern differences beyond integer values, and ending up with 360 color groupings is enough to be interesting without being overwhelming. Thus hue values that the JavaScript `RGBToHSL` function outputs as 15.000 through 15.999 shall be considered “hue 15”.

When determining “littermates” (which the “clone” designation depends on), pure-coated MoonCats will ignore the “coat pattern” color (second color in the generated palette) when determining if two MoonCats match. This is done to keep to the logic that two MoonCats are “clones” if they have exactly the same visual representation. Because the “coat pattern” color is unused, two pure-coated MoonCats _will_ have the same rendered output even if their coat pattern color varies a little bit.

Twelve human-friendly color labels will be used to indicate what color a MoonCat is. These labels shall be equal divisions of the HLS color wheel (meaning, each shall be 30 degrees). This allows for the three RGB color (“Red”, “Green”, “Blue”) and the three CMYK color (“Cyan”, “Magenta”, “Yellow”) to be used as color names, as well as “Orange” and “Purple” from common names used for descriptions of the rainbow. That leaves a few color ranges that need to fall back on lesser-used color names to fill the gaps:

- Between “Yellow” and “Green” &rArr; “Chartreuse”
- Between “Green” and “Cyan” &rArr; “Teal”
- Between “Cyan” and “Blue” &rArr; “Sky Blue”
- Between “Magenta” and “Red” &rArr; “Fuchsia”

Given true Red is zero degrees, true Green is 120 degrees, and true Blue is 240 degrees, those need to be expanded to be a 30-degree range by adding 15 degrees to each side. These ranges shall be _inclusive_ on the upper-end, and _exclusive_ on the lower-end. For example, “Green” ranges from 105.000 degrees to 135.000 degrees (120 &plusmn; 15 = `( 105, 135 ]`), and MoonCats with hue values of 106.000 through 135.999 are labeled “Green”.

The full list of colors and their ranges (for integer hue values) are:

- Red: 345 &lt; hue &#x22DC; 15
- Orange: 15 &lt; hue &#x22DC; 45
- Yellow: 45 &lt; hue &#x22DC; 75
- Chartreuse: 75 &lt; hue &#x22DC; 105
- Green: 105 &lt; hue &#x22DC; 135
- Teal: 135 &lt; hue &#x22DC; 165
- Cyan: 165 &lt; hue &#x22DC; 195
- Sky Blue: 195 &lt; hue &#x22DC; 225
- Blue: 225 &lt; hue &#x22DC; 255
- Purple: 255 &lt; hue &#x22DC; 285
- Magenta: 285 &lt; hue &#x22DC; 315
- Fuchsia: 315 &lt; hue &#x22DC; 345


## Consequences
<!-- Outcomes, both positive and negative -->
There are situations where the JavaScript floating-point internal logic gets the RGB-to-HSL calculation wrong, which when combined with the decision to truncate hue values rather than round them means that some MoonCats end up as a hue integer value that absolute math wouldn't agree with. For example, [MoonCat #23618](https://mooncatrescue.com/mooncats/23618#onchain), who has a DNA color value of rgb(246,169,141) (`#f6a98d`). Translating that to HSL would result in a hue value of exactly 16, but JavaScript reports “15.999999999999993”, so that MoonCat canonically is “hue 15”. This means that other programming languages that attempt to replicate the MoonCat color logic will need to make concessions if they do floating-point math differently, and make specific overrides for places where “their math” doesn't agree with “JavaScript math”. The Solidity contract at [`0x2fd7E0c38243eA15700F45cfc38A7a7f66df1deC`](https://etherscan.io/address/0x2fd7E0c38243eA15700F45cfc38A7a7f66df1deC) compensates for this by having a `mapColors` function that records on-chain which MoonCats the Solidity color math does not work dynamically for, and just saves their values on-chain.

The color between “Cyan” and “Blue” many may call “Light Blue” or “Pale Blue”, but because MoonCats having a “pale” color is a completely separate trait, that color range should not have an adjective implying “less-saturated”. “Sky Blue” fits that requirement, though then becomes the only color name with a space in it, which can complicate how it gets represented in code.

Picking “Fuchsia” and “Chartreuse” are technically accurate names for those color ranges, and are color terms the general public has likely heard before, but they are unfortunately very hard to spell correctly. Hopefully this ASR can serve as a reference point to touch back to and verify the spelling whenever a new client implementation is developed.

Having the hue color ranges be inclusive on the upper-end and exclusive on the lower-end combined with the truncation of MoonCat hue values means the ranges are shifted slightly around the color wheel (for example, “Red” having a range of `( 345, 15 ]` means that instead of hue 15.000 being a splitting point between “Red” and “Orange”, by making 15.000 “Red”, all the values up through 15.999 are also “Red”. The “Red” color range has 16 one-degree chunks on one side of “zero”, and 14 one-degree chunks on the other side of zero). So it would likely have made more intuitive sense to reverse which ends of the range get included/excluded, but the current precedent was set during the 2021 “rediscovery” process, and changing it now would not be helpful.

MoonCats who's hue values are within one degree of a color change (e.g. 15.000 through 15.999 on the “Red” side, and 16.000 through 16.999 on the “Orange” side) get labeled as having an “Edge Color” tidbit, which helps let people know if they look at a MoonCat and go “That's a red MoonCat? Looks orange to me!” have some hint as to why that might be.