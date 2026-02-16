import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Package, Truck, MapPin, Phone, X } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    order_number: string;
    created_at: string;
    total_amount: number;
    status: string;
    delivery_method: string;
    delivery_address?: string | null;
    phone?: string | null;
    items: OrderItem[];
  } | null;
  statusClass: (status: string) => string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(price);

export function OrderDetailsDialog({ open, onOpenChange, order, statusClass }: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order #{order.order_number}</span>
            <Badge className={`${statusClass(order.status)} border`}>{order.status}</Badge>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(order.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-lg font-semibold">{formatPrice(order.total_amount)}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-2">
              {order.delivery_method === 'delivery' ? (
                <Truck className="h-4 w-4 text-green-500" />
              ) : (
                <Package className="h-4 w-4 text-blue-500" />
              )}
              <div>
                <div className="text-sm text-muted-foreground">Method</div>
                <div className="font-medium capitalize">{order.delivery_method}</div>
              </div>
            </div>
            {(order.phone || order.delivery_address) && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Contact</div>
                <div className="text-sm flex items-center gap-2">
                  {order.phone && (<><Phone className="h-4 w-4" />{order.phone}</>)}
                </div>
              </div>
            )}
          </div>

          {order.delivery_address && (
            <div className="p-3 rounded-lg bg-muted/30 flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 text-orange-500" />
              <div>
                <div className="text-sm font-medium">Delivery Address</div>
                <div className="text-sm text-muted-foreground">{order.delivery_address}</div>
              </div>
            </div>
          )}

          <Separator />

          {/* Items */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items ({order.items.length})
            </h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded border" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center border">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{formatPrice(item.price)} × {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-semibold">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


