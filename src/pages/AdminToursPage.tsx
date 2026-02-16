import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, MapPin, Clock, Users, Grid, List } from "lucide-react";

interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  duration?: string;
  max_participants: number;
  location?: string;
  is_active: boolean;
}

const AdminToursPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    max_participants: '',
    location: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchTours();
    setupRealtimeSubscriptions();
  }, []);

  const fetchTours = async () => {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTours(data || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast({
        title: "Error",
        description: "Failed to load tours.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('admin-tours-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tours'
        },
        () => {
          fetchTours();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const uploadImage = async (file: File, tourId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${tourId}.${fileExt}`;
    const filePath = `tours/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('tours')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('tours')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tourData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: formData.duration,
        max_participants: parseInt(formData.max_participants),
        location: formData.location,
      };

      let result;
      if (editingTour) {
        result = await supabase
          .from('tours')
          .update(tourData)
          .eq('id', editingTour.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('tours')
          .insert(tourData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Upload image if provided
      if (imageFile && result.data) {
        const imageUrl = await uploadImage(imageFile, result.data.id);
        await supabase
          .from('tours')
          .update({ image_url: imageUrl })
          .eq('id', result.data.id);
      }

      toast({
        title: "Success",
        description: `Tour ${editingTour ? 'updated' : 'created'} successfully.`,
      });

      setDialogOpen(false);
      resetForm();
      fetchTours();
    } catch (error) {
      console.error('Error saving tour:', error);
      toast({
        title: "Error",
        description: "Failed to save tour.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tourId: string) => {
    try {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', tourId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tour deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting tour:', error);
      toast({
        title: "Error",
        description: "Failed to delete tour.",
        variant: "destructive",
      });
    }
  };

  const toggleTourStatus = async (tourId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ is_active: !currentStatus })
        .eq('id', tourId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Tour ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating tour status:', error);
      toast({
        title: "Error",
        description: "Failed to update tour status.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      max_participants: '',
      location: '',
    });
    setImageFile(null);
    setEditingTour(null);
  };

  const openEditDialog = (tour: Tour) => {
    setEditingTour(tour);
    setFormData({
      name: tour.name,
      description: tour.description || '',
      price: tour.price.toString(),
      duration: tour.duration || '',
      max_participants: tour.max_participants.toString(),
      location: tour.location || '',
    });
    setDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Tours</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage your tour offerings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode==='grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode==='list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tour
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTour ? 'Edit Tour' : 'Add New Tour'}
              </DialogTitle>
              <DialogDescription>
                {editingTour 
                  ? 'Update the tour information below.'
                  : 'Fill in the details to create a new tour.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Tour Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (R)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 3 hours"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="participants">Max Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Main Farm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image">Tour Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingTour ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      ) : (
        <div className={viewMode==='grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
          {tours.map((tour) => (
            <Card key={tour.id} className={viewMode==='grid' ? "relative" : "relative p-3"}>
              {tour.image_url && (
                <div className={viewMode==='grid' ? "aspect-square overflow-hidden rounded-t-lg" : "hidden md:block w-40 h-28 overflow-hidden rounded"}>
                  <img
                    src={tour.image_url}
                    alt={tour.name}
                    className={viewMode==='grid' ? "w-full h-full object-cover" : "w-full h-full object-cover"}
                  />
                </div>
              )}
              <CardHeader className={viewMode==='grid' ? undefined : "py-0"}>
                <div className={viewMode==='grid' ? "flex justify-between items-start" : "flex justify-between items-start"}>
                  <CardTitle className="text-lg">{tour.name}</CardTitle>
                  <Badge variant={tour.is_active ? "default" : "secondary"}>
                    {tour.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription className={viewMode==='grid' ? undefined : "line-clamp-2"}>{tour.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={viewMode==='grid' ? "space-y-2" : "space-y-2 md:ml-44"}>
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">R{tour.price}</span>
                    <span className="text-sm text-muted-foreground">per person</span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {tour.duration && (
                      <div className="flex items-center">
                        <Clock className="mr-2 h-3 w-3" />
                        {tour.duration}
                      </div>
                    )}
                    {tour.location && (
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-3 w-3" />
                        {tour.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Users className="mr-2 h-3 w-3" />
                      Max {tour.max_participants} participants
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(tour)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTourStatus(tour.id, tour.is_active)}
                    >
                      {tour.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Tour</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{tour.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(tour.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tours.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No tours found.</p>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Tour
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminToursPage;