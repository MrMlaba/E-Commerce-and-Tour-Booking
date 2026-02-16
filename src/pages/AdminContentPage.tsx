import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Upload, X, ImageIcon, Plus, Trash2 } from "lucide-react";
import { Navigate } from "react-router-dom";

interface ContentItem {
  section_key: string;
  content: string;
  section_group: string;
  display_order: number;
}

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

const AdminContentPage = () => {
  const { userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [newGalleryImage, setNewGalleryImage] = useState<File | null>(null);
  const [newImageTitle, setNewImageTitle] = useState("");
  const [newImageDescription, setNewImageDescription] = useState("");
  const [newImageTags, setNewImageTags] = useState("");
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchContent();
      fetchGalleryImages();
    }
  }, [userRole]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .order('display_order');

      if (error) throw error;

      const contentMap: Record<string, string> = {};
      data?.forEach((item: ContentItem) => {
        contentMap[item.section_key] = item.content;
      });
      
      setContent(contentMap);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setGalleryImages(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch gallery images: " + error.message,
        variant: "destructive",
      });
    }
  };

  const uploadHeroImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `hero-image-${Date.now()}.${fileExt}`;
    const filePath = `hero/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const uploadGalleryImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `gallery-${Date.now()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleUpdate = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setHeroImageFile(file);
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setNewGalleryImage(file);
  };

  const addGalleryImage = async () => {
    if (!newGalleryImage) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    setUploadingGalleryImage(true);
    try {
      const imageUrl = await uploadGalleryImage(newGalleryImage);
      
      const { error } = await supabase
        .from('gallery_images')
        .insert({
          title: newImageTitle.trim(),
          description: newImageDescription.trim(),
          image_url: imageUrl,
          tags: newImageTags.split(',').map(tag => tag.trim()).filter(tag => tag),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Gallery image added successfully",
      });

      // Reset form
      setNewGalleryImage(null);
      setNewImageTitle("");
      setNewImageDescription("");
      setNewImageTags("");
      
      // Refresh gallery images
      fetchGalleryImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add gallery image: " + error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingGalleryImage(false);
    }
  };

  const deleteGalleryImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Gallery image deleted successfully",
      });

      // Refresh gallery images
      fetchGalleryImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete gallery image: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async (sectionGroup: string) => {
    setSaving(true);
    try {
      let updates = Object.entries(content)
        .filter(([key]) => key.startsWith(sectionGroup))
        .map(([key, value]) => ({
          section_key: key,
          content: value.trim(),
        }));

      // If saving hero section and there's an image file, upload it first
      if (sectionGroup === 'hero' && heroImageFile) {
        setUploading(true);
        try {
          const imageUrl = await uploadHeroImage(heroImageFile);
          updates = updates.map(update => 
            update.section_key === 'hero_image_url' 
              ? { ...update, content: imageUrl }
              : update
          );
        } catch (error: any) {
          toast({
            title: "Error",
            description: "Failed to upload image: " + error.message,
            variant: "destructive",
          });
          return;
        } finally {
          setUploading(false);
        }
      }

      for (const update of updates) {
        const { error } = await supabase
          .from('homepage_content')
          .update({ content: update.content })
          .eq('section_key', update.section_key);

        if (error) throw error;
      }

      // Clear the image file after successful save
      if (sectionGroup === 'hero' && heroImageFile) {
        setHeroImageFile(null);
      }

      toast({
        title: "Success",
        description: "Content updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Manage Homepage Content</h1>
        </div>
        <p className="text-muted-foreground">Edit text content displayed on the landing page</p>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>Main banner content at the top of the homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hero_heading">Heading</Label>
              <Input
                id="hero_heading"
                value={content.hero_heading || ''}
                onChange={(e) => handleUpdate('hero_heading', e.target.value)}
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="hero_description">Description</Label>
              <Textarea
                id="hero_description"
                value={content.hero_description || ''}
                onChange={(e) => handleUpdate('hero_description', e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="hero_location">Location</Label>
              <Input
                id="hero_location"
                value={content.hero_location || ''}
                onChange={(e) => handleUpdate('hero_location', e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="hero_image">Hero Image</Label>
              
              {/* Current Image Preview */}
              {content.hero_image_url && !heroImageFile && (
                <div className="mt-2 mb-4">
                  <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-muted gap-3">
                    <div className="h-48 w-full rounded-lg overflow-hidden bg-background border-2 border-primary/20 flex items-center justify-center">
                      <img 
                        src={content.hero_image_url} 
                        alt="Current Hero Image" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Current hero image</p>
                  </div>
                </div>
              )}

              {/* New Image Preview */}
              {heroImageFile && (
                <div className="mt-2 mb-4">
                  <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-muted gap-3">
                    <div className="h-48 w-full rounded-lg overflow-hidden bg-background border-2 border-primary/20 flex items-center justify-center">
                      <img 
                        src={URL.createObjectURL(heroImageFile)} 
                        alt="New Hero Image Preview" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">New image selected: {heroImageFile.name}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setHeroImageFile(null)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* File Upload Input */}
              <div className="mt-2">
                <Input
                  id="hero_image"
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageUpload}
                  disabled={uploading}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a new image to replace the current hero image (max 5MB, JPG/PNG/WebP)
              </p>
              
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Upload className="h-4 w-4 animate-pulse" />
                  Uploading image...
                </div>
              )}
            </div>
            <Button onClick={() => handleSave('hero')} disabled={saving || uploading}>
              {saving || uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {uploading ? 'Uploading Image...' : 'Save Hero Section'}
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Mission & Values Section */}
        <Card>
          <CardHeader>
            <CardTitle>Mission & Values Section</CardTitle>
            <CardDescription>Information about your mission and core values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mission_heading">Section Heading</Label>
              <Input
                id="mission_heading"
                value={content.mission_heading || ''}
                onChange={(e) => handleUpdate('mission_heading', e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="mission_description">Section Description</Label>
              <Textarea
                id="mission_description"
                value={content.mission_description || ''}
                onChange={(e) => handleUpdate('mission_description', e.target.value)}
                maxLength={500}
                rows={2}
              />
            </div>

            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h4 className="font-semibold">Card 1: Sustainable Agriculture</h4>
              <div>
                <Label htmlFor="mission_card1_title">Title</Label>
                <Input
                  id="mission_card1_title"
                  value={content.mission_card1_title || ''}
                  onChange={(e) => handleUpdate('mission_card1_title', e.target.value)}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="mission_card1_desc">Description</Label>
                <Textarea
                  id="mission_card1_desc"
                  value={content.mission_card1_desc || ''}
                  onChange={(e) => handleUpdate('mission_card1_desc', e.target.value)}
                  maxLength={300}
                  rows={2}
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h4 className="font-semibold">Card 2: Community Empowerment</h4>
              <div>
                <Label htmlFor="mission_card2_title">Title</Label>
                <Input
                  id="mission_card2_title"
                  value={content.mission_card2_title || ''}
                  onChange={(e) => handleUpdate('mission_card2_title', e.target.value)}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="mission_card2_desc">Description</Label>
                <Textarea
                  id="mission_card2_desc"
                  value={content.mission_card2_desc || ''}
                  onChange={(e) => handleUpdate('mission_card2_desc', e.target.value)}
                  maxLength={300}
                  rows={2}
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h4 className="font-semibold">Card 3: Indigenous Knowledge</h4>
              <div>
                <Label htmlFor="mission_card3_title">Title</Label>
                <Input
                  id="mission_card3_title"
                  value={content.mission_card3_title || ''}
                  onChange={(e) => handleUpdate('mission_card3_title', e.target.value)}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="mission_card3_desc">Description</Label>
                <Textarea
                  id="mission_card3_desc"
                  value={content.mission_card3_desc || ''}
                  onChange={(e) => handleUpdate('mission_card3_desc', e.target.value)}
                  maxLength={300}
                  rows={2}
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h4 className="font-semibold">Card 4: Quality Assured</h4>
              <div>
                <Label htmlFor="mission_card4_title">Title</Label>
                <Input
                  id="mission_card4_title"
                  value={content.mission_card4_title || ''}
                  onChange={(e) => handleUpdate('mission_card4_title', e.target.value)}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="mission_card4_desc">Description</Label>
                <Textarea
                  id="mission_card4_desc"
                  value={content.mission_card4_desc || ''}
                  onChange={(e) => handleUpdate('mission_card4_desc', e.target.value)}
                  maxLength={300}
                  rows={2}
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h4 className="font-semibold">Card 5: Local Heritage</h4>
              <div>
                <Label htmlFor="mission_card5_title">Title</Label>
                <Input
                  id="mission_card5_title"
                  value={content.mission_card5_title || ''}
                  onChange={(e) => handleUpdate('mission_card5_title', e.target.value)}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="mission_card5_desc">Description</Label>
                <Textarea
                  id="mission_card5_desc"
                  value={content.mission_card5_desc || ''}
                  onChange={(e) => handleUpdate('mission_card5_desc', e.target.value)}
                  maxLength={300}
                  rows={2}
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h4 className="font-semibold">Card 6: Sustainable Practices</h4>
              <div>
                <Label htmlFor="mission_card6_title">Title</Label>
                <Input
                  id="mission_card6_title"
                  value={content.mission_card6_title || ''}
                  onChange={(e) => handleUpdate('mission_card6_title', e.target.value)}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="mission_card6_desc">Description</Label>
                <Textarea
                  id="mission_card6_desc"
                  value={content.mission_card6_desc || ''}
                  onChange={(e) => handleUpdate('mission_card6_desc', e.target.value)}
                  maxLength={300}
                  rows={2}
                />
              </div>
            </div>

            <Button onClick={() => handleSave('mission')} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Mission Section
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Products Section */}
        <Card>
          <CardHeader>
            <CardTitle>Products Section</CardTitle>
            <CardDescription>Introduction to the products section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="products_heading">Heading</Label>
              <Input
                id="products_heading"
                value={content.products_heading || ''}
                onChange={(e) => handleUpdate('products_heading', e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="products_description">Description</Label>
              <Textarea
                id="products_description"
                value={content.products_description || ''}
                onChange={(e) => handleUpdate('products_description', e.target.value)}
                maxLength={300}
                rows={2}
              />
            </div>
            <Button onClick={() => handleSave('products')} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Products Section
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Tours Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tours Section</CardTitle>
            <CardDescription>Introduction to the eco-tourism experiences section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tours_heading">Heading</Label>
              <Input
                id="tours_heading"
                value={content.tours_heading || ''}
                onChange={(e) => handleUpdate('tours_heading', e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="tours_description">Description</Label>
              <Textarea
                id="tours_description"
                value={content.tours_description || ''}
                onChange={(e) => handleUpdate('tours_description', e.target.value)}
                maxLength={300}
                rows={2}
              />
            </div>
            <Button onClick={() => handleSave('tours')} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Tours Section
            </Button>
          </CardContent>
        </Card>

        <Separator />

        
        {/* NEW Gallery Section */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery Section</CardTitle>
            <CardDescription>Manage gallery images and section content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gallery Section Content */}
            
             
            <div className="space-y-4">
              <h4 className="font-semibold">Add New Gallery Image</h4>
              
              {/* Image Upload */}
              <div>
                <Label htmlFor="gallery_image">Gallery Image</Label>
                
                {/* New Image Preview */}
                {newGalleryImage && (
                  <div className="mt-2 mb-4">
                    <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-muted gap-3">
                      <div className="h-48 w-full rounded-lg overflow-hidden bg-background border-2 border-primary/20 flex items-center justify-center">
                        <img 
                          src={URL.createObjectURL(newGalleryImage)} 
                          alt="New Gallery Image Preview" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">New image selected: {newGalleryImage.name}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewGalleryImage(null)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Upload Input */}
                <div className="mt-2">
                  <Input
                    id="gallery_image"
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryImageUpload}
                    disabled={uploadingGalleryImage}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a new gallery image (max 5MB, JPG/PNG/WebP)
                </p>
              </div>

              {/* Image Details */}
              <div>
                <Label htmlFor="new_image_title">Image Title (Optional)</Label>
                <Input
                  id="new_image_title"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                  maxLength={100}
                  placeholder="Enter a title for this image"
                />
              </div>

              <div>
                <Label htmlFor="new_image_description">Image Description (Optional)</Label>
                <Textarea
                  id="new_image_description"
                  value={newImageDescription}
                  onChange={(e) => setNewImageDescription(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="Enter a description for this image"
                />
              </div>

              <div>
                <Label htmlFor="new_image_tags">Tags (Optional)</Label>
                <Input
                  id="new_image_tags"
                  value={newImageTags}
                  onChange={(e) => setNewImageTags(e.target.value)}
                  maxLength={200}
                  placeholder="Enter tags separated by commas (e.g., farm, community, sustainable)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tags help users find images when searching
                </p>
              </div>

              <Button 
                onClick={addGalleryImage} 
                disabled={!newGalleryImage || uploadingGalleryImage}
                className="w-full"
              >
                {uploadingGalleryImage ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {uploadingGalleryImage ? 'Uploading Image...' : 'Add to Gallery'}
              </Button>
            </div>

            <Separator />

            {/* Existing Gallery Images */}
            <div className="space-y-4">
              <h4 className="font-semibold">Existing Gallery Images ({galleryImages.length})</h4>
              
              {galleryImages.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No gallery images yet. Add your first image above.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
                  {galleryImages.map((image) => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img 
                          src={image.image_url} 
                          alt={image.title || 'Gallery image'}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                          onClick={() => deleteGalleryImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-3">
                        {image.title && (
                          <h5 className="font-semibold text-sm mb-1">{image.title}</h5>
                        )}
                        {image.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {image.description}
                          </p>
                        )}
                        {image.tags && image.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {image.tags.slice(0, 3).map((tag, index) => (
                              <span 
                                key={index}
                                className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {image.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{image.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* CTA Section */}
        <Card>
          <CardHeader>
            <CardTitle>Call-to-Action Section</CardTitle>
            <CardDescription>Final section encouraging users to join</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cta_heading">Heading</Label>
              <Input
                id="cta_heading"
                value={content.cta_heading || ''}
                onChange={(e) => handleUpdate('cta_heading', e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="cta_description">Description</Label>
              <Textarea
                id="cta_description"
                value={content.cta_description || ''}
                onChange={(e) => handleUpdate('cta_description', e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>
            <Button onClick={() => handleSave('cta')} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save CTA Section
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminContentPage;