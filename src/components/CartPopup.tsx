import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Minus, Plus, ShoppingCart, Truck, Package, CreditCard, MapPin, Phone, Loader2, Sparkles, QrCode, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// Add Yoco type declaration
declare global {
  interface Window {
    YocoSDK: any;
  }
}

export const CartPopup = ({ isOpen, onClose }: CartPopupProps) => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash">("cash");

  useEffect(() => {
    const fetchDeliveryFee = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'delivery_fee')
          .single();
        
        if (data?.value && typeof data.value === 'object' && 'amount' in data.value) {
          setDeliveryFee((data.value as { amount: number }).amount || 0);
        }
      } catch (error) {
        console.error('Error fetching delivery fee:', error);
      }
    };
    
    if (isOpen) {
      fetchDeliveryFee();
    }
  }, [isOpen]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(price);
  };

  const totalAmount = getTotalPrice() + (deliveryMethod === "delivery" ? deliveryFee : 0);

  const handleCashPayment = async () => {
    if (!user) {
      toast.error("Please login to checkout");
      return;
    }

    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (deliveryMethod === "delivery" && !deliveryAddress) {
      toast.error("Please enter your delivery address");
      return;
    }

    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);

    try {
      const orderCount = Math.floor(Math.random() * 10000);
      const orderNumber = `ORD-${String(orderCount).padStart(4, '0')}`;

      const orderData = {
        user_id: user.id,
        order_number: orderNumber,
        total_amount: totalAmount,
        status: 'pending',
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === "delivery" ? deliveryAddress : null,
        phone: phone,
        payment_method: 'cash',
        payment_status: 'pending',
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Order placed successfully! Please have cash ready for delivery.");
      clearCart();
      onClose();
      navigate("/dashboard/orders");

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l shadow-xl z-50 flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-primary/10 rounded">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <p className="text-xs text-muted-foreground">{getTotalItems()} items</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-primary/10">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={item.id} className="border-l-2 border-l-primary/20">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="relative">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-14 h-14 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-muted rounded border flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <Badge 
                            variant="secondary" 
                            className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
                          >
                            {item.quantity}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {formatPrice(item.price)} each
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-xs font-medium px-2 py-1 min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto text-xs h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFromCart(item.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Checkout Form */}
                <div className="space-y-4 mt-6">
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery Method
                    </Label>
                    <RadioGroup value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as "delivery" | "pickup")}>
                      <div className="flex items-center space-x-3 p-2 border rounded hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="pickup" id="popup-pickup" />
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-blue-500" />
                          <Label htmlFor="popup-pickup" className="cursor-pointer text-sm font-medium">Pick up at store</Label>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 border rounded hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="delivery" id="popup-delivery" />
                        <div className="flex items-center gap-2">
                          <Truck className="h-3 w-3 text-green-500" />
                          <Label htmlFor="popup-delivery" className="cursor-pointer text-sm font-medium">
                            Delivery (+{formatPrice(deliveryFee)})
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {deliveryMethod === "delivery" && (
                    <div className="space-y-2">
                      <Label htmlFor="popup-address" className="text-sm font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Address
                      </Label>
                      <Textarea
                        id="popup-address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your delivery address"
                        rows={2}
                        className="text-sm resize-none"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="popup-phone" className="text-sm font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="popup-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="text-sm"
                    />
                  </div>

                  <Separator />

                  {/* Payment Method - Cash Only for Now */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Payment Method
                    </Label>
                    
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <QrCode className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-800">Cash on Delivery</h4>
                          <p className="text-xs text-amber-700">Pay when you receive your order</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs text-amber-700">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                          <span>No online payment required</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                          <span>Zero transaction fees</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                          <span>Perfect for small businesses</span>
                        </div>
                      </div>
                    </div>

                    {/* Coming Soon Notice */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <p className="text-xs text-blue-700 font-medium">
                        💳 Online payments coming soon!
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        We're setting up Yoco for card payments
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal ({getTotalItems()} items):</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>
                    {deliveryMethod === "delivery" && (
                      <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span>{formatPrice(deliveryFee)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-base font-bold">
                      <span>Total Amount:</span>
                      <span className="text-primary">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700" 
                    onClick={handleCashPayment}
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-5 w-5 mr-2" />
                        Place Order - Pay Cash
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      You'll pay {formatPrice(totalAmount)} in cash when you receive your order
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};