import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  CreditCard, 
  Truck, 
  ShoppingBag,
  Eye,
  Download,
  RefreshCw,
  TrendingUp,
  Clock,
  X,
  Search
} from "lucide-react";
import { OrderDetailsDialog } from "@/components/OrderDetailsDialog";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  image?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  delivery_method: string;
  delivery_address?: string;
  phone?: string;
  created_at: string;
  items: OrderItem[];
}

const OrdersPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'processing'|'shipped'|'delivered'|'cancelled'>('all');
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []).map(order => ({
        ...order,
        items: Array.isArray(order.items) ? order.items.map((item: any) => ({
          ...item,
          // Ensure image_url is included, use placeholder if missing
          image_url: item.image_url || item.image || null
        })) as OrderItem[] : []
      })));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
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
      case 'completed':
        return <Package className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'cancelled':
        return <X className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(price);
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);

  const filtered = orders.filter(o => (statusFilter==='all' ? true : o.status===statusFilter) && (search.trim()==='' || o.order_number.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            My Orders
          </h1>
          <p className="text-muted-foreground">
            Track and manage your order history
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <Card className="px-4 py-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">{totalOrders}</div>
                <div className="text-xs text-muted-foreground">Total Orders</div>
              </div>
            </div>
          </Card>
          <Card className="px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">{formatPrice(totalSpent)}</div>
                <div className="text-xs text-muted-foreground">Total Spent</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Start shopping to see your orders here
            </p>
            <Button asChild>
              <a href="/shop">Start Shopping</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Sticky toolbar */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur -mx-2 px-2 py-2 border-b">
            <div className="flex flex-wrap items-center gap-2">
              {(['all','pending','processing','shipped','delivered','cancelled'] as const).map(s => (
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
                  placeholder="Search Order #"
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filtered.map((order) => (
            <Card key={order.id} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* Left Section - Order Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-base">Order #{order.order_number}</h3>
                        <Badge className={`${getStatusColor(order.status)} border flex items-center gap-1 text-xs`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDateTime(order.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {order.delivery_method === 'delivery' ? (
                            <Truck className="h-3 w-3 text-green-500" />
                          ) : (
                            <Package className="h-3 w-3 text-blue-500" />
                          )}
                          <span className="capitalize">{order.delivery_method}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{order.items.length} items</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Section - Items preview hidden; shown in View dialog */}

                  {/* Right Section - Amount & Actions */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary">
                        {formatPrice(order.total_amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} items
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDetails(order)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <OrderDetailsDialog 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
        order={selectedOrder}
        statusClass={getStatusColor}
      />
    </div>
  );
};

export default OrdersPage;
