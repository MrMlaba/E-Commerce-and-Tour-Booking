import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Clock, Package as PackageIcon, Truck, FileText, Search, Check, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { PdfViewerModal } from "@/components/PdfViewerModal";
import { OrderDetailsModal } from "@/components/OrderDetailsModal";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_method: string;
  delivery_address?: string;
  phone?: string;
  payment_proof_url?: string;
  items: OrderItem[];
  profiles: {
    first_name: string;
    last_name: string;
  };
}

const AdminOrdersPage = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; orderNumber: string } | null>(null);
  const [pickupSearch, setPickupSearch] = useState("");
  const [pickupStatus, setPickupStatus] = useState<'all' | 'pending' | 'processing' | 'delivered' | 'collected'>('all');
  const [deliveryStatus, setDeliveryStatus] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all');

  // Date filter states
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        delivery_method,
        delivery_address,
        phone,
        payment_proof_url,
        items,
        user_id
      `)
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
  
    console.log('Raw orders data:', data); // Debug log
  
    const ordersWithProfiles = await Promise.all(
      (data || []).map(async (order) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', order.user_id)
          .single();
        
        // Fix and validate items data
        let items: OrderItem[] = [];
        
        if (Array.isArray(order.items)) {
          items = order.items.map((item: any, index: number) => ({
            id: item?.id || `item-${index}`,
            name: item?.name || item?.product_name || 'Unknown Product',
            price: Number(item?.price) || 0,
            quantity: Number(item?.quantity) || 1,
            image_url: item?.image_url || item?.image || undefined,
          }));
        }
        
        console.log('Processed order items:', items); // Debug log
        
        return {
          ...order,
          items: items,
          profiles: profile || { first_name: 'Unknown', last_name: 'User' }
        } as Order;
      })
    );
  
    setOrders(ordersWithProfiles as Order[]);
    setLoading(false);
  };

    // Date filtering functions
    const filterOrdersByDate = (orders: Order[]) => {
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return orders.filter(order => {
            const orderDate = new Date(order.created_at);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
          });
          
        case 'yesterday':
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          const yesterdayEnd = new Date(yesterday);
          yesterdayEnd.setHours(23, 59, 59, 999);
          return orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= yesterday && orderDate <= yesterdayEnd;
          });
          
        case 'thisWeek':
          const startOfWeek = new Date();
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          return orders.filter(order => new Date(order.created_at) >= startOfWeek);
          
        case 'thisMonth':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return orders.filter(order => new Date(order.created_at) >= startOfMonth);
          
        case 'custom':
          if (!customStartDate) return orders;
          const startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
          
          let endDate = customEndDate ? new Date(customEndDate) : new Date();
          endDate.setHours(23, 59, 59, 999);
          
          return orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= startDate && orderDate <= endDate;
          });
          
        default:
          return orders;
      }
    };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const closeOrderDetails = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    closeOrderDetails(); // Close modal after status update
  };


  const openPdfModal = (orderNumber: string, paymentProofUrl: string) => {
    setSelectedPdf({ url: paymentProofUrl, orderNumber });
    setPdfModalOpen(true);
  };

  const closePdfModal = () => {
    setPdfModalOpen(false);
    setSelectedPdf(null);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock },
      processing: { variant: "secondary" as const, icon: PackageIcon },
      shipped: { variant: "default" as const, icon: Truck },
      delivered: { variant: "default" as const, icon: CheckCircle },
      collected: { variant: "default" as const, icon: CheckCircle },
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


  const filteredByDate = filterOrdersByDate(orders);
  const deliveryOrders = filteredByDate.filter(order => order.delivery_method === 'delivery');
  const pickupOrders = filteredByDate.filter(order => order.delivery_method === 'pickup');
  const filteredDeliveryOrders = deliveryOrders.filter(o => deliveryStatus === 'all' ? true : o.status === deliveryStatus);
  const filteredPickupOrders = pickupOrders.filter(o =>
    (pickupStatus === 'all' ? true : o.status === pickupStatus) &&
    (pickupSearch.trim() === "" || o.order_number.toLowerCase().includes(pickupSearch.toLowerCase()))
  );

  const resetDateFilter = () => {
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setShowDatePicker(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Order Management</h1>
        <p className="text-muted-foreground">Process and manage customer orders</p>
      </div>

      {/* Date Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter by Date
          </CardTitle>
          <CardDescription>Filter orders by specific date ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Quick Date Filters */}
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'yesterday', label: 'Yesterday' },
                { value: 'thisWeek', label: 'This Week' },
                { value: 'thisMonth', label: 'This Month' },
                { value: 'custom', label: 'Custom Range' }
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    setDateFilter(value);
                    if (value !== 'custom') setShowDatePicker(false);
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    dateFilter === value 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Custom Date Picker */}
            {dateFilter === 'custom' && (
              <div className="flex flex-wrap gap-3 items-center bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">From:</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">To:</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetDateFilter}
                >
                  Reset
                </Button>
              </div>
            )}

            {/* Results Count */}
            <div className="ml-auto text-sm text-muted-foreground">
              Showing {filteredByDate.length} of {orders.length} orders
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="delivery" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="delivery">
            Delivery Orders ({deliveryOrders.length})
          </TabsTrigger>
          <TabsTrigger value="pickup">
            Pickup Orders ({pickupOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="delivery" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Orders</CardTitle>
            <CardDescription>Orders for home delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sticky toolbar with status chips */}
              <div className="sticky top-0 z-10 bg-card/80 backdrop-blur border-b py-2 -mx-4 px-4">
                <div className="flex items-center gap-2 text-sm">
                  {(['all','pending','processing','shipped','delivered'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setDeliveryStatus(s)}
                      className={`px-2.5 py-1 rounded-full border ${deliveryStatus===s ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'}`}
                    >
                      {s[0].toUpperCase()+s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {filteredDeliveryOrders.map((order) => (
                <div 
                  key={order.id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer hover:border-primary/50"
                  onClick={() => openOrderDetails(order)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="font-medium">{order.order_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.profiles.first_name} {order.profiles.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        R{Number(order.total_amount).toFixed(2)} • {formatDateTime(order.created_at)}
                      </div>
                      {order.delivery_address && (
                        <div className="text-sm text-muted-foreground">
                          📍 {order.delivery_address}
                        </div>
                      )}
                      {order.phone && (
                        <div className="text-sm text-muted-foreground">
                          📞 {order.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(order.status)}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the card click
                          openOrderDetails(order);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredDeliveryOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No delivery orders found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

        <TabsContent value="pickup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pickup Orders</CardTitle>
              <CardDescription>Orders for in-store pickup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search by Order Number */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      className="pl-9 pr-3 py-2 w-full rounded-md border bg-background"
                      placeholder="Search by Order # (e.g., ORD-0123)"
                      value={pickupSearch}
                      onChange={(e) => setPickupSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sticky status chips */}
                <div className="sticky top-0 z-10 bg-card/80 backdrop-blur border-b py-2 -mx-4 px-4">
                  <div className="flex items-center gap-2 text-sm">
                    {(['all','pending','processing','delivered','collected'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setPickupStatus(s)}
                        className={`px-2.5 py-1 rounded-full border ${pickupStatus===s ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'}`}
                      >
                        {s[0].toUpperCase()+s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredPickupOrders.map((order) => (
                <div 
                  key={order.id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer hover:border-primary/50"
                  onClick={() => openOrderDetails(order)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="font-medium">{order.order_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.profiles.first_name} {order.profiles.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        R{Number(order.total_amount).toFixed(2)} • {formatDateTime(order.created_at)}
                      </div>
                      {order.phone && (
                        <div className="text-sm text-muted-foreground">
                          📞 {order.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(order.status)}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openOrderDetails(order);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredPickupOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No pickup orders found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={closeOrderDetails}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default AdminOrdersPage;