-- CREATE TABLE statements
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  country TEXT DEFAULT 'US',
  filter TEXT,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.shows (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tmdb_id TEXT NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tag_sections (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);


CREATE TABLE public.tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'tv' CHECK (
    type IN ('profile-like','profile-dislike','profile','profile-describe','tv','warning','unassigned')
  ),
  section_id INTEGER REFERENCES public.tag_sections(id)
);

CREATE TABLE public.user_shows (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  show_id INTEGER NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'rec' CHECK (type IN ('rec','watch','seen')),
  description TEXT,
  visible BOOLEAN DEFAULT true,
  currently_watching BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, show_id)
);

CREATE TABLE public.follows (
  follower UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  followed UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower, followed)
);

CREATE TABLE public.user_show_tags (
  user_show_id INTEGER NOT NULL REFERENCES public.user_shows(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (user_show_id, tag_id)
);

CREATE TABLE public.profile_tags (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'like' CHECK (category IN ('like', 'dislike', 'describe')),
  PRIMARY KEY (user_id, tag_id)
);

-- Function that creates a public user profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires the function on every new signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

 -- Function to automatically update updated_at on user_shows
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.user_shows
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_show_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_tags ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES:
-- Users can read any profile
CREATE POLICY "Public profiles are viewable by everyone"
ON public.users FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can delete their own account
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- User shows are viewable by everyone
CREATE POLICY "User shows are viewable by everyone"
ON public.user_shows FOR SELECT
USING (true);

CREATE POLICY "Shows are viewable by everyone"
ON public.shows FOR SELECT
USING (true);

-- Users can insert their own shows
CREATE POLICY "Users can insert own shows"
ON public.user_shows FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own shows
CREATE POLICY "Users can update own shows"
ON public.user_shows FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update shows"
ON public.shows FOR UPDATE
TO authenticated
USING (true);

-- Users can delete their own shows
CREATE POLICY "Users can delete own shows"
ON public.user_shows FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- Follows are viewable by everyone
CREATE POLICY "Follows are viewable by everyone"
ON public.follows FOR SELECT
USING (true);

-- Users can follow others
CREATE POLICY "Users can insert own follows"
ON public.follows FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = follower);

-- Users can unfollow
CREATE POLICY "Users can delete own follows"
ON public.follows FOR DELETE
TO authenticated
USING (auth.uid() = follower);

-- Tags are viewable by everyone
CREATE POLICY "Tags are viewable by everyone"
ON public.tags FOR SELECT
USING (true);

-- Users can add shows
CREATE POLICY "Authenticated users can insert shows"
ON public.shows FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);


-- Profile tags viewable by everyone
CREATE POLICY "Profile tags are viewable by everyone"
ON public.profile_tags FOR SELECT
USING (true);

-- Users can update own profile tags
CREATE POLICY "Users can manage own profile tags"
ON public.profile_tags FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- User show tags viewable by everyone
CREATE POLICY "User show tags are viewable by everyone"
ON public.user_show_tags FOR SELECT
USING (true);

-- Users can manage tags on their own shows
CREATE POLICY "Users can manage own user show tags"
ON public.user_show_tags FOR ALL
TO authenticated
USING (auth.uid() = (SELECT user_id FROM public.user_shows WHERE id = user_show_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM public.user_shows WHERE id = user_show_id));


-- Allow the trigger function to insert into users
CREATE POLICY "Allow trigger to create user profile"
ON public.users FOR INSERT
WITH CHECK (true);