import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Truck, 
  Package, 
  CreditCard, 
  MapPin, 
  Phone, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch delivery fee on component mount
  useEffect(() => {
    const fetchDeliveryFee = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'delivery_fee')
        .single();
      
      if (data?.value && typeof data.value === 'object' && 'amount' in data.value) {
        setDeliveryFee((data.value as { amount: number }).amount || 0);
      }
    };
    fetchDeliveryFee();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(price);
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to checkout.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    if (deliveryMethod === "delivery" && !deliveryAddress) {
      toast({
        title: "Address required",
        description: "Please enter your delivery address.",
        variant: "destructive",
      });
      return;
    }

    if (!phone) {
      toast({
        title: "Phone required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentProof) {
      toast({
        title: "Payment proof required",
        description: "Please attach your payment proof before checkout.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Upload payment proof
      const fileExt = paymentProof.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentProof);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Generate order number on client side (better to use DB function)
      const orderCount = Math.floor(Math.random() * 10000);
      const orderNumber = `ORD-${String(orderCount).padStart(4, '0')}`;
      
      const totalWithDelivery = getTotalPrice() + (deliveryMethod === "delivery" ? deliveryFee : 0);
      
      const orderData = {
        user_id: user.id,
        order_number: orderNumber,
        total_amount: totalWithDelivery,
        status: 'pending',
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === "delivery" ? deliveryAddress : null,
        phone: phone,
        payment_proof_url: publicUrl,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;

      toast({
        title: "Order placed!",
        description: "Your order has been successfully placed.",
      });

      clearCart();
      navigate("/dashboard/orders");
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground">
              Review your items and complete your order
            </p>
          </div>
        </div>
        
        <Card className="border-dashed">
          <CardContent className="py-20 text-center">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start shopping to add amazing products to your cart. Discover our collection of indigenous herbs and traditional products.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <a href="/shop">Start Shopping</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} • {formatPrice(getTotalPrice())}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Your Items ({getTotalItems()})
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCart}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>
          
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="group hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Product Image */}
                    <div className="relative">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 bg-primary text-primary-foreground"
                      >
                        {item.quantity}
                      </Badge>
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {formatPrice(item.price)} each
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-4 py-1 text-sm font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} × {item.quantity}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Checkout Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Checkout
              </CardTitle>
              <CardDescription>Complete your order securely</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Delivery Method */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Delivery Method
                </Label>
                <RadioGroup value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as "delivery" | "pickup")}>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <Label htmlFor="pickup" className="cursor-pointer font-medium">Pick up at store</Label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-green-500" />
                      <Label htmlFor="delivery" className="cursor-pointer font-medium">
                        Delivery (+{formatPrice(deliveryFee)})
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Delivery Address */}
              {deliveryMethod === "delivery" && (
                <div className="space-y-3">
                  <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </Label>
                  <Textarea
                    id="address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}

              {/* Phone Number */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <Separator />

              {/* Payment Details */}
              <div className="space-y-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border">
                <h3 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please make payment to the following account:
                </p>
                <div className="space-y-2 text-sm bg-background p-3 rounded border">
                  <div className="flex justify-between">
                    <span className="font-medium">Bank:</span>
                    <span>Capitec</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Account Number:</span>
                    <span className="font-mono">Here</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Account Holder:</span>
                    <span>Mrs Nonhlanhla</span>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              <div className="space-y-3">
                <Label htmlFor="payment-proof" className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Payment Proof (Required)
                </Label>
                <Input
                  id="payment-proof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                  required
                />
                {paymentProof && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>File selected: {paymentProof.name}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload a screenshot or PDF of your payment confirmation
                </p>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold">Order Summary</h3>
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
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    {formatPrice(getTotalPrice() + (deliveryMethod === "delivery" ? deliveryFee : 0))}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full h-12 text-base font-semibold" 
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Place Order
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
