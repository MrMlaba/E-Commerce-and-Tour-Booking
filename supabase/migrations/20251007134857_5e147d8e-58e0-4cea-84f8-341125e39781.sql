-- Create homepage_content table
CREATE TABLE public.homepage_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  section_group TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Everyone can view homepage content"
ON public.homepage_content
FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage homepage content"
ON public.homepage_content
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_homepage_content_updated_at
BEFORE UPDATE ON public.homepage_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.homepage_content;

-- Insert initial homepage content
INSERT INTO public.homepage_content (section_key, content, section_group, display_order) VALUES
-- Hero Section
('hero_heading', 'Discover Authentic South African Indigenous Products & Eco-Tours', 'hero', 1),
('hero_description', 'Experience sustainable agriculture and cultural heritage through our curated collection of indigenous products and immersive eco-tourism experiences.', 'hero', 2),
('hero_location', 'KwaZulu-Natal, South Africa', 'hero', 3),

-- Mission Section
('mission_heading', 'Our Mission & Values', 'mission', 1),
('mission_description', 'We are committed to preserving indigenous knowledge while empowering local communities through sustainable practices.', 'mission', 2),
('mission_card1_title', 'Sustainable Agriculture', 'mission', 3),
('mission_card1_desc', 'Supporting traditional farming methods that protect our environment and preserve biodiversity for future generations.', 'mission', 4),
('mission_card2_title', 'Community Empowerment', 'mission', 5),
('mission_card2_desc', 'Creating economic opportunities for local communities while celebrating their rich cultural heritage.', 'mission', 6),
('mission_card3_title', 'Indigenous Knowledge', 'mission', 7),
('mission_card3_desc', 'Honoring and sharing centuries-old wisdom about natural remedies and sustainable living practices.', 'mission', 8),

-- Products Section
('products_heading', 'Indigenous Products', 'products', 1),
('products_description', 'Browse our collection of authentic South African products', 'products', 2),

-- Tours Section
('tours_heading', 'Eco-Tourism Experiences', 'tours', 1),
('tours_description', 'Immerse yourself in authentic cultural and nature experiences', 'tours', 2),

-- CTA Section
('cta_heading', 'Join Our Community', 'cta', 1),
('cta_description', 'Be part of our mission to preserve indigenous heritage and promote sustainable living.', 'cta', 2);