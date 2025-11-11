import React from 'react';
import Icon from '../../../components/AppIcon';

const HowItWorksSection = () => {
  const steps = [
    {
      id: 1,
      icon: "Camera",
      title: "Report Issues",
      description: "Capture photos and describe civic problems in your community with precise location data.",
      color: "bg-primary"
    },
    {
      id: 2,
      icon: "Users",
      title: "Community Engagement",
      description: "Vote, comment, and collaborate with neighbors to prioritize and discuss local issues.",
      color: "bg-accent"
    },
    {
      id: 3,
      icon: "CheckCircle",
      title: "Track Progress",
      description: "Monitor government responses and resolution progress with real-time status updates.",
      color: "bg-success"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            How E-speak Works
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Three simple steps to make your voice heard and drive positive change in your community
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps?.map((step, index) => (
            <div key={step?.id} className="relative">
              {/* Step Card */}
              <div className="civic-card p-8 text-center civic-card-hover">
                <div className={`w-16 h-16 ${step?.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <Icon name={step?.icon} size={28} color="white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{step?.title}</h3>
                <p className="text-text-secondary leading-relaxed">{step?.description}</p>
              </div>

              {/* Connection Arrow (Desktop) */}
              {index < steps?.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="ArrowRight" size={16} color="var(--color-primary)" />
                  </div>
                </div>
              )}

              {/* Connection Arrow (Mobile) */}
              {index < steps?.length - 1 && (
                <div className="md:hidden flex justify-center mt-6 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="ArrowDown" size={16} color="var(--color-primary)" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;