import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import communityImg from '../../../assets/community.png';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Empowering Voices,
              <span className="text-primary block">Developing Communities</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary mb-8 max-w-2xl">
              Report civic issues, engage with your community, and track government responses in real-time. 
              Your voice matters in building a better tomorrow.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/report-issue">
                <Button 
                  variant="default" 
                  size="lg" 
                  iconName="Plus" 
                  iconPosition="left"
                  className="w-full sm:w-auto"
                >
                  Report an Issue
                </Button>
              </Link>
              <Link to="/map-view">
                <Button 
                  variant="outline" 
                  size="lg" 
                  iconName="Map" 
                  iconPosition="left"
                  className="w-full sm:w-auto"
                >
                  View Map
                </Button>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl p-8 civic-shadow-card">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center overflow-hidden">
                <img 
                  src={communityImg} 
                  alt="Community Voice" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;