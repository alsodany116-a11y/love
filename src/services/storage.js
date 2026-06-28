import { supabase } from './supabase'

const DEFAULTS = {
  settings: {
    siteName: "رسالة حب كلاسيكية",
    recipientName: "حبيبتي الجميلة",
    mainPassword: "love",
    adminPassword: "admin123",
    envelopeLabel: "رسالة خاصة مكتوبة بماء الذهب إليكِ وحدكِ",
    envelopeHint: "✦ كلمة السر الخاصة بنا ✦",
    letterText: "إلى من سكنت قلبي وجعلت حياتي ربيعاً دائمًا.. 💖\n\nأكتب لكِ هذه الكلمات لتظل شاهدةً على حبٍّ عظيم ولد ليبقى، وقصة حب كلاسيكية تفخر بها النجوم.\n\nإليكِ عهودي الصادقة:\n• أن أكون لكِ الأمان والملجأ في كل الأوقات.\n• أن أصون ابتسامتكِ الجميلة التي تضيء عالمي.\n• أن تظل روحي حاضنة لروحكِ في السراء والضراء.\n\nأحبكِ اليوم، غداً، وإلى نهاية العمر.. وكل لحظة بجانبكِ هي أثمن لحظات حياتي. ✨",
    signatureName: "المخلص لكِ دائماً",
    letterFontSize: "text-2xl",
    musicName: "Classic Italian Piano",
    musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    musicAutoplay: true,
    nextButtonText: "التالي",
    galleryTitle: "معرض الصور والذكريات",
    selectedArabicFont: "Noto Naskh Arabic",
    selectedEnglishFont: "Lora",
    playlist: [
      { name: "Classic Italian Piano", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { name: "Venice Gondola Melody", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
      { name: "Under the Tuscan Stars", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
    ],
    meetings: [
      { date: "14 فبراير 2024", title: "اللقاء الأول", location: "مقهى الكاتدرائية القديم", note: "ارتشفنا قهوة الإسبريسو معاً وتحدثنا لساعات." },
      { date: "20 مارس 2024", title: "موعد على النهر", location: "جسر فينيسيا الخشبي", note: "شاهدنا غروب الشمس وشاركتِني ضحكتكِ الساحرة." },
      { date: "01 مايو 2024", title: "يوم الاعتراف", location: "حديقة الورود الكلاسيكية", note: "اليوم الذي غير مجرى حياتي إلى الأبد." }
    ],
    voiceUrl: null,
    firstEncounterDate: "2024-02-14T19:00:00+03:00",
    envelopeStyle: "vintage",
    sealStyle: "heart",
    transitionStyle: "cinematic",
    musicStyle: "vinyl",
    envelopeInsideText: "إلى أغلى ما أملك...",
    bgHeartsOpacity: 0.15,
    colors: {
      bg: "#F5EDD6",
      gold: "#B8960C",
      rose: "#8B3A52",
      text: "#2C1810",
      card: "#FDF6E3",
      border: "#C9A84C"
    },
    themePreset: "classic"
  },
  memories: [
    {
      id: "1",
      title: "أول لقاء بيننا",
      date: "14 فبراير 2024",
      description: "اليوم الذي التقت فيه أعيننا لأول مرة، كان يوماً ربيعياً جميلاً هبت فيه نسمات دافئة أحسست معها أن حياتي قد بدأت للتو.",
      photoUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600",
      sortOrder: 1
    },
    {
      id: "2",
      title: "أول اعتراف بالحب",
      date: "01 مايو 2024",
      description: "تحت أضواء الشموع الخافتة، وبنبضات قلب متسارعة، همست لكِ بكلمة \"أحبك\" لأول مرة.. وكم كانت فرحتي حين رأيت ابتسامتكِ الخجولة.",
      photoUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600",
      sortOrder: 2
    }
  ],
  gallery: [
    {
      id: "1",
      photoUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=600",
      caption: "وردة حمراء تذكرني بكِ دائماً",
      date: "فبراير 2024",
      sortOrder: 1
    }
  ]
}

// Helpers for LocalStorage Backup
const getLocalBackup = (key, defaultVal) => {
  try {
    const val = localStorage.getItem(`romantic_backup_${key}`)
    return val ? JSON.parse(val) : defaultVal
  } catch (e) {
    return defaultVal
  }
}

const setLocalBackup = (key, val) => {
  try {
    localStorage.setItem(`romantic_backup_${key}`, JSON.stringify(val))
  } catch (e) {
    console.error("Local storage error:", e)
  }
}

export const storage = {
  // --- 1. SETTINGS SERVICES ---
  getSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('romantic_settings')
        .select('*')
        .eq('id', 'config')
        .single()

      if (error || !data) {
        console.warn("Supabase load failed, using local storage/defaults:", error)
        const local = getLocalBackup('settings', DEFAULTS.settings)
        storage.applyColorsToDOM(local.colors, local.themePreset)
        storage.applyFontsToDOM(local.selectedArabicFont, local.selectedEnglishFont)
        return local
      }

      const mappedSettings = {
        siteName: data.site_name,
        recipientName: data.recipient_name,
        mainPassword: data.main_password,
        adminPassword: data.admin_password,
        envelopeLabel: data.envelope_label,
        envelopeHint: data.envelope_hint,
        letterText: data.letter_text || "", // STRICT CRASH GUARD
        signatureName: data.signature_name || "",
        letterFontSize: data.letter_font_size || "text-2xl",
        musicName: data.music_name,
        musicUrl: data.music_url,
        musicAutoplay: data.music_autoplay,
        nextButtonText: data.next_button_text || "التالي",
        galleryTitle: data.gallery_title || "معرض الصور والذكريات",
        selectedArabicFont: data.selected_arabic_font || "Noto Naskh Arabic",
        selectedEnglishFont: data.selected_english_font || "Lora",
        playlist: data.playlist || DEFAULTS.settings.playlist,
        meetings: data.meetings || [],
        voiceUrl: data.voice_url || null,
        firstEncounterDate: data.first_encounter_date || "2024-02-14T19:00:00+03:00",
        envelopeStyle: data.envelope_style || "vintage",
        sealStyle: data.seal_style || "heart",
        transitionStyle: data.transition_style || "cinematic",
        musicStyle: data.music_style || "vinyl",
        themePreset: data.theme_preset || "classic",
        envelopeInsideText: data.envelope_inside_text || "إلى أغلى ما أملك...",
        bgHeartsOpacity: data.bg_hearts_opacity !== undefined ? data.bg_hearts_opacity : 0.15,
        colors: {
          bg: data.bg_color,
          gold: data.gold_color,
          rose: data.rose_color,
          text: data.text_color,
          card: data.card_color || (data.theme_preset === 'minimal' ? '#ffffff' : (data.theme_preset === 'night' ? '#0e1628' : (data.theme_preset === 'forest' ? '#0c1a10' : (data.theme_preset === 'dark' ? '#1a0d20' : '#FDF6E3')))),
          border: data.border_color || (data.theme_preset === 'minimal' ? '#c5e3f5' : (data.theme_preset === 'night' ? '#1e3060' : (data.theme_preset === 'forest' ? '#1a3a22' : (data.theme_preset === 'dark' ? '#3a1a30' : '#C9A84C'))))
        }
      }

      storage.applyColorsToDOM(mappedSettings.colors, mappedSettings.themePreset)
      storage.applyFontsToDOM(mappedSettings.selectedArabicFont, mappedSettings.selectedEnglishFont)
      setLocalBackup('settings', mappedSettings)
      return mappedSettings
    } catch (e) {
      console.error(e)
      const local = getLocalBackup('settings', DEFAULTS.settings)
      storage.applyColorsToDOM(local.colors, local.themePreset)
      storage.applyFontsToDOM(local.selectedArabicFont, local.selectedEnglishFont)
      return local
    }
  },

  saveSettings: async (settings) => {
    setLocalBackup('settings', settings)
    storage.applyColorsToDOM(settings.colors, settings.themePreset)
    storage.applyFontsToDOM(settings.selectedArabicFont, settings.selectedEnglishFont)

    try {
      const { error } = await supabase
        .from('romantic_settings')
        .upsert({
          id: 'config',
          site_name: settings.siteName,
          recipient_name: settings.recipientName,
          main_password: settings.mainPassword,
          admin_password: settings.adminPassword,
          envelope_label: settings.envelopeLabel,
          envelope_hint: settings.envelopeHint,
          letter_text: settings.letterText || "",
          signature_name: settings.signatureName || "",
          letter_font_size: settings.letterFontSize || "text-2xl",
          music_name: settings.musicName,
          music_url: settings.musicUrl,
          music_autoplay: settings.musicAutoplay,
          bg_color: settings.colors.bg,
          gold_color: settings.colors.gold,
          rose_color: settings.colors.rose,
          text_color: settings.colors.text,
          next_button_text: settings.nextButtonText || 'التالي',
          gallery_title: settings.galleryTitle || 'معرض الصور والذكريات',
          selected_arabic_font: settings.selectedArabicFont || 'Noto Naskh Arabic',
          selected_english_font: settings.selectedEnglishFont || 'Lora',
          playlist: settings.playlist || [],
          meetings: settings.meetings || [],
          voice_url: settings.voiceUrl || null,
          first_encounter_date: settings.firstEncounterDate || null,
          envelope_style: settings.envelopeStyle || 'vintage',
          seal_style: settings.sealStyle || 'heart',
          transition_style: settings.transitionStyle || 'cinematic',
          music_style: settings.musicStyle || 'vinyl',
          theme_preset: settings.themePreset || 'classic',
          envelope_inside_text: settings.envelopeInsideText || 'إلى أغلى ما أملك...',
          bg_hearts_opacity: settings.bgHeartsOpacity !== undefined ? settings.bgHeartsOpacity : 0.15
        })

      if (error) throw error
      return { success: true }
    } catch (e) {
      console.error("Failed to save settings to Supabase:", e)
      return { success: false, error: e.message }
    }
  },

  applyColorsToDOM: (colors, themePreset = 'classic') => {
    if (!colors) return
    const root = document.documentElement
    
    // Check if we are on the admin path to isolate admin dashboard from theme styles
    const isAdmin = window.location.pathname.startsWith('/admin')

    const bg = isAdmin ? '#F5EDD6' : (colors.bg || '#F5EDD6')
    const gold = isAdmin ? '#B8960C' : (colors.gold || '#B8960C')
    const rose = isAdmin ? '#8B3A52' : (colors.rose || '#8B3A52')
    const text = isAdmin ? '#2C1810' : (colors.text || '#2C1810')
    const card = isAdmin ? '#FDF6E3' : (colors.card || '#FDF6E3')
    const border = isAdmin ? '#C9A84C' : (colors.border || '#C9A84C')
    const activePreset = isAdmin ? 'classic' : themePreset

    // Dynamically inject theme preset class onto document body
    document.body.className = `theme-${activePreset} bg-parchment-bg text-parchment-text antialiased`

    root.style.setProperty('--color-bg', bg)
    root.style.setProperty('--color-gold', gold)
    root.style.setProperty('--color-rose', rose)
    root.style.setProperty('--color-text', text)
    root.style.setProperty('--color-card', card)
    root.style.setProperty('--color-border', border)
  },

  applyFontsToDOM: (arabicFont, englishFont) => {
    const root = document.documentElement
    const isAdmin = window.location.pathname.startsWith('/admin')
    
    const activeArabic = isAdmin ? 'Noto Naskh Arabic' : (arabicFont || 'Noto Naskh Arabic')
    const activeEnglish = isAdmin ? 'Lora' : (englishFont || 'Lora')

    root.style.setProperty('--font-arabic', `"${activeArabic}"`)
    root.style.setProperty('--font-english', `"${activeEnglish}"`)
  },

  // --- 2. FILE UPLOADS TO SUPABASE STORAGE ---
  uploadFile: async (file, bucketName = 'love-assets') => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload file directly to Supabase Storage Bucket
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Retrieve public URL of the uploaded asset
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      return { success: true, url: publicUrlData.publicUrl }
    } catch (e) {
      console.error("Supabase storage upload failed:", e)
      return { success: false, error: e.message }
    }
  },

  // --- 3. SITE ANALYTICS MODULES ---
  incrementOpenCount: async () => {
    try {
      const { data } = await supabase
        .from('romantic_analytics')
        .select('*')
        .eq('id', 'analytics')
        .single()

      const currentOpen = data ? (data.open_count || 0) : 0

      const { error } = await supabase
        .from('romantic_analytics')
        .upsert({
          id: 'analytics',
          open_count: currentOpen + 1,
          last_open: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      if (error) throw error
    } catch (e) {
      console.warn("Analytics increment open failed:", e)
    }
  },

  incrementPageView: async (pageName) => {
    try {
      const { data } = await supabase
        .from('romantic_analytics')
        .select('*')
        .eq('id', 'analytics')
        .single()

      if (data) {
        const colName = `${pageName}_views` // e.g. letter_views
        const currentCount = data[colName] || 0
        await supabase
          .from('romantic_analytics')
          .update({
            [colName]: currentCount + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', 'analytics')
      }
    } catch (e) {
      console.warn(`Analytics increment page view for ${pageName} failed:`, e)
    }
  },

  updatePageDuration: async (pageName, durationSeconds) => {
    if (!durationSeconds || durationSeconds <= 0) return
    try {
      const { data } = await supabase
        .from('romantic_analytics')
        .select('*')
        .eq('id', 'analytics')
        .single()

      if (data) {
        const colName = `${pageName}_duration` // e.g. letter_duration
        const currentDuration = data[colName] || 0
        await supabase
          .from('romantic_analytics')
          .update({
            [colName]: currentDuration + Math.round(durationSeconds),
            updated_at: new Date().toISOString()
          })
          .eq('id', 'analytics')
      }
    } catch (e) {
      console.warn(`Analytics duration update for ${pageName} failed:`, e)
    }
  },

  getAnalytics: async () => {
    try {
      const { data, error } = await supabase
        .from('romantic_analytics')
        .select('*')
        .eq('id', 'analytics')
        .single()

      if (error || !data) throw error
      return data
    } catch (e) {
      console.warn("Could not load analytics from Supabase, using mock zeros:", e)
      return {
        open_count: 0,
        last_open: null,
        letter_views: 0,
        timeline_views: 0,
        gallery_views: 0,
        final_views: 0,
        letter_duration: 0,
        timeline_duration: 0,
        gallery_duration: 0,
        final_duration: 0
      }
    }
  },

  // --- 4. TIMELINE / MEMORIES SERVICES ---
  getMemories: async () => {
    try {
      const { data, error } = await supabase
        .from('romantic_memories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error || !data || data.length === 0) {
        console.warn("Memories empty or load error, using local/defaults:", error)
        return getLocalBackup('memories', DEFAULTS.memories)
      }

      const mappedMemories = data.map(item => ({
        id: item.id,
        title: item.title,
        date: item.date,
        description: item.description,
        photoUrl: item.photo_url,
        sortOrder: item.sort_order || 0
      }))

      setLocalBackup('memories', mappedMemories)
      return mappedMemories
    } catch (e) {
      console.error(e)
      return getLocalBackup('memories', DEFAULTS.memories)
    }
  },

  saveMemoriesList: async (memoriesList) => {
    setLocalBackup('memories', memoriesList)
    try {
      const rows = memoriesList.map((item, idx) => ({
        id: item.id.length > 8 ? item.id : undefined,
        title: item.title,
        date: item.date || null,
        description: item.description,
        photo_url: item.photoUrl || null,
        sort_order: idx + 1
      }))

      const { error } = await supabase
        .from('romantic_memories')
        .upsert(rows)

      if (error) throw error
      return { success: true }
    } catch (e) {
      console.error("Failed to batch save memories:", e)
      return { success: false, error: e.message }
    }
  },

  addMemory: async (memory) => {
    try {
      const { data, error } = await supabase
        .from('romantic_memories')
        .insert({
          title: memory.title,
          date: memory.date || null,
          description: memory.description,
          photo_url: memory.photoUrl || null,
          sort_order: memory.sortOrder || 0
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (e) {
      console.error(e)
      return { success: false, error: e.message }
    }
  },

  updateMemory: async (id, memory) => {
    try {
      const { error } = await supabase
        .from('romantic_memories')
        .update({
          title: memory.title,
          date: memory.date || null,
          description: memory.description,
          photo_url: memory.photoUrl || null,
          sort_order: memory.sortOrder
        })
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (e) {
      console.error(e)
      return { success: false, error: e.message }
    }
  },

  deleteMemory: async (id) => {
    try {
      const { error } = await supabase
        .from('romantic_memories')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (e) {
      console.error(e)
      return { success: false, error: e.message }
    }
  },

  // --- 5. GALLERY SERVICES ---
  getGallery: async () => {
    try {
      const { data, error } = await supabase
        .from('romantic_gallery')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error || !data || data.length === 0) {
        console.warn("Gallery empty or load error, using local/defaults:", error)
        return getLocalBackup('gallery', DEFAULTS.gallery)
      }

      const mappedGallery = data.map(item => ({
        id: item.id,
        photoUrl: item.photo_url,
        caption: item.caption,
        date: item.date,
        sortOrder: item.sort_order || 0
      }))

      setLocalBackup('gallery', mappedGallery)
      return mappedGallery
    } catch (e) {
      console.error(e)
      return getLocalBackup('gallery', DEFAULTS.gallery)
    }
  },

  saveGalleryList: async (galleryList) => {
    setLocalBackup('gallery', galleryList)
    try {
      const rows = galleryList.map((item, idx) => ({
        id: item.id.length > 8 ? item.id : undefined,
        photo_url: item.photoUrl || null,
        caption: item.caption,
        date: item.date || null,
        sort_order: idx + 1
      }))

      const { error } = await supabase
        .from('romantic_gallery')
        .upsert(rows)

      if (error) throw error
      return { success: true }
    } catch (e) {
      console.error(e)
      return { success: false, error: e.message }
    }
  },

  addPhoto: async (photo) => {
    try {
      const { data, error } = await supabase
        .from('romantic_gallery')
        .insert({
          photo_url: photo.photoUrl || null,
          caption: photo.caption,
          date: photo.date || null,
          sort_order: photo.sortOrder || 0
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (e) {
      console.error(e)
      return { success: false, error: e.message }
    }
  },

  updatePhoto: async (id, photo) => {
    try {
      const { error } = await supabase
        .from('romantic_gallery')
        .update({
          photo_url: photo.photoUrl || null,
          caption: photo.caption,
          date: photo.date || null,
          sort_order: photo.sortOrder
        })
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (e) {
      console.error(e)
      return { success: false, error: e.message }
    }
  },

  deletePhoto: async (id) => {
    try {
      const { error } = await supabase
        .from('romantic_gallery')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (e) {
      console.error(e)
      return { success: false, error: e.message }
    }
  }
}
