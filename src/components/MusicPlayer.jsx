import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCw, RotateCcw, SkipForward, SkipBack, ListMusic, ChevronUp, ChevronDown } from 'lucide-react'

export default function MusicPlayer({ playlist, musicStyle = 'vinyl', autoPlay }) {
  const audioRef = useRef(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false)
  const progressRef = useRef(null)

  const activePlaylist = (Array.isArray(playlist) && playlist.length > 0) ? playlist : [
    { name: "Classic Italian Piano", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
  ]

  const currentTrack = activePlaylist[currentTrackIndex] || activePlaylist[0]

  useEffect(() => {
    const savedTrackIndex = localStorage.getItem('romantic_music_track_index')
    const savedPlayState = localStorage.getItem('romantic_music_playing')
    
    if (savedTrackIndex !== null) {
      const idx = parseInt(savedTrackIndex, 10)
      if (idx >= 0 && idx < activePlaylist.length) {
        setCurrentTrackIndex(idx)
      }
    }

    if (audioRef.current) {
      const targetIdx = savedTrackIndex !== null ? parseInt(savedTrackIndex, 10) : 0
      const track = activePlaylist[targetIdx] || activePlaylist[0]
      audioRef.current.src = track.url
      audioRef.current.load()

      if (savedPlayState === 'true' || (savedPlayState === null && autoPlay)) {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.warn("Autoplay blocked by browser. User interaction needed:", err)
              setIsPlaying(false)
            })
        }
      }
    }
  }, [playlist, autoPlay])

  useEffect(() => {
    localStorage.setItem('romantic_music_playing', isPlaying)
  }, [isPlaying])

  useEffect(() => {
    localStorage.setItem('romantic_music_track_index', currentTrackIndex)
  }, [currentTrackIndex])

  const changeTrack = (index) => {
    if (index < 0 || index >= activePlaylist.length) return
    setCurrentTrackIndex(index)
    setIsPlaying(false)
    
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = activePlaylist[index].url
        audioRef.current.load()
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.warn(err))
      }
    }, 100)
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error(err))
    }
  }

  const nextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % activePlaylist.length
    changeTrack(nextIdx)
  }

  const prevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + activePlaylist.length) % activePlaylist.length
    changeTrack(prevIdx)
  }

  const skipTime = (amount) => {
    if (!audioRef.current) return
    let newTime = audioRef.current.currentTime + amount
    if (newTime < 0) newTime = 0
    if (newTime > duration) newTime = duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
  }

  const handleSeek = (e) => {
    if (!audioRef.current || duration === 0) return
    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  // Hide music player if hidden style selected
  if (musicStyle === 'hidden') return null

  // 1. MINIMAL MUSIC PLAYER DESIGN
  if (musicStyle === 'minimal') {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto max-w-[280px] bg-parchment-card border border-parchment-border shadow-vintage rounded-full py-1.5 px-3 flex items-center gap-2 z-[999] select-none backdrop-blur-sm bg-opacity-95 text-right font-arabic">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={nextTrack}
        />
        
        {/* Play/Pause Minimal toggle */}
        <button
          onClick={togglePlay}
          className="w-7 h-7 rounded-full bg-parchment-gold text-parchment-bg hover:bg-parchment-rose hover:text-white active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-sm flex-shrink-0"
        >
          {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current translate-x-[-0.5px]" />}
        </button>

        {/* Short Text Name */}
        <span className="text-[10px] font-playfair italic font-bold text-parchment-text truncate max-w-[120px] leading-none">
          {currentTrack.name}
        </span>

        {/* Next Song simple trigger */}
        <button
          onClick={nextTrack}
          className="p-1 hover:text-parchment-gold text-parchment-text/60 active:scale-90 transition-all cursor-pointer flex-shrink-0"
          title="التالي"
        >
          <SkipForward className="w-3 h-3" />
        </button>
      </div>
    )
  }

  // 2. CLASSIC ROTATING VINYL MUSIC PLAYER DESIGN (Default)
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[350px] z-[999] select-none font-arabic">
      
      {/* Expandable Playlist Drawer */}
      <AnimatePresence>
        {isPlaylistOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-parchment-card border border-parchment-border shadow-vintage rounded-t-2xl p-4 mb-[-12px] pb-5 text-right font-arabic"
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-parchment-border/20">
              <span className="text-xs font-bold text-parchment-gold flex items-center gap-1">
                <ListMusic className="w-3.5 h-3.5" />
                قائمة الأغاني ({activePlaylist.length})
              </span>
              <button
                onClick={() => setIsPlaylistOpen(false)}
                className="text-[10px] text-parchment-rose hover:underline"
              >
                إغلاق
              </button>
            </div>
            
            <div className="max-h-[140px] overflow-y-auto no-scrollbar space-y-1">
              {activePlaylist.map((track, tIdx) => (
                <button
                  key={tIdx}
                  onClick={() => {
                    changeTrack(tIdx)
                    setIsPlaylistOpen(false)
                  }}
                  className={`w-full text-right py-2 px-3 text-xs rounded transition-colors flex justify-between items-center ${
                    currentTrackIndex === tIdx
                      ? 'bg-parchment-gold/15 text-parchment-rose font-bold'
                      : 'hover:bg-parchment-text/5 text-parchment-text/85'
                  }`}
                >
                  <span className="truncate pr-2">{track.name}</span>
                  {currentTrackIndex === tIdx && <span className="text-[10px]">• جاري التشغيل</span>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Control Panel */}
      <div className="bg-parchment-card border border-parchment-border shadow-vintage rounded-full py-2.5 px-4 flex items-center gap-3 bg-opacity-95 backdrop-blur-sm relative z-10">
        
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={nextTrack}
        />

        {/* Vinyl Disc art */}
        <div
          onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
          className="relative flex-shrink-0 w-9 h-9 rounded-full bg-[#1b0d07] border border-parchment-gold/40 flex items-center justify-center overflow-hidden cursor-pointer hover:brightness-110 active:scale-95 transition-all"
          title="عرض قائمة الأغاني"
        >
          <div
            className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-parchment-rose to-[#3E1B25] ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
            style={{ animationDuration: '6s' }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-parchment-gold border border-parchment-bg flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#1b0d07]"></div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            {isPlaylistOpen ? (
              <ChevronDown className="w-3 h-3 text-white" />
            ) : (
              <ChevronUp className="w-3 h-3 text-white" />
            )}
          </div>
        </div>

        {/* Audio Title & Seekable Bar */}
        <div className="flex-grow flex flex-col min-w-0 pr-1 text-right">
          <span className="text-[9px] font-bold text-parchment-gold tracking-wide truncate">
            أغنية {currentTrackIndex + 1} من {activePlaylist.length}
          </span>
          <span className="text-xs font-playfair italic font-bold text-parchment-text truncate leading-tight mt-0.5">
            {currentTrack.name}
          </span>

          <div
            ref={progressRef}
            onClick={handleSeek}
            className="relative w-full h-[3px] bg-parchment-text/10 rounded mt-1.5 cursor-pointer group"
          >
            <div
              className="absolute top-0 bottom-0 right-0 bg-parchment-gold rounded group-hover:bg-parchment-rose transition-colors"
              style={{ width: `${progressPercent}%`, left: 'auto' }}
            />
            <div
              className="absolute top-[-2px] w-2 h-2 rounded-full bg-parchment-gold opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ right: `calc(${progressPercent}% - 4px)` }}
            />
          </div>

          <div className="flex justify-between text-[8px] text-parchment-text/50 font-bold mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Skip & Play controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          
          <button
            onClick={prevTrack}
            className="p-1 text-parchment-text/60 hover:text-parchment-gold active:scale-90 transition-all cursor-pointer"
            title="الأغنية السابقة"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-7 h-7 rounded-full bg-parchment-gold text-parchment-bg hover:bg-parchment-rose hover:text-white active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-sm"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current translate-x-[-0.5px]" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1 text-parchment-text/60 hover:text-parchment-gold active:scale-90 transition-all cursor-pointer"
            title="الأغنية التالية"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  )
}
