"use client"

import React, { useEffect, useState } from 'react'

type BubbleStyle = {
  width: string
  height: string
  left: string
  bottom: string
  animationDelay: string
  animationDuration: string
}

export default function Bubbles() {
  const [bubbles, setBubbles] = useState<BubbleStyle[] | null>(null)

  useEffect(() => {
    const items: BubbleStyle[] = Array.from({ length: 12 }).map(() => ({
      width: `${Math.random() * 4 + 2}px`,
      height: `${Math.random() * 4 + 2}px`,
      left: `${Math.random() * 100}%`,
      bottom: '-5%',
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${Math.random() * 10 + 10}s`
    }))

    setBubbles(items)
  }, [])

  if (!bubbles) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      {bubbles.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-400/10 animate-bubble"
          style={{
            width: s.width,
            height: s.height,
            left: s.left,
            bottom: s.bottom,
            animationDelay: s.animationDelay,
            animationDuration: s.animationDuration
          }}
        />
      ))}
    </div>
  )
}
