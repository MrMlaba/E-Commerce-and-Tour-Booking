import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Image as ImageIcon } from "lucide-react";

const AdminBrandingPage = () => {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [brandingId, setBrandingId] = useState<string>("");

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const { data, error } = await supabase
        .from('site_branding')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setBrandingId(data.id);
        setLogoUrl(data.logo_url || "");
      }
    } catch (error: any) {
      console.error('Error fetching branding:', error);
      toast.error('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('site_branding')
        .update({ logo_url: publicUrl })
        .eq('id', brandingId);

      if (updateError) throw updateError;

      setLogoUrl(publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Site Branding</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
            <CardDescription>
              Upload your company logo to display in the navigation bar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {logoUrl && (
              <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-muted gap-3">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-background border-2 border-primary/20 flex items-center justify-center">
                  <img 
                    src={logoUrl} 
                    alt="Amaselwa Holdings Logo" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-lg font-bold text-primary">Amaselwa Holdings</p>
              </div>
            )}

            <div>
              <Label htmlFor="logo-upload">Upload Logo</Label>
              <div className="mt-2">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Recommended: PNG or SVG format, transparent background
              </p>
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4 animate-pulse" />
                Uploading...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBrandingPage;
