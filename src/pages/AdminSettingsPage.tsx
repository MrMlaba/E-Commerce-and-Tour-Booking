import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminSettingsPage = () => {
  const { toast } = useToast();
  const [deliveryFee, setDeliveryFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'delivery_fee')
        .single();

      if (error) throw error;

      if (data?.value && typeof data.value === 'object' && 'amount' in data.value) {
        setDeliveryFee((data.value as { amount: number }).amount.toString());
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSaveDeliveryFee = async () => {
    setLoading(true);
    try {
      const amount = parseFloat(deliveryFee);
      
      if (isNaN(amount) || amount < 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid delivery fee.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'delivery_fee',
          value: { amount }
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Delivery fee has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Settings</CardTitle>
          <CardDescription>Configure delivery fee for orders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delivery-fee">Delivery Fee (R)</Label>
            <Input
              id="delivery-fee"
              type="number"
              step="0.01"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              placeholder="Enter delivery fee"
            />
          </div>
          <Button onClick={handleSaveDeliveryFee} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
