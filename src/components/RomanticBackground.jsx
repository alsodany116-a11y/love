import React, { useEffect, useState } from 'react'

export default function RomanticBackground() {
  const [petals, setPetals] = useState([])

  useEffect(() => {
    // Generate only 4 slow, subtle floating rose petals for cleaner, less distracting visuals.
    const generatedPetals = Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage of screen width
      size: Math.random() * 10 + 12, // px (12px to 22px) - smaller size
      duration: Math.random() * 15 + 25, // seconds (25s to 40s) - much slower fall
      delay: Math.random() * -30, // negative delay so they start staggered immediately
      opacity: Math.random() * 0.25 + 0.2, // 0.2 to 0.45 - lower opacity
      drift: Math.random() * 30 - 15, // offset swing
    }))
    setPetals(generatedPetals)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Paper texture grain filter */}
      <div className="paper-grain absolute inset-0 z-0"></div>

      {/* Warm Ambient candlelight radial vignette */}
      <div className="vignette-overlay absolute inset-0 z-10"></div>
      
      {/* Floating Rose Petals (pure CSS drawing) */}
      <div className="absolute inset-0 z-20">
        {petals.map((petal) => (
          <div
            key={petal.id}
            className="absolute top-[-30px] rounded-full bg-gradient-to-br from-parchment-rose to-[#5c2032] will-change-transform"
            style={{
              left: `${petal.left}%`,
              width: `${petal.size}px`,
              height: `${petal.size * 1.15}px`,
              opacity: petal.opacity,
              borderRadius: '50% 10% 50% 50% / 50% 10% 60% 50%', // Petal shape
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `float-down-${petal.id} ${petal.duration}s linear infinite`,
              animationDelay: `${petal.delay}s`
            }}
          />
        ))}
      </div>

      {/* Inline styles for custom staggered animations */}
      <style>{`
        ${petals.map((petal) => `
          @keyframes float-down-${petal.id} {
            0% {
              transform: translateY(-50px) translateX(0) rotate(0deg);
            }
            50% {
              transform: translateY(50vh) translateX(${petal.drift}px) rotate(180deg);
            }
            100% {
              transform: translateY(105vh) translateX(${petal.drift * 2}px) rotate(360deg);
            }
          }
        `).join('\n')}
      `}</style>
    </div>
  )
}
