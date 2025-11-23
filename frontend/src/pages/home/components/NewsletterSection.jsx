import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-r from-primary to-accent">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Icon name="Bell" size={32} color="white" />
          </div>
        </div>

        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Stay Updated on Community Issues
        </h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Get weekly updates about issues in your area, community events, and how your reported problems are being resolved.
        </p>

        {!isSubscribed ? (
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:border-white/40 backdrop-blur-sm"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-white/90 civic-transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            <p className="text-xs text-white/70 mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        ) : (
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-center space-x-2 text-white mb-2">
              <Icon name="CheckCircle" size={24} className="text-success" />
              <span className="font-semibold text-lg">Successfully Subscribed!</span>
            </div>
            <p className="text-white/90 text-sm">
              Check your inbox for a confirmation email. Welcome to the community!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Icon name="Mail" size={24} color="white" />
            </div>
            <h4 className="text-white font-semibold mb-1">Weekly Digest</h4>
            <p className="text-white/80 text-sm">Get curated updates every week</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Icon name="MapPin" size={24} color="white" />
            </div>
            <h4 className="text-white font-semibold mb-1">Local Updates</h4>
            <p className="text-white/80 text-sm">Issues specific to your area</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Icon name="TrendingUp" size={24} color="white" />
            </div>
            <h4 className="text-white font-semibold mb-1">Impact Reports</h4>
            <p className="text-white/80 text-sm">See the change you're creating</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
