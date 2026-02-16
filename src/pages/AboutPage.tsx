import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  Users, 
  Award, 
  Heart,
  Globe,
  Target,
  Eye,
  CheckCircle,
  Sprout,
  Recycle,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  const values = [
    {
      icon: Leaf,
      title: "Sustainability",
      description: "We practice regenerative agriculture that restores and enhances ecosystem health"
    },
    {
      icon: Users,
      title: "Community",
      description: "Empowering local communities through education, employment, and knowledge sharing"
    },
    {
      icon: Heart,
      title: "Indigenous Knowledge",
      description: "Preserving and promoting traditional South African agricultural wisdom"
    },
    {
      icon: Globe,
      title: "Environmental Stewardship",
      description: "Protecting biodiversity and natural resources for future generations"
    }
  ];

  const achievements = [
    {
      icon: Sprout,
      title: "50+ Indigenous Varieties",
      description: "Cultivating and preserving native plant species"
    },
    {
      icon: Users,
      title: "200+ Community Members",
      description: "Directly benefiting from our programs"
    },
    {
      icon: Recycle,
      title: "Zero Waste Operations",
      description: "Completely circular agricultural practices"
    },
    {
      icon: BookOpen,
      title: "1000+ Students Educated",
      description: "Through our workshops and tours"
    }
  ];

  const certifications = [
    "Organic Farming Certification",
    "Fair Trade Principles",
    "Biodiversity Conservation",
    "Community Development",
    "Traditional Knowledge Preservation"
  ];

  const timeline = [
    {
      year: "2019",
      title: "Foundation",
      description: "Amaselwa Holdings was established with a vision to promote sustainable agriculture in KwaZulu-Natal"
    },
    {
      year: "2020",
      title: "Community Partnership",
      description: "Formed partnerships with local communities to integrate traditional farming knowledge"
    },
    {
      year: "2021",
      title: "Organic Certification",
      description: "Achieved organic certification and launched our first product line"
    },
    {
      year: "2022",
      title: "Eco-Tourism Launch",
      description: "Started offering educational tours and workshops to share our knowledge"
    },
    {
      year: "2023",
      title: "Expansion",
      description: "Expanded to 50+ indigenous varieties and launched online marketplace"
    },
    {
      year: "2024",
      title: "Recognition",
      description: "Received provincial recognition for community development and sustainability"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-earth py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Award className="h-3 w-3 mr-1" />
            Established 2019
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Growing Community Through
            <br />
            <span className="text-accent">Agroecology</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Amaselwa Holdings is more than a farm—we're a movement dedicated to sustainable agriculture, 
            community empowerment, and the preservation of indigenous knowledge in South Africa.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-8">Our Mission & Vision</h2>
              
              <Card className="mb-6 border-l-4 border-l-accent">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-accent" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    To promote sustainable agriculture through agroecological practices while empowering 
                    local communities, preserving indigenous knowledge, and creating economic opportunities 
                    that benefit both people and the environment.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-secondary" />
                    Our Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    To be a leading example of regenerative agriculture in South Africa, demonstrating 
                    how traditional knowledge and modern sustainable practices can create thriving 
                    communities and restore ecological balance.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-primary">Our Core Values</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {values.map((value, index) => (
                  <Card key={index} className="text-center hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                        <value.icon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-primary mb-2">{value.title}</h4>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Journey</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From humble beginnings to becoming a recognized leader in sustainable agriculture
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-primary rounded-full"></div>
            
            <div className="space-y-12">
              {timeline.map((event, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="px-3 py-1">{event.year}</Badge>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{event.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="relative lg:w-2/12 flex justify-center">
                    <div className="w-4 h-4 bg-accent rounded-full border-4 border-background shadow-lg"></div>
                  </div>
                  
                  <div className="w-full lg:w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Impact</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Measurable results from our commitment to sustainable agriculture and community development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-nature rounded-full flex items-center justify-center mx-auto mb-4">
                    <achievement.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-accent mb-2">{achievement.title}</h3>
                  <p className="text-muted-foreground">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-gradient-earth">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">Certifications & Standards</h2>
          <p className="text-lg text-muted-foreground mb-12">
            We maintain the highest standards in sustainable agriculture and community development
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="font-medium text-primary">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Be part of the sustainable agriculture movement. Whether through purchasing our products, 
            joining our tours, or supporting our community initiatives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/shop">Shop Products</Link>
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary">
              <Link to="/tours">Book Experience</Link>
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary">
              <Link to="/contact">Get Involved</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;