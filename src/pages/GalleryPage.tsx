import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Grid3X3, List, Filter, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
  created_at: string;
}

const GalleryPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setImages(data);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags from images
  const allTags = Array.from(new Set(images.flatMap(img => img.tags || []))).sort();

  const filteredImages = images.filter(image => {
    const matchesSearch = 
      image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => image.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
  };

  const openImageModal = (image: GalleryImage) => {
    const index = filteredImages.findIndex(img => img.id === image.id);
    setCurrentImageIndex(index);
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const navigateImages = (direction: 'prev' | 'next') => {
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentImageIndex + 1) % filteredImages.length;
    } else {
      newIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    }
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      if (e.key === 'ArrowLeft') {
        navigateImages('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImages('next');
      } else if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, currentImageIndex, filteredImages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading gallery...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Our Gallery
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore photos from our farm, community events, sustainable practices, and cultural heritage
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search images by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedTags.length > 0) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2 h-9"
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Filter by Tags:</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer px-2 py-1 text-xs hover:bg-primary/80 transition-colors"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredImages.length} of {images.length} images
          </p>
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
                  {tag}
                  <X 
                    className="h-2 w-2 cursor-pointer" 
                    onClick={() => toggleTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Gallery Images - Smaller Size */}
        {filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No images found</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {searchTerm || selectedTags.length > 0 
                  ? "Try adjusting your search or filters" 
                  : "No gallery images available yet"
                }
              </p>
              {(searchTerm || selectedTags.length > 0) && (
                <Button onClick={clearFilters} size="sm">
                  Clear all filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
              : "space-y-3"
          }>
            {filteredImages.map((image) => (
              <Card 
                key={image.id} 
                className={
                  viewMode === "list" 
                    ? "flex gap-3 overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group p-2"
                    : "overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer group"
                }
                onClick={() => openImageModal(image)}
              >
                <div className={
                  viewMode === "list" 
                    ? "w-20 h-20 flex-shrink-0 relative overflow-hidden rounded"
                    : "aspect-square relative overflow-hidden"
                }>
                  <img 
                    src={image.image_url} 
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ZoomIn className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                {viewMode === "list" && (
                  <CardContent className="flex-1 p-0 flex flex-col justify-center">
                    {image.title && (
                      <h3 className="font-medium text-primary text-sm mb-1 line-clamp-1">
                        {image.title}
                      </h3>
                    )}
                    {image.description && (
                      <p className="text-muted-foreground text-xs line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal - Only Image, No Details */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-none w-auto">
          {selectedImage && (
            <div className="relative">
              {/* Navigation Buttons */}
              <div className="absolute inset-y-0 left-0 flex items-center z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateImages('prev')}
                  className="h-12 w-12 bg-black/30 hover:bg-black/50 text-white ml-4 rounded-full"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>

              <div className="absolute inset-y-0 right-0 flex items-center z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateImages('next')}
                  className="h-12 w-12 bg-black/30 hover:bg-black/50 text-white mr-4 rounded-full"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 w-8 bg-black/30 hover:bg-black/50 text-white rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Image Counter */}
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-black/30 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {filteredImages.length}
                </div>
              </div>

              {/* Main Image - Container matches image size */}
              <div className="relative">
                <img 
                  src={selectedImage.image_url} 
                  alt={selectedImage.title || 'Gallery image'}
                  className="max-w-[90vw] max-h-[90vh] object-contain"
                  style={{
                    width: 'auto',
                    height: 'auto'
                  }}
                />
              </div>

              {/* Thumbnail Navigation */}
              {filteredImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="flex gap-2 overflow-x-auto max-w-[80vw] px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full">
                    {filteredImages.map((image, index) => (
                      <div
                        key={image.id}
                        className={`flex-shrink-0 w-8 h-8 rounded cursor-pointer overflow-hidden transition-all border ${
                          index === currentImageIndex 
                            ? 'border-white ring-2 ring-white/50' 
                            : 'border-white/30 hover:border-white/70'
                        }`}
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setSelectedImage(image);
                        }}
                      >
                        <img 
                          src={image.image_url} 
                          alt={image.title || 'Gallery image'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryPage;