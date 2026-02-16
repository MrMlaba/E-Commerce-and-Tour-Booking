import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CompactProductCard } from "@/components/CompactProductCard";
import { CompactTourCard } from "@/components/CompactTourCard";
import { DashboardSearchFilters } from "@/components/DashboardSearchFilters";
import { useToast } from "@/components/ui/use-toast";
import { useSearch } from "@/contexts/SearchContext";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  MapPin, 
  Search, 
  Grid, 
  List, 
  SlidersHorizontal,
  TrendingUp,
  Star,
  ShoppingCart
} from "lucide-react";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category?: string;
  stock_quantity: number;
  rating?: number;
  created_at?: string;
}

interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  duration?: string;
  max_participants: number;
  location?: string;
  rating?: number;
  created_at?: string;
}

const UserDashboardHome = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { filters } = useSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductFilters, setShowProductFilters] = useState(false);
  const [showTourFilters, setShowTourFilters] = useState(false);

  useEffect(() => {
    fetchProductsAndTours();
    const cleanup = setupRealtimeSubscriptions();
    return () => {
      // Ensure we unsubscribe from realtime channels when unmounting
      cleanup && cleanup();
    };
  }, []);

  const fetchProductsAndTours = async () => {
    try {
      const [productsResponse, toursResponse] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true),
        supabase.from('tours').select('*').eq('is_active', true)
      ]);

      if (productsResponse.error) throw productsResponse.error;
      if (toursResponse.error) throw toursResponse.error;

      setProducts(productsResponse.data || []);
      setTours(toursResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load products and tours.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchProductsAndTours();
        }
      )
      .subscribe();

    const toursChannel = supabase
      .channel('tours-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tours'
        },
        () => {
          fetchProductsAndTours();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(toursChannel);
    };
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = filters.searchTerm === '' || 
        product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (product.description?.toLowerCase() || "").includes(filters.searchTerm.toLowerCase());
      
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(product.category);
      
      const matchesPrice = product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1];
      
      const matchesStock = !filters.inStock || product.stock_quantity > 0;
      
      const matchesRating = !filters.minRating || (product.rating || 5) >= filters.minRating;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesRating;
    });

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filters]);

  // Filter and sort tours
  const filteredAndSortedTours = useMemo(() => {
    let filtered = tours.filter(tour => {
      const matchesSearch = filters.searchTerm === '' || 
        tour.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (tour.description?.toLowerCase() || "").includes(filters.searchTerm.toLowerCase());
      
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(tour.location);
      
      const matchesPrice = tour.price >= filters.priceRange[0] && 
        tour.price <= filters.priceRange[1];
      
      const matchesRating = !filters.minRating || (tour.rating || 5) >= filters.minRating;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [tours, filters]);

  const productCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
  }, [products]);

  const tourCategories = useMemo(() => {
    return Array.from(new Set(tours.map(t => t.location).filter(Boolean))) as string[];
  }, [tours]);

  const maxProductPrice = useMemo(() => {
    return Math.max(...products.map(p => p.price), 0);
  }, [products]);

  const maxTourPrice = useMemo(() => {
    return Math.max(...tours.map(t => t.price), 0);
  }, [tours]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.user_metadata?.first_name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Discover our products and book amazing tours.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{products.length} Products</span>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{tours.length} Tours</span>
            </div>
          </Card>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Products Section */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Our Products</h2>
                  <p className="text-sm text-muted-foreground">
                    Discover our collection of {filteredAndSortedProducts.length} products
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProductFilters(!showProductFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/shop">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </div>
            </div>

            {/* Product Filters */}
            {showProductFilters && (
              <div className="mb-6">
                <DashboardSearchFilters
                  categories={productCategories}
                  maxPrice={maxProductPrice}
                  type="products"
                />
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAndSortedProducts.slice(0, 10).map((product) => (
                <CompactProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {filteredAndSortedProducts.length === 0 && (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button variant="outline" onClick={() => setShowProductFilters(true)}>
                  <Search className="h-4 w-4 mr-2" />
                  Adjust Filters
                </Button>
              </Card>
            )}
            
            {filteredAndSortedProducts.length > 10 && (
              <div className="text-center mt-6">
                <Button asChild>
                  <Link to="/shop">
                    View All Products ({filteredAndSortedProducts.length})
                  </Link>
                </Button>
              </div>
            )}
          </section>

          <Separator className="my-8" />

          {/* Tours Section */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Available Tours</h2>
                  <p className="text-sm text-muted-foreground">
                    Explore {filteredAndSortedTours.length} amazing tour experiences
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTourFilters(!showTourFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/tours">
                    <MapPin className="h-4 w-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </div>
            </div>

            {/* Tour Filters */}
            {showTourFilters && (
              <div className="mb-6">
                <DashboardSearchFilters
                  categories={tourCategories}
                  maxPrice={maxTourPrice}
                  type="tours"
                />
              </div>
            )}

            {/* Tours Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAndSortedTours.slice(0, 8).map((tour) => (
                <CompactTourCard key={tour.id} tour={tour} />
              ))}
            </div>
            
            {filteredAndSortedTours.length === 0 && (
              <Card className="p-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tours found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters to find amazing tour experiences.
                </p>
                <Button variant="outline" onClick={() => setShowTourFilters(true)}>
                  <Search className="h-4 w-4 mr-2" />
                  Adjust Filters
                </Button>
              </Card>
            )}
            
            {filteredAndSortedTours.length > 8 && (
              <div className="text-center mt-6">
                <Button asChild>
                  <Link to="/tours">
                    View All Tours ({filteredAndSortedTours.length})
                  </Link>
                </Button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default UserDashboardHome;
