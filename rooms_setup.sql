CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  password text,
  host_id text NOT NULL,
  media_id text NOT NULL,
  media_type text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for the rooms table (if we want to track changes, though we mainly use broadcast channels)
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- RLS Policies
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a room" 
ON public.rooms FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read rooms" 
ON public.rooms FOR SELECT 
USING (true);

CREATE POLICY "Only host can update" 
ON public.rooms FOR UPDATE 
USING (true);

CREATE POLICY "Only host can delete" 
ON public.rooms FOR DELETE 
USING (true);
