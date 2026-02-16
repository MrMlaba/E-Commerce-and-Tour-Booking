import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SearchProvider } from "@/contexts/SearchContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import ShopPage from "./pages/ShopPage";
import ToursPage from "./pages/ToursPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboardHome from "./pages/UserDashboardHome";
import OrdersPage from "./pages/OrdersPage";
import BookingsPage from "./pages/BookingsPage";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminToursPage from "./pages/AdminToursPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminContentPage from "./pages/AdminContentPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminTourBookingsPage from "./pages/AdminTourBookingsPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminTourDatesPage from "./pages/AdminTourDatesPage";
import AdminBrandingPage from "./pages/AdminBrandingPage";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./layouts/AdminLayout";
import { UserLayout } from "./layouts/UserLayout";
import GalleryPage from "./pages/GalleryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/tours" element={<ToursPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<UserLayout />}>
                    <Route index element={<UserDashboardHome />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="bookings" element={<BookingsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                  <Route path="/admin-dashboard" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="tour-bookings" element={<AdminTourBookingsPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="tours" element={<AdminToursPage />} />
                    <Route path="tour-dates" element={<AdminTourDatesPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="content" element={<AdminContentPage />} />
                    <Route path="branding" element={<AdminBrandingPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                  </Route>
                  <Route path="/cart" element={<CartPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
            </TooltipProvider>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
