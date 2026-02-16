import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

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

interface CompactProductCardProps {
  product: Product;
}

export function CompactProductCard({ product }: CompactProductCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(price);
  };

  const renderStars = (rating: number = 5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
      <div className="relative">
        {product.image_url ? (
          <div className="h-32 overflow-hidden rounded-t-lg">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-32 bg-muted flex items-center justify-center rounded-t-lg">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        {/* Stock indicator */}
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
            Low Stock
          </Badge>
        )}
        
        {/* Category badge */}
        {product.category && (
          <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
            {product.category}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
          <div className="text-right ml-2">
            <div className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </div>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          {renderStars(product.rating)}
          <span className="text-xs text-muted-foreground ml-1">
            ({product.rating || 5})
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className="text-xs line-clamp-2 mb-3">
          {product.description}
        </CardDescription>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {product.stock_quantity} available
            </span>
          </div>
        </div>

        <Button
          size="sm"
          className="w-full text-xs"
          onClick={handleAddToCart}
          disabled={!product.stock_quantity || product.stock_quantity === 0}
        >
          <ShoppingCart className="h-3 w-3 mr-1" />
          {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardContent>
    </Card>
  );
}
