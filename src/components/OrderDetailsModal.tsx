// @/components/OrderDetailsModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, Phone, Calendar, Package, User, Clock, PackageIcon, Truck, CheckCircle } from "lucide-react";

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

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

export const OrderDetailsModal = ({ isOpen, onClose, order, onStatusUpdate }: OrderDetailsModalProps) => {
  if (!order) return null;

  console.log('Order data in modal:', order); // Debug log

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Safe calculation functions
  const calculateItemTotal = (item: OrderItem) => {
    const price = Number(item?.price) || 0;
    const quantity = Number(item?.quantity) || 1;
    return (price * quantity).toFixed(2);
  };

  const getItemPrice = (item: OrderItem) => {
    return (Number(item?.price) || 0).toFixed(2);
  };

  const isDelivery = order.delivery_method === 'delivery';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details: {order.order_number}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{order.profiles.first_name} {order.profiles.last_name}</p>
                </div>
                {order.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone
                    </p>
                    <p className="font-medium">{order.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Order Date
                  </p>
                  <p className="font-medium">{formatDateTime(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Method</p>
                  <p className="font-medium capitalize">{order.delivery_method}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {isDelivery && order.delivery_address && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </h3>
                <p className="text-sm">{order.delivery_address}</p>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Order Items ({order.items?.length || 0})</h3>
              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  <>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-background rounded border">
                        <div className="flex items-center gap-3 flex-1">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name || 'Product image'}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                // If image fails to load, hide it
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <PackageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.name || 'Unnamed Product'}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity || 1}</p>
                          </div>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="font-medium">R{calculateItemTotal(item)}</p>
                          <p className="text-sm text-muted-foreground">R{getItemPrice(item)} each</p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
                      <span>Total Amount:</span>
                      <span>R{Number(order.total_amount || 0).toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No items found in this order
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Actions & Status */}
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Order Status</h3>
              <div className="flex justify-center mb-4">
                {getStatusBadge(order.status)}
              </div>
              
              {/* Status Actions */}
              <div className="space-y-2">
                {isDelivery ? (
                  <>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => onStatusUpdate(order.id, 'processing')}
                      disabled={order.status !== 'pending'}
                    >
                      Start Processing
                    </Button>
                    <Button
                      size="sm"
                      className="w-full"
                      variant="outline"
                      onClick={() => onStatusUpdate(order.id, 'shipped')}
                      disabled={order.status !== 'processing'}
                    >
                      Mark as Shipped
                    </Button>
                    <Button
                      size="sm"
                      className="w-full"
                      variant="outline"
                      onClick={() => onStatusUpdate(order.id, 'delivered')}
                      disabled={order.status !== 'shipped'}
                    >
                      Mark as Delivered
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => onStatusUpdate(order.id, 'processing')}
                      disabled={order.status !== 'pending'}
                    >
                      Start Processing
                    </Button>
                    <Button
                      size="sm"
                      className="w-full"
                      variant="outline"
                      onClick={() => onStatusUpdate(order.id, 'delivered')}
                      disabled={order.status !== 'processing'}
                    >
                      Ready for Pickup
                    </Button>
                    <Button
                      size="sm"
                      className="w-full"
                      variant="outline"
                      onClick={() => onStatusUpdate(order.id, 'collected')}
                      disabled={order.status !== 'delivered'}
                    >
                      Mark as Collected
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Payment Proof */}
            {order.payment_proof_url && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Payment Proof</h3>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    window.open(order.payment_proof_url, '_blank');
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Payment Proof
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};