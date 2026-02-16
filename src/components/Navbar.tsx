import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, Menu, X, User, LogOut, ShoppingCart } from "lucide-react";
import { CartPopup } from "@/components/CartPopup";

const Navbar = () => {
  const { user, userRole, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const location = useLocation();

  const isAdminDashboardRoute = location.pathname.startsWith('/admin-dashboard');
  const isUserDashboardRoute = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const { data } = await supabase
        .from('site_branding')
        .select('logo_url')
        .single();
      
      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  // Only hide navbar for admin dashboard
  const showCart = !isAdminDashboardRoute && user;

  return (
    <>
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              {logoUrl ? (
                <div className="flex items-center space-x-2">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-background border-2 border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                    <img src={logoUrl} alt="Amaselwa Holdings Logo" className="h-full w-full object-cover" />
                  </div>
                  <span className="text-xl font-bold text-primary">Amaselwa Holdings</span>
                </div>
              ) : (
                <>
                  <div className="p-2 bg-gradient-primary rounded-lg group-hover:scale-105 transition-transform">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-primary">Amaselwa</span>
                    <span className="text-xs text-muted-foreground block leading-none">Holdings</span>
                  </div>
                </>
              )}
            </Link>

          {/* Desktop Navigation */}
          {!isUserDashboardRoute && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`transition-colors ${location.pathname === "/" ? "text-primary" : "text-foreground hover:text-primary"}`}>Home</Link>
              <Link to="/shop" className={`transition-colors ${location.pathname === "/shop" ? "text-primary" : "text-foreground hover:text-primary"}`}>Shop</Link>
              <Link to="/tours" className={`transition-colors ${location.pathname === "/tours" ? "text-primary" : "text-foreground hover:text-primary"}`}>Tours</Link>
              <Link to="/about" className={`transition-colors ${location.pathname === "/about" ? "text-primary" : "text-foreground hover:text-primary"}`}>About</Link>
              <Link to="/gallery" className={`transition-colors ${location.pathname === "/gallery" ? "text-primary" : "text-foreground hover:text-primary"}`}>Gallery</Link>
              <Link to="/contact" className={`transition-colors ${location.pathname === "/contact" ? "text-primary" : "text-foreground hover:text-primary"}`}>Contact</Link>
            </nav>
          )}

            {/* Cart Button - Only show when user is logged in */}
            <div className="hidden md:flex items-center space-x-4">
              {user && !isAdminDashboardRoute &&(
                <Button 
                  variant="outline" 
                  size="icon"
                  className="relative"
                  onClick={() => setIsCartOpen(!isCartOpen)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {getTotalItems() > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Auth/User Section */}
              {user ? (
                <>
                  {!isUserDashboardRoute && (
                    <Button asChild variant="outline">
                      <Link to={userRole === 'admin' ? '/admin-dashboard' : '/dashboard'}>
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  )}
                  <Button onClick={signOut} variant="ghost">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              {user && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative"
                  onClick={() => setIsCartOpen(!isCartOpen)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {getTotalItems() > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              {!isUserDashboardRoute && (
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <Link to="/" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
                  <Link to="/shop" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Shop</Link>
                  <Link to="/tours" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Tours</Link>
                  <Link to="/about" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>About</Link>
                  <Link to="/gallery" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Gallery</Link>
                  <Link to="/contact" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                </div>
              )}

              <div className={`px-2 pt-4 pb-3 ${!isUserDashboardRoute ? 'border-t border-border' : ''} space-y-2`}>
                {user ? (
                  <>
                    {!isUserDashboardRoute && (
                      <Button asChild variant="outline" className="w-full">
                        <Link to={userRole === 'admin' ? '/admin-dashboard' : '/dashboard'} onClick={() => setIsMenuOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                    )}
                    <Button onClick={() => { signOut(); setIsMenuOpen(false); }} variant="ghost" className="w-full">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <CartPopup isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;