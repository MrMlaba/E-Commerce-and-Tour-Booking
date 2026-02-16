-- Create storage buckets for product and tour images
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('tours', 'tours', true);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tours table
CREATE TABLE public.tours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  duration TEXT,
  max_participants INTEGER DEFAULT 10,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Everyone can view active products" 
ON public.products 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all products" 
ON public.products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for tours
CREATE POLICY "Everyone can view active tours" 
ON public.tours 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all tours" 
ON public.tours 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage policies for product images
CREATE POLICY "Public can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "Admins can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'products' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'products' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'products' AND has_role(auth.uid(), 'admin'::app_role));

-- Create storage policies for tour images
CREATE POLICY "Public can view tour images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tours');

CREATE POLICY "Admins can upload tour images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'tours' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tour images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'tours' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tour images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'tours' AND has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tours_updated_at
BEFORE UPDATE ON public.tours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for products and tours
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.tours REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.products;
ALTER publication supabase_realtime ADD TABLE public.tours;

-- Insert sample data
INSERT INTO public.products (name, description, price, category, stock_quantity) VALUES
('Organic Honey', 'Pure organic honey from local farms', 25.99, 'Food', 50),
('Handmade Soap', 'Natural soap made with organic ingredients', 12.50, 'Personal Care', 30),
('Fresh Vegetables Box', 'Weekly box of fresh organic vegetables', 35.00, 'Food', 20);

INSERT INTO public.tours (name, description, price, duration, max_participants, location) VALUES
('Farm Tour Experience', 'Guided tour of our organic farm with tastings', 45.00, '3 hours', 15, 'Main Farm'),
('Beekeeping Workshop', 'Learn about beekeeping and honey production', 65.00, '2 hours', 8, 'Apiary'),
('Sustainable Farming Tour', 'Explore sustainable farming practices', 55.00, '4 hours', 12, 'Multiple Locations');