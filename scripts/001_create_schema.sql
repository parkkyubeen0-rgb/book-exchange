-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create books table
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  file_url TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'exchanging', 'exchanged')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create exchange_requests table
CREATE TABLE IF NOT EXISTS public.exchange_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requester_book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;

-- 5. Profiles RLS policies
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- Allow users to view other profiles (for displaying nickname in exchanges)
CREATE POLICY "profiles_select_public" ON public.profiles 
  FOR SELECT USING (true);

-- 6. Books RLS policies
-- Users can view their own books
CREATE POLICY "books_select_own" ON public.books 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view public books
CREATE POLICY "books_select_public" ON public.books 
  FOR SELECT USING (is_public = true);

-- Users can insert their own books
CREATE POLICY "books_insert_own" ON public.books 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own books
CREATE POLICY "books_update_own" ON public.books 
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own books
CREATE POLICY "books_delete_own" ON public.books 
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Exchange requests RLS policies
-- Users can view requests they sent
CREATE POLICY "exchange_requests_select_sent" ON public.exchange_requests 
  FOR SELECT USING (auth.uid() = requester_id);

-- Users can view requests they received
CREATE POLICY "exchange_requests_select_received" ON public.exchange_requests 
  FOR SELECT USING (auth.uid() = owner_id);

-- Users can create requests
CREATE POLICY "exchange_requests_insert" ON public.exchange_requests 
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Owners can update requests (accept/reject)
CREATE POLICY "exchange_requests_update_owner" ON public.exchange_requests 
  FOR UPDATE USING (auth.uid() = owner_id);

-- Requesters can also update for completion
CREATE POLICY "exchange_requests_update_requester" ON public.exchange_requests 
  FOR UPDATE USING (auth.uid() = requester_id);

-- Users can delete their own requests
CREATE POLICY "exchange_requests_delete" ON public.exchange_requests 
  FOR DELETE USING (auth.uid() = requester_id);

-- 8. Create function and trigger for auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nickname', 'User')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_user_id ON public.books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_is_public ON public.books(is_public);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_requester_id ON public.exchange_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_owner_id ON public.exchange_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_status ON public.exchange_requests(status);
