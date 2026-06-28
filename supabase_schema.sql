-- Supabase Schema for Romantic Gift Website (Theme, Analytics & Storage Supported)
-- Run this script in the Supabase SQL Editor.

-- 1. Create table for general settings
CREATE TABLE IF NOT EXISTS public.romantic_settings (
    id text PRIMARY KEY DEFAULT 'config',
    site_name text NOT NULL DEFAULT 'رسالة حب',
    recipient_name text NOT NULL DEFAULT 'حبيبتي',
    main_password text NOT NULL DEFAULT 'love',
    admin_password text NOT NULL DEFAULT 'admin123',
    envelope_label text NOT NULL DEFAULT 'رسالة خاصة إليكِ',
    envelope_hint text NOT NULL DEFAULT '✦ كلمة السر ✦',
    letter_text text NOT NULL DEFAULT 'إلى تلك الجميلة التي ملأت حياتي دفئاً وحباً.. منذ أن التقيت بكِ والعالم يبدو مكاناً أكثر جمالاً. كل يوم يمر بجانبكِ هو هدية من السماء، وقصتنا التي نكتبها معاً هي أثمن ما أملك. أكتب لكِ هذه الكلمات لتظل شاهدة على حبٍ لن يمحوه الزمن، وعلى روحين التقتا في عهد أبدي من العشق الكلاسيكي.. أحبكِ اليوم وغداً وإلى الأبد.',
    signature_name text NOT NULL DEFAULT 'حبيبكِ',
    letter_font_size text NOT NULL DEFAULT 'text-2xl',
    music_name text NOT NULL DEFAULT 'Classic Italian Piano',
    music_url text NOT NULL DEFAULT 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    music_autoplay boolean NOT NULL DEFAULT true,
    bg_color text NOT NULL DEFAULT '#F5EDD6',
    gold_color text NOT NULL DEFAULT '#B8960C',
    rose_color text NOT NULL DEFAULT '#8B3A52',
    text_color text NOT NULL DEFAULT '#2C1810',
    next_button_text text NOT NULL DEFAULT 'التالي',
    gallery_title text NOT NULL DEFAULT 'معرض الصور والذكريات',
    selected_arabic_font text NOT NULL DEFAULT 'Noto Naskh Arabic',
    selected_english_font text NOT NULL DEFAULT 'Lora',
    playlist jsonb NOT NULL DEFAULT '[]'::jsonb,
    meetings jsonb NOT NULL DEFAULT '[]'::jsonb,
    voice_url text, -- Optional voice note recording URL
    first_encounter_date timestamp with time zone, -- Relationships elapsed counter start time
    envelope_style text NOT NULL DEFAULT 'vintage', -- 'vintage', 'modern', 'box'
    seal_style text NOT NULL DEFAULT 'heart', -- 'heart', 'rose', 'ring'
    transition_style text NOT NULL DEFAULT 'cinematic', -- 'cinematic', 'zoom', 'slide'
    music_style text NOT NULL DEFAULT 'vinyl', -- 'vinyl', 'minimal', 'hidden'
    theme_preset text NOT NULL DEFAULT 'classic',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table for timeline memories
CREATE TABLE IF NOT EXISTS public.romantic_memories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    date text, -- Optional
    description text NOT NULL,
    photo_url text, -- Optional
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create table for gallery polaroid photos
CREATE TABLE IF NOT EXISTS public.romantic_gallery (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_url text, -- Optional
    caption text NOT NULL,
    date text, -- Optional
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create table for site analytics
CREATE TABLE IF NOT EXISTS public.romantic_analytics (
    id text PRIMARY KEY DEFAULT 'analytics',
    open_count integer DEFAULT 0,
    last_open timestamp with time zone,
    letter_views integer DEFAULT 0,
    timeline_views integer DEFAULT 0,
    gallery_views integer DEFAULT 0,
    final_views integer DEFAULT 0,
    letter_duration integer DEFAULT 0, -- accumulated viewing duration in seconds
    timeline_duration integer DEFAULT 0,
    gallery_duration integer DEFAULT 0,
    final_duration integer DEFAULT 0,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) and configure public access policies
ALTER TABLE public.romantic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.romantic_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.romantic_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.romantic_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow safe re-running)
DROP POLICY IF EXISTS "Allow public read settings" ON public.romantic_settings;
DROP POLICY IF EXISTS "Allow public write settings" ON public.romantic_settings;
DROP POLICY IF EXISTS "Allow public read memories" ON public.romantic_memories;
DROP POLICY IF EXISTS "Allow public write memories" ON public.romantic_memories;
DROP POLICY IF EXISTS "Allow public read gallery" ON public.romantic_gallery;
DROP POLICY IF EXISTS "Allow public write gallery" ON public.romantic_gallery;
DROP POLICY IF EXISTS "Allow public read analytics" ON public.romantic_analytics;
DROP POLICY IF EXISTS "Allow public write analytics" ON public.romantic_analytics;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public read settings" ON public.romantic_settings FOR SELECT USING (true);
CREATE POLICY "Allow public write settings" ON public.romantic_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read memories" ON public.romantic_memories FOR SELECT USING (true);
CREATE POLICY "Allow public write memories" ON public.romantic_memories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read gallery" ON public.romantic_gallery FOR SELECT USING (true);
CREATE POLICY "Allow public write gallery" ON public.romantic_gallery FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read analytics" ON public.romantic_analytics FOR SELECT USING (true);
CREATE POLICY "Allow public write analytics" ON public.romantic_analytics FOR ALL USING (true) WITH CHECK (true);

-- Insert default configurations if not exists
INSERT INTO public.romantic_settings (
    id, site_name, recipient_name, main_password, admin_password, envelope_label, envelope_hint,
    letter_text, signature_name, letter_font_size, music_name, music_url, music_autoplay,
    bg_color, gold_color, rose_color, text_color, next_button_text, gallery_title,
    selected_arabic_font, selected_english_font, playlist, meetings,
    voice_url, first_encounter_date, envelope_style, seal_style, transition_style, music_style, theme_preset
)
VALUES (
    'config',
    'رسالة حب كلاسيكية',
    'حبيبتي الجميلة',
    'love',
    'admin123',
    'رسالة خاصة مكتوبة بماء الذهب إليكِ وحدكِ',
    '✦ كلمة السر الخاصة بنا ✦',
    'إلى من سكنت قلبي وجعلت حياتي ربيعاً دائمًا.. 💖

أكتب لكِ هذه الكلمات لتظل شاهدةً على حبِّ عظيم ولد ليبقى، وقصة حب كلاسيكية تفخر بها النجوم.

إليكِ عهودي الصادقة:
• أن أكون لكِ الأمان والملجأ في كل الأوقات.
• أن أصون ابتسامتكِ الجميلة التي تضيء عالمي.
• أن تظل روحي حاضنة لروحكِ في السراء والضراء.

أحبكِ اليوم، غداً، وإلى نهاية العمر.. وكل لحظة بجانبكِ هي أثمن لحظات حياتي. ✨',
    'المخلص لكِ دائماً',
    'text-2xl',
    'Classic Italian Piano',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    true,
    '#F5EDD6',
    '#B8960C',
    '#8B3A52',
    '#2C1810',
    'التالي',
    'معرض الصور والذكريات',
    'Noto Naskh Arabic',
    'Lora',
    '[
      {"name": "Classic Italian Piano", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"},
      {"name": "Venice Gondola Melody", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"},
      {"name": "Under the Tuscan Stars", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"}
    ]'::jsonb,
    '[
      {"date": "14 فبراير 2024", "title": "اللقاء الأول", "location": "مقهى الكاتدرائية القديم", "note": "ارتشفنا قهوة الإسبريسو معاً وتحدثنا لساعات."},
      {"date": "20 مارس 2024", "title": "موعد على النهر", "location": "جسر فينيسيا الخشبي", "note": "شاهدنا غروب الشمس وشاركتِني ضحكتكِ الساحرة."},
      {"date": "01 مايو 2024", "title": "يوم الاعتراف", "location": "حديقة الورود الكلاسيكية", "note": "اليوم الذي غير مجرى حياتي إلى الأبد."}
    ]'::jsonb,
    null,
    '2024-02-14T19:00:00+03:00',
    'vintage',
    'heart',
    'cinematic',
    'vinyl',
    'classic'
) ON CONFLICT (id) DO NOTHING;

-- Insert default analytics row if not exists
INSERT INTO public.romantic_analytics (id, open_count)
VALUES ('analytics', 0) ON CONFLICT (id) DO NOTHING;

-- Insert default memories if table is empty
INSERT INTO public.romantic_memories (title, date, description, photo_url, sort_order)
SELECT 'أول لقاء بيننا', '14 فبراير 2024', 'اليوم الذي التقت فيه أعيننا لأول مرة، كان يوماً ربيعياً جميلاً هبت فيه نسمات دافئة أحسست معها أن حياتي قد بدأت للتو.', 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600', 1
WHERE NOT EXISTS (SELECT 1 FROM public.romantic_memories);

INSERT INTO public.romantic_memories (title, date, description, photo_url, sort_order)
SELECT 'أول اعتراف بالحب', '01 مايو 2024', 'تحت أضواء الشموع الخافتة، وبنبضات قلب متسارعة، همست لكِ بكلمة "أحبك" لأول مرة.. وكم كانت فرحتي حين رأيت ابتسامتكِ الخجولة.', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600', 2
WHERE NOT EXISTS (SELECT 1 FROM public.romantic_memories WHERE sort_order = 2);

-- Insert default gallery items if table is empty
INSERT INTO public.romantic_gallery (photo_url, caption, date, sort_order)
SELECT 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=600', 'وردة حمراء تذكرني بكِ دائماً', 'فبراير 2024', 1
WHERE NOT EXISTS (SELECT 1 FROM public.romantic_gallery);

-- Migration support for existing databases (adds theme_preset column safely)
ALTER TABLE public.romantic_settings ADD COLUMN IF NOT EXISTS theme_preset text NOT NULL DEFAULT 'classic';
ALTER TABLE public.romantic_settings ADD COLUMN IF NOT EXISTS envelope_inside_text text NOT NULL DEFAULT 'إلى أغلى ما أملك...';
ALTER TABLE public.romantic_settings ADD COLUMN IF NOT EXISTS bg_hearts_opacity double precision NOT NULL DEFAULT 0.15;
ALTER TABLE public.romantic_settings ADD COLUMN IF NOT EXISTS curtain_title text NOT NULL DEFAULT 'فُتِحت الرسالة بنجاح... 💌';
ALTER TABLE public.romantic_settings ADD COLUMN IF NOT EXISTS curtain_description text NOT NULL DEFAULT 'لقد فُك ختم الشمع وحان وقت سماع الكلمات وقراءة قصة حبنا السعيدة.. هل أنتِ مستعدة؟';
ALTER TABLE public.romantic_settings ADD COLUMN IF NOT EXISTS curtain_button_text text NOT NULL DEFAULT 'ادخلي إلى قلبي 💖';
