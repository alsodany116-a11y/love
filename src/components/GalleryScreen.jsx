import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

export default function GalleryScreen({ gallery, galleryTitle, nextButtonText, onNext, onBack }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Open lightbox
  const openLightbox = (index) => {
    // Only open lightbox if the item actually has a photo
    if (gallery[index].photoUrl && gallery[index].photoUrl.trim() !== '') {
      setLightboxIndex(index)
    }
  }

  // Close lightbox
  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  // Go to next photo
  const nextPhoto = (e) => {
    e.stopPropagation()
    if (lightboxIndex === null) return
    
    // Find next photo with valid URL
    let nextIdx = lightboxIndex
    let attempts = 0
    do {
      nextIdx = (nextIdx + 1) % gallery.length
      attempts++
    } while (
      (!gallery[nextIdx].photoUrl || gallery[nextIdx].photoUrl.trim() === '') && 
      attempts < gallery.length
    )

    setLightboxIndex(nextIdx)
  }

  // Go to previous photo
  const prevPhoto = (e) => {
    e.stopPropagation()
    if (lightboxIndex === null) return

    // Find previous photo with valid URL
    let prevIdx = lightboxIndex
    let attempts = 0
    do {
      prevIdx = (prevIdx - 1 + gallery.length) % gallery.length
      attempts++
    } while (
      (!gallery[prevIdx].photoUrl || gallery[prevIdx].photoUrl.trim() === '') && 
      attempts < gallery.length
    )

    setLightboxIndex(prevIdx)
  }

  // Determinate rotation class based on index
  const getRotationClass = (index) => {
    const rotations = [
      '-rotate-3',
      'rotate-2',
      '-rotate-1',
      'rotate-3',
      '-rotate-2',
      'rotate-1'
    ]
    return rotations[index % rotations.length]
  }

  // Filter gallery items that have photos for the lightbox indices
  const photosOnly = gallery.filter(item => item.photoUrl && item.photoUrl.trim() !== '')

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center py-24 px-4 select-none animate-fade-in">
      
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

      {/* 2. Page Header */}
      <div className="text-center mb-16 max-w-[350px] mt-4">
        <span className="text-xs uppercase tracking-widest text-parchment-gold font-bold mb-2 block">
          ✦ لحظاتنا الخاصة ✦
        </span>
        <h2 className="text-3xl font-playfair italic font-semibold text-parchment-text break-words px-2 leading-tight">
          {galleryTitle || 'معرض الصور والذكريات'}
        </h2>
        <div className="w-16 h-[1px] bg-parchment-gold/40 mx-auto mt-4"></div>
      </div>

      {/* 3. Grid of Polaroid Cards (Dynamic heights, masonry feel) */}
      <div className="w-full max-w-[420px] grid grid-cols-2 gap-4 px-2">
        {gallery.map((photo, index) => {
          const rotationClass = getRotationClass(index)
          const hasPhoto = photo.photoUrl && photo.photoUrl.trim() !== ''
          const hasDate = photo.date && photo.date.trim() !== ''
          
          return (
            <motion.div
              key={photo.id || index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (index % 2) * 0.1 }}
              onClick={() => openLightbox(index)}
              className={`relative border border-parchment-border/40 shadow-vintage overflow-hidden rounded-lg transform ${rotationClass} hover:rotate-0 hover:scale-[1.03] hover:z-30 transition-all duration-300 w-full flex flex-col bg-parchment-card/95 ${
                hasPhoto ? 'cursor-pointer min-h-[220px]' : 'p-4 justify-center min-h-[140px] cursor-default'
              }`}
            >
              {hasPhoto ? (
                <>
                  {/* Image top container */}
                  <div className="w-full aspect-square overflow-hidden bg-black/5 border-b border-parchment-border/20">
                    <img
                      src={photo.photoUrl}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {/* Caption bottom area */}
                  <div className="p-3 text-center space-y-1 flex-1 flex flex-col justify-center">
                    <p className="font-handwriting text-parchment-text text-[11px] leading-relaxed break-words whitespace-pre-line">
                      {photo.caption}
                    </p>
                    {hasDate && (
                      <span className="text-[8px] font-bold text-parchment-rose block mt-1">
                        {photo.date}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                /* Text-Only Slot */
                <div className="text-center">
                  <p className="font-handwriting text-parchment-text text-xs leading-relaxed break-words whitespace-pre-line mb-2">
                    {photo.caption}
                  </p>
                  {hasDate && (
                    <span className="text-[9px] font-bold text-parchment-rose block">
                      📬 {photo.date}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Gallery Bottom Button */}
      <div className="flex flex-col items-center mt-20 pb-12 z-30">
        <button
          onClick={onNext}
          className="group px-6 py-2 border-b border-parchment-gold hover:border-parchment-rose text-parchment-gold hover:text-parchment-rose font-arabic font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer"
        >
          <span>{nextButtonText || 'التالي'}</span>
          <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Photo Slider */}
            <div className="relative w-full max-w-[360px] flex items-center justify-center">
              
              {/* Previous Button */}
              {photosOnly.length > 1 && (
                <button
                  onClick={prevPhoto}
                  className="absolute right-[-20px] md:right-[-40px] p-1.5 text-white/55 hover:text-white bg-white/10 rounded-full hover:bg-white/25 transition-all z-10 cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Polaroid Frame */}
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when tapping frame
                className="bg-white p-4 pb-8 border border-white/20 shadow-2xl cursor-default w-full"
              >
                <img
                  src={gallery[lightboxIndex].photoUrl}
                  alt={gallery[lightboxIndex].caption}
                  className="w-full h-auto max-h-[340px] object-contain bg-slate-900 rounded-sm"
                />
                
                {/* Caption and Date in Lightbox */}
                <div className="mt-4 text-center">
                  <p className="font-handwriting text-parchment-text text-base md:text-lg px-2">
                    {gallery[lightboxIndex].caption}
                  </p>
                  {gallery[lightboxIndex].date && (
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      ✦ {gallery[lightboxIndex].date} ✦
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Next Button */}
              {photosOnly.length > 1 && (
                <button
                  onClick={nextPhoto}
                  className="absolute left-[-20px] md:left-[-40px] p-1.5 text-white/55 hover:text-white bg-white/10 rounded-full hover:bg-white/25 transition-all z-10 cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
