import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Leaf, 
  Users, 
  Heart, 
  ShoppingCart, 
  Calendar,
  MapPin,
  Star,
  CheckCircle,
  Award,
  Sprout,
  ImageIcon // Add this import
} from "lucide-react";
import heroFarmDefault from "@/assets/hero-farm.jpg";
import { ProductCard } from "@/components/ProductCard";
import { TourCard } from "@/components/TourCard";

interface ContentData {
  hero_heading: string;
  hero_description: string;
  hero_location: string;
  hero_image_url?: string;
  mission_heading: string;
  mission_description: string;
  mission_card1_title: string;
  mission_card1_desc: string;
  mission_card2_title: string;
  mission_card2_desc: string;
  mission_card3_title: string;
  mission_card3_desc: string;
  mission_card4_title?: string;
  mission_card4_desc?: string;
  mission_card5_title?: string;
  mission_card5_desc?: string;
  mission_card6_title?: string;
  mission_card6_desc?: string;
  products_heading: string;
  products_description: string;
  tours_heading: string;
  tours_description: string;
  gallery_heading: string; // Add this
  gallery_description: string; // Add this
  cta_heading: string;
  cta_description: string;
}

const HomePage = () => {
  const [contentData, setContentData] = useState<ContentData>({
    hero_heading: "Discover Authentic South African Indigenous Products & Eco-Tours",
    hero_description: "Experience sustainable agriculture and cultural heritage through our curated collection of indigenous products and immersive eco-tourism experiences.",
    hero_location: "KwaZulu-Natal, South Africa",
    mission_heading: "Our Mission & Values",
    mission_description: "We are committed to preserving indigenous knowledge while empowering local communities through sustainable practices.",
    mission_card1_title: "Sustainable Agriculture",
    mission_card1_desc: "Supporting traditional farming methods that protect our environment and preserve biodiversity for future generations.",
    mission_card2_title: "Community Empowerment",
    mission_card2_desc: "Creating economic opportunities for local communities while celebrating their rich cultural heritage.",
    mission_card3_title: "Indigenous Knowledge",
    mission_card3_desc: "Honoring and sharing centuries-old wisdom about natural remedies and sustainable living practices.",
    products_heading: "Indigenous Products",
    products_description: "Browse our collection of authentic South African products",
    tours_heading: "Eco-Tourism Experiences",
    tours_description: "Immerse yourself in authentic cultural and nature experiences",
    gallery_heading: "Our Gallery", // Add default
    gallery_description: "Explore photos from our farm, community, and sustainable practices", // Add default
    cta_heading: "Join Our Community",
    cta_description: "Be part of our mission to preserve indigenous heritage and promote sustainable living.",
  });

  const [products, setProducts] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]); // Add this state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
    fetchProductsAndTours();
    fetchGalleryImages(); // Add this

    const contentChannel = supabase
      .channel('homepage-content-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'homepage_content'
      }, () => {
        fetchContent();
      })
      .subscribe();

    const productsChannel = supabase
      .channel('homepage-products-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, () => {
        fetchProductsAndTours();
      })
      .subscribe();

    const toursChannel = supabase
      .channel('homepage-tours-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tours'
      }, () => {
        fetchProductsAndTours();
      })
      .subscribe();

    // Add gallery images channel
    const galleryChannel = supabase
      .channel('homepage-gallery-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'gallery_images' // You'll need to create this table
      }, () => {
        fetchGalleryImages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(contentChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(toursChannel);
      supabase.removeChannel(galleryChannel);
    };
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('section_key, content');

      if (error) throw error;

      if (data) {
        const newContent: any = {};
        data.forEach((item) => {
          newContent[item.section_key] = item.content;
        });
        setContentData(prev => ({ ...prev, ...newContent }));
      }
    } catch (error) {
      console.error('Error fetching homepage content:', error);
    }
  };

  const fetchProductsAndTours = async () => {
    try {
      const [productsResponse, toursResponse] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).limit(4),
        supabase.from('tours').select('*').eq('is_active', true).limit(3)
      ]);

      if (productsResponse.data) setProducts(productsResponse.data);
      if (toursResponse.data) setTours(toursResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to fetch gallery images
  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6); // Show 6 images on homepage

      if (error) throw error;
      if (data) setGalleryImages(data);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    }
  };

  const features = [
    {
      icon: Leaf,
      title: contentData.mission_card1_title,
      description: contentData.mission_card1_desc
    },
    {
      icon: Users,
      title: contentData.mission_card2_title,
      description: contentData.mission_card2_desc
    },
    {
      icon: Heart,
      title: contentData.mission_card3_title,
      description: contentData.mission_card3_desc
    },
    {
      icon: Award,
      title: contentData.mission_card4_title || "Quality Assured",
      description: contentData.mission_card4_desc || "Ensuring the highest quality standards in all our products and services."
    },
    {
      icon: MapPin,
      title: contentData.mission_card5_title || "Local Heritage",
      description: contentData.mission_card5_desc || "Celebrating and preserving our rich local cultural heritage."
    },
    {
      icon: Sprout,
      title: contentData.mission_card6_title || "Sustainable Practices",
      description: contentData.mission_card6_desc || "Committed to environmentally friendly and sustainable operations."
    }
  ];


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${contentData.hero_image_url || heroFarmDefault})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <Badge className="mb-6 bg-white/10 text-white border-white/20" variant="outline">
            <MapPin className="h-3 w-3 mr-1" />
            {contentData.hero_location}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-float">
            {contentData.hero_heading}
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            {contentData.hero_description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild className="text-lg px-8">
              <Link to="/shop">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Shop Products
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 text-white border-white hover:bg-white hover:text-primary">
              <Link to="/tours" className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Book Tours
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-earth">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {contentData.mission_heading}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {contentData.mission_description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-none shadow-warm hover:shadow-earth transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              {contentData.products_heading}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              {contentData.products_description}
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading...</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {products.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No products available at the moment.
                </p>
              )}
            </>
          )}
          
          <div className="text-center">
            <Button variant="nature" size="lg" asChild>
              <Link to="/shop">
                View All Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              {contentData.tours_heading}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              {contentData.tours_description}
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading...</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
              {tours.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No tours available at the moment.
                </p>
              )}
            </>
          )}
          
          <div className="text-center">
            <Button variant="earth" size="lg" asChild>
              <Link to="/tours">
                Book Experience
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* NEW Gallery Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              {contentData.gallery_heading}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              {contentData.gallery_description}
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading...</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {galleryImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden border-none shadow-warm hover:shadow-earth transition-all duration-300 hover:-translate-y-2">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={image.image_url} 
                        alt={image.title || 'Gallery image'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {(image.title || image.description) && (
                      <CardContent className="p-4">
                        {image.title && (
                          <h3 className="font-semibold text-primary mb-2">{image.title}</h3>
                        )}
                        {image.description && (
                          <p className="text-sm text-muted-foreground">{image.description}</p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
              {galleryImages.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No gallery images available at the moment.
                </p>
              )}
            </>
          )}
          
          <div className="text-center">
            <Button variant="nature" size="lg" asChild>
              <Link to="/gallery">
                <ImageIcon className="h-4 w-4 mr-2" />
                View Full Gallery
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {contentData.cta_heading}
          </h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            {contentData.cta_description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="text-lg px-8" asChild>
              <Link to="/register">
                <Users className="h-5 w-5 mr-2" />
                Create Account
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 text-white border-white hover:bg-white hover:text-primary">
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;