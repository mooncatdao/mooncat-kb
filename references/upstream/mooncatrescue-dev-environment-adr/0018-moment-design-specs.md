# 0018 - MoonCat​Moment Design Specifications
**Updated:** <!-- DD Mon YYYY --> 14 Mar 2026

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
The goals of the [MoonCat​Moments](https://mooncatrescue.com/moments) tokens are intended to be consistently produced, and therefore having a consistent design language will help them all look like they're part of the same collection. 

The modern “social post” feed image is 1200 pixels wide, but then varies between 627, 628 and 630 pixels tall (approximately 1.91:1 aspect ratio).

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
Target a general layout of 1200x630 pixels to fit the social media standard, yet be round pixel values. But to make the background match the pixel-art aesthetics of MoonCats, the backdrops should be initially designed as 200x106 pixel art.

To arrange MoonCats into that backdrop, it should be scaled up 600% to 1200x630 making each background-art pixel a 6-pixel square. With this scale, MoonCats can be rendered with Accessories (which use half-pixels) without quality loss.

To make a final “printer-quality” version, that should be scaled up 300% to be a 3600x1890 canvas (each pixel of the original art becomes a 18-pixel square. At 300 DPI that would print 12x6.3”, 305x160mm). Additional subtle effects can be added here (film grain, glowing effects, lens flares) that don't follow the pixel art structure. Plus adding text titles and other labels that should be the highest-resolution possible (to give the impression it's designed as a touristy postcard image).

To make the lower-quality public version, the print-quality version should be scaled down 33% to be back to 1200x630 again.

To make the “stamp” style image (to be used for thumbnails), a 400x400 square crop should be made of some portion of the final image. The spinning, interactive “stamp” versions of MoonCat​Moments are presented as 200x200 elements in the website. Having the images used within them be twice that size allows for high-pixel-ratio screens (retina displays and mobile devices) to show those in a sharper focus.

## Consequences
<!-- Outcomes, both positive and negative -->
Having the baseline/public image scale have the backdrop pixels at 6-pixel squares means there's some flexibility to have the MoonCats rendered larger or smaller within the background. Though it also makes it harder to get the MoonCats aligned precisely to the same grid as the backdrop. But for most visuals, having the MoonCats rigidly fixed to the same grid isn't necessary. Since there's non-pixel-sized effects that get added later, if MoonCats are offset a little bit, that can give a bit of variety and life to the final result.