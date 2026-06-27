import React, { useEffect, useState } from 'react'

export default function RomanticBackground({ themePreset = 'classic' }) {
  const [petals, setPetals] = useState([])
  const [stars, setStars] = useState([])

  useEffect(() => {
    if (themePreset === 'minimal' || themePreset === 'night') {
      setPetals([])
      return
    }

    // Generate falling items (leaves for forest, rose petals for classic/dark)
    const generatedPetals = Array.from({ length: 8 }).map((_, i) => {
      const isForest = themePreset === 'forest'
      const leafTypes = ['🍃', '🍂', '🍁']
      const leaf = leafTypes[Math.floor(Math.random() * leafTypes.length)]
      return {
        id: i,
        left: Math.random() * 100, // percentage of screen width
        size: isForest ? Math.random() * 10 + 16 : Math.random() * 14 + 18, // px
        duration: Math.random() * 15 + 25, // seconds (25s to 40s)
        delay: Math.random() * -30, // start staggered immediately
        opacity: isForest ? (Math.random() * 0.15 + 0.12) : (Math.random() * 0.2 + 0.25), // low opacity for leaves
        drift: Math.random() * 40 - 20, // subtle horizontal drift
        leafEmoji: isForest ? leaf : null
      }
    })
    setPetals(generatedPetals)
  }, [themePreset])

  useEffect(() => {
    if (themePreset === 'night') {
      // Generate 35 glowing star dots for the night sky theme
      const generatedStars = Array.from({ length: 35 }).map((_, i) => ({
        id: i,
        top: Math.random() * 85, // vertical %
        left: Math.random() * 100, // horizontal %
        size: Math.random() * 2 + 1, // px (1px to 3px)
        delay: Math.random() * 5, // pulse animation delay
        duration: Math.random() * 3 + 2, // pulse duration in seconds
      }))
      setStars(generatedStars)
    } else {
      setStars([])
    }
  }, [themePreset])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Paper texture grain filter (turned off in minimal theme via CSS) */}
      <div className="paper-grain absolute inset-0 z-0"></div>

      {/* Warm Ambient candlelight radial vignette */}
      <div className="vignette-overlay absolute inset-0 z-10"></div>
      
      {/* Scattered Night Stars (Night Sky theme only) */}
      {themePreset === 'night' && (
        <div className="absolute inset-0 z-15">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute bg-white rounded-full shadow-white-glow"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animation: `pulse-star ${star.duration}s ease-in-out infinite`,
                animationDelay: `${star.delay}s`,
                opacity: 0.8
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Rose Petals / Leaves (pure CSS drawing / Emojis) */}
      {themePreset !== 'minimal' && themePreset !== 'night' && (
        <div className="absolute inset-0 z-20">
          {petals.map((petal) => (
            petal.leafEmoji ? (
              // Forest theme leaf emojis
              <div
                key={petal.id}
                className="absolute top-[-30px] will-change-transform flex items-center justify-center"
                style={{
                  left: `${petal.left}%`,
                  fontSize: `${petal.size}px`,
                  opacity: petal.opacity,
                  animation: `float-down-${petal.id} ${petal.duration}s linear infinite`,
                  animationDelay: `${petal.delay}s`
                }}
              >
                {petal.leafEmoji}
              </div>
            ) : (
              // Classic/Dark theme CSS rose petals
              <div
                key={petal.id}
                className="absolute top-[-30px] rounded-full bg-gradient-to-br from-parchment-rose to-[#5c2032] will-change-transform"
                style={{
                  left: `${petal.left}%`,
                  width: `${petal.size}px`,
                  height: `${petal.size * 1.15}px`,
                  opacity: petal.opacity,
                  borderRadius: '50% 10% 50% 50% / 50% 10% 60% 50%',
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: `float-down-${petal.id} ${petal.duration}s linear infinite`,
                  animationDelay: `${petal.delay}s`
                }}
              />
            )
          ))}
        </div>
      )}

      {/* Inline styles for custom staggered animations */}
      <style>{`
        @keyframes pulse-star {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
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
