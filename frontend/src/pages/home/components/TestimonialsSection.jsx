import React from 'react';
import Icon from '../../../components/AppIcon';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      role: 'Local Resident',
      location: 'Kathmandu',
      avatar: 'RK',
      content: 'E-speak helped me report a dangerous pothole that was fixed within days. The transparency in tracking the issue resolution was impressive!',
      rating: 5,
      date: '2 weeks ago'
    },
    {
      id: 2,
      name: 'Sita Sharma',
      role: 'Community Organizer',
      location: 'Pokhara',
      avatar: 'SS',
      content: 'Finally, a platform that gives voice to citizens! We organized our neighborhood through E-speak and got street lights fixed in our area.',
      rating: 5,
      date: '1 month ago'
    },
    {
      id: 3,
      name: 'Prakash Thapa',
      role: 'Business Owner',
      location: 'Lalitpur',
      avatar: 'PT',
      content: 'As a business owner, I appreciate how E-speak helps maintain our community. I\'ve reported and voted on multiple issues affecting our locality.',
      rating: 5,
      date: '3 weeks ago'
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            What Our Community Says
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Real stories from real people who are making a difference in their communities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-xl border border-border p-6 civic-shadow-card hover:shadow-xl civic-transition"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-text-secondary">{testimonial.role} • {testimonial.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Icon key={i} name="Star" size={16} className="text-warning fill-current" />
                ))}
              </div>

              <p className="text-text-secondary mb-4 leading-relaxed">
                "{testimonial.content}"
              </p>

              <p className="text-xs text-text-secondary">{testimonial.date}</p>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-text-secondary mb-4">Join thousands of active citizens</p>
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 civic-transition">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
