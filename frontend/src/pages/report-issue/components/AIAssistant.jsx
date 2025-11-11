import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import IssueForm from './components/IssueForm';
import PhotoUpload from './components/PhotoUpload';
import LocationSelector from './components/LocationSelector';
import AIAssistant from './components/AIAssistant';
import ProgressIndicator from './components/ProgressIndicator';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ReportIssue = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    photos: [],
    location: {
      address: '',
      coordinates: null,
      accuracy: null
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState('');

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotosChange = (photos) => {
    setFormData(prev => ({
      ...prev,
      photos
    }));
  };

  const handleLocationChange = (location) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
  };

  const handleAISuggestion = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['title', 'description', 'category', 'priority', 'reporterName', 'reporterEmail'];
    const missingFields = requiredFields?.filter(field => !formData?.[field] || formData?.[field]?.trim() === '');
    
    if (missingFields?.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields?.join(', ')}`);
      return false;
    }

    if (!formData?.location?.address) {
      alert('Please provide the issue location');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex?.test(formData?.reporterEmail)) {
      alert('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const generateReportId = () => {
    const date = new Date();
    const year = date?.getFullYear();
    const month = String(date?.getMonth() + 1)?.padStart(2, '0');
    const day = String(date?.getDate())?.padStart(2, '0');
    const random = Math.floor(Math.random() * 1000)?.toString()?.padStart(3, '0');
    return `RPT-${year}-${month}${day}-${random}`;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const reportId = generateReportId();
      setGeneratedReportId(reportId);

      // Simulate successful submission
      console.log('Report submitted:', {
        ...formData,
        reportId,
        submittedAt: new Date()?.toISOString(),
        status: 'Submitted'
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('There was an error submitting your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/issues');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: '',
      reporterName: '',
      reporterEmail: '',
      reporterPhone: '',
      photos: [],
      location: {
        address: '',
        coordinates: null,
        accuracy: null
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Report a Civic Issue
              </h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Help improve your community by reporting issues that need attention. 
                Our AI-powered system will help categorize and route your report to the right authorities.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              <IssueForm
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
              
              <PhotoUpload
                photos={formData?.photos}
                onPhotosChange={handlePhotosChange}
              />
              
              <LocationSelector
                location={formData?.location}
                onLocationChange={handleLocationChange}
              />
            </div>

            {/* Right Column - AI Assistant & Progress */}
            <div className="space-y-8">
              <ProgressIndicator formData={formData} />
              
              <AIAssistant
                formData={formData}
                onSuggestionApply={handleAISuggestion}
              />

              {/* Quick Actions */}
              <div className="bg-card rounded-lg border border-border p-6 civic-shadow-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    iconName="RotateCcw"
                    iconPosition="left"
                    className="w-full"
                  >
                    Reset Form
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/issues')}
                    iconName="List"
                    iconPosition="left"
                    className="w-full"
                  >
                    View All Issues
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/map-view')}
                    iconName="Map"
                    iconPosition="left"
                    className="w-full"
                  >
                    View on Map
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-lg border border-border p-8 max-w-md w-full civic-shadow-modal">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mx-auto mb-4">
                <Icon name="CheckCircle" size={32} className="text-success" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Report Submitted Successfully!
              </h2>
              
              <p className="text-text-secondary mb-4">
                Your civic issue has been submitted and assigned ID: 
                <span className="font-mono font-medium text-primary"> {generatedReportId}</span>
              </p>
              
              <div className="bg-muted rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-foreground mb-2">What happens next?</h3>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Your report will be reviewed within 24-48 hours</li>
                  <li>• You'll receive email updates on the progress</li>
                  <li>• The relevant department will be notified</li>
                  <li>• Community members can vote and comment</li>
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/report-issue')}
                  className="flex-1"
                >
                  Report Another Issue
                </Button>
                <Button
                  variant="default"
                  onClick={handleSuccessClose}
                  className="flex-1"
                >
                  View All Issues
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportIssue;