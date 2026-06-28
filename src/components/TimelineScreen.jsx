import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Calendar, MapPin, FileText, ArrowLeft, Clock, Heart } from 'lucide-react'

export default function TimelineScreen({ memories, meetings, nextButtonText, firstEncounterDate, onNext, onBack }) {
  const [showMeetingsOnly, setShowMeetingsOnly] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Robust meetings parsing guard to handle both arrays and JSON-strings from database
  let activeMeetings = []
  if (Array.isArray(meetings)) {
    // Self-heal if meetings is a corrupted array of characters
    if (meetings.length > 0 && meetings.every(item => typeof item === 'string' && item.length === 1)) {
      try {
        const reconstructed = meetings.join('')
        const parsed = JSON.parse(reconstructed)
        activeMeetings = Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error("Failed to self-heal corrupted meetings array:", e)
      }
    } else {
      activeMeetings = meetings
    }
  } else if (typeof meetings === 'string') {
    try {
      activeMeetings = JSON.parse(meetings)
    } catch (e) {
      console.error("Failed to parse meetings JSON:", e)
    }
  }

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 75,
        damping: 16
      }
    }
  }

  // Relationship elapsed time counter tick
  useEffect(() => {
    if (!firstEncounterDate) return

    const calculateTime = () => {
      const start = new Date(firstEncounterDate)
      const now = new Date()
      const diffMs = now.getTime() - start.getTime()

      if (diffMs <= 0) {
        setTimeElapsed({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const totalSeconds = Math.floor(diffMs / 1000)
      const totalMinutes = Math.floor(totalSeconds / 60)
      const totalHours = Math.floor(totalMinutes / 60)
      const totalDays = Math.floor(totalHours / 24)

      const years = Math.floor(totalDays / 365)
      const remainingDays = totalDays % 365
      const remainingHours = totalHours % 24
      const remainingMinutes = totalMinutes % 60
      const remainingSeconds = totalSeconds % 60

      setTimeElapsed({
        years,
        days: remainingDays,
        hours: remainingHours,
        minutes: remainingMinutes,
        seconds: remainingSeconds
      })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [firstEncounterDate])

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center py-24 px-4 select-none font-arabic">
      
      {/* Top Go Back Option */}
      {!showMeetingsOnly && onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 right-6 font-arabic text-xs font-semibold text-parchment-gold hover:text-parchment-rose flex items-center gap-1 cursor-pointer transition-colors z-45"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>رجوع للخلف</span>
        </button>
      )}

      {/* --- Sub-Page: Meetings Postcards View --- */}
      {showMeetingsOnly ? (
        <div className="w-full max-w-[420px] flex flex-col items-center mt-4">
          
          {/* Header of Postcard Page */}
          <div className="text-center mb-8 w-full relative">
            <button
              onClick={() => setShowMeetingsOnly(false)}
              className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-1.5 border border-parchment-border/45 rounded-full text-xs font-bold text-parchment-gold hover:text-parchment-rose flex items-center gap-1 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>رجوع الذكريات</span>
            </button>
            
            <span className="text-[10px] uppercase tracking-widest text-parchment-gold font-bold mb-1 block">
              ✦ دفاتر البريد ✦
            </span>
            <h2 className="text-2xl font-playfair italic font-semibold text-parchment-text">
              لقاءاتنا التاريخية
            </h2>
            <div className="w-12 h-[1px] bg-parchment-gold/40 mx-auto mt-3"></div>
          </div>

          {/* Cards Stack */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 w-full px-2"
          >
            {activeMeetings.map((meeting, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-parchment-card/90 border border-parchment-border/40 rounded-lg p-5 shadow-vintage relative overflow-hidden text-right"
              >
                {/* Vintage Postage Stamp Ornament on top right corner */}
                <div className="absolute top-4 left-4 w-12 h-14 border border-dashed border-parchment-border/50 bg-parchment-card p-1 flex flex-col items-center justify-center rounded-sm shadow-xs select-none">
                  <div className="w-full h-full border border-parchment-gold/20 flex flex-col items-center justify-center bg-parchment-bg/30">
                    <Heart className="w-4 h-4 text-parchment-rose animate-pulse" />
                    <span className="text-[6px] font-bold text-parchment-gold/80 mt-1 font-mono">LOVE</span>
                  </div>
                </div>

                <span className="inline-block text-[11px] font-bold text-parchment-rose tracking-wider bg-parchment-bg/60 border border-parchment-border/30 rounded px-2.5 py-0.5 mb-3">
                  📬 {meeting.date}
                </span>

                <h3 className="text-xl font-playfair italic font-semibold text-parchment-text mb-2 pr-1 break-words">
                  {meeting.title}
                </h3>

                <div className="flex items-center gap-1 text-xs text-parchment-gold font-bold pr-1 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>المكان: {meeting.location || 'غير محدد'}</span>
                </div>

                <p className="text-sm font-lora text-parchment-text/80 leading-relaxed border-t border-parchment-border/20 pt-3 whitespace-pre-line break-words pr-1">
                  {meeting.note}
                </p>
              </motion.div>
            ))}

            {activeMeetings.length === 0 && (
              <p className="text-center text-xs text-parchment-text/45 py-12">لا توجد لقاءات مسجلة بعد.</p>
            )}
          </motion.div>

          <button
            onClick={() => setShowMeetingsOnly(false)}
            className="mt-12 px-6 py-2 bg-parchment-gold text-parchment-bg hover:bg-parchment-rose hover:text-white rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لخط الذكريات لمتابعة القراءة</span>
          </button>

        </div>
      ) : (
        /* --- Standard Memories Timeline View --- */
        <div className="w-full max-w-[420px] flex flex-col items-center">
          
          {/* Page Header */}
          <div className="text-center mb-8 max-w-[350px] mt-4">
            <span className="text-xs uppercase tracking-widest text-parchment-gold font-bold mb-2 block">
              ✦ رحلتنا معاً ✦
            </span>
            <h2 className="text-3xl font-playfair italic font-semibold text-parchment-text">
              شريط ذكرياتنا الجميلة
            </h2>
            <div className="w-16 h-[1px] bg-parchment-gold/40 mx-auto mt-4"></div>
          </div>

          {/* Relationship Ticking Clock Board */}
          {firstEncounterDate && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-[370px] bg-parchment-card/90 border border-parchment-border/40 rounded-xl p-4 mb-8 shadow-vintage flex flex-col items-center justify-center text-center relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-[4px] bottom-0 bg-parchment-gold"></div>
              
              <span className="text-[10px] uppercase font-bold text-parchment-gold flex items-center gap-1 mb-2.5">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                لقد مضى على أول لقاء لنا:
              </span>

              <div className="grid grid-cols-5 gap-1.5 w-full select-all font-mono font-bold text-parchment-text">
                
                {/* Years */}
                <div className="flex flex-col items-center bg-parchment-card/60 border border-parchment-border/20 rounded p-1.5 min-w-[50px]">
                  <span className="text-sm md:text-base text-parchment-rose">{timeElapsed.years}</span>
                  <span className="text-[8px] font-arabic text-parchment-text/50 mt-0.5">سنة</span>
                </div>

                {/* Days */}
                <div className="flex flex-col items-center bg-parchment-card/60 border border-parchment-border/20 rounded p-1.5 min-w-[50px]">
                  <span className="text-sm md:text-base text-parchment-rose">{timeElapsed.days}</span>
                  <span className="text-[8px] font-arabic text-parchment-text/50 mt-0.5">يوم</span>
                </div>

                {/* Hours */}
                <div className="flex flex-col items-center bg-parchment-card/60 border border-parchment-border/20 rounded p-1.5 min-w-[50px]">
                  <span className="text-sm md:text-base text-parchment-rose">{timeElapsed.hours}</span>
                  <span className="text-[8px] font-arabic text-parchment-text/50 mt-0.5">ساعة</span>
                </div>

                {/* Minutes */}
                <div className="flex flex-col items-center bg-parchment-card/60 border border-parchment-border/20 rounded p-1.5 min-w-[50px]">
                  <span className="text-sm md:text-base text-parchment-rose">{timeElapsed.minutes}</span>
                  <span className="text-[8px] font-arabic text-parchment-text/50 mt-0.5">دقيقة</span>
                </div>

                {/* Seconds */}
                <div className="flex flex-col items-center bg-parchment-card/60 border border-parchment-border/20 rounded p-1.5 min-w-[50px]">
                  <span className="text-sm md:text-base text-parchment-rose">{timeElapsed.seconds}</span>
                  <span className="text-[8px] font-arabic text-parchment-text/50 mt-0.5">ثانية</span>
                </div>

              </div>

              <span className="text-[9px] font-handwriting text-parchment-gold mt-3">✦ حبٌ ينمو ويكبر في كل ثانية ✦</span>
            </motion.div>
          )}

          {/* Inline Link Trigger Button to open sub-view instead of Modal */}
          {activeMeetings.length > 0 && (
            <button
              onClick={() => setShowMeetingsOnly(true)}
              className="mb-10 px-5 py-2.5 bg-parchment-card hover:bg-[#F2EBCE] border border-parchment-border text-parchment-gold hover:text-parchment-rose rounded-full text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer z-30"
            >
              <Calendar className="w-4 h-4" />
              <span>جدول لقاءاتنا التاريخية 🗓️</span>
            </button>
          )}

          {/* Timeline Path */}
          <div className="relative w-full flex flex-col px-4">
            
            <div className="absolute right-8 top-4 bottom-24 w-[1px] border-r-2 border-dashed border-parchment-gold/60"></div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-12"
            >
              {memories.map((memory, index) => {
                const rotation = index % 2 === 0 ? 'rotate-2' : '-rotate-2'
                const hasDate = memory.date && memory.date.trim() !== ''

                return (
                  <motion.div
                    key={memory.id || index}
                    variants={itemVariants}
                    className="relative flex flex-col pr-12 text-right"
                  >
                    
                    <div className="absolute right-[19px] top-1 w-8 h-8 rounded-full bg-parchment-bg border-[3px] border-double border-parchment-gold flex items-center justify-center shadow-sm z-20">
                      {hasDate ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-parchment-rose"></div>
                      ) : (
                        <span className="text-[10px] text-parchment-rose">❤️</span>
                      )}
                    </div>

                    {memory.photoUrl && memory.photoUrl.trim() !== '' ? (
                      /* 1. Vertical Card with Full Photo on Top & Text Below */
                      <div className="bg-parchment-card/90 border border-parchment-border/40 rounded-lg shadow-vintage overflow-hidden w-full flex flex-col transform transition-transform duration-300 hover:scale-[1.02] text-right">
                        {/* Image top container */}
                        <div className="w-full h-[220px] sm:h-[260px] overflow-hidden border-b border-parchment-border/20 bg-black/5">
                          <img
                            src={memory.photoUrl}
                            alt={memory.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        {/* Content bottom container */}
                        <div className="p-5 space-y-2.5">
                          {hasDate && (
                            <span className="inline-block text-[10px] font-bold text-parchment-rose bg-parchment-bg/60 border border-parchment-border/30 rounded px-2.5 py-0.5">
                              📬 {memory.date}
                            </span>
                          )}

                          <h3 className="text-xl font-playfair italic font-semibold text-parchment-text break-words">
                            {memory.title}
                          </h3>

                          <p className="text-sm font-lora text-parchment-text/80 leading-relaxed whitespace-pre-line break-words">
                            {memory.description}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* 2. Text-Only Classic Card */
                      <div className="bg-parchment-card/80 border border-parchment-border/40 rounded-lg p-5 shadow-vintage backdrop-blur-[1px] w-full h-auto text-right">
                        {hasDate && (
                          <span className="inline-block text-[11px] font-bold text-parchment-rose tracking-wider bg-parchment-bg/60 border border-parchment-border/30 rounded px-2.5 py-0.5 mb-2.5">
                            📬 {memory.date}
                          </span>
                        )}

                        <h3 className="text-xl font-playfair italic font-semibold text-parchment-text mb-2 break-words">
                          {memory.title}
                        </h3>

                        <p className="text-sm font-lora text-parchment-text/80 leading-relaxed whitespace-pre-line break-words">
                          {memory.description}
                        </p>
                      </div>
                    )}

                  </motion.div>
                )
              })}
            </motion.div>

            <div className="flex flex-col items-center mt-16 pb-12 z-30">
              <button
                onClick={onNext}
                className="group px-6 py-2 border-b border-parchment-gold hover:border-parchment-rose text-parchment-gold hover:text-parchment-rose font-arabic font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                <span>{nextButtonText || 'التالي'}</span>
                <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
