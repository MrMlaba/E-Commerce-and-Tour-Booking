import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Clock, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Tour {
  id: string;
  name: string;
  price: number;
  description: string | null;
  location: string | null;
  duration: string | null;
  max_participants: number | null;
  image_url: string | null;
}

interface TourDate {
  id: string;
  available_date: string;
  max_bookings: number;
  current_bookings: number;
  is_available: boolean;
}

export const DashboardTours = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [availableDates, setAvailableDates] = useState<TourDate[]>([]);
  const [bookingDetails, setBookingDetails] = useState({
    numberOfPeople: 1,
    tourDate: "",
    isSubmitting: false
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const { data, error } = await supabase
        .from('tours' as any)
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setTours(data as unknown as Tour[]);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDates = async (tourId: string) => {
    try {
      const { data, error } = await supabase
        .from('tour_dates' as any)
        .select('*')
        .eq('tour_id', tourId)
        .eq('is_available', true)
        .gte('available_date', new Date().toISOString().split('T')[0])
        .order('available_date', { ascending: true });

      if (error) throw error;

      setAvailableDates((data as any) || []);
    } catch (error) {
      console.error('Error fetching available dates:', error);
      setAvailableDates([]);
    }
  };

  const handleTourSelect = (tour: Tour) => {
    setSelectedTour(tour);
    fetchAvailableDates(tour.id);
    setBookingDetails({
      numberOfPeople: 1,
      tourDate: "",
      isSubmitting: false
    });
  };

  const handleBookTour = async () => {
    if (!selectedTour || !user) return;

    setBookingDetails(prev => ({ ...prev, isSubmitting: true }));

    try {
      const totalAmount = selectedTour.price * bookingDetails.numberOfPeople;
      
      const { error } = await supabase
        .from('tour_bookings')
        .insert({
          user_id: user.id,
          tour_name: selectedTour.name,
          tour_date: bookingDetails.tourDate,
          number_of_people: bookingDetails.numberOfPeople,
          amount: totalAmount,
          status: 'pending',
          booking_number: `BOOK-${Date.now()}`
        });

      if (error) throw error;

      toast({
        title: "Booking Successful!",
        description: `Your booking for ${selectedTour.name} has been submitted. You'll receive confirmation soon.`,
      });

      // Reset form
      setSelectedTour(null);
      setBookingDetails({
        numberOfPeople: 1,
        tourDate: "",
        isSubmitting: false
      });

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingDetails(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground text-center">Loading tours...</p>
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Amaselwa Tours & Workshops
            </h2>
            <p className="text-muted-foreground">Experience sustainable farming and cultural heritage</p>
          </div>
        </div>
        <p className="text-muted-foreground text-center py-8">No tours available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Amaselwa Tours & Workshops
          </h2>
          <p className="text-muted-foreground">Experience sustainable farming and cultural heritage</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tours.map((tour) => (
          <Card key={tour.id} className="group overflow-hidden border hover:shadow-lg transition-all duration-300">
            <div className="relative overflow-hidden">
              <img
                src={tour.image_url || '/placeholder.svg'}
                alt={tour.name}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <Badge className="bg-accent text-white">
                  R{tour.price}/person
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-3">
              <h3 className="font-semibold text-base text-primary mb-2 line-clamp-1">{tour.name}</h3>
              
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {tour.description || 'Join us for an amazing experience'}
              </p>

              <div className="flex justify-between gap-2 mb-3 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{tour.duration || 'Contact us'}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>Max {tour.max_participants || 10}</span>
                </div>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm"
                    className="w-full"
                    onClick={() => handleTourSelect(tour)}
                  >
                    Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Book {selectedTour?.name}</DialogTitle>
                    <DialogDescription>
                      Fill in your booking details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <Select
                        value={bookingDetails.tourDate}
                        onValueChange={(value) => setBookingDetails(prev => ({ 
                          ...prev, tourDate: value 
                        }))}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a date" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDates.length === 0 ? (
                            <SelectItem value="no-dates" disabled>
                              No dates available
                            </SelectItem>
                          ) : (
                            availableDates
                              .filter(date => date.current_bookings < date.max_bookings)
                              .map((date) => (
                                <SelectItem key={date.id} value={date.available_date}>
                                  {format(new Date(date.available_date), 'PPP')} 
                                  ({date.max_bookings - date.current_bookings} spots left)
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="people" className="text-right">
                        People
                      </Label>
                      <Input
                        id="people"
                        type="number"
                        min="1"
                        max={selectedTour?.max_participants || 10}
                        className="col-span-3"
                        value={bookingDetails.numberOfPeople}
                        onChange={(e) => setBookingDetails(prev => ({ 
                          ...prev, numberOfPeople: parseInt(e.target.value) || 1 
                        }))}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Total</Label>
                      <div className="col-span-3 text-lg font-bold text-primary">
                        R{selectedTour ? selectedTour.price * bookingDetails.numberOfPeople : 0}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      onClick={handleBookTour}
                      disabled={!bookingDetails.tourDate || bookingDetails.isSubmitting}
                    >
                      {bookingDetails.isSubmitting ? "Booking..." : "Confirm Booking"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};