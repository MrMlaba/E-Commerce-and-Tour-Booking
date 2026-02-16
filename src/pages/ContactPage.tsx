import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  MessageSquare,
  Send,
  Facebook,
  Instagram,
  Youtube,
  ExternalLink
} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would handle form submission
    alert("Thank you for your message! We'll get back to you within 24 hours.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Farm",
      details: [
        "Amaselwa Holdings Pty Ltd",
        "Umgababa, KwaZulu-Natal",
        "South Africa"
      ],
      action: "Get Directions"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: [
        "+27 (0)31 123 4567",
        "+27 (0)82 987 6543",
        "WhatsApp Available"
      ],
      action: "Call Now"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: [
        "info@amaselwa.co.za",
        "tours@amaselwa.co.za",
        "support@amaselwa.co.za"
      ],
      action: "Send Email"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        "Monday - Friday: 8:00 AM - 5:00 PM",
        "Saturday: 9:00 AM - 3:00 PM",
        "Sunday: By Appointment"
      ],
      action: "Book Visit"
    }
  ];

  const socialMedia = [
    {
      icon: Facebook,
      name: "Facebook",
      handle: "@AmaselwaHoldings",
      url: "#"
    },
    {
      icon: Instagram,
      name: "Instagram",
      handle: "@amaselwa_farm",
      url: "#"
    },
    {
      icon: Youtube,
      name: "YouTube",
      handle: "Amaselwa Holdings",
      url: "#"
    }
  ];

  const departments = [
    { name: "General Inquiries", email: "info@amaselwa.co.za" },
    { name: "Product Orders", email: "orders@amaselwa.co.za" },
    { name: "Tours & Workshops", email: "tours@amaselwa.co.za" },
    { name: "Partnerships", email: "partnerships@amaselwa.co.za" },
    { name: "Media & Press", email: "media@amaselwa.co.za" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-earth py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Get In Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you. Reach out for questions about our products, tours, or partnerships.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">Contact Information</h2>
                <p className="text-muted-foreground mb-6">
                  Choose the best way to reach us. We're here to help with any questions or inquiries.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gradient-primary rounded-lg">
                          <info.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary mb-1">{info.title}</h3>
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Social Media */}
              <div>
                <h3 className="font-semibold text-primary mb-4">Follow Us</h3>
                <div className="space-y-2">
                  {socialMedia.map((social, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                      <social.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="font-medium text-sm">{social.name}</span>
                        <p className="text-xs text-muted-foreground">{social.handle}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Contacts */}
              <div>
                <h3 className="font-semibold text-primary mb-4">Department Contacts</h3>
                <div className="space-y-2">
                  {departments.map((dept, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{dept.name}:</span>
                      <br />
                      <a href={`mailto:${dept.email}`} className="text-accent hover:underline">
                        {dept.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Send Us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+27 (0)XX XXX XXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <select
                        id="subject"
                        className="w-full p-2 border border-input rounded-md"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="products">Product Information</option>
                        <option value="tours">Tours & Workshops</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="support">Technical Support</option>
                        <option value="feedback">Feedback & Suggestions</option>
                        <option value="media">Media & Press</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="submit" variant="hero" className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        subject: "",
                        message: ""
                      })}
                    >
                      Clear Form
                    </Button>
                  </div>
                </form>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">What to Expect</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• We typically respond within 24 hours during business days</li>
                    <li>• For urgent matters, please call us directly</li>
                    <li>• Tour bookings will be confirmed via email with detailed instructions</li>
                    <li>• Product orders will receive tracking information once shipped</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Find Us</CardTitle>
              <CardDescription>
                Located in the heart of Umgababa, KwaZulu-Natal, our farm is easily accessible and welcomes visitors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Interactive Map Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  We're working on integrating an interactive map to help you find us easily.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Address:</strong> Umgababa, KwaZulu-Natal, South Africa</p>
                  <p><strong>GPS Coordinates:</strong> -30.1234, 30.8765 (Approximate)</p>
                </div>
                <Button variant="outline" className="mt-4">
                  Get Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;