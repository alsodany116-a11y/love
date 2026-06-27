import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Heart } from 'lucide-react'

export default function LoginScreen({ mainPassword, onLoginSuccess, siteSettings }) {
  const [password, setPassword] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [isSealCracked, setIsSealCracked] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [flapZIndex, setFlapZIndex] = useState(25)
  const canvasRef = useRef(null)
  const [errorMessage, setErrorMessage] = useState('')

  const envelopeStyle = siteSettings.envelopeStyle || 'vintage'
  const sealStyle = siteSettings.sealStyle || 'heart'

  // Canvas-based heart burst
  const triggerCanvasBurst = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = (canvas.width = window.innerWidth)
    const height = (canvas.height = window.innerHeight)

    const particles = []
    const heartColors = ['#8B3A52', '#B8960C', '#E2587E', '#D4AF37', '#A23956']

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: width / 2,
        y: height / 2 + 50,
        size: Math.random() * 8 + 6,
        speedX: (Math.random() - 0.5) * 10,
        speedY: (Math.random() - 0.7) * 12 - 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        opacity: 1,
        decay: Math.random() * 0.012 + 0.008,
        type: Math.random() > 0.5 ? 'heart' : 'petal',
      })
    }

    const drawHeart = (ctx, x, y, size, color, opacity, rotation) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(0, -size / 4)
      ctx.bezierCurveTo(-size / 2, -size / 2, -size, -size / 6, -size, size / 3)
      ctx.bezierCurveTo(-size, size * 0.8, -size / 4, size * 1.1, 0, size * 1.3)
      ctx.bezierCurveTo(size / 4, size * 1.1, size, size * 0.8, size, size / 3)
      ctx.bezierCurveTo(size, -size / 6, size / 2, -size / 2, 0, -size / 4)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const drawPetal = (ctx, x, y, size, color, opacity, rotation) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(-size / 2, -size / 2, -size / 2, size / 2, 0, size)
      ctx.bezierCurveTo(size / 2, size / 2, size / 2, -size / 2, 0, 0)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, width, height)
      let active = false

      particles.forEach((p) => {
        if (p.opacity > 0) {
          active = true
          p.x += p.speedX
          p.y += p.speedY
          p.speedY += 0.15
          p.rotation += p.rotationSpeed
          p.opacity -= p.decay

          if (p.type === 'heart') {
            drawHeart(ctx, p.x, p.y, p.size, p.color, Math.max(0, p.opacity), p.rotation)
          } else {
            drawPetal(ctx, p.x, p.y, p.size, p.color, Math.max(0, p.opacity), p.rotation)
          }
        }
      })

      if (active) {
        requestAnimationFrame(animateParticles)
      }
    }

    animateParticles()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isOpening || isTransitioning) return

    const entered = password.trim().toLowerCase()
    const correct = (mainPassword || 'love').trim().toLowerCase()

    if (entered === correct) {
      setIsOpening(true)
      setErrorMessage('')
      
      setTimeout(() => {
        setFlapZIndex(5)
      }, 500)

      setTimeout(() => {
        triggerCanvasBurst()
      }, 700)

      setTimeout(() => {
        onLoginSuccess()
      }, 2800)

    } else {
      setIsShaking(true)
      setIsSealCracked(true)
      setErrorMessage('كلمة السر خاطئة.. حاولي مجدداً يا جميلتي ❤️')
      
      setTimeout(() => {
        setIsShaking(false)
      }, 500)

      setTimeout(() => {
        setIsSealCracked(false)
      }, 2500)
    }
  }

  // Envelope flap drawing details based on style
  const getFlapClipPath = () => {
    if (envelopeStyle === 'modern') {
      return 'polygon(0 0, 0 85%, 50% 100%, 100% 85%, 100% 0)' // horizontal seal
    }
    if (envelopeStyle === 'box') {
      return 'polygon(15% 0, 0 100%, 100% 100%, 85% 0)' // folding pouch box
    }
    return 'polygon(0 0, 50% 100%, 100% 0)' // vintage classic triangle
  }

  const getFlapBgColor = () => {
    if (envelopeStyle === 'modern') return '#C8B896'
    if (envelopeStyle === 'box') return '#B29E74'
    return '#D1BE9C'
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full px-4 overflow-hidden select-none">
      
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      <div className="relative w-full max-w-[390px] flex flex-col items-center z-30 font-arabic">
        
        {/* Header Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs uppercase tracking-widest text-parchment-gold font-bold mb-2">
            ✦ {siteSettings.siteName || 'بوابة العشاق'} ✦
          </span>
          <h1 className="text-3xl font-playfair italic text-parchment-text font-semibold">
            {siteSettings.envelopeLabel || 'رسالة خاصة إليكِ'}
          </h1>
        </motion.div>

        {/* Outer 3D Envelope */}
        <div className={`relative w-full flex flex-col items-center ${isShaking ? 'animate-shake' : ''}`}>
          
          <div className="relative w-full h-[220px] bg-transparent preserve-3d">
            
            {/* The Letter Sheet */}
            <div
              className={`absolute left-[6%] right-[6%] bottom-2 h-[180px] bg-parchment-card rounded-md border border-parchment-border/40 shadow-inner flex flex-col items-center justify-center px-6 transition-all duration-[2000ms] cubic-bezier(0.25, 1, 0.5, 1) z-10 ${
                isOpening ? 'transform -translate-y-[145px] opacity-100 scale-105' : 'transform translate-y-0 opacity-40 scale-95'
              }`}
            >
              <Heart className="w-8 h-8 text-parchment-rose animate-pulse mb-2" />
              <p className="font-playfair italic text-parchment-text/80 text-sm text-center">
                {siteSettings.envelopeInsideText || 'إلى أغلى ما أملك...'}
              </p>
              <div className="w-12 h-[1px] bg-parchment-gold/40 mt-2"></div>
            </div>

            {/* Back Envelope Body */}
            <div className="absolute inset-0 bg-[#E2D2B3] rounded-lg shadow-vintage border border-parchment-border/30 z-0"></div>

            {/* Dynamic Envelope Flap */}
            <div
              className="absolute top-0 left-0 right-0 h-1/2 rounded-t-lg origin-top transition-transform duration-1000 ease-in-out shadow-sm"
              style={{
                clipPath: getFlapClipPath(),
                background: getFlapBgColor(),
                transform: isOpening ? 'rotateX(180deg) translateY(2px)' : 'rotateX(0deg)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'visible',
                zIndex: flapZIndex
              }}
            >
              <div className="absolute inset-0 bg-[#C2AF8C] opacity-25"></div>
            </div>

            {/* Front Side Panels (Left & Right Flaps) */}
            <div
              className="absolute inset-0 pointer-events-none z-20 bg-transparent"
              style={{
                clipPath: envelopeStyle === 'box' 
                  ? 'polygon(0 0, 0 100%, 30% 50%)' 
                  : 'polygon(0 0, 0 100%, 50% 50%)',
                background: '#EADBB6',
                borderLeft: '1px solid var(--color-border)',
              }}
            ></div>
            <div
              className="absolute inset-0 pointer-events-none z-20 bg-transparent"
              style={{
                clipPath: envelopeStyle === 'box' 
                  ? 'polygon(100% 0, 100% 100%, 70% 50%)' 
                  : 'polygon(100% 0, 100% 100%, 50% 50%)',
                background: '#EADBB6',
                borderRight: '1px solid var(--color-border)',
              }}
            ></div>

            {/* Bottom Panel Flap */}
            <div
              className="absolute inset-0 pointer-events-none z-20 bg-[#ECCFA2] shadow-md border-t border-parchment-border/20"
              style={{
                clipPath: envelopeStyle === 'box' 
                  ? 'polygon(0 100%, 30% 50%, 70% 50%, 100% 100%)' 
                  : 'polygon(0 100%, 50% 50%, 100% 100%)',
              }}
            ></div>

            {/* Wax Seal (Different seal icons supported) */}
            <div
              onClick={handleSubmit}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-parchment-rose hover:bg-[#9E455E] active:scale-95 cursor-pointer rounded-full shadow-wax-seal flex items-center justify-center transition-all duration-700 z-30 ${
                isOpening ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'
              }`}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* 1. Seal Shape Heart */}
                {sealStyle === 'heart' && (
                  <Heart className="w-6 h-6 text-parchment-bg fill-current opacity-85" />
                )}

                {/* 2. Seal Shape Rose */}
                {sealStyle === 'rose' && (
                  <svg className="w-6 h-6 text-parchment-bg fill-current opacity-85" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-1.5-3.5C10.67 13 10 12.33 10 11.5S10.67 10 11.5 10s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                  </svg>
                )}

                {/* 3. Seal Shape Ring */}
                {sealStyle === 'ring' && (
                  <svg className="w-6 h-6 text-parchment-bg stroke-current fill-none stroke-[2] opacity-85" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="14" r="6" />
                    <polygon points="12,2 15,6 9,6" className="fill-current" />
                  </svg>
                )}

                {isSealCracked && (
                  <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <div className="w-[2px] h-full bg-[#1e070e] rotate-[35deg] animate-pulse"></div>
                    <div className="w-[1px] h-full bg-[#1e070e] rotate-[-25deg] absolute opacity-70"></div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Form Entry Paper Strip */}
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col items-center mt-8 px-4"
          >
            <div className="relative w-full mb-4 group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isOpening}
                placeholder={siteSettings.envelopeHint || "✦ كلمة السر ✦"}
                className={`w-full py-3 px-10 text-center border border-parchment-border/40 focus:border-parchment-gold focus:outline-none rounded shadow-sm focus:ring-1 focus:ring-parchment-gold text-lg transition-all font-arabic tracking-wide ${
                  siteSettings.themePreset === 'dark' || siteSettings.themePreset === 'night' || siteSettings.themePreset === 'forest'
                    ? 'bg-black/55 text-white placeholder-white/35'
                    : 'bg-white text-[#2C1810] placeholder-[#2C1810]/40'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-gold">
                <Lock className="w-4 h-4" />
              </div>
              
              <div className="absolute left-1 top-0 bottom-0 w-[2px] bg-parchment-gold opacity-50"></div>
              <div className="absolute right-1 top-0 bottom-0 w-[2px] bg-parchment-gold opacity-50"></div>
            </div>

            <AnimatePresence>
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-parchment-rose text-xs font-semibold mb-4 text-center animate-bounce"
                >
                  {errorMessage}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isOpening}
              className="px-8 py-3 bg-gradient-to-r from-parchment-gold to-[#D4B34C] text-parchment-bg hover:brightness-105 active:scale-95 shadow-md rounded-full font-arabic font-semibold tracking-wider transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{isOpening ? 'جاري فتح الرسالة...' : 'افتح الرسالة 💌'}</span>
            </button>
          </form>

        </div>

      </div>

      <style>{`
        .preserve-3d {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
