import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import ImpactMetricsSection from './components/ImpactMetricsSection';
import RecentReportsSection from './components/RecentReportsSection';
import TestimonialsSection from './components/TestimonialsSection';
import TeamSection from './components/TeamSection';
import CTASection from './components/CTASection';
import NewsletterSection from './components/NewsletterSection';

const Home = () => {
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [showConfirmSend, setShowConfirmSend] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setShowConfirmSend(true);
  };

  const confirmSendMessage = async () => {
    setShowConfirmSend(false);
    setContactSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/contact/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (response.ok) {
        setContactForm({ name: '', email: '', message: '' });
        setShowContactUs(false);
        setShowSuccessModal(true);
      } else {
        alert('❌ Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      alert('❌ Failed to send message. Please check your connection and try again.');
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>E-speak - Empowering Voices, Developing Communities</title>
        <meta name="description" content="Report civic issues, engage with your community, and track government responses in real-time. Your voice matters in building a better tomorrow." />
        <meta name="keywords" content="civic engagement, community issues, government response, local democracy, citizen participation" />
        <meta property="og:title" content="E-speak - Empowering Voices, Developing Communities" />
        <meta property="og:description" content="Report civic issues, engage with your community, and track government responses in real-time." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <HeroSection />
          <HowItWorksSection />
          <ImpactMetricsSection />
          <RecentReportsSection />
          <TestimonialsSection />
          <TeamSection />
          <CTASection />
          <NewsletterSection />
        </main>

        {/* Footer */}
        <footer className="bg-foreground text-white py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                    <span className="text-white font-bold text-sm">E</span>
                  </div>
                  <span className="text-xl font-semibold">E-speak</span>
                </div>
                <p className="text-gray-300 mb-4 max-w-md">
                  Empowering citizens to report issues, engage with communities, and drive positive change through transparent civic participation.
                </p>
                <div className="flex space-x-3">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-lg hover:bg-primary civic-transition">
                    <span className="sr-only">Facebook</span>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-lg hover:bg-primary civic-transition">
                    <span className="sr-only">WhatsApp</span>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-lg hover:bg-primary civic-transition">
                    <span className="sr-only">X (Twitter)</span>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="/report-issue" className="text-gray-300 hover:text-white civic-transition">Report Issue</a></li>
                  <li><a href="/map-view" className="text-gray-300 hover:text-white civic-transition">Map View</a></li>
                  <li><a href="/issues" className="text-gray-300 hover:text-white civic-transition">Browse Issues</a></li>
                  <li><a href="/community" className="text-gray-300 hover:text-white civic-transition">Community</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><button onClick={() => setShowHelpCenter(true)} className="text-gray-300 hover:text-white civic-transition">Help Center</button></li>
                  <li><button onClick={() => setShowContactUs(true)} className="text-gray-300 hover:text-white civic-transition">Contact Us</button></li>
                  <li><button onClick={() => setShowPrivacyPolicy(true)} className="text-gray-300 hover:text-white civic-transition">Privacy Policy</button></li>
                  <li><button onClick={() => setShowTermsOfService(true)} className="text-gray-300 hover:text-white civic-transition">Terms of Service</button></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 text-sm">
                © {new Date().getFullYear()} E-speak. All rights reserved.
              </p>
              <p className="text-gray-300 text-sm mt-2 md:mt-0">
                Building stronger communities together
              </p>
            </div>
          </div>
        </footer>

        {/* Help Center Modal */}
        {showHelpCenter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Icon name="HelpCircle" size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Help Center</h2>
                  </div>
                  <button onClick={() => setShowHelpCenter(false)} className="text-gray-500 hover:text-gray-700">
                    <Icon name="X" size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* FAQs */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">How do I report an issue?</h4>
                      <p className="text-sm text-gray-600">Click "Report Issue" in the navigation menu, fill out the form with details about the issue, add photos if possible, and submit. You'll receive a unique tracking ID.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">How long does it take to resolve issues?</h4>
                      <p className="text-sm text-gray-600">Resolution times vary by issue type and priority. Use our Civic AI Chatbot to learn about typical timeframes for different issue categories.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Can I track my reported issues?</h4>
                      <p className="text-sm text-gray-600">Yes! Use the tracking page with your report ID, or view all your reports in "My Issues" section after signing in.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">What types of issues can I report?</h4>
                      <p className="text-sm text-gray-600">You can report infrastructure issues, public safety concerns, sanitation problems, noise complaints, and more. Check our categories in the report form.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">How does the AI Assistant help?</h4>
                      <p className="text-sm text-gray-600">Our AI Assistant provides smart suggestions for titles, categories, and priorities. It also offers insights based on thousands of civic cases worldwide.</p>
                    </div>
                  </div>
                </div>

                {/* Chatbot CTA */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="Bot" size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Need More Help?</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Our Civic AI Chatbot can answer specific questions about civic issues, departments, resolution times, and best practices. It's trained on thousands of real civic service cases!
                      </p>
                      <button
                        onClick={() => {
                          setShowHelpCenter(false);
                          window.dispatchEvent(new Event('openCivicChatbot'));
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
                      >
                        <Icon name="MessageCircle" size={16} />
                        <span>Open Civic AI Chatbot</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Us Modal */}
        {showContactUs && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Icon name="Mail" size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                  </div>
                  <button onClick={() => setShowContactUs(false)} className="text-gray-500 hover:text-gray-700">
                    <Icon name="X" size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 flex items-start gap-2">
                    <Icon name="Info" size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>We typically respond within 24-48 hours. For immediate assistance, try our Civic AI Chatbot!</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowContactUs(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {contactSubmitting ? (
                      <>
                        <Icon name="Loader2" size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmSend && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Icon name="Send" size={32} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Confirm Send Message
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to send this message? We'll get back to you as soon as possible.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-left">
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Name:</span> {contactForm.name}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Email:</span> {contactForm.email}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Message:</span>
                  <p className="text-gray-600 mt-1">{contactForm.message}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmSend(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSendMessage}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="Check" size={18} />
                  Yes, Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Icon name="CheckCircle" size={48} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Message Sent Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Thank you for contacting us! We've received your message and will get back to you as soon as possible.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacyPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="prose max-w-none">
                  <p className="text-sm text-gray-500 mb-6">Last updated: January 7, 2026</p>
                  
                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h3>
                    <p className="text-gray-700 mb-3">
                      E-speak collects information to provide better services to our users. We collect the following types of information:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li><strong>Personal Information:</strong> When you report an issue, we collect your name, email address, phone number (optional), and location data.</li>
                      <li><strong>Issue Reports:</strong> Details about civic issues including descriptions, photos, location coordinates, and timestamps.</li>
                      <li><strong>Usage Data:</strong> Information about how you interact with our platform, including IP address, browser type, and device information.</li>
                      <li><strong>Contact Messages:</strong> Information you provide when contacting our support team.</li>
                    </ul>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h3>
                    <p className="text-gray-700 mb-3">We use the collected information for:</p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li>Processing and routing civic issue reports to appropriate government departments</li>
                      <li>Providing you with updates on your reported issues</li>
                      <li>Improving our AI-powered civic assistance features</li>
                      <li>Analyzing trends to help improve community services</li>
                      <li>Communicating with you about your reports and our services</li>
                      <li>Preventing fraud and ensuring platform security</li>
                    </ul>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">3. Information Sharing</h3>
                    <p className="text-gray-700 mb-3">
                      We share your information only in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li><strong>Government Agencies:</strong> Issue reports are shared with relevant municipal departments to facilitate resolution.</li>
                      <li><strong>Public Display:</strong> Anonymized issue locations and categories may be displayed on our public map to show community trends.</li>
                      <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights.</li>
                      <li><strong>Service Providers:</strong> We work with trusted third-party services for hosting, analytics, and AI processing.</li>
                    </ul>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h3>
                    <p className="text-gray-700">
                      We implement industry-standard security measures to protect your personal information. This includes encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">5. Your Rights</h3>
                    <p className="text-gray-700 mb-3">You have the right to:</p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li>Access your personal data</li>
                      <li>Request correction of inaccurate data</li>
                      <li>Request deletion of your data (subject to legal requirements)</li>
                      <li>Opt-out of certain data collection practices</li>
                      <li>Export your data in a portable format</li>
                    </ul>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">6. Cookies and Tracking</h3>
                    <p className="text-gray-700">
                      We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie preferences through your browser settings.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">7. Children's Privacy</h3>
                    <p className="text-gray-700">
                      E-speak is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">8. Changes to This Policy</h3>
                    <p className="text-gray-700">
                      We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">9. Contact Us</h3>
                    <p className="text-gray-700">
                      If you have questions about this Privacy Policy or your personal data, please contact us through our Contact Us form or email us at privacy@e-speak.com
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terms of Service Modal */}
        {showTermsOfService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Terms of Service</h2>
                <button
                  onClick={() => setShowTermsOfService(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="prose max-w-none">
                  <p className="text-sm text-gray-500 mb-6">Last updated: January 7, 2026</p>
                  
                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h3>
                    <p className="text-gray-700">
                      By accessing and using E-speak, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to modify these terms at any time, and continued use constitutes acceptance of modified terms.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">2. Service Description</h3>
                    <p className="text-gray-700 mb-3">
                      E-speak is a civic engagement platform that enables users to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li>Report civic issues to local government departments</li>
                      <li>Track the status of reported issues</li>
                      <li>View community-wide issue trends</li>
                      <li>Receive AI-powered assistance for issue reporting</li>
                      <li>Engage with civic data and insights</li>
                    </ul>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">3. User Responsibilities</h3>
                    <p className="text-gray-700 mb-3">As a user of E-speak, you agree to:</p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li><strong>Accurate Information:</strong> Provide truthful and accurate information in all reports</li>
                      <li><strong>Appropriate Content:</strong> Submit only legitimate civic issues, not spam, harassment, or inappropriate content</li>
                      <li><strong>Legal Compliance:</strong> Use the platform in compliance with all applicable local, state, and federal laws</li>
                      <li><strong>Respectful Conduct:</strong> Treat other users, government officials, and platform staff with respect</li>
                      <li><strong>Account Security:</strong> Maintain the security of your account credentials</li>
                      <li><strong>Prohibited Activities:</strong> Not attempt to hack, disrupt, or misuse the platform</li>
                    </ul>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">4. Content Guidelines</h3>
                    <p className="text-gray-700 mb-3">When reporting issues, you must not include:</p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      <li>False or misleading information</li>
                      <li>Hate speech, discrimination, or harassment</li>
                      <li>Personal attacks or defamatory content</li>
                      <li>Copyrighted material without permission</li>
                      <li>Private information about others</li>
                      <li>Commercial advertisements or spam</li>
                      <li>Illegal content or content promoting illegal activities</li>
                    </ul>
                    <p className="text-gray-700 mt-3">
                      We reserve the right to remove content that violates these guidelines and may suspend or terminate accounts for repeated violations.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">5. Intellectual Property</h3>
                    <p className="text-gray-700 mb-3">
                      All content on E-speak, including text, graphics, logos, and software, is the property of E-speak or its licensors and is protected by copyright and intellectual property laws.
                    </p>
                    <p className="text-gray-700">
                      By submitting content (reports, photos, comments), you grant E-speak a non-exclusive, worldwide, royalty-free license to use, display, and share that content for platform operation and civic improvement purposes.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">6. AI-Powered Features</h3>
                    <p className="text-gray-700">
                      Our AI assistance features are provided to help improve report quality and provide civic insights. AI-generated suggestions are informational only and should be reviewed before use. We do not guarantee the accuracy or completeness of AI-generated content.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">7. Service Availability</h3>
                    <p className="text-gray-700">
                      We strive to maintain continuous platform availability but cannot guarantee uninterrupted service. We may perform maintenance, updates, or modifications at any time. We are not liable for any temporary unavailability or loss of functionality.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">8. Limitation of Liability</h3>
                    <p className="text-gray-700">
                      E-speak acts as an intermediary between citizens and government agencies. We do not guarantee that reported issues will be resolved or resolved within any specific timeframe. Government agencies are responsible for issue resolution. E-speak is not liable for any damages arising from:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                      <li>Delays or failures in issue resolution</li>
                      <li>Platform downtime or technical issues</li>
                      <li>Actions taken by government agencies</li>
                      <li>User-generated content</li>
                      <li>Unauthorized access to your account</li>
                    </ul>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">9. Indemnification</h3>
                    <p className="text-gray-700">
                      You agree to indemnify and hold harmless E-speak, its officers, employees, and partners from any claims, damages, or expenses arising from your use of the platform or violation of these terms.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">10. Termination</h3>
                    <p className="text-gray-700">
                      We reserve the right to suspend or terminate your account at any time for violations of these terms, illegal activity, or at our discretion. You may also delete your account at any time through your account settings.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">11. Governing Law</h3>
                    <p className="text-gray-700">
                      These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction in which E-speak operates, without regard to conflict of law principles.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">12. Contact Information</h3>
                    <p className="text-gray-700">
                      For questions about these Terms of Service, please contact us through our Contact Us form or email us at support@e-speak.com
                    </p>
                  </section>

                  <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>By using E-speak, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;