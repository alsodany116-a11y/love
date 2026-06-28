import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, Lock, MessageSquare, Calendar, Image, Music, Palette,
  Plus, Trash2, Edit2, Check, ArrowRight, Eye, ShieldAlert,
  ArrowUp, ArrowDown, List, CalendarDays, BarChart3, Upload, Loader2, Play
} from 'lucide-react'
import { storage } from '../services/storage'

export default function AdminDashboard({ onBackToSite, onSettingsChanged }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  // Local states matching storage settings
  const [settings, setSettings] = useState(null)
  const [memories, setMemories] = useState([])
  const [gallery, setGallery] = useState([])
  const [analytics, setAnalytics] = useState(null)

  // Upload progress indicators
  const [isUploading, setIsUploading] = useState(false)
  const [uploadField, setUploadField] = useState('') // 'memory', 'photo', 'voice'

  // Modal / Add drawer states for memory
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false)
  const [memoryForm, setMemoryForm] = useState({ id: '', title: '', date: '', description: '', photoUrl: '' })
  
  // Modal / Add drawer states for photo
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [photoForm, setPhotoForm] = useState({ id: '', photoUrl: '', caption: '', date: '' })

  // Modal / Add drawer states for playlist item
  const [isPlaylistItemModalOpen, setIsPlaylistItemModalOpen] = useState(false)
  const [playlistForm, setPlaylistForm] = useState({ index: -1, name: '', url: '' })

  // Modal / Add drawer states for meetings item
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [meetingForm, setMeetingForm] = useState({ index: -1, date: '', title: '', location: '', note: '' })

  // List of 10 Arabic and 10 English Google Fonts
  const arabicFonts = [
    'Noto Naskh Arabic',
    'Cairo',
    'Tajawal',
    'Almarai',
    'Amiri',
    'Changa',
    'Reem Kufi',
    'IBM Plex Sans Arabic',
    'Alexandria',
    'Lemonada'
  ]

  const englishFonts = [
    'Lora',
    'Playfair Display',
    'Inter',
    'Roboto',
    'Montserrat',
    'Cinzel',
    'Great Vibes',
    'Dancing Script',
    'Cormorant Garamond',
    'Parisienne'
  ]

  // Fetch settings, memories, gallery, analytics
  useEffect(() => {
    async function loadData() {
      const dbSettings = await storage.getSettings()
      const dbMemories = await storage.getMemories()
      const dbGallery = await storage.getGallery()
      const dbAnalytics = await storage.getAnalytics()
      
      setSettings(dbSettings)
      setMemories(dbMemories)
      setGallery(dbGallery)
      setAnalytics(dbAnalytics)
    }
    loadData()
  }, [])

  // Admin login check
  const handleAdminAuth = (e) => {
    e.preventDefault()
    if (!settings) return
    const entered = adminPasswordInput.trim()
    const correct = settings.adminPassword || 'admin123'

    if (entered === correct) {
      setIsAdminAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('الباسورد غير صحيح. يرجى التحقق وإعادة المحاولة!')
    }
  }

  // File upload handler to Supabase Storage
  const handleFileUpload = async (e, fieldType) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    setUploadField(fieldType)

    const res = await storage.uploadFile(file, 'love-assets')
    if (res.success && res.url) {
      if (fieldType === 'memory') {
        setMemoryForm(prev => ({ ...prev, photoUrl: res.url }))
      } else if (fieldType === 'photo') {
        setPhotoForm(prev => ({ ...prev, photoUrl: res.url }))
      } else if (fieldType === 'voice') {
        setSettings(prev => ({ ...prev, voiceUrl: res.url }))
      }
      alert('تم تحميل الملف وتوليد الرابط بنجاح! 📸🎙️')
    } else {
      alert(`عذراً، فشل تحميل الملف: ${res.error || 'تأكد من إنشاء حاوية love-assets في Supabase Storage'}`)
    }
    setIsUploading(false)
    setUploadField('')
  }

  // Trigger Save to database
  const saveAllSettings = async (newSettings = settings) => {
    setIsSaving(true)
    setSaveStatus(null)
    const result = await storage.saveSettings(newSettings)
    if (result.success) {
      setSaveStatus('success')
      if (onSettingsChanged) {
        onSettingsChanged(newSettings)
      }
      setTimeout(() => setSaveStatus(null), 3000)
    } else {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 4000)
    }
    setIsSaving(false)
  }

  // Handle color change
  const handleColorChange = (key, val) => {
    const updated = {
      ...settings,
      colors: {
        ...settings.colors,
        [key]: val
      }
    }
    setSettings(updated)
    storage.applyColorsToDOM(updated.colors, updated.themePreset)
  }

  // Handle applying theme presets
  const handleApplyThemePreset = (preset) => {
    let card = '#FDF6E3'
    let border = '#C9A84C'
    
    if (preset.id === 'dark') {
      card = '#1a0d20'
      border = '#3a1a30'
    } else if (preset.id === 'minimal') {
      card = '#ffffff'
      border = '#c5e3f5'
    } else if (preset.id === 'night') {
      card = '#0e1628'
      border = '#1e3060'
    } else if (preset.id === 'forest') {
      card = '#0c1a10'
      border = '#1a3a22'
    }

    const updated = {
      ...settings,
      themePreset: preset.id,
      selectedArabicFont: preset.arabicFont,
      selectedEnglishFont: preset.englishFont,
      colors: {
        bg: preset.bg,
        text: preset.text,
        rose: preset.rose,
        gold: preset.gold,
        card: card,
        border: border
      }
    }
    setSettings(updated)
    storage.applyColorsToDOM(updated.colors, updated.themePreset)
    storage.applyFontsToDOM(updated.selectedArabicFont, updated.selectedEnglishFont)
    saveAllSettings(updated)
  }

  // Handle font changes
  const handleFontChange = (key, val) => {
    const updated = {
      ...settings,
      [key]: val
    }
    setSettings(updated)
    storage.applyFontsToDOM(
      key === 'selectedArabicFont' ? val : settings.selectedArabicFont,
      key === 'selectedEnglishFont' ? val : settings.selectedEnglishFont
    )
  }

  // --- MEMORIES OPERATIONS ---
  const openMemoryAdd = () => {
    setMemoryForm({ id: '', title: '', date: '', description: '', photoUrl: '' })
    setIsMemoryModalOpen(true)
  }

  const openMemoryEdit = (item) => {
    setMemoryForm({
      id: item.id,
      title: item.title,
      date: item.date || '',
      description: item.description,
      photoUrl: item.photoUrl || ''
    })
    setIsMemoryModalOpen(true)
  }

  const handleSaveMemory = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    let updatedMemories = [...memories]

    if (memoryForm.id) {
      const index = updatedMemories.findIndex(m => m.id === memoryForm.id)
      if (index !== -1) {
        updatedMemories[index] = { ...memoryForm }
      }
      await storage.updateMemory(memoryForm.id, memoryForm)
    } else {
      const newMemory = { ...memoryForm, id: Date.now().toString(), sortOrder: memories.length + 1 }
      const res = await storage.addMemory(newMemory)
      if (res.success && res.data) {
        newMemory.id = res.data.id
      }
      updatedMemories.push(newMemory)
    }

    setMemories(updatedMemories)
    await storage.saveMemoriesList(updatedMemories)
    setIsMemoryModalOpen(false)
    setIsSaving(false)
  }

  const handleDeleteMemory = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الذكرى؟')) return
    setIsSaving(true)
    const filtered = memories.filter(m => m.id !== id)
    setMemories(filtered)
    await storage.deleteMemory(id)
    await storage.saveMemoriesList(filtered)
    setIsSaving(false)
  }

  // --- GALLERY OPERATIONS ---
  const openPhotoAdd = () => {
    setPhotoForm({ id: '', photoUrl: '', caption: '', date: '' })
    setIsPhotoModalOpen(true)
  }

  const openPhotoEdit = (item) => {
    setPhotoForm({
      id: item.id,
      photoUrl: item.photoUrl || '',
      caption: item.caption,
      date: item.date || ''
    })
    setIsPhotoModalOpen(true)
  }

  const handleSavePhoto = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    let updatedGallery = [...gallery]

    if (photoForm.id) {
      const index = updatedGallery.findIndex(p => p.id === photoForm.id)
      if (index !== -1) {
        updatedGallery[index] = { ...photoForm }
      }
      await storage.updatePhoto(photoForm.id, photoForm)
    } else {
      const newPhoto = { ...photoForm, id: Date.now().toString(), sortOrder: gallery.length + 1 }
      const res = await storage.addPhoto(newPhoto)
      if (res.success && res.data) {
        newPhoto.id = res.data.id
      }
      updatedGallery.push(newPhoto)
    }

    setGallery(updatedGallery)
    await storage.saveGalleryList(updatedGallery)
    setIsPhotoModalOpen(false)
    setIsSaving(false)
  }

  const handleDeletePhoto = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) return
    setIsSaving(true)
    const filtered = gallery.filter(p => p.id !== id)
    setGallery(filtered)
    await storage.deletePhoto(id)
    await storage.saveGalleryList(filtered)
    setIsSaving(false)
  }

  // --- PLAYLIST OPERATIONS (JSON SETTINGS) ---
  const openPlaylistAdd = () => {
    setPlaylistForm({ index: -1, name: '', url: '' })
    setIsPlaylistItemModalOpen(true)
  }

  const openPlaylistEdit = (index, track) => {
    setPlaylistForm({
      index,
      name: track.name,
      url: track.url
    })
    setIsPlaylistItemModalOpen(true)
  }

  const handleSavePlaylistItem = (e) => {
    e.preventDefault()
    const currentPlaylist = [...(settings.playlist || [])]
    const newItem = { name: playlistForm.name, url: playlistForm.url }

    if (playlistForm.index !== -1) {
      currentPlaylist[playlistForm.index] = newItem
    } else {
      currentPlaylist.push(newItem)
    }

    const updated = { ...settings, playlist: currentPlaylist }
    setSettings(updated)
    saveAllSettings(updated)
    setIsPlaylistItemModalOpen(false)
  }

  const handleDeletePlaylistItem = (index) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الأغنية؟')) return
    const currentPlaylist = [...(settings.playlist || [])]
    currentPlaylist.splice(index, 1)

    const updated = { ...settings, playlist: currentPlaylist }
    setSettings(updated)
    saveAllSettings(updated)
  }

  const movePlaylistItem = (index, direction) => {
    const currentPlaylist = [...(settings.playlist || [])]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= currentPlaylist.length) return

    const temp = currentPlaylist[index]
    currentPlaylist[index] = currentPlaylist[targetIndex]
    currentPlaylist[targetIndex] = temp

    const updated = { ...settings, playlist: currentPlaylist }
    setSettings(updated)
    saveAllSettings(updated)
  }

  // --- MEETINGS / CALENDAR OPERATIONS (JSON SETTINGS) ---
  const openMeetingAdd = () => {
    setMeetingForm({ index: -1, date: '', title: '', location: '', note: '' })
    setIsMeetingModalOpen(true)
  }

  const openMeetingEdit = (index, meeting) => {
    setMeetingForm({
      index,
      date: meeting.date,
      title: meeting.title,
      location: meeting.location || '',
      note: meeting.note || ''
    })
    setIsMeetingModalOpen(true)
  }

  const handleSaveMeetingItem = (e) => {
    e.preventDefault()
    const currentMeetings = [...(settings.meetings || [])]
    const newItem = {
      date: meetingForm.date,
      title: meetingForm.title,
      location: meetingForm.location,
      note: meetingForm.note
    }

    if (meetingForm.index !== -1) {
      currentMeetings[meetingForm.index] = newItem
    } else {
      currentMeetings.push(newItem)
    }

    const updated = { ...settings, meetings: currentMeetings }
    setSettings(updated)
    saveAllSettings(updated)
    setIsMeetingModalOpen(false)
  }

  const handleDeleteMeetingItem = (index) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا اللقاء؟')) return
    const currentMeetings = [...(settings.meetings || [])]
    currentMeetings.splice(index, 1)

    const updated = { ...settings, meetings: currentMeetings }
    setSettings(updated)
    saveAllSettings(updated)
  }

  // Calculate Most Viewed Section & formats durations
  const getMostViewedSection = () => {
    if (!analytics) return 'غير متوفر'
    const viewsMap = {
      'الرسالة الرومانسية': analytics.letter_views || 0,
      'شريط الذكريات': analytics.timeline_views || 0,
      'معرض الصور': analytics.gallery_views || 0,
      'الصفحة الختامية': analytics.final_views || 0
    }
    let maxViews = -1
    let mostViewed = 'غير متوفر'
    for (const [section, count] of Object.entries(viewsMap)) {
      if (count > maxViews) {
        maxViews = count
        mostViewed = section
      }
    }
    return maxViews > 0 ? `${mostViewed} (${maxViews} زيارة)` : 'لا توجد زيارات بعد'
  }

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return '0 ثانية'
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return m > 0 ? `${m} دقيقة و ${s} ثانية` : `${s} ثانية`
  }

  // Conversion helper for HTML Datetime-Local Picker
  const formatDatetimeForPicker = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    // Offset local timezone date representation
    const tzOffset = date.getTimezoneOffset() * 60000
    const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16)
    return localISOTime
  }

  if (!settings) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-parchment-bg text-parchment-text select-none">
        <div className="text-center font-arabic">
          <div className="w-10 h-10 border-4 border-parchment-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>جاري تحميل إعدادات لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  // --- PASSWORD PROTECTION GATE ---
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-parchment-bg text-parchment-text select-none">
        <div className="w-full max-w-[370px] bg-parchment-card border border-parchment-border/40 rounded-lg p-8 shadow-vintage relative">
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-parchment-rose/10 rounded-full flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6 text-parchment-rose" />
            </div>
            <h1 className="text-xl font-bold font-arabic mb-1">دخول لوحة الإشراف</h1>
            <p className="text-xs text-parchment-text/60 leading-relaxed font-arabic">
              يرجى إدخال كلمة مرور المشرف للوصول وتعديل إعدادات الموقع.
            </p>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                placeholder="كلمة مرور لوحة التحكم"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full py-2.5 px-10 text-center bg-[#FAF6EE] border border-parchment-border/30 rounded focus:border-parchment-rose focus:outline-none font-arabic text-sm"
              />
              <Lock className="w-4 h-4 text-parchment-gold absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {authError && (
              <p className="text-parchment-rose text-xs font-semibold text-center">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-parchment-rose text-white hover:bg-[#732C3F] active:scale-95 transition-all rounded font-arabic text-sm font-semibold cursor-pointer shadow-md"
            >
              تسجيل الدخول
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-parchment-border/20 text-center">
            <button
              onClick={onBackToSite}
              className="text-xs text-parchment-gold hover:text-parchment-rose font-arabic flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <span>العودة للموقع الرئيسي</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    )
  }

  // --- ADMIN MAIN DASHBOARD UI ---
  return (
    <div className="min-h-screen w-full bg-parchment-bg text-parchment-text p-4 md:p-8 flex justify-center dir-rtl font-arabic select-none pb-24">
      <div className="w-full max-w-[820px] bg-parchment-card border border-parchment-border rounded-lg shadow-vintage overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-56 bg-[#EDE4CA] border-b md:border-b-0 md:border-l border-parchment-border/50 p-4 space-y-1.5 flex-shrink-0 flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar">
          
          <div className="hidden md:flex flex-col items-center text-center pb-6 border-b border-parchment-border/20 mb-4">
            <span className="text-2xl font-bold">💎</span>
            <h2 className="font-playfair italic font-bold text-lg mt-2 text-parchment-text">إعدادات الحب</h2>
            <p className="text-[10px] text-parchment-text/60 mt-1">تحديث لايف بمقدار ثانية</p>
          </div>

          {[
            { id: 'general', label: 'إعدادات عامة', icon: Settings },
            { id: 'login', label: 'صفحة الدخول', icon: Lock },
            { id: 'letter', label: 'الرسالة والصوت', icon: MessageSquare },
            { id: 'timeline', label: 'قصة الذكريات', icon: Calendar },
            { id: 'meetings', label: 'جدول المقابلات 🗓️', icon: CalendarDays },
            { id: 'gallery', label: 'معرض Polaroid', icon: Image },
            { id: 'playlist', label: 'قائمة الأغاني 🎵', icon: List },
            { id: 'colors', label: 'المظهر والخطوط 🎨', icon: Palette },
            { id: 'analytics', label: 'الإحصائيات 📊', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded text-sm transition-all text-right w-full flex-shrink-0 font-medium ${
                  isActive
                    ? 'bg-parchment-gold text-white shadow-sm'
                    : 'text-parchment-text/75 hover:bg-[#E4D9BB]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            )
          })}

          <div className="md:mt-auto pt-4 md:border-t border-parchment-border/20 flex flex-col gap-2 w-full md:flex-none">
            <button
              onClick={onBackToSite}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-parchment-text/5 hover:bg-parchment-text/10 text-parchment-text rounded text-xs transition-all w-full cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">معاينة الموقع</span>
            </button>
          </div>

        </div>

        {/* Tab Contents Panels */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto max-h-[85vh] no-scrollbar">
          
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-parchment-border/25">
            <h2 className="text-xl font-bold">
              {activeTab === 'general' && 'عام ومفاتيح الأمان'}
              {activeTab === 'login' && 'تهيئة شاشة الدخول'}
              {activeTab === 'letter' && 'تعديل الرسالة والتسجيل الصوتي'}
              {activeTab === 'timeline' && 'إدارة محطات الذكريات'}
              {activeTab === 'meetings' && 'سجل اللقاءات والمقابلات'}
              {activeTab === 'gallery' && 'معرض صور Polaroid'}
              {activeTab === 'playlist' && 'إدارة قائمة الأغاني المتتابعة'}
              {activeTab === 'colors' && 'تخصيص المظهر بالكامل'}
              {activeTab === 'analytics' && 'لوحة التحليلات والمشاهدات'}
            </h2>
            
            <AnimatePresence>
              {saveStatus && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 font-semibold ${
                    saveStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{saveStatus === 'success' ? 'تم الحفظ في Supabase!' : 'خطأ أثناء الحفظ!'}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2">اسم الموقع ✦</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2">اسم محبوبتكِ ✦</label>
                  <input
                    type="text"
                    value={settings.recipientName}
                    onChange={(e) => setSettings({ ...settings, recipientName: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2">تاريخ وساعة أول مقابلة (العداد التنازلي/التصاعدي) ✦</label>
                <input
                  type="datetime-local"
                  value={formatDatetimeForPicker(settings.firstEncounterDate)}
                  onChange={(e) => setSettings({ ...settings, firstEncounterDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="admin-input font-mono"
                />
                <p className="text-[10px] text-parchment-text/50 mt-1">
                  مثال: موعد التقائكما لأول مرة، وسيظهر العداد يحسب بالثانية منذ ذلك اليوم.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2">كلمة المرور الرئيسية (للمحبوب) ✦</label>
                <input
                  type="text"
                  value={settings.mainPassword}
                  onChange={(e) => setSettings({ ...settings, mainPassword: e.target.value })}
                  className="admin-input font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2">كلمة مرور المشرف (لهذه اللوحة) ✦</label>
                <input
                  type="text"
                  value={settings.adminPassword}
                  onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                  className="admin-input font-mono"
                />
              </div>

              <div className="pt-6">
                <button
                  onClick={() => saveAllSettings()}
                  disabled={isSaving}
                  className="admin-save-btn"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات العامة'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LOGIN CONFIG */}
          {activeTab === 'login' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-2">عنوان الظرف المكتوب بخط اليد ✦</label>
                <input
                  type="text"
                  value={settings.envelopeLabel}
                  onChange={(e) => setSettings({ ...settings, envelopeLabel: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2">تلميح حقل الإدخال ✦</label>
                <input
                  type="text"
                  value={settings.envelopeHint}
                  onChange={(e) => setSettings({ ...settings, envelopeHint: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2">الرسالة المكتوبة بداخل الظرف (كارت المفاجأة) ✦</label>
                <input
                  type="text"
                  value={settings.envelopeInsideText}
                  onChange={(e) => setSettings({ ...settings, envelopeInsideText: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div className="pt-6">
                <button
                  onClick={() => saveAllSettings()}
                  disabled={isSaving}
                  className="admin-save-btn"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ شاشة الدخول'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: THE LETTER & VOICE NOTES */}
          {activeTab === 'letter' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-2">محتوى الخطاب الرومانسي ✦</label>
                <textarea
                  value={settings.letterText}
                  onChange={(e) => setSettings({ ...settings, letterText: e.target.value })}
                  rows={6}
                  className="admin-input resize-y font-lora leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2">التوقيع النهائي ✦</label>
                  <input
                    type="text"
                    value={settings.signatureName}
                    onChange={(e) => setSettings({ ...settings, signatureName: e.target.value })}
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">حجم خط الرسالة ✦</label>
                  <select
                    value={settings.letterFontSize}
                    onChange={(e) => setSettings({ ...settings, letterFontSize: e.target.value })}
                    className="admin-input cursor-pointer"
                  >
                    <option value="text-lg">صغير</option>
                    <option value="text-xl">متوسط</option>
                    <option value="text-2xl">كبير</option>
                    <option value="text-3xl">كبير جداً</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Next Button Customization */}
              <div>
                <label className="block text-xs font-bold mb-2">نص زر التنقل ✦</label>
                <input
                  type="text"
                  value={settings.nextButtonText}
                  onChange={(e) => setSettings({ ...settings, nextButtonText: e.target.value })}
                  placeholder="التالي"
                  className="admin-input"
                />
              </div>

              {/* Audio Voice Recording Upload */}
              <div className="border border-parchment-border/30 rounded-lg p-4 bg-[#F2EBCE]/20 space-y-3">
                <label className="block text-xs font-bold text-parchment-rose flex items-center gap-1">
                  <span>🎙️ رفع تسجيل صوتي بصوتك (Audio MP3)</span>
                </label>
                
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileUpload(e, 'voice')}
                    className="hidden"
                    id="audio-upload-input"
                  />
                  <label
                    htmlFor="audio-upload-input"
                    className="px-4 py-2 border border-dashed border-parchment-border hover:bg-[#F2EBCE] text-parchment-gold rounded cursor-pointer text-xs font-bold flex items-center gap-1.5 transition-all w-full md:w-auto justify-center"
                  >
                    {isUploading && uploadField === 'voice' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>اختر ملف صوتي من جهازك</span>
                  </label>
                  
                  <input
                    type="text"
                    readOnly
                    placeholder="رابط الملف الصوتي المرفوع"
                    value={settings.voiceUrl || ''}
                    className="admin-input flex-grow font-mono text-xs text-left"
                  />
                </div>
                {settings.voiceUrl && (
                  <p className="text-[10px] text-green-700 font-semibold">
                    ✓ تم الرفع بنجاح! سيظهر زر "اسمعني" في الرسالة لتشغيل موجات الصوت التفاعلية.
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => saveAllSettings()}
                  disabled={isSaving}
                  className="admin-save-btn"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ الرسالة والتسجيل الصوتي'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE STORIES */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-parchment-text/60">عدد محطات الذكريات: {memories.length}</span>
                <button
                  onClick={openMemoryAdd}
                  className="px-3 py-1.5 bg-parchment-gold hover:bg-[#967B0A] text-white rounded text-xs flex items-center gap-1 transition-all cursor-pointer font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة ذكرى جديدة</span>
                </button>
              </div>

              {/* Memories List */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                {memories.map((item) => (
                  <div key={item.id} className="p-4 bg-[#F2EBCE]/50 border border-parchment-border/30 rounded flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-2">
                        {item.date && (
                          <span className="text-xs font-bold text-parchment-rose bg-parchment-card px-1.5 py-0.5 rounded">
                            {item.date}
                          </span>
                        )}
                        <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                      </div>
                      <p className="text-xs text-parchment-text/60 mt-1 truncate">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openMemoryEdit(item)}
                        className="p-1.5 hover:bg-parchment-gold hover:text-white rounded text-parchment-text/70 transition-all cursor-pointer"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMemory(item.id)}
                        className="p-1.5 hover:bg-parchment-rose hover:text-white rounded text-parchment-text/70 transition-all cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {memories.length === 0 && (
                  <p className="text-center text-xs text-parchment-text/45 py-8">لا يوجد ذكريات. أضف واحدة!</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MILESTONE MEETINGS */}
          {activeTab === 'meetings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-parchment-text/60 font-semibold">عدد المقابلات: {(settings.meetings || []).length}</span>
                <button
                  onClick={openMeetingAdd}
                  className="px-3 py-1.5 bg-parchment-gold hover:bg-[#967B0A] text-white rounded text-xs flex items-center gap-1 transition-all cursor-pointer font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة لقاء/مقابلة</span>
                </button>
              </div>

              {/* Meetings list */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                {(settings.meetings || []).map((item, idx) => (
                  <div key={idx} className="p-4 bg-[#F2EBCE]/50 border border-parchment-border/30 rounded flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-parchment-rose bg-parchment-card px-1.5 py-0.5 rounded font-mono">
                          {item.date}
                        </span>
                        <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                      </div>
                      <p className="text-xs text-parchment-text/50 mt-1 truncate">📍 {item.location} | {item.note}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openMeetingEdit(idx, item)}
                        className="p-1.5 hover:bg-parchment-gold hover:text-white rounded text-parchment-text/70 transition-all cursor-pointer"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMeetingItem(idx)}
                        className="p-1.5 hover:bg-parchment-rose hover:text-white rounded text-parchment-text/70 transition-all cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {(settings.meetings || []).length === 0 && (
                  <p className="text-center text-xs text-parchment-text/45 py-8">الجدول فارغ. سجل بعض اللقاءات!</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: PHOTO GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold mb-2">عنوان صفحة المعرض ✦</label>
                <input
                  type="text"
                  value={settings.galleryTitle}
                  onChange={(e) => setSettings({ ...settings, galleryTitle: e.target.value })}
                  placeholder="معرض الصور والذكريات"
                  className="admin-input mb-4"
                />
                <button
                  onClick={() => saveAllSettings()}
                  disabled={isSaving}
                  className="px-4 py-2 bg-parchment-gold text-white text-xs font-bold rounded cursor-pointer hover:bg-[#967B0A]"
                >
                  حفظ عنوان المعرض
                </button>
              </div>

              <hr className="border-parchment-border/20 my-4" />

              <div className="flex justify-between items-center">
                <span className="text-xs text-parchment-text/60 font-semibold">عدد صور المعرض: {gallery.length}</span>
                <button
                  onClick={openPhotoAdd}
                  className="px-3 py-1.5 bg-parchment-gold hover:bg-[#967B0A] text-white rounded text-xs flex items-center gap-1 transition-all cursor-pointer font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة صورة Polaroid</span>
                </button>
              </div>

              {/* Photos Polaroid List */}
              <div className="grid grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                {gallery.map((item) => (
                  <div key={item.id} className="p-3 bg-white border border-slate-200 shadow-sm rounded flex flex-col justify-between">
                    {item.photoUrl ? (
                      <div className="w-full aspect-video overflow-hidden bg-slate-100 rounded-sm mb-2">
                        <img
                          src={item.photoUrl}
                          alt={item.caption}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full py-6 bg-slate-50 border border-dashed border-slate-200 rounded flex items-center justify-center mb-2">
                        <span className="text-[10px] text-slate-400">بدون صورة (تذكرة نصية)</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-handwriting text-xs text-[#3D251E] truncate">{item.caption}</h4>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">{item.date || 'بدون تاريخ'}</p>
                    </div>
                    
                    <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => openPhotoEdit(item)}
                        className="p-1 hover:bg-parchment-gold hover:text-white rounded text-slate-400 transition-all cursor-pointer"
                        title="تعديل"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(item.id)}
                        className="p-1 hover:bg-parchment-rose hover:text-white rounded text-slate-400 transition-all cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: PLAYLIST */}
          {activeTab === 'playlist' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-parchment-text/60">
                  الأغاني في القائمة: {(settings.playlist || []).length}
                </span>
                <button
                  onClick={openPlaylistAdd}
                  className="px-3 py-1.5 bg-parchment-gold hover:bg-[#967B0A] text-white rounded text-xs flex items-center gap-1 transition-all cursor-pointer font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة أغنية للقائمة</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                {(settings.playlist || []).map((track, tIdx) => (
                  <div key={tIdx} className="p-3.5 bg-[#F2EBCE]/50 border border-parchment-border/30 rounded flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-grow text-right">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-parchment-rose/10 text-parchment-rose text-xs flex items-center justify-center font-bold font-mono">
                          {tIdx + 1}
                        </span>
                        <h4 className="font-semibold text-sm truncate">{track.name}</h4>
                      </div>
                      <p className="text-[10px] text-parchment-text/50 truncate mt-1 font-mono">{track.url}</p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => movePlaylistItem(tIdx, -1)} disabled={tIdx === 0} className="p-1 hover:bg-parchment-text/5 rounded text-parchment-text/60 disabled:opacity-30">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => movePlaylistItem(tIdx, 1)} disabled={tIdx === (settings.playlist || []).length - 1} className="p-1 hover:bg-parchment-text/5 rounded text-parchment-text/60 disabled:opacity-30">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-[1px] h-4 bg-parchment-border/20 mx-1"></div>
                      <button onClick={() => openPlaylistEdit(tIdx, track)} className="p-1.5 hover:bg-parchment-gold hover:text-white rounded text-parchment-text/70 transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeletePlaylistItem(tIdx)} className="p-1.5 hover:bg-parchment-rose hover:text-white rounded text-parchment-text/70 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: THEME, COLORS & FONTS CUSTOMIZATION */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              
              {/* 0. Theme Presets Select Cards */}
              <h3 className="text-sm font-bold border-b border-parchment-border/20 pb-1.5 mb-3 text-parchment-gold flex items-center gap-1.5">
                <span>اختر ثيم رومانسي جاهز 🎨</span>
              </h3>
              <p className="text-[11px] text-parchment-text/60 mb-4 leading-relaxed">
                اضغط على أي مظهر من الثيمات الاحترافية الخمسة المجهزة بالكامل أدناه لتطبيق لوحة الألوان والخطوط والأجواء فوراً على الرسالة بأكملها:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
                {[
                  {
                    id: 'classic',
                    name: 'كلاسيك فينيسيا',
                    desc: 'ورق بردي دافئ وذهبي كلاسيكي مع ختم شمعي إيطالي.',
                    bg: '#F5EDD6',
                    text: '#2C1810',
                    rose: '#8B3A52',
                    gold: '#B8960C',
                    arabicFont: 'Noto Naskh Arabic',
                    englishFont: 'Lora'
                  },
                  {
                    id: 'dark',
                    name: 'الرومانسية المظلمة',
                    desc: 'خلفية ليلية فاخرة سوداء مع توهج أحمر وأرجواني ساحر.',
                    bg: '#0d0d14',
                    text: '#ffffff',
                    rose: '#c01840',
                    gold: '#e8a020',
                    arabicFont: 'Amiri',
                    englishFont: 'Cairo'
                  },
                  {
                    id: 'minimal',
                    name: 'البساطة الفاخرة (Baby Blue)',
                    desc: 'درجات الأزرق السماوي الهادئ وزوايا حادة ناعمة لجمال هادئ ومريح.',
                    bg: '#eef6fb',
                    text: '#1e5f84',
                    rose: '#4a9fc4',
                    gold: '#8ec9e8',
                    arabicFont: 'Cairo',
                    englishFont: 'Cairo'
                  },
                  {
                    id: 'night',
                    name: 'سماء الليل المرصعة',
                    desc: 'سماء داكنة مرصعة بالنجوم اللامعة وهلال يزين الصفحة.',
                    bg: '#0a0f1e',
                    text: '#e8eeff',
                    rose: '#1a3a7a',
                    gold: '#7eb8f7',
                    arabicFont: 'Amiri',
                    englishFont: 'Cairo'
                  },
                  {
                    id: 'forest',
                    name: 'الغابة المظلمة',
                    desc: 'أجواء الطبيعة والغموض الخضراء مع وهج ناعم وأوراق متطايرة.',
                    bg: '#080f0a',
                    text: '#e8f5ee',
                    rose: '#1a6a3a',
                    gold: '#5aba7a',
                    arabicFont: 'Amiri',
                    englishFont: 'Cairo'
                  }
                ].map((preset) => {
                  const isCurrent = (settings.themePreset || 'classic') === preset.id
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyThemePreset(preset)}
                      className={`text-right p-3.5 rounded-lg border-2 transition-all flex flex-col justify-between cursor-pointer text-xs ${
                        isCurrent
                          ? 'border-parchment-rose bg-parchment-rose/5 shadow-sm scale-102'
                          : 'border-parchment-border/30 hover:border-parchment-gold hover:bg-parchment-card/30'
                      }`}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-parchment-text">{preset.name}</span>
                          {isCurrent && <span className="text-[10px] bg-parchment-rose text-white px-1.5 py-0.5 rounded font-bold">نشط</span>}
                        </div>
                        <p className="text-[10px] text-parchment-text/60 leading-normal mb-3 min-h-[36px]">{preset.desc}</p>
                      </div>

                      {/* Color dots preview */}
                      <div className="flex items-center gap-1.5 mt-2 justify-start">
                        <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: preset.bg }} title="الخلفية" />
                        <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: preset.rose }} title="الرئيسي" />
                        <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: preset.gold }} title="الفرعي" />
                        <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: preset.text }} title="النص" />
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* 1. Theme layouts selectors */}
              <h3 className="text-sm font-bold border-b border-parchment-border/20 pb-1.5 mb-3 text-parchment-gold">تخصيص تصاميم المظهر (الثيم)</h3>
              <div className="grid grid-cols-2 gap-4">
                
                {/* Envelope Style */}
                <div>
                  <label className="block text-xs font-bold mb-2">تصميم وشكل الظرف (Envelope Shape) ✦</label>
                  <select
                    value={settings.envelopeStyle}
                    onChange={(e) => setSettings({ ...settings, envelopeStyle: e.target.value })}
                    className="admin-input cursor-pointer"
                  >
                    <option value="vintage">الظرف الكلاسيكي (Vintage Triangle)</option>
                    <option value="modern">الظرف الأفقي الحديث (Modern horizontal)</option>
                    <option value="box">صندوق المفاجآت المغلق (Secret Box Pouch)</option>
                  </select>
                </div>

                {/* Wax Seal Style */}
                <div>
                  <label className="block text-xs font-bold mb-2">شكل ختم الشمع (Wax Seal Stamp) ✦</label>
                  <select
                    value={settings.sealStyle}
                    onChange={(e) => setSettings({ ...settings, sealStyle: e.target.value })}
                    className="admin-input cursor-pointer"
                  >
                    <option value="heart">ختم القلب الرومانسي ❤️</option>
                    <option value="rose">ختم الوردة الإيطالية 🌹</option>
                    <option value="ring">ختم الدبلتين الكلاسيكي 💍</option>
                  </select>
                </div>

                {/* Transition style */}
                <div>
                  <label className="block text-xs font-bold mb-2">حركة الانتقال بين الصفحات (Transitions) ✦</label>
                  <select
                    value={settings.transitionStyle}
                    onChange={(e) => setSettings({ ...settings, transitionStyle: e.target.value })}
                    className="admin-input cursor-pointer"
                  >
                    <option value="cinematic">تلاشي سينمائي متدرج (Cinematic Fade)</option>
                    <option value="zoom">تكبير وتصغير سلس (Scale Zoom)</option>
                    <option value="slide">انزلاق جانبي ناعم (Horizontal Slide)</option>
                  </select>
                </div>

                {/* Music Player style */}
                <div>
                  <label className="block text-xs font-bold mb-2">تصميم مشغل الموسيقى (Music Player Shape) ✦</label>
                  <select
                    value={settings.musicStyle}
                    onChange={(e) => setSettings({ ...settings, musicStyle: e.target.value })}
                    className="admin-input cursor-pointer"
                  >
                    <option value="vinyl">أسطوانة الفينيل الدوارة (Floating Vinyl)</option>
                    <option value="minimal">كبسولة تشغيل مصغرة (Minimal Capsule)</option>
                    <option value="hidden">إخفاء المشغل بالكامل (Hidden Player)</option>
                  </select>
                </div>

              </div>

              {/* 2. Color Palette */}
              <h3 className="text-sm font-bold border-b border-parchment-border/20 pb-1.5 mt-8 mb-3 text-parchment-gold">تخصيص لوحة الألوان</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2">لون الخلفية (aged parchment) ✦</label>
                  <div className="flex gap-2">
                    <input type="color" value={settings.colors.bg} onChange={(e) => handleColorChange('bg', e.target.value)} className="w-10 h-10 border border-parchment-border/40 rounded cursor-pointer" />
                    <input type="text" value={settings.colors.bg} onChange={(e) => handleColorChange('bg', e.target.value)} className="admin-input font-mono" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">لون النص الأساسي (espresso) ✦</label>
                  <div className="flex gap-2">
                    <input type="color" value={settings.colors.text} onChange={(e) => handleColorChange('text', e.target.value)} className="w-10 h-10 border border-parchment-border/40 rounded cursor-pointer" />
                    <input type="text" value={settings.colors.text} onChange={(e) => handleColorChange('text', e.target.value)} className="admin-input font-mono" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">لون الذهب الأثري (accent gold) ✦</label>
                  <div className="flex gap-2">
                    <input type="color" value={settings.colors.gold} onChange={(e) => handleColorChange('gold', e.target.value)} className="w-10 h-10 border border-parchment-border/40 rounded cursor-pointer" />
                    <input type="text" value={settings.colors.gold} onChange={(e) => handleColorChange('gold', e.target.value)} className="admin-input font-mono" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">لون الورد (rose accent) ✦</label>
                  <div className="flex gap-2">
                    <input type="color" value={settings.colors.rose} onChange={(e) => handleColorChange('rose', e.target.value)} className="w-10 h-10 border border-parchment-border/40 rounded cursor-pointer" />
                    <input type="text" value={settings.colors.rose} onChange={(e) => handleColorChange('rose', e.target.value)} className="admin-input font-mono" />
                  </div>
                </div>
              </div>

              {/* 3. Fonts */}
              <h3 className="text-sm font-bold border-b border-parchment-border/20 pb-1.5 mt-8 mb-3 text-parchment-gold">تخصيص الخطوط والتايبوغرافي</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2">خط اللغة العربية ✦</label>
                  <select value={settings.selectedArabicFont} onChange={(e) => handleFontChange('selectedArabicFont', e.target.value)} className="admin-input cursor-pointer font-semibold">
                    {arabicFonts.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold mb-2">خط العناوين والإنجليزية ✦</label>
                  <select value={settings.selectedEnglishFont} onChange={(e) => handleFontChange('selectedEnglishFont', e.target.value)} className="admin-input cursor-pointer font-semibold">
                    {englishFonts.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
                  </select>
                </div>
              </div>

              {/* 4. Background Effects */}
              <h3 className="text-sm font-bold border-b border-parchment-border/20 pb-1.5 mt-8 mb-3 text-parchment-gold">تأثيرات الخلفية الرومانسية</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-2">شفافية القلوب المتطايرة في الخلفية 💖 (0% إلى 100%)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="0.8"
                      step="0.05"
                      value={settings.bgHeartsOpacity !== undefined ? settings.bgHeartsOpacity : 0.15}
                      onChange={(e) => setSettings({ ...settings, bgHeartsOpacity: parseFloat(e.target.value) })}
                      className="w-full accent-parchment-rose cursor-pointer"
                    />
                    <span className="text-xs font-bold font-mono w-14 text-center bg-parchment-card border border-parchment-border/20 rounded px-1.5 py-0.5">
                      {Math.round((settings.bgHeartsOpacity !== undefined ? settings.bgHeartsOpacity : 0.15) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => saveAllSettings()}
                  disabled={isSaving}
                  className="admin-save-btn"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ المظهر والخطوط والألوان'}
                </button>
              </div>

            </div>
          )}

          {/* TAB 9: ANALYTICS PANEL */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              
              {/* Quick stats grid */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Open Count */}
                <div className="p-4 bg-[#FAF6EE] border border-parchment-border/30 rounded-lg text-center shadow-sm">
                  <span className="text-[10px] text-parchment-text/45 block mb-1 font-bold">عدد مرات فتح الموقع ✉️</span>
                  <span className="text-2xl font-bold font-mono text-parchment-rose">{analytics.open_count || 0}</span>
                </div>

                {/* Last Entry */}
                <div className="p-4 bg-[#FAF6EE] border border-parchment-border/30 rounded-lg text-center shadow-sm">
                  <span className="text-[10px] text-parchment-text/45 block mb-1 font-bold">آخر وقت دخل فيه 📅</span>
                  <span className="text-xs font-bold text-parchment-text truncate block mt-1.5">
                    {analytics.last_open ? new Date(analytics.last_open).toLocaleString('ar-EG') : 'لم يدخل بعد'}
                  </span>
                </div>

                {/* Most Viewed */}
                <div className="p-4 bg-[#FAF6EE] border border-parchment-border/30 rounded-lg text-center shadow-sm col-span-2">
                  <span className="text-[10px] text-parchment-text/45 block mb-1 font-bold">أكثر جزء اتشاف 🏆</span>
                  <span className="text-sm font-bold text-parchment-gold block mt-0.5">{getMostViewedSection()}</span>
                </div>

              </div>

              {/* Views and Durations Detail table */}
              <h3 className="text-sm font-bold border-b border-parchment-border/20 pb-1.5 mt-8 text-parchment-gold">تفاصيل تصفح الصفحات</h3>
              <div className="overflow-hidden border border-parchment-border/20 rounded-lg">
                <table className="w-full text-right border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-[#FAF6EE] border-b border-parchment-border/20 font-bold">
                      <th className="py-2 px-3 text-parchment-gold">الصفحة</th>
                      <th className="py-2 px-3 text-parchment-gold">مرات الزيارة</th>
                      <th className="py-2 px-3 text-parchment-gold">إجمالي مدة المشاهدة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-parchment-border/10 hover:bg-[#FAF6EE]/50">
                      <td className="py-2.5 px-3 font-semibold">الرسالة الرومانسية</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-parchment-rose">{analytics.letter_views || 0}</td>
                      <td className="py-2.5 px-3 text-parchment-text/75">{formatDuration(analytics.letter_duration)}</td>
                    </tr>
                    <tr className="border-b border-parchment-border/10 hover:bg-[#FAF6EE]/50">
                      <td className="py-2.5 px-3 font-semibold">شريط الذكريات</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-parchment-rose">{analytics.timeline_views || 0}</td>
                      <td className="py-2.5 px-3 text-parchment-text/75">{formatDuration(analytics.timeline_duration)}</td>
                    </tr>
                    <tr className="border-b border-parchment-border/10 hover:bg-[#FAF6EE]/50">
                      <td className="py-2.5 px-3 font-semibold">معرض الصور</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-parchment-rose">{analytics.gallery_views || 0}</td>
                      <td className="py-2.5 px-3 text-parchment-text/75">{formatDuration(analytics.gallery_duration)}</td>
                    </tr>
                    <tr className="hover:bg-[#FAF6EE]/50">
                      <td className="py-2.5 px-3 font-semibold">الصفحة الختامية</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-parchment-rose">{analytics.final_views || 0}</td>
                      <td className="py-2.5 px-3 text-parchment-text/75">{formatDuration(analytics.final_duration)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-parchment-border/10 text-center">
                <span className="text-[10px] text-parchment-text/40 font-bold">✓ الإحصائيات تتحدث تلقائياً مع تصفح المستخدم للموقع</span>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* --- MEMORY ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {isMemoryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-parchment-card border border-parchment-border w-full max-w-[420px] rounded-lg p-6 shadow-2xl space-y-4 text-right"
            >
              <h3 className="text-lg font-bold border-b border-parchment-border/20 pb-2">
                {memoryForm.id ? 'تعديل محطة الذكرى' : 'إضافة ذكرى جديدة للقصة'}
              </h3>

              <form onSubmit={handleSaveMemory} className="space-y-3 text-right">
                <div>
                  <label className="block text-xs font-bold mb-1">تاريخ المناسبة (اختياري) ✦</label>
                  <input
                    type="text"
                    placeholder="مثال: 14 فبراير 2024"
                    value={memoryForm.date}
                    onChange={(e) => setMemoryForm({ ...memoryForm, date: e.target.value })}
                    className="admin-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">العنوان ✦</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أول لقاء بيننا"
                    value={memoryForm.title}
                    onChange={(e) => setMemoryForm({ ...memoryForm, title: e.target.value })}
                    className="admin-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">تفاصيل الذكرى ✦</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="اكتب تفاصيل القصة هنا..."
                    value={memoryForm.description}
                    onChange={(e) => setMemoryForm({ ...memoryForm, description: e.target.value })}
                    className="admin-input text-sm resize-none"
                  />
                </div>

                {/* File input for memory picture upload */}
                <div className="border border-parchment-border/20 rounded p-3 bg-slate-50 space-y-2">
                  <label className="block text-[11px] font-bold text-parchment-gold">تحميل صورة الذكرى مباشرة من جهازك ✦</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'memory')}
                      className="hidden"
                      id="memory-file-input"
                    />
                    <label htmlFor="memory-file-input" className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded cursor-pointer flex items-center gap-1">
                      {isUploading && uploadField === 'memory' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>اختر صورة</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      placeholder="رابط الصورة المرفوعة"
                      value={memoryForm.photoUrl}
                      className="admin-input font-mono text-xs text-left flex-grow"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-parchment-border/20">
                  <button type="submit" className="flex-grow py-2 bg-parchment-gold hover:bg-[#967B0A] text-white font-semibold rounded text-sm transition-all shadow-sm">حفظ الذكرى</button>
                  <button type="button" onClick={() => setIsMemoryModalOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-sm transition-all">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PHOTO ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-parchment-card border border-parchment-border w-full max-w-[420px] rounded-lg p-6 shadow-2xl space-y-4 text-right"
            >
              <h3 className="text-lg font-bold border-b border-parchment-border/20 pb-2">
                {photoForm.id ? 'تعديل صورة Polaroid' : 'إضافة صورة Polaroid جديدة'}
              </h3>

              <form onSubmit={handleSavePhoto} className="space-y-3 text-right">
                
                {/* File Input for Polaroid Photo */}
                <div className="border border-parchment-border/20 rounded p-3 bg-slate-50 space-y-2">
                  <label className="block text-[11px] font-bold text-parchment-gold">تحميل صورة Polaroid مباشرة من جهازك ✦</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      className="hidden"
                      id="photo-file-input"
                    />
                    <label htmlFor="photo-file-input" className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded cursor-pointer flex items-center gap-1">
                      {isUploading && uploadField === 'photo' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>اختر صورة</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      placeholder="رابط الصورة المرفوعة"
                      value={photoForm.photoUrl}
                      className="admin-input font-mono text-xs text-left flex-grow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">التعليق المكتوب بخط اليد ✦</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: وردة حمراء تذكرني بكِ..."
                    value={photoForm.caption}
                    onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                    className="admin-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">تاريخ الالتقاط (اختياري) ✦</label>
                  <input
                    type="text"
                    placeholder="مثال: مايو 2024"
                    value={photoForm.date}
                    onChange={(e) => setPhotoForm({ ...photoForm, date: e.target.value })}
                    className="admin-input text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-parchment-border/20">
                  <button type="submit" className="flex-grow py-2 bg-parchment-gold hover:bg-[#967B0A] text-white font-semibold rounded text-sm transition-all shadow-sm">حفظ الصورة</button>
                  <button type="button" onClick={() => setIsPhotoModalOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-sm transition-all">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PLAYLIST ITEM ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {isPlaylistItemModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-parchment-card border border-parchment-border w-full max-w-[420px] rounded-lg p-6 shadow-2xl space-y-4 text-right"
            >
              <h3 className="text-lg font-bold border-b border-parchment-border/20 pb-2">
                {playlistForm.index !== -1 ? 'تعديل أغنية في القائمة' : 'إضافة أغنية جديدة لقائمة التشغيل'}
              </h3>

              <form onSubmit={handleSavePlaylistItem} className="space-y-3 text-right">
                <div>
                  <label className="block text-xs font-bold mb-1">اسم الأغنية ✦</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: عازف البيانو الإيطالي"
                    value={playlistForm.name}
                    onChange={(e) => setPlaylistForm({ ...playlistForm, name: e.target.value })}
                    className="admin-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">رابط ملف الصوت المباشر (Direct MP3 URL) ✦</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                    value={playlistForm.url}
                    onChange={(e) => setPlaylistForm({ ...playlistForm, url: e.target.value })}
                    className="admin-input font-mono text-xs"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-parchment-border/20">
                  <button type="submit" className="flex-grow py-2 bg-parchment-gold hover:bg-[#967B0A] text-white font-semibold rounded text-sm transition-all shadow-sm">حفظ الأغنية</button>
                  <button type="button" onClick={() => setIsPlaylistItemModalOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-sm transition-all">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MEETINGS ITEM ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {isMeetingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-parchment-card border border-parchment-border w-full max-w-[420px] rounded-lg p-6 shadow-2xl space-y-4 text-right"
            >
              <h3 className="text-lg font-bold border-b border-parchment-border/20 pb-2">
                {meetingForm.index !== -1 ? 'تعديل لقاء' : 'تسجيل مقابلة/لقاء جديد'}
              </h3>

              <form onSubmit={handleSaveMeetingItem} className="space-y-3 text-right">
                <div>
                  <label className="block text-xs font-bold mb-1">تاريخ المقابلة ✦</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 14 فبراير 2024"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="admin-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">عنوان المقابلة ✦</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: اللقاء الأول"
                    value={meetingForm.title}
                    onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                    className="admin-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">مكان اللقاء ✦</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مقهى الكاتدرائية القديم"
                    value={meetingForm.location}
                    onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                    className="admin-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">ملاحظة/خاطرة سريعة (اختياري) ✦</label>
                  <input
                    type="text"
                    placeholder="مثال: ارتشفنا قهوة الإسبريسو معاً..."
                    value={meetingForm.note}
                    onChange={(e) => setMeetingForm({ ...meetingForm, note: e.target.value })}
                    className="admin-input text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-parchment-border/20">
                  <button type="submit" className="flex-grow py-2 bg-parchment-gold hover:bg-[#967B0A] text-white font-semibold rounded text-sm transition-all shadow-sm">حفظ اللقاء</button>
                  <button type="button" onClick={() => setIsMeetingModalOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-sm transition-all">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-input {
          width: 100%;
          padding: 8px 12px;
          background-color: #FAF6EE;
          border: 1px solid var(--color-border);
          border-opacity: 0.35;
          border-radius: 4px;
          color: var(--color-text);
          font-size: 13px;
          transition: all 0.2s;
        }
        .admin-input:focus {
          border-color: var(--color-rose);
          outline: none;
          box-shadow: 0 0 0 1px var(--color-rose);
        }
        .admin-save-btn {
          width: 100%;
          padding: 10px;
          background-color: var(--color-rose);
          color: white;
          font-weight: 600;
          font-size: 13px;
          border-radius: 4px;
          transition: all 0.2s;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .admin-save-btn:hover {
          background-color: #732C3F;
        }
        .admin-save-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  )
}
