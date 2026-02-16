import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  Package,
  MapPin,
  Settings,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

interface Booking {
  id: string;
  booking_number: string;
  tour_name: string;
  tour_date: string;
  number_of_people: number;
  amount: number;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

const AdminDashboard = () => {
  const { userRole, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  const isNew = (isoDate: string) => {
    const created = new Date(isoDate).getTime();
    const now = Date.now();
    const diffHours = (now - created) / (1000 * 60 * 60);
    return diffHours <= 48; // mark items from last 48h as New
  };

  const formatDateTime = (isoDate: string) => {
    const d = new Date(isoDate);
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  useEffect(() => {
    if (userRole === 'admin') {
      fetchOrders();
      fetchBookings();
      fetchMetrics();
    }
  }, [userRole]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }

    // Fetch user profiles separately
    const ordersWithProfiles = await Promise.all(
      (data || []).map(async (order) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', order.user_id)
          .single();
        
        return {
          ...order,
          profiles: profile || { first_name: 'Unknown', last_name: 'User' }
        };
      })
    );

    setOrders(ordersWithProfiles);
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('tour_bookings')
      .select(`
        id,
        booking_number,
        tour_name,
        tour_date,
        number_of_people,
        amount,
        status,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return;
    }

    // Fetch user profiles separately
    const bookingsWithProfiles = await Promise.all(
      (data || []).map(async (booking) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', booking.user_id)
          .single();
        
        return {
          ...booking,
          profiles: profile || { first_name: 'Unknown', last_name: 'User' }
        };
      })
    );

    setBookings(bookingsWithProfiles);
  };

  const fetchMetrics = async () => {
    // Fetch total users
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Fetch total orders
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Fetch total bookings
    const { count: bookingsCount } = await supabase
      .from('tour_bookings')
      .select('*', { count: 'exact', head: true });

    // Calculate total revenue
    const { data: ordersRevenue } = await supabase
      .from('orders')
      .select('total_amount');

    const { data: bookingsRevenue } = await supabase
      .from('tour_bookings')
      .select('amount');

    const totalOrdersRevenue = ordersRevenue?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
    const totalBookingsRevenue = bookingsRevenue?.reduce((sum, booking) => sum + Number(booking.amount), 0) || 0;

    setMetrics({
      totalUsers: usersCount || 0,
      totalOrders: ordersCount || 0,
      totalBookings: bookingsCount || 0,
      totalRevenue: totalOrdersRevenue + totalBookingsRevenue,
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      fetchOrders();
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('tour_bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
      fetchBookings();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock },
      approved: { variant: "default" as const, icon: CheckCircle },
      rejected: { variant: "destructive" as const, icon: XCircle },
      processing: { variant: "secondary" as const, icon: Clock },
      shipped: { variant: "default" as const, icon: CheckCircle },
      delivered: { variant: "default" as const, icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your business operations</p>
      </div>


      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{metrics.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Order Management</TabsTrigger>
          <TabsTrigger value="bookings">Booking Management</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Product Orders</CardTitle>
                  <CardDescription>Latest updates from the past few days</CardDescription>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {orders.length} total
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        {order.order_number}
                        {isNew(order.created_at) && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">New</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.profiles.first_name} {order.profiles.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        R{Number(order.total_amount).toFixed(2)} • {formatDateTime(order.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Tour Bookings</CardTitle>
                  <CardDescription>Latest booking activity</CardDescription>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {bookings.length} total
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        {booking.booking_number}
                        {isNew(booking.created_at) && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">New</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.profiles.first_name} {booking.profiles.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.tour_name} • {booking.number_of_people} people
                      </div>
                      <div className="text-sm text-muted-foreground">
                        R{Number(booking.amount).toFixed(2)} • {formatDateTime(booking.tour_date)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No bookings found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;