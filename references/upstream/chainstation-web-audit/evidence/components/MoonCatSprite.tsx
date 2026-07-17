'use client'
import { IPFS_GATEWAY } from 'lib/util'
import { CSSProperties, useState, useEffect } from 'react'

// Base image is 512x256 in size, with 32 pixel sprites
const FRAME_TIME = 120 // milliseconds per frame

const ROW_INDEX = {
  'right-walk': 0,
  'up-walk': 1,
  'left-walk': 2,
  'down-walk': 3,
  'right-idle': 4,
  'up-idle': 5,
  'left-idle': 6,
  'down-idle': 7,
}

interface BrainState {
  frame: number
  phase: number
}

/**
 * A static visual to show off a MoonCat sprite.
 * This component does not move, but shows the MoonCat animating in-place through a set routine of animations.
 */
const MoonCatSprite = ({ rescueOrder, style }: { rescueOrder: number; style: CSSProperties }) => {
  const [brain, setBrain] = useState<BrainState>({ frame: 0, phase: 0 })

  useEffect(() => {
    let active = true // Flag to stop trying to animate when component is unmounted/rerendered
    let lastTime = performance.now()
    function animationTick(currentTime: number) {
      if (!active) return
      const delta = currentTime - lastTime
      if (delta >= FRAME_TIME) {
        // Time to update frames
        lastTime = currentTime
        setBrain(({ frame, phase }) => {
          if (frame > 6) {
            // Move to next phase
            if (phase >= 11) {
              return { frame: 0, phase: 0 }
            } else {
              return { frame: 0, phase: phase + 1 }
            }
          } else {
            return { phase, frame: frame + 1 }
          }
        })
      }

      // Call self again, to animate the sprite
      window.requestAnimationFrame(animationTick)
    }
    window.requestAnimationFrame(animationTick)

    return () => {
      active = false
    }
  }, [])

  // Phases:
  //  0: idle
  //  1: idle
  //  2: idle
  //  3: idle
  //  4: walk right
  //  5: walk right
  //  6: idle facing right
  //  7: walk right
  //  8: idle
  //  9: idle
  // 10: walk left
  // 11: walk left
  let spriteRow: number
  switch (brain.phase) {
    case 4:
    case 5:
    case 7:
      spriteRow = ROW_INDEX['right-walk']
      break
    case 6:
      spriteRow = ROW_INDEX['right-idle']
      break
    case 10:
    case 11:
      spriteRow = ROW_INDEX['left-walk']
      break
    default:
      spriteRow = ROW_INDEX['down-idle']
  }

  return (
    <div
      className="sprite-animation"
      style={{
        ...style,
        '--frame': brain.frame,
        '--row': spriteRow,
        position: 'initial',
        display: 'inline-block',
        backgroundImage: `url("${IPFS_GATEWAY}/ipfs/bafybeib5iedrzr7unbp4zq6rkrab3caik7nw7rfzlcfvu4xqs6bfk7dgje/${rescueOrder}.png")`,
      }}
    />
  )
}
export default MoonCatSprite
