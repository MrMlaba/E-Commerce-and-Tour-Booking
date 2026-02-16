-- Create a table for site settings/branding
CREATE TABLE IF NOT EXISTS public.site_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_branding ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view branding"
  ON public.site_branding
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage branding"
  ON public.site_branding
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default row
INSERT INTO public.site_branding (logo_url) VALUES (null)
ON CONFLICT DO NOTHING;

CREATE TABLE gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON gallery_images
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access" ON gallery_images
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');