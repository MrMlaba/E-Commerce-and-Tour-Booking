-- Add new mission card fields and hero image URL to homepage_content
INSERT INTO public.homepage_content (section_key, content, section_group, display_order)
VALUES 
  ('hero_image_url', '/src/assets/hero-farm.jpg', 'hero', 4),
  ('mission_card4_title', 'Quality Assured', 'mission', 7),
  ('mission_card4_desc', 'Ensuring the highest quality standards in all our products and services.', 'mission', 8),
  ('mission_card5_title', 'Local Heritage', 'mission', 9),
  ('mission_card5_desc', 'Celebrating and preserving our rich local cultural heritage.', 'mission', 10),
  ('mission_card6_title', 'Sustainable Practices', 'mission', 11),
  ('mission_card6_desc', 'Committed to environmentally friendly and sustainable operations.', 'mission', 12)
ON CONFLICT (section_key) DO NOTHING;