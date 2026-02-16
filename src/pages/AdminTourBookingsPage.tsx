import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  booking_number: string;
  tour_name: string;
  tour_date: string;
  number_of_people: number;
  amount: number;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

const AdminTourBookingsPage = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tour_bookings')
      .select(`
        id,
        booking_number,
        tour_name,
        tour_date,
        number_of_people,
        amount,
        status,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tour bookings",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const bookingsWithProfiles = await Promise.all(
      (data || []).map(async (booking) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', booking.user_id)
          .single();
        
        return {
          ...booking,
          profiles: profile || { first_name: 'Unknown', last_name: 'User' }
        };
      })
    );

    setBookings(bookingsWithProfiles);
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('tour_bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Booking ${newStatus} successfully`,
      });
      fetchBookings();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock },
      approved: { variant: "default" as const, icon: CheckCircle },
      rejected: { variant: "destructive" as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Tour Bookings Management</h1>
        <p className="text-muted-foreground">Approve or reject tour booking requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tour Bookings</CardTitle>
          <CardDescription>Manage all tour booking requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{booking.booking_number}</div>
                  <div className="text-sm text-muted-foreground">
                    {booking.profiles.first_name} {booking.profiles.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {booking.tour_name} • {booking.number_of_people} people
                  </div>
                  <div className="text-sm text-muted-foreground">
                    R{Number(booking.amount).toFixed(2)} • {new Date(booking.tour_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(booking.status)}
                  {booking.status === 'pending' && (
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateBookingStatus(booking.id, 'approved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateBookingStatus(booking.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tour bookings found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTourBookingsPage;
