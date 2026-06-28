import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, RotateCcw } from 'lucide-react'

export default function FinalScreen({ recipientName, signatureName, themePreset = 'classic', onReset, onBack }) {
  const [animationCompleted, setAnimationCompleted] = useState(false)

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const [showHearts, setShowHearts] = useState(false)
  
  const finalMessageText = `شكراً لأنكِ في حياتي، وشكراً لكل لحظة جميلة عشناها وسنعيشها معاً.. أنتِ اختياري الوحيد ونبض قلبي الصادق. عهدٌ عليّ أن أصون حبّنا، وأن أظل مخلصاً لعينيكِ الجميلتين.`

  const words = finalMessageText.split(' ').filter(w => w !== '')
  const animDurationPerWord = 0.4
  const delayPerWord = 0.15 // Slow, dramatic

  useEffect(() => {
    const totalDuration = (words.length * delayPerWord + animDurationPerWord) * 1000
    const timer = setTimeout(() => {
      setAnimationCompleted(true)
      setShowHearts(true)
    }, totalDuration)
    return () => clearTimeout(timer)
  }, [words.length])

  const [hearts, setHearts] = useState([])
  useEffect(() => {
    if (showHearts) {
      const generated = Array.from({ length: 3 }).map((_, i) => ({
        id: i,
        left: 25 + Math.random() * 50,
        size: 12 + Math.random() * 8,
        delay: Math.random() * 3,
        duration: 10 + Math.random() * 5
      }))
      setHearts(generated)
    }
  }, [showHearts])

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: delayPerWord,
      },
    },
  }

  const wordVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: animDurationPerWord, ease: 'easeOut' } },
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start py-24 px-4 select-none bg-parchment-bg transition-colors duration-1000">
      
      {/* 1. Top Go Back Option */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 right-6 font-arabic text-xs font-semibold text-parchment-gold hover:text-parchment-rose flex items-center gap-1 cursor-pointer transition-colors z-45"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>رجوع للخلف</span>
        </button>
      )}

      {/* Dynamic Deep Vignette edges */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-radial-vignette"></div>

      <div className="w-full max-w-[430px] bg-parchment-card/75 border border-parchment-border/40 rounded-lg p-4 md:p-8 shadow-vintage backdrop-blur-[2px] relative mt-4 mb-28 z-20">
        
        {/* Decorative inner border box */}
        <div className="border-4 border-double border-parchment-border/30 rounded p-4 md:p-6 bg-parchment-inner/40 flex flex-col items-center">
          
          {/* Top Gold Ornament / Moon */}
          {themePreset === 'night' ? (
            <svg className="w-8 h-8 text-parchment-gold opacity-95 mb-6 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3a9 9 0 1 0 9 9 9.75 9.75 0 0 0-.67-3.4 6.75 6.75 0 0 1-8.33-8.33A9.75 9.75 0 0 0 12 3Z" fill="currentColor" />
            </svg>
          ) : (
            <svg className="w-20 h-5 text-parchment-gold opacity-90 mb-6" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12C35 2 65 2 90 12M50 2V22M42 8C45 10 55 10 58 8M45 16C47 15 53 15 55 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="50" cy="12" r="3" fill="currentColor" />
            </svg>
          )}

          {/* Word-by-word message */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="text-xl font-playfair italic leading-relaxed text-parchment-text flex flex-wrap gap-x-2 gap-y-1 justify-center dir-rtl w-full"
          >
            {words.map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: animDurationPerWord,
                  delay: index * delayPerWord,
                  ease: 'easeOut'
                }}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>

        </div>

        {/* Signature & "إلى الأبد" Reveal */}
        <div className="min-h-[180px] flex flex-col items-center w-full mt-6 border-t border-parchment-border/20 pt-4">
          <AnimatePresence>
            {animationCompleted && (
              <div className="flex flex-col items-center w-full">
                {/* Signature name */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2 }}
                  className="font-handwriting text-parchment-rose text-lg mb-2"
                >
                  {signatureName || 'المخلص لكِ'}
                </motion.p>

                {/* "إلى الأبد" */}
                <motion.h3
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 2.0, delay: 0.8 }}
                  className="text-4xl font-playfair italic font-extrabold text-parchment-gold tracking-wider mt-1 mb-6"
                >
                  إلى الأبد
                </motion.h3>

                {/* Restart/Reset Button - Go back to Letter Page */}
                {onReset && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.0, delay: 1.5 }}
                    onClick={onReset}
                    className="px-5 py-2 border border-parchment-gold hover:border-parchment-rose text-parchment-gold hover:text-parchment-rose rounded-full text-xs font-bold font-arabic transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة قراءة الرسالة من البداية 💌</span>
                  </motion.button>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Floating Hearts Upward */}
      {showHearts && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-25">
          {hearts.map((h) => (
            <div
              key={h.id}
              className="absolute bottom-[-30px] text-parchment-rose/40 will-change-transform" // reduced opacity to 40%
              style={{
                left: `${h.left}%`,
                fontSize: `${h.size}px`,
                animation: `float-up-${h.id} ${h.duration}s linear infinite`,
                animationDelay: `${h.delay}s`
              }}
            >
              ❤️
            </div>
          ))}
        </div>
      )}

      {/* Custom styles for vignette and floating animation */}
      <style>{`
        .bg-radial-vignette {
          background: radial-gradient(circle, transparent 40%, rgba(35, 18, 12, 0.22) 100%);
        }
        
        ${hearts.map((h) => `
          @keyframes float-up-${h.id} {
            0% {
              transform: translateY(0) scale(1) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.5;
            }
            90% {
              opacity: 0.3;
            }
            100% {
              transform: translateY(-105vh) scale(0.8) rotate(${Math.random() * 90 - 45}deg);
              opacity: 0;
            }
          }
        `).join('\n')}
      `}</style>
    </div>
  )
}
