import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { storage } from './services/storage'
import { Heart, Play } from 'lucide-react'

// Component imports
import RomanticBackground from './components/RomanticBackground'
import LoginScreen from './components/LoginScreen'
import LetterScreen from './components/LetterScreen'
import TimelineScreen from './components/TimelineScreen'
import GalleryScreen from './components/GalleryScreen'
import FinalScreen from './components/FinalScreen'
import MusicPlayer from './components/MusicPlayer'
import AdminDashboard from './components/AdminDashboard'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // App data states
  const [settings, setSettings] = useState(null)
  const [memories, setMemories] = useState([])
  const [gallery, setGallery] = useState([])

  // UI Flow States
  const [currentScreen, setCurrentScreen] = useState('login') // 'login', 'curtain', 'letter', 'timeline', 'gallery', 'final'
  const [hasLetterLoaded, setHasLetterLoaded] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load configuration and contents from database
  const loadAllContent = async () => {
    try {
      const dbSettings = await storage.getSettings()
      const dbMemories = await storage.getMemories()
      const dbGallery = await storage.getGallery()

      setSettings(dbSettings)
      setMemories(dbMemories)
      setGallery(dbGallery)
    } catch (e) {
      console.error("Failed to load contents:", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAllContent()
  }, [])

  // Dynamic CSS variables and body theme injector hook
  useEffect(() => {
    if (settings) {
      storage.applyColorsToDOM(settings.colors, settings.themePreset)
      storage.applyFontsToDOM(settings.selectedArabicFont, settings.selectedEnglishFont)
    }
  }, [settings])

  const safeScrollToTop = () => {
    window.scrollTo(0, 0)
    if (document.body) document.body.scrollTo(0, 0)
    if (document.documentElement) document.documentElement.scrollTo(0, 0)
  }

  // Auto-scroll to top of window whenever the screen switches (multi-stage scroll to bypass animation delay layout shifts)
  useEffect(() => {
    safeScrollToTop()
    
    const timer1 = setTimeout(() => {
      safeScrollToTop()
    }, 100)
    
    const timer2 = setTimeout(() => {
      safeScrollToTop()
    }, 500)

    const timer3 = setTimeout(() => {
      safeScrollToTop()
    }, 900)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [currentScreen])

  // --- ANALYTICS VIEWS & DURATION TRACKING ---
  useEffect(() => {
    if (currentScreen === 'login' || currentScreen === 'curtain' || !settings) return

    // 1. Increment Page View in Supabase
    storage.incrementPageView(currentScreen)

    // 2. Begin Duration Timer
    const startTime = Date.now()

    // 3. Commit duration when user navigates away
    return () => {
      const duration = Math.round((Date.now() - startTime) / 1000)
      if (duration > 0) {
        storage.updatePageDuration(currentScreen, duration)
      }
    }
  }, [currentScreen, settings])

  // Handle settings changes
  const handleSettingsChanged = (newSettings) => {
    setSettings(newSettings)
  }

  // Handle successful login (start music immediately on click)
  const handleLoginSuccess = () => {
    storage.incrementOpenCount() // Log open in analytics
    localStorage.setItem('romantic_music_playing', 'true') // Force play
    setIsMusicPlaying(true)
    setHasLetterLoaded(true) // Mounts music player immediately in click event!
    setCurrentScreen('curtain')
  }

  // Handle entering the letter screen from the curtain
  const handleEnterLetter = () => {
    setCurrentScreen('letter')
  }

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-parchment-bg text-parchment-text font-arabic select-none">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-parchment-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold tracking-wider">جاري تحميل رسالة الحب...</p>
        </div>
      </div>
    )
  }

  const isAdminPath = location.pathname === '/admin'

  // Dynamic Framer Motion Transition configurations based on theme settings
  const getTransitionVariants = () => {
    const style = settings.transitionStyle || 'cinematic'
    switch (style) {
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.93 },
          animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
          exit: { opacity: 0, scale: 1.07, transition: { duration: 0.6, ease: 'easeIn' } }
        }
      case 'slide':
        return {
          initial: { opacity: 0, x: 120 },
          animate: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
          exit: { opacity: 0, x: -120, transition: { duration: 0.5, ease: 'easeIn' } }
        }
      case 'cinematic':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { duration: 1.0, ease: 'easeInOut' } },
          exit: { opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }
        }
    }
  }

  const transitionVariants = getTransitionVariants()

  return (
    <div className="relative min-h-screen w-full overflow-hidden select-none">
      
      {/* Shared Romantic background (grain, vignette, floating petals) */}
      <RomanticBackground themePreset={settings?.themePreset || 'classic'} bgHeartsOpacity={settings?.bgHeartsOpacity} />

      {/* Routes Wrapper */}
      <div className="relative z-10 w-full min-h-screen flex flex-col no-scrollbar">
        <Routes>
          
          {/* Main User Facing Flow */}
          <Route
            path="/"
            element={
              <div className="w-full flex-grow flex flex-col no-scrollbar">
                
                {/* Single Shell Screen Sequencer */}
                <AnimatePresence mode="wait">
                  
                  {currentScreen === 'login' && (
                    <motion.div
                      key="login"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.0 }}
                      className="w-full min-h-screen flex flex-col justify-center items-center"
                    >
                      <LoginScreen
                        mainPassword={settings.mainPassword}
                        siteSettings={settings}
                        onLoginSuccess={handleLoginSuccess}
                      />
                    </motion.div>
                  )}

                  {/* --- NEW ROMANTIC CURTAIN SCREEN --- */}
                  {currentScreen === 'curtain' && (
                    <motion.div
                      key="curtain"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2 }}
                      className="fixed inset-0 bg-parchment-rose z-[9999] flex flex-col items-center justify-center p-6 text-center font-arabic"
                    >
                      {/* Deep Velvet curtain vignette */}
                      <div className="absolute inset-0 bg-radial-vignette opacity-60 pointer-events-none" />
                      
                      {/* Floating Hearts inside curtain */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ y: '110vh', x: `${15 + i * 15}%`, scale: 0.8 }}
                            animate={{ y: '-10vh' }}
                            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 1.5 }}
                            className="absolute text-white"
                          >
                            <Heart className="w-6 h-6 fill-current" />
                          </motion.div>
                        ))}
                      </div>

                      {/* Golden postcard frame */}
                      <div className="relative w-full max-w-[360px] bg-parchment-card border-4 border-double border-parchment-border rounded-lg p-8 shadow-2xl flex flex-col items-center z-10">
                        <Heart className="w-10 h-10 text-parchment-rose fill-current animate-bounce mb-4" />
                        
                        <h2 className="text-2xl font-playfair italic font-extrabold text-parchment-text mb-2 leading-tight">
                          {settings.curtainTitle || "فُتِحت الرسالة بنجاح... 💌"}
                        </h2>
                        
                        <p className="text-xs text-parchment-text/70 font-lora leading-relaxed mb-6">
                          {settings.curtainDescription || "لقد فُك ختم الشمع وحان وقت سماع الكلمات وقراءة قصة حبنا السعيدة.. هل أنتِ مستعدة؟"}
                        </p>

                        <button
                          onClick={handleEnterLetter}
                          className="px-6 py-3 bg-parchment-rose hover:opacity-90 text-white active:scale-95 transition-all shadow-md rounded-full font-semibold text-xs tracking-wider flex items-center gap-2 cursor-pointer group"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{settings.curtainButtonText || "ادخلي إلى قلبي 💖"}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentScreen === 'letter' && (
                    <motion.div
                      key="letter"
                      variants={transitionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="w-full min-h-screen flex flex-col justify-center"
                    >
                      <LetterScreen
                        letterText={settings.letterText}
                        signatureName={settings.signatureName}
                        letterFontSize={settings.letterFontSize}
                        nextButtonText={settings.nextButtonText}
                        voiceUrl={settings.voiceUrl}
                        onStartMusic={handleEnterLetter}
                        onNext={() => setCurrentScreen('timeline')}
                        onBack={() => {
                          setHasLetterLoaded(false)
                          setCurrentScreen('login')
                        }}
                      />
                    </motion.div>
                  )}

                  {currentScreen === 'timeline' && (
                    <motion.div
                      key="timeline"
                      variants={transitionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="w-full min-h-screen"
                    >
                      <TimelineScreen
                        memories={memories}
                        meetings={settings.meetings}
                        nextButtonText={settings.nextButtonText}
                        firstEncounterDate={settings.firstEncounterDate}
                        onNext={() => setCurrentScreen('gallery')}
                        onBack={() => setCurrentScreen('letter')}
                      />
                    </motion.div>
                  )}

                  {currentScreen === 'gallery' && (
                    <motion.div
                      key="gallery"
                      variants={transitionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="w-full min-h-screen"
                    >
                      <GalleryScreen
                        gallery={gallery}
                        galleryTitle={settings.galleryTitle}
                        nextButtonText={settings.nextButtonText}
                        onNext={() => setCurrentScreen('final')}
                        onBack={() => setCurrentScreen('timeline')}
                      />
                    </motion.div>
                  )}

                  {currentScreen === 'final' && (
                    <motion.div
                      key="final"
                      variants={transitionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="w-full min-h-screen flex flex-col justify-center"
                    >
                      <FinalScreen
                        recipientName={settings.recipientName}
                        signatureName={settings.signatureName}
                        themePreset={settings.themePreset}
                        onReset={() => setCurrentScreen('letter')}
                        onBack={() => setCurrentScreen('gallery')}
                      />
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            }
          />

          {/* Admin Dashboard Page */}
          <Route
            path="/admin"
            element={
              <AdminDashboard
                onBackToSite={() => navigate('/')}
                onSettingsChanged={handleSettingsChanged}
              />
            }
          />

        </Routes>
      </div>

      {/* Floating persistent Music Player (Customisable player shapes) */}
      {hasLetterLoaded && !isAdminPath && settings.musicStyle !== 'hidden' && (
        <MusicPlayer
          playlist={settings.playlist}
          musicStyle={settings.musicStyle}
          autoPlay={settings.musicAutoplay}
        />
      )}

    </div>
  )
}
