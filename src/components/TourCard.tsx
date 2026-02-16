import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
}

interface TourCardProps {
  tour: Tour;
}

export function TourCard({ tour }: TourCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleBookTour = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to book tours.",
        variant: "destructive",
      });
      return;
    }

    // For now, just show a success message
    // In a real app, you'd navigate to booking form
    toast({
      title: "Booking initiated",
      description: `Booking process started for ${tour.name}.`,
    });
  };

  return (
    <Card className="h-full flex flex-col">
      {tour.image_url && (
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={tour.image_url}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="flex-1">
        <CardTitle className="text-lg">{tour.name}</CardTitle>
        <CardDescription>{tour.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {tour.duration && (
            <div className="flex items-center text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              {tour.duration}
            </div>
          )}
          {tour.location && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              {tour.location}
            </div>
          )}
          <div className="flex items-center text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            Max {tour.max_participants} participants
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-bold text-primary">
            R{tour.price}
          </span>
          <span className="text-muted-foreground"> per person</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleBookTour} className="w-full">
          <Calendar className="mr-2 h-4 w-4" />
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
}