import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Header from '../../components/ui/Header';
import IssueForm from './components/IssueForm';
import PhotoUpload from './components/PhotoUpload';
import LocationSelector from './components/LocationSelector';
import AIAssistant from './components/AIAssistant';
import ProgressIndicator from './components/ProgressIndicator';
import SimilarIssues from './components/SimilarIssues';
import ReportSummary from './components/ReportSummary';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ReportIssue = () => {
  const navigate = useNavigate();
  const { user, isLoaded, isSignedIn } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    isAnonymous: false,
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
  const [showSummary, setShowSummary] = useState(false);

  // Auto-fill user details when signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const fullName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '';
      const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || '';
      
      setFormData(prev => ({
        ...prev,
        reporterName: fullName,
        reporterEmail: email
      }));
    }
  }, [isLoaded, isSignedIn, user]);

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
    console.log('AI Suggestion Applied:', { field, value });
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['title', 'description', 'category', 'priority', 'reporterName', 'reporterEmail'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.reporterEmail)) {
      alert('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleProceedToSummary = () => {
    if (!validateForm()) return;
    setShowSummary(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditFromSummary = (section) => {
    setShowSummary(false);
    // Scroll to the appropriate section after a brief delay
    setTimeout(() => {
      const sectionMap = {
        'details': 'issue-form-section',
        'location': 'location-section',
        'photos': 'photos-section'
      };
      const elementId = sectionMap[section];
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('reporterName', formData.reporterName);
      formDataToSend.append('reporterEmail', formData.reporterEmail);
      formDataToSend.append('isAnonymous', formData.isAnonymous);
      if (formData.reporterPhone) formDataToSend.append('reporterPhone', formData.reporterPhone);

      // Append location data
      if (formData.location?.address) formDataToSend.append('address', formData.location.address);
      if (formData.location?.coordinates?.lat) formDataToSend.append('latitude', formData.location.coordinates.lat);
      if (formData.location?.coordinates?.lng) formDataToSend.append('longitude', formData.location.coordinates.lng);

      // Append photos
      formData.photos.forEach(photo => {
        if (photo.file) {
          formDataToSend.append('photos', photo.file);
        }
      });

      console.log('Submitting issue to backend...');
      
      const res = await fetch('http://127.0.0.1:8000/api/issues/create/', {
        method: 'POST',
        body: formDataToSend
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error submitting report:', errorData);
        
        // Display specific error messages
        if (errorData.reporterName) {
          alert(`Reporter Name Error: ${errorData.reporterName.join(', ')}`);
        } else if (errorData.reporterEmail) {
          alert(`Reporter Email Error: ${errorData.reporterEmail.join(', ')}`);
        } else if (errorData.title) {
          alert(`Title Error: ${errorData.title.join(', ')}`);
        } else if (errorData.description) {
          alert(`Description Error: ${errorData.description.join(', ')}`);
        } else if (errorData.category) {
          alert(`Category Error: ${errorData.category.join(', ')}`);
        } else if (errorData.priority) {
          alert(`Priority Error: ${errorData.priority.join(', ')}`);
        } else {
          alert(`Failed to submit report: ${JSON.stringify(errorData)}`);
        }
        
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      console.log('Report submitted:', data);

      setGeneratedReportId(data.data.report_id);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error submitting report:', error);
      alert(`There was an error submitting your report: ${error.message}. Please make sure the backend server is running on http://127.0.0.1:8000`);
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
      isAnonymous: false,
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
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Report a Civic Issue
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Help improve your community by reporting issues that need attention.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {showSummary ? (
                <ReportSummary
                  formData={formData}
                  onEdit={handleEditFromSummary}
                  onConfirm={handleSubmit}
                  onBack={() => setShowSummary(false)}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <>
                  <SimilarIssues 
                    title={formData.title}
                    description={formData.description}
                    category={formData.category}
                    onSelectIssue={(issue) => {
                      navigate(`/issues?id=${issue.id}`);
                    }}
                  />
                  <div id="issue-form-section">
                    <IssueForm formData={formData} onFormChange={handleFormChange} />
                  </div>
                  <div id="location-section">
                    <LocationSelector location={formData.location} onLocationChange={handleLocationChange} />
                  </div>
                  <div id="photos-section">
                    <PhotoUpload photos={formData.photos} onPhotosChange={handlePhotosChange} />
                  </div>

                  <div className="bg-card rounded-lg border border-border p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <Button
                        variant="default"
                        className="w-full sm:w-72"
                        onClick={handleProceedToSummary}
                        disabled={
                          !formData.title ||
                          !formData.description ||
                          !formData.category ||
                          !formData.priority ||
                          !formData.reporterName ||
                          !formData.reporterEmail
                        }
                        iconName="Eye"
                        iconPosition="left"
                      >
                        Review & Submit
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full sm:w-72"
                        onClick={resetForm}
                      >
                        Reset Form
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-8">
              <ProgressIndicator formData={formData} showSummary={showSummary} />
              {!showSummary && (
                <AIAssistant formData={formData} onSuggestionApply={handleAISuggestion} />
              )}
            </div>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-lg border border-border p-8 max-w-md w-full">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mx-auto mb-4">
                <Icon name="CheckCircle" size={32} className="text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Report Submitted Successfully!
              </h2>
              <p className="text-text-secondary mb-4">
                Your civic issue has been submitted. ID: 
                <span className="font-mono font-medium text-primary"> {generatedReportId}</span>
              </p>
              <div className="flex space-x-3">
                <Button variant="default" onClick={handleSuccessClose} className="flex-1">
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