import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const MapContainer = ({ filteredIssues, onIssueSelect, selectedIssue }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [zoomLevel, setZoomLevel] = useState(12);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
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
          console.log('Location access denied');
        }
      );
    }
  }, []);

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
      {/* Google Maps Iframe */}
      <iframe
        width="100%"
        height="100%"
        loading="lazy"
        title="Community Issues Map"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=${zoomLevel}&output=embed`}
        className="w-full h-full"
      />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="flex items-center justify-center w-10 h-10 bg-surface border border-border rounded-lg shadow-sm hover:bg-muted civic-transition"
        >
          <Icon name="Plus" size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex items-center justify-center w-10 h-10 bg-surface border border-border rounded-lg shadow-sm hover:bg-muted civic-transition"
        >
          <Icon name="Minus" size={16} />
        </button>
        <button
          onClick={handleLocationReset}
          className="flex items-center justify-center w-10 h-10 bg-surface border border-border rounded-lg shadow-sm hover:bg-muted civic-transition"
          title="Reset to my location"
        >
          <Icon name="MapPin" size={16} />
        </button>
      </div>

      {/* Issue Markers Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              left: `${20 + (issue.id * 15) % 60}%`,
              top: `${30 + (issue.id * 12) % 40}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => onIssueSelect(issue)}
          >
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg civic-transition hover:scale-110 ${
              issue.priority === 'high' ? 'bg-error' :
              issue.priority === 'medium' ? 'bg-warning' : 'bg-success'
            }`}>
              <Icon 
                name={
                  issue.category === 'Infrastructure' ? 'Wrench' :
                  issue.category === 'Public Safety' ? 'Shield' :
                  issue.category === 'Environment' ? 'Leaf' :
                  issue.category === 'Transportation' ? 'Car' : 'AlertCircle'
                } 
                size={14} 
                color="white" 
              />
              {issue.votes > 5 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {issue.votes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Issue Details Popup */}
      {selectedIssue && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
          <div className="bg-surface border border-border rounded-lg shadow-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{selectedIssue.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedIssue.category === 'Infrastructure' ? 'bg-blue-100 text-blue-800' :
                    selectedIssue.category === 'Public Safety' ? 'bg-red-100 text-red-800' :
                    selectedIssue.category === 'Environment'? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedIssue.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedIssue.status === 'Resolved' ? 'bg-success text-white' :
                    selectedIssue.status === 'In Progress'? 'bg-warning text-white' : 'bg-secondary text-white'
                  }`}>
                    {selectedIssue.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onIssueSelect(null)}
                className="flex items-center justify-center w-6 h-6 text-text-secondary hover:text-foreground civic-transition"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
            
            <p className="text-sm text-text-secondary mb-3 line-clamp-2">
              {selectedIssue.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-text-secondary">
                <div className="flex items-center space-x-1">
                  <Icon name="ThumbsUp" size={14} />
                  <span>{selectedIssue.votes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="MessageSquare" size={14} />
                  <span>{selectedIssue.comments}</span>
                </div>
              </div>
              <button className="text-primary text-sm font-medium hover:text-primary/80 civic-transition">
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cluster Info */}
      <div className="absolute top-4 left-4 bg-surface border border-border rounded-lg shadow-sm px-3 py-2">
        <div className="text-sm font-medium text-foreground">
          {filteredIssues.length} Issues Found
        </div>
      </div>
    </div>
  );
};

export default MapContainer;