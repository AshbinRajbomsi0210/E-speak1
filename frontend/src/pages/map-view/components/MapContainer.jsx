import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import InteractiveMap from '../../../components/InteractiveMap';

const MapContainer = ({ filteredIssues, onIssueSelect, selectedIssue, initialCenter }) => {
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState({ lat: 27.7172, lng: 85.3240 }); // Kathmandu, Nepal default
  const [zoomLevel, setZoomLevel] = useState(12);
  const [userLocation, setUserLocation] = useState(null);

  // Handle initial center from URL params (e.g., from authority dashboard)
  useEffect(() => {
    if (initialCenter && initialCenter.lat && initialCenter.lng) {
      setMapCenter(initialCenter);
      setZoomLevel(16); // Zoom in closer when viewing specific issue
    }
  }, [initialCenter]);

  useEffect(() => {
    // Get user's current location (only if no initial center provided)
    if (!initialCenter && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.log('Location access denied, using default location (Kathmandu)');
        }
      );
    }
  }, [initialCenter]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 1));
  };

  const handleLocationReset = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setZoomLevel(14);
    }
  };

  return (
    <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
      {/* Interactive Leaflet Map */}
      <InteractiveMap
        issues={filteredIssues}
        center={mapCenter}
        zoom={zoomLevel}
        onIssueClick={onIssueSelect}
        selectedIssue={selectedIssue}
        showControls={false}
      />

      {/* Custom Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[1000]">
        <button
          onClick={handleZoomIn}
          className="flex items-center justify-center w-10 h-10 bg-surface border border-border rounded-lg shadow-lg hover:bg-muted civic-transition"
          title="Zoom in"
        >
          <Icon name="Plus" size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex items-center justify-center w-10 h-10 bg-surface border border-border rounded-lg shadow-lg hover:bg-muted civic-transition"
          title="Zoom out"
        >
          <Icon name="Minus" size={16} />
        </button>
        <button
          onClick={handleLocationReset}
          className="flex items-center justify-center w-10 h-10 bg-surface border border-border rounded-lg shadow-lg hover:bg-muted civic-transition"
          title="Reset to my location"
        >
          <Icon name="MapPin" size={16} />
        </button>
      </div>

      {/* Issue Details Popup */}
      {selectedIssue && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[1000]">
          <div className="bg-surface border border-border rounded-lg shadow-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg mb-2">{selectedIssue.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-text-secondary mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedIssue.category === 'Infrastructure' ? 'bg-blue-100 text-blue-800' :
                    selectedIssue.category === 'Public Safety' ? 'bg-red-100 text-red-800' :
                    selectedIssue.category === 'Environment'? 'bg-green-100 text-green-800' : 
                    selectedIssue.category === 'Transportation'? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedIssue.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedIssue.status === 'Resolved' ? 'bg-success/10 text-success border border-success/20' :
                    selectedIssue.status === 'In Progress'? 'bg-primary/10 text-primary border border-primary/20' : 
                    'bg-warning/10 text-warning border border-warning/20'
                  }`}>
                    {selectedIssue.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onIssueSelect(null)}
                className="flex items-center justify-center w-8 h-8 text-text-secondary hover:text-foreground hover:bg-muted rounded-lg civic-transition"
              >
                <Icon name="X" size={18} />
              </button>
            </div>
            
            <p className="text-sm text-text-secondary mb-4 line-clamp-3">
              {selectedIssue.description}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-5 text-sm text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Icon name="ThumbsUp" size={16} />
                  <span className="font-medium">{selectedIssue.votes}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="MessageSquare" size={16} />
                  <span className="font-medium">{selectedIssue.comments}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="MapPin" size={16} />
                  <span className="font-medium text-xs">{selectedIssue.address}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate(`/issue/${selectedIssue.id}`)}
              className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 civic-transition"
            >
              View Full Details
            </button>
          </div>
        </div>
      )}

      {/* Cluster Info */}
      <div className="absolute top-4 left-4 bg-surface border border-border rounded-lg shadow-lg px-4 py-3 z-[1000]">
        <div className="text-sm font-semibold text-foreground flex items-center space-x-2">
          <Icon name="MapPin" size={16} className="text-primary" />
          <span>{filteredIssues.length} {filteredIssues.length === 1 ? 'Issue' : 'Issues'} in View</span>
        </div>
        <div className="text-xs text-text-secondary mt-1">
          Zoom Level: {zoomLevel}
        </div>
      </div>
    </div>
  );
};

export default MapContainer;