import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  // Google Maps URL with exact coordinates for Amaselwa Holdings
  const googleMapsUrl = "https://www.google.com/maps?q=-30.160421,30.810042";

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-bold">Amaselwa</span>
                <span className="text-sm opacity-80 block leading-none">Holdings</span>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Promoting sustainable agriculture and community empowerment through agroecology practices in KwaZulu-Natal, South Africa.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                About Us
              </Link>
              <Link to="/shop" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                Products
              </Link>
              <Link to="/tours" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                Eco-Tours
              </Link>
              <Link to="/contact" className="block text-sm opacity-80 hover:opacity-100 transition-opacity">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Our Services</h3>
            <div className="space-y-2">
              <p className="text-sm opacity-80">Indigenous Fruits & Herbs</p>
              <p className="text-sm opacity-80">Traditional Grains</p>
              <p className="text-sm opacity-80">Herbal Remedies</p>
              <p className="text-sm opacity-80">Farm Tours</p>
              <p className="text-sm opacity-80">Educational Workshops</p>
              <p className="text-sm opacity-80">Cultural Experiences</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 opacity-80" />
                <a 
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity hover:underline cursor-pointer"
                >
                  Danganya, Luthuli, 4105
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 opacity-80" />
                <a 
                  href="tel:+27797948067"
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity hover:underline"
                >
                  +27 (0)79 794 8067
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 opacity-80" />
                <a 
                  href="mailto:hello@amaselwa.co.za"
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity hover:underline"
                >
                  hello@amaselwa.co.za
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-sm opacity-80">
            © 2024 Amaselwa Holdings Pty Ltd. All rights reserved. | Sustainable Agriculture | Community Empowerment
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;