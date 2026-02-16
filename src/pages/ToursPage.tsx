import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TourCard } from "@/components/TourCard";

const ToursPage = () => {
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    participants: 1,
    specialRequests: ""
  });

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      setTours(data || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (tour) => {
    setSelectedTour(tour);
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    // Here you would handle the booking submission
    alert(`Booking request submitted for ${selectedTour.title}! We'll contact you within 24 hours to confirm your booking.`);
    setSelectedTour(null);
    setBookingForm({
      name: "",
      email: "",
      phone: "",
      date: "",
      participants: 1,
      specialRequests: ""
    });
  };

  const handleInputChange = (field, value) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-earth py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Eco-Tourism Experiences
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with nature, learn traditional practices, and experience sustainable agriculture through our guided tours and workshops
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tours Grid */}
        {loading ? (
          <div className="text-center py-12">Loading tours...</div>
        ) : tours.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tours available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToursPage;