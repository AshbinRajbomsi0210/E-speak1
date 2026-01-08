import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const TestimonialsSection = () => {
  const navigate = useNavigate();
  const testimonials = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      role: 'Local Resident',
      location: 'Kathmandu',
      avatar: 'RK',
      content: 'E-speak transformed how our community addresses civic issues. I reported a dangerous pothole through the app, and within 48 hours, local authorities responded. The real-time tracking feature kept me updated every step of the way, and the issue was completely resolved in just 5 days. This platform truly bridges the gap between citizens and government - it\'s accountability in action!',
      rating: 5,
      date: '2 weeks ago'
    },
    {
      id: 2,
      name: 'Sita Sharma',
      role: 'Community Organizer',
      location: 'Pokhara',
      avatar: 'SS',
      content: 'As a community organizer, E-speak has been a game-changer for civic engagement. We used the platform to coordinate with 50+ neighbors about broken street lights in our area. The voting feature helped prioritize the most critical locations, and the AI assistant even suggested the best times to report for faster response. Within three weeks, all 12 street lights were repaired. The transparency dashboard showing government response times has made officials more accountable than ever before.',
      rating: 5,
      date: '1 month ago'
    },
    {
      id: 3,
      name: 'Prakash Thapa',
      role: 'Business Owner',
      location: 'Lalitpur',
      avatar: 'PT',
      content: 'Running a business in Lalitpur, I\'ve seen firsthand how E-speak empowers communities to take charge of local infrastructure. I\'ve used the platform to report 8 different issues - from drainage problems to illegal parking - and witnessed a 75% resolution rate. The AI-powered insights help identify recurring problems in our area, and the community voting ensures the most urgent issues get attention first. This isn\'t just an app; it\'s a movement toward better governance and civic responsibility.',
      rating: 5,
      date: '3 weeks ago'
    }
  ];

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-8 py-3 bg-primary/10 text-primary rounded-full text-2xl font-bold mb-6">
            Testimonials
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            What Our Community Says
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Real stories from real people who are making a difference in their communities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-2xl border border-border p-8 civic-shadow-card hover:shadow-xl civic-transition"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg">{testimonial.name}</h4>
                  <p className="text-sm text-text-secondary">{testimonial.role} • {testimonial.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Icon key={i} name="Star" size={18} className="text-warning fill-current" />
                ))}
              </div>

              <p className="text-text-secondary mb-6 leading-relaxed text-base">
                "{testimonial.content}"
              </p>

              <p className="text-sm text-text-secondary font-medium">{testimonial.date}</p>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <p className="text-text-secondary mb-4 text-lg">Join thousands of active citizens making real change</p>
          <button 
            onClick={() => navigate('/community')}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 civic-transition shadow-md hover:shadow-lg"
          >
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
