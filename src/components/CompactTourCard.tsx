import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Star, Camera, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  duration?: string;
  max_participants: number;
  location?: string;
  rating?: number;
  created_at?: string;
}

interface TourDate {
  id: string;
  available_date: string;
  max_bookings: number;
  current_bookings: number;
  is_available: boolean;
  tour_id: string;
}

interface CompactTourCardProps {
  tour: Tour;
  onBook?: (tour: Tour) => void;
}

export function CompactTourCard({ tour, onBook }: CompactTourCardProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [availableDates, setAvailableDates] = useState<TourDate[]>([]);
  const [bookingDetails, setBookingDetails] = useState({
    numberOfPeople: 1,
    tourDate: "",
    isSubmitting: false
  });
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculate available spots for selected date
  const selectedDate = availableDates.find(date => date.available_date === bookingDetails.tourDate);
  const remainingSpots = selectedDate ? selectedDate.max_bookings - selectedDate.current_bookings : 0;
  const maxAllowedParticipants = Math.min(tour.max_participants, remainingSpots);
  const isOverCapacity = bookingDetails.numberOfPeople > maxAllowedParticipants;
  const isDateSelected = !!bookingDetails.tourDate;
  const canBook = isDateSelected && !isOverCapacity && bookingDetails.numberOfPeople > 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(price);
  };

  const renderStars = (rating: number = 5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const fetchAvailableDates = async () => {
    try {
      const { data, error } = await supabase
        .from('tour_dates')
        .select('*')
        .eq('tour_id', tour.id)
        .eq('is_available', true)
        .gte('available_date', new Date().toISOString().split('T')[0])
        .order('available_date', { ascending: true });

      if (error) throw error;

      // Filter dates that still have capacity
      const availableDatesWithCapacity = (data || []).filter(date => 
        date.current_bookings < date.max_bookings
      );
      
      setAvailableDates(availableDatesWithCapacity);
    } catch (error) {
      console.error('Error fetching available dates:', error);
      setAvailableDates([]);
    }
  };

  const handleOpenBooking = () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to book a tour.",
        variant: "destructive",
      });
      return;
    }
    
    if (onBook) {
      onBook(tour);
    } else {
      setShowBookingForm(true);
      fetchAvailableDates();
      setBookingDetails({
        numberOfPeople: 1,
        tourDate: "",
        isSubmitting: false
      });
    }
  };

  const handleBookTour = async () => {
    if (!user || !canBook) return;

    setBookingDetails(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Double-check capacity before booking (fresh data from database)
      const { data: freshDateData, error: dateError } = await supabase
        .from('tour_dates')
        .select('*')
        .eq('tour_id', tour.id)
        .eq('available_date', bookingDetails.tourDate)
        .eq('is_available', true)
        .single();

      if (dateError || !freshDateData) {
        toast({
          title: "Date Not Available",
          description: "The selected date is no longer available.",
          variant: "destructive",
        });
        return;
      }

      // Final capacity check with fresh data
      if (freshDateData.current_bookings + bookingDetails.numberOfPeople > freshDateData.max_bookings) {
        const remainingSpots = freshDateData.max_bookings - freshDateData.current_bookings;
        toast({
          title: "Not Enough Spots",
          description: `Only ${remainingSpots} spot${remainingSpots !== 1 ? 's' : ''} remaining on this date. Please select fewer participants.`,
          variant: "destructive",
        });
        return;
      }

      // Check overall tour capacity with fresh data
      const { data: allTourDates, error: allDatesError } = await supabase
        .from('tour_dates')
        .select('current_bookings')
        .eq('tour_id', tour.id);

      if (allDatesError) throw allDatesError;

      const totalParticipants = allTourDates?.reduce((sum, date) => sum + date.current_bookings, 0) || 0;
      
      if (totalParticipants + bookingDetails.numberOfPeople > tour.max_participants) {
        toast({
          title: "Tour Fully Booked",
          description: "This tour has reached its maximum capacity across all dates.",
          variant: "destructive",
        });
        return;
      }

      const totalAmount = tour.price * bookingDetails.numberOfPeople;
      const bookingNumber = `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Create booking data according to your actual schema
      const bookingData = {
        user_id: user.id,
        booking_number: bookingNumber,
        tour_name: tour.name,
        tour_date: bookingDetails.tourDate,
        number_of_people: bookingDetails.numberOfPeople,
        amount: totalAmount,
        status: 'pending'
      };

      console.log('Creating booking with:', bookingData);

      // Create the booking
      const { data: bookingResult, error: bookingError } = await supabase
        .from('tour_bookings')
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) {
        console.error('Booking error details:', bookingError);
        throw new Error(`Booking failed: ${bookingError.message}`);
      }

      console.log('Booking created successfully:', bookingResult);

      // Update the current bookings count for this date
      const { error: updateError } = await supabase
        .from('tour_dates')
        .update({ 
          current_bookings: freshDateData.current_bookings + bookingDetails.numberOfPeople 
        })
        .eq('id', freshDateData.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error(`Failed to update date capacity: ${updateError.message}`);
      }

      console.log('Date capacity updated successfully');

      toast({
        title: "Booking Submitted!",
        description: `Your booking for ${bookingDetails.numberOfPeople} participant${bookingDetails.numberOfPeople !== 1 ? 's' : ''} has been submitted for approval.`,
      });

      // Reset form
      setShowBookingForm(false);
      setBookingDetails({
        numberOfPeople: 1,
        tourDate: "",
        isSubmitting: false
      });

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingDetails(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const getRemainingSpots = (date: TourDate) => {
    return date.max_bookings - date.current_bookings;
  };

  const isLowCapacity = (remainingSpots: number) => {
    return remainingSpots <= 3;
  };

  const handleParticipantsChange = (value: string) => {
    const participants = parseInt(value || '1');
    const maxAllowed = selectedDate ? Math.min(tour.max_participants, getRemainingSpots(selectedDate)) : tour.max_participants;
    const safeParticipants = Math.min(Math.max(1, participants), maxAllowed);
    
    setBookingDetails(prev => ({ 
      ...prev, 
      numberOfPeople: safeParticipants
    }));
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="relative">
          {tour.image_url ? (
            <div className="h-32 overflow-hidden rounded-t-lg">
              <img
                src={tour.image_url}
                alt={tour.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="h-32 bg-muted flex items-center justify-center rounded-t-lg">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          {/* Duration badge */}
          {tour.duration && (
            <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
              {tour.duration}
            </Badge>
          )}
          
          {/* Location badge */}
          {tour.location && (
            <Badge variant="outline" className="absolute top-2 left-2 text-xs bg-background/80">
              <MapPin className="h-3 w-3 mr-1" />
              {tour.location}
            </Badge>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {tour.name}
            </CardTitle>
            <div className="text-right ml-2">
              <div className="text-lg font-bold text-primary">
                {formatPrice(tour.price)}
              </div>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            {renderStars(tour.rating)}
            <span className="text-xs text-muted-foreground ml-1">
              ({tour.rating || 5})
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <CardDescription className="text-xs line-clamp-2 mb-3">
            {tour.description}
          </CardDescription>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Max {tour.max_participants} people
              </span>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full text-xs"
            onClick={handleOpenBooking}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Book Tour
          </Button>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book {tour.name}</DialogTitle>
            <DialogDescription>
              Select an available date and confirm your booking
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
                  ...prev, 
                  tourDate: value,
                  numberOfPeople: 1 // Reset to 1 when date changes
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
                    availableDates.map((date) => {
                      const remainingSpots = getRemainingSpots(date);
                      const lowCapacity = isLowCapacity(remainingSpots);
                      return (
                        <SelectItem key={date.id} value={date.available_date}>
                          {format(new Date(date.available_date), 'PPP')} 
                          {` (${remainingSpots} spot${remainingSpots !== 1 ? 's' : ''} left${lowCapacity ? ' - Hurry!' : ''})`}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="people" className="text-right">
                People
              </Label>
              <div className="col-span-3 space-y-2">
                <Input
                  id="people"
                  type="number"
                  min="1"
                  max={maxAllowedParticipants}
                  className="w-full"
                  value={bookingDetails.numberOfPeople}
                  onChange={(e) => handleParticipantsChange(e.target.value)}
                />
                <div className="flex items-center gap-2 text-xs">
                  {isDateSelected && (
                    <>
                      <span className="text-muted-foreground">
                        Maximum: {maxAllowedParticipants} people
                      </span>
                      {isOverCapacity && (
                        <span className="text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Exceeds available spots
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Price per person</Label>
              <div className="col-span-3 text-sm text-muted-foreground">
                {formatPrice(tour.price)}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Total</Label>
              <div className="col-span-3 text-lg font-bold text-primary">
                {formatPrice(tour.price * bookingDetails.numberOfPeople)}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleBookTour}
              disabled={!canBook || bookingDetails.isSubmitting}
            >
              {bookingDetails.isSubmitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}