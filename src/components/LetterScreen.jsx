import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Volume2, VolumeX, Play, Pause, X } from 'lucide-react'

export default function LetterScreen({ letterText, signatureName, letterFontSize, nextButtonText, voiceUrl, themePreset = 'classic', onNext, onBack, onStartMusic }) {
  const [animationCompleted, setAnimationCompleted] = useState(false)

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0)
    if (document.body) document.body.scrollTo(0, 0)
    if (document.documentElement) document.documentElement.scrollTo(0, 0)
  }, [])
  const [isVoicePlayerOpen, setIsVoicePlayerOpen] = useState(false)
  const [isVoicePlaying, setIsVoicePlaying] = useState(false)
  const voiceAudioRef = useRef(null)

  // Start music automatically on screen mount (Letter Screen load)
  useEffect(() => {
    if (onStartMusic) {
      onStartMusic()
    }
  }, [onStartMusic])

  // Auto-play voice note recording in the background on mount without opening modal
  useEffect(() => {
    if (voiceUrl && typeof voiceUrl === 'string' && voiceUrl.trim() !== '') {
      const timer = setTimeout(() => {
        if (voiceAudioRef.current) {
          voiceAudioRef.current.play()
            .then(() => setIsVoicePlaying(true))
            .catch((err) => {
              console.warn("Auto-play voice note blocked or failed:", err)
              setIsVoicePlaying(false)
            })
        }
      }, 1200) // Trigger after screen fades in
      return () => clearTimeout(timer)
    }
  }, [voiceUrl])

  // Parse text into paragraphs and words to animate them word-by-word
  const paragraphs = (letterText || '').split('\n')
  
  // Calculate total words to know when the cursor animation should stop
  let wordCounter = 0
  const paragraphsWithIndices = paragraphs.map((paragraph) => {
    const words = paragraph.split(' ').filter(w => w !== '')
    const wordsWithIndices = words.map((word) => {
      const idx = wordCounter
      wordCounter++
      return { word, index: idx }
    })
    return { words: wordsWithIndices }
  })

  const totalWords = wordCounter
  const animDurationPerWord = 0.4
  const delayPerWord = 0.12

  useEffect(() => {
    const totalDuration = (totalWords * delayPerWord + animDurationPerWord) * 1000
    const timer = setTimeout(() => {
      setAnimationCompleted(true)
    }, totalDuration)
    return () => clearTimeout(timer)
  }, [totalWords])

  // Toggle voice playback
  const toggleVoicePlay = () => {
    if (!voiceAudioRef.current) return
    if (isVoicePlaying) {
      voiceAudioRef.current.pause()
      setIsVoicePlaying(false)
    } else {
      voiceAudioRef.current.play()
        .then(() => setIsVoicePlaying(true))
        .catch((err) => console.error(err))
    }
  }

  // Open/Close voice player modal
  const openVoicePlayer = () => {
    setIsVoicePlayerOpen(true)
  }

  const closeVoicePlayer = () => {
    setIsVoicePlayerOpen(false)
  }

  // Generate 16 bars for waveform animation
  const waveformBars = Array.from({ length: 16 })

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start py-24 px-4 select-none font-arabic">
      
      {/* Hidden Voice Audio - Kept at top level so it can play in the background */}
      {typeof voiceUrl === 'string' && voiceUrl.trim() !== '' && (
        <audio
          ref={voiceAudioRef}
          src={voiceUrl}
          onEnded={() => setIsVoicePlaying(false)}
        />
      )}

      {/* Top Go Back Option */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 right-6 font-arabic text-xs font-semibold text-parchment-gold hover:text-parchment-rose flex items-center gap-1 cursor-pointer transition-colors z-45"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>إغلاق الرسالة والرجوع</span>
        </button>
      )}

      {/* Elegant floating Voice button (اسمعني) */}
      {typeof voiceUrl === 'string' && voiceUrl.trim() !== '' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
          onClick={openVoicePlayer}
          className="absolute top-6 left-6 px-4 py-2 bg-parchment-rose text-white hover:bg-[#732C3F] active:scale-95 shadow-md rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer z-45"
        >
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>اسمعني 🎙️</span>
        </motion.button>
      )}

      {/* Main outer card */}
      <div className="w-full max-w-[430px] bg-parchment-card/75 border border-parchment-border/40 rounded-lg p-4 md:p-8 shadow-vintage backdrop-blur-[2px] relative mt-4 mb-28">
        
        {/* Decorative inner border box */}
        <div className={`border-4 border-double border-parchment-border/30 rounded p-4 md:p-6 bg-[#FAF6EE]/40 flex flex-col items-center ${themePreset === 'minimal' ? 'ruled-lines' : ''}`}>
          
          {/* Top Ornament / Moon */}
          <div className="flex flex-col items-center mb-6 w-full">
            {themePreset === 'night' ? (
              <svg className="w-8 h-8 text-parchment-gold opacity-95 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3a9 9 0 1 0 9 9 9.75 9.75 0 0 0-.67-3.4 6.75 6.75 0 0 1-8.33-8.33A9.75 9.75 0 0 0 12 3Z" fill="currentColor" />
              </svg>
            ) : themePreset === 'minimal' ? (
              <div className="w-24 h-[1px] bg-parchment-gold/40 mb-3" />
            ) : (
              <svg className="w-20 h-5 text-parchment-gold opacity-80" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12C35 2 65 2 90 12M50 2V22M42 8C45 10 55 10 58 8M45 16C47 15 53 15 55 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="50" cy="12" r="3" fill="currentColor" />
              </svg>
            )}
            <span className="text-[10px] uppercase tracking-widest text-parchment-gold font-bold mt-1">
              إليكِ أنتِ...
            </span>
          </div>

          {/* Text Area with Word-by-Word Reveal */}
          <div className={`text-right leading-relaxed font-lora font-medium text-parchment-text ${letterFontSize || 'text-xl'} w-full`}>
            {paragraphsWithIndices.map((paragraph, pIdx) => (
              <p key={pIdx} className="mb-4 min-h-[1.5em] flex flex-wrap gap-x-2 gap-y-1 justify-start dir-rtl">
                {paragraph.words.map(({ word, index }) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
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
                
                {!animationCompleted && pIdx === paragraphsWithIndices.length - 1 && (
                  <span
                    className="inline-block text-parchment-gold font-bold ml-1 animate-pulse"
                    style={{
                      animationDelay: `${totalWords * delayPerWord}s`
                    }}
                  >
                    ✦
                  </span>
                )}
              </p>
            ))}
            
            {animationCompleted && (
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 2, duration: 1 }}
                className="inline-block blinking-cursor text-parchment-gold"
              />
            )}
          </div>
          
        </div>

        {/* Bottom signature and wax seal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: animationCompleted ? 1 : 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="flex flex-col items-center mt-6 border-t border-parchment-border/20 pt-4"
        >
          <span className="font-playfair italic text-lg text-parchment-gold mb-3">
            {signatureName || 'حبيبكِ'}
          </span>

          <div className="w-9 h-9 bg-parchment-rose rounded-full shadow-md flex items-center justify-center cursor-default mb-6 hover:scale-105 transition-transform">
            <svg className="w-4.5 h-4.5 text-parchment-bg fill-current opacity-80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>

          <button
            onClick={onNext}
            className="group px-6 py-2 border-b border-parchment-gold hover:border-parchment-rose text-parchment-gold hover:text-parchment-rose font-arabic font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer text-sm"
          >
            <span>{nextButtonText || 'التالي'}</span>
            <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
          </button>
        </motion.div>

      </div>

      {/* --- CINEMATIC VOICE RECORDING WAVEFORM PLAYER MODAL --- */}
      <AnimatePresence>
        {isVoicePlayerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2C1810]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-parchment-card border border-parchment-border w-full max-w-[340px] rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center relative"
            >
              {/* Close Button */}
              <button
                onClick={closeVoicePlayer}
                className="absolute top-4 right-4 p-1.5 hover:bg-parchment-rose/10 hover:text-parchment-rose rounded-full text-parchment-text/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[10px] font-bold text-parchment-gold uppercase tracking-wider mb-2">
                تسجيل رومانسي خاص 🎙️
              </span>
              <h4 className="font-playfair italic text-lg text-parchment-text font-bold mb-8">
                أصغي لقلبي يا حبيبتي...
              </h4>

              {/* Pulsing audio waveform visualizer bars */}
              <div className="flex items-end justify-center gap-1.5 h-24 mb-10 w-full px-4">
                {waveformBars.map((_, index) => {
                  const baseHeight = 15 + Math.sin(index * 0.4) * 45 // 15px to 60px base
                  return (
                    <motion.div
                      key={index}
                      className="w-1.5 rounded-full bg-gradient-to-t from-parchment-gold to-parchment-rose"
                      animate={isVoicePlaying ? {
                        scaleY: [1, 2.0 + Math.sin(index * 0.5) * 1.0, 1]
                      } : {
                        scaleY: 1
                      }}
                      transition={isVoicePlaying ? {
                        duration: 0.6 + (index % 4) * 0.1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      } : {}}
                      style={{
                        height: `${baseHeight}px`,
                        originY: 1 // Scale up from the bottom
                      }}
                    />
                  )
                })}
              </div>

              {/* Action play button */}
              <button
                onClick={toggleVoicePlay}
                className="w-16 h-16 bg-parchment-rose text-white hover:bg-[#732C3F] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer mb-2"
              >
                {isVoicePlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-[-1px]" />
                )}
              </button>

              <span className="text-[10px] text-parchment-text/40 font-bold mt-4">
                {isVoicePlaying ? 'جاري الاستماع...' : 'انقر لتشغيل الصوت'}
              </span>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
