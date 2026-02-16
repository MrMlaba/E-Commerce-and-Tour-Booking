import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Tour {
  id: string;
  name: string;
}

interface TourDate {
  id: string;
  tour_id: string;
  available_date: string;
  max_bookings: number;
  current_bookings: number;
  is_available: boolean;
}

const AdminTourDatesPage = () => {
  const { toast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [tourDates, setTourDates] = useState<TourDate[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    maxBookings: "10",
  });

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (selectedTourId) {
      fetchTourDates(selectedTourId);
    }
  }, [selectedTourId]);

  const fetchTours = async () => {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTours(data || []);
      if (data && data.length > 0) {
        setSelectedTourId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  const fetchTourDates = async (tourId: string) => {
    try {
      const { data, error } = await supabase
        .from('tour_dates')
        .select('*')
        .eq('tour_id', tourId)
        .order('available_date');

      if (error) throw error;
      setTourDates(data || []);
    } catch (error) {
      console.error('Error fetching tour dates:', error);
    }
  };

  const handleAddDate = async () => {
    if (!formData.date || !selectedTourId) {
      toast({
        title: "Invalid input",
        description: "Please select a tour and date.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tour_dates')
        .insert({
          tour_id: selectedTourId,
          available_date: formData.date,
          max_bookings: parseInt(formData.maxBookings),
          current_bookings: 0,
          is_available: true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tour date added successfully.",
      });

      setDialogOpen(false);
      setFormData({ date: "", maxBookings: "10" });
      fetchTourDates(selectedTourId);
    } catch (error) {
      console.error('Error adding tour date:', error);
      toast({
        title: "Error",
        description: "Failed to add tour date.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDate = async (dateId: string) => {
    try {
      const { error } = await supabase
        .from('tour_dates')
        .delete()
        .eq('id', dateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tour date deleted successfully.",
      });

      fetchTourDates(selectedTourId);
    } catch (error) {
      console.error('Error deleting tour date:', error);
      toast({
        title: "Error",
        description: "Failed to delete tour date.",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (dateId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tour_dates')
        .update({ is_available: !currentStatus })
        .eq('id', dateId);

      if (error) throw error;

      fetchTourDates(selectedTourId);
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Tour Dates</h1>
          <p className="text-muted-foreground">Set available dates for tours</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Date
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Select Tour</Label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
          >
            {tours.map((tour) => (
              <option key={tour.id} value={tour.id}>
                {tour.name}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Dates</CardTitle>
          </CardHeader>
          <CardContent>
            {tourDates.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No dates available for this tour. Add one to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {tourDates.map((date) => (
                  <div
                    key={date.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {new Date(date.available_date).toLocaleDateString('en-ZA', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {date.current_bookings} / {date.max_bookings} booked
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={date.is_available ? "default" : "secondary"}>
                        {date.is_available ? "Available" : "Unavailable"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAvailability(date.id, date.is_available)}
                      >
                        Toggle
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDate(date.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tour Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="maxBookings">Maximum Bookings</Label>
              <Input
                id="maxBookings"
                type="number"
                min="1"
                value={formData.maxBookings}
                onChange={(e) => setFormData({ ...formData, maxBookings: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDate} disabled={loading}>
              {loading ? "Adding..." : "Add Date"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTourDatesPage;
