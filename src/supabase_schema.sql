-- Create tables for ScriptClear

-- 1. Cards table
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    correct_char TEXT NOT NULL,
    confused_with TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    box INTEGER DEFAULT 1,
    next_review TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed TIMESTAMPTZ,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can create their own cards" ON cards;
CREATE POLICY "Users can create their own cards" ON cards FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own cards" ON cards;
CREATE POLICY "Users can view their own cards" ON cards FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cards" ON cards;
CREATE POLICY "Users can update their own cards" ON cards FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cards" ON cards;
CREATE POLICY "Users can delete their own cards" ON cards FOR DELETE USING (auth.uid() = user_id);


-- 2. Review Sessions table
CREATE TABLE IF NOT EXISTS review_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ DEFAULT NOW(),
    cards_reviewed INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0
);

ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own sessions" ON review_sessions;
CREATE POLICY "Users can manage their own sessions" ON review_sessions FOR ALL USING (auth.uid() = user_id);


-- 3. Storage Setup
-- Note: You must create the 'cards' bucket manually in the Supabase Storage UI first
-- or use the following SQL if your environment supports it (usually requires superuser).

-- Policies for the 'cards' bucket
-- Allow authenticated users to upload files to their own folder
DROP POLICY IF EXISTS "Users can upload their own card images" ON storage.objects;
CREATE POLICY "Users can upload their own card images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'cards' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public to view card images (or restrict to authenticated if preferred)
DROP POLICY IF EXISTS "Anyone can view card images" ON storage.objects;
CREATE POLICY "Anyone can view card images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'cards');

-- Allow users to delete their own card images
DROP POLICY IF EXISTS "Users can delete their own card images" ON storage.objects;
CREATE POLICY "Users can delete their own card images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'cards' AND (storage.foldername(name))[1] = auth.uid()::text);
-- 4. User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    last_compare_left_id UUID REFERENCES cards(id) ON DELETE SET NULL,
    last_compare_right_id UUID REFERENCES cards(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
CREATE POLICY "Users can manage their own preferences" 
ON user_preferences FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
