import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  CreditCard, 
  Eye, 
  Download, 
  RefreshCw,
  TrendingUp,
  CalendarDays,
  UserCheck,
  X,
  CheckCircle,
  AlertCircle,
  Search
} from "lucide-react";

interface Booking {
  id: string;
  booking_number: string;
  tour_name: string;
  tour_date: string;
  number_of_people: number;
  amount: number;
  status: string;
  created_at: string;
}

const BookingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all'|'confirmed'|'pending'|'cancelled'>('all');
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tour_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <AlertCircle className="h-3 w-3" />;
      case 'cancelled':
        return <X className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const totalSpent = bookings.reduce((sum, booking) => sum + booking.amount, 0);

  const filtered = bookings.filter(b => (statusFilter==='all' ? true : b.status===statusFilter) && (search.trim()==='' || b.booking_number.toLowerCase().includes(search.toLowerCase()) || b.tour_name.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-muted-foreground">
            Manage your tour bookings and experiences
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <Card className="px-4 py-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">{totalBookings}</div>
                <div className="text-xs text-muted-foreground">Total Bookings</div>
              </div>
            </div>
          </Card>
          <Card className="px-4 py-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">{confirmedBookings}</div>
                <div className="text-xs text-muted-foreground">Confirmed</div>
              </div>
            </div>
          </Card>
          <Card className="px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">{formatPrice(totalSpent)}</div>
                <div className="text-xs text-muted-foreground">Total Spent</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {bookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-4">
              Start exploring amazing tour experiences
            </p>
            <Button asChild>
              <a href="/tours">Browse Tours</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Sticky toolbar */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur -mx-2 px-2 py-2 border-b">
            <div className="flex flex-wrap items-center gap-2">
              {(['all','confirmed','pending','cancelled'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-full border text-sm ${statusFilter===s ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'}`}
                >
                  {s[0].toUpperCase()+s.slice(1)}
                </button>
              ))}
              <div className="relative ml-auto w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  className="pl-9 pr-3 py-2 w-full rounded-md border bg-background"
                  placeholder="Search booking # or tour name"
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filtered.map((booking) => (
            <Card key={booking.id} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* Left Section - Booking Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-base line-clamp-1">{booking.tour_name}</h3>
                        <Badge className={`${getStatusColor(booking.status)} border flex items-center gap-1 text-xs`}>
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDateTime(booking.tour_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Section intentionally minimal to hide details until View */}

                  {/* Right Section - Amount & Actions */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary">
                        {formatPrice(booking.amount)}
                      </div>
                    </div>
                    
                    
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
