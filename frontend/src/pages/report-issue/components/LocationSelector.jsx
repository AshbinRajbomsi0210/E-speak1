import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import InteractiveMap from '../../../components/InteractiveMap';

const LocationSelector = ({ location, onLocationChange }) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 27.7172, lng: 85.3240 }); 
  const [zoomLevel, setZoomLevel] = useState(12);
  const [locationStatus, setLocationStatus] = useState(null); // 'loading', 'success', 'error'

  useEffect(() => {
    if (location?.coordinates) {
      setMapCenter({
        lat: location?.coordinates?.lat,
        lng: location?.coordinates?.lng
      });
    }
  }, [location?.coordinates]);

  // Reverse geocoding using Nominatim (OpenStreetMap)
  const reverseGeocode = async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'E-speak-Civic-App'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setIsReverseGeocoding(false);
        return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    setIsReverseGeocoding(false);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationStatus('loading');
    
    if (navigator.geolocation) {
      navigator.geolocation?.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position?.coords?.latitude,
            lng: position?.coords?.longitude
          };
          
          // Get address from coordinates
          const address = await reverseGeocode(coords.lat, coords.lng);
          
          onLocationChange({
            address: address,
            coordinates: coords,
            accuracy: position?.coords?.accuracy
          });
          
          setMapCenter(coords);
          setZoomLevel(16);
          setIsLoadingLocation(false);
          setLocationStatus('success');
          
          // Clear success status after 3 seconds
          setTimeout(() => setLocationStatus(null), 3000);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
          setLocationStatus(null);
          // Silently fail - user can click on map or enter address manually
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    } else {
      setIsLoadingLocation(false);
      setLocationStatus(null);
    }
  };

  const handleAddressChange = (e) => {
    const address = e?.target?.value;
    onLocationChange({
      ...location,
      address
    });
  };

  const handleMapClick = async (coords) => {
    // Get address from clicked coordinates
    const address = await reverseGeocode(coords.lat, coords.lng);
    
    onLocationChange({
      address: address,
      coordinates: coords,
      accuracy: 10
    });
    
    setMapCenter(coords);
    setZoomLevel(16);
  };

  return (
    <div className="space-y-4">
      {/* Location Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Icon name="MapPin" size={16} className="text-primary" />
          Location
        </label>
        <Button
          variant={locationStatus === 'success' ? 'default' : 'outline'}
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          size="sm"
          className={`gap-2 transition-all duration-300 ${locationStatus === 'success' ? 'bg-success hover:bg-success/90' : ''}`}
        >
          {isLoadingLocation ? (
            <>
              <Icon name="Loader" size={14} className="animate-spin" />
              <span>Locating...</span>
            </>
          ) : locationStatus === 'success' ? (
            <>
              <Icon name="CheckCircle" size={14} />
              <span>Located!</span>
            </>
          ) : (
            <>
              <Icon name="Navigation" size={14} />
              <span>Use Current Location</span>
            </>
          )}
        </Button>
      </div>

      {/* Address Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Enter address or click on the map below"
          value={location?.address || ''}
          onChange={handleAddressChange}
          className="w-full pl-10"
        />
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
      </div>

      {/* Interactive Map */}
      <div className="relative w-full rounded-xl overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 shadow-sm" style={{ zIndex: 1 }}>
        {/* Map Loading/Geocoding Overlay */}
        {(isReverseGeocoding || isLoadingLocation) && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-card px-4 py-3 rounded-xl flex items-center space-x-3 shadow-lg border border-border">
              <Icon name="Loader" size={18} className="text-primary animate-spin" />
              <span className="text-sm font-medium">
                {isLoadingLocation ? 'Finding your location...' : 'Getting address...'}
              </span>
            </div>
          </div>
        )}
        
        <div className="h-72">
          <InteractiveMap
            issues={[]}
            center={mapCenter}
            zoom={zoomLevel}
            onClick={handleMapClick}
            clickable={true}
            height="100%"
            showControls={false}
          />
        </div>
        
        {/* Map Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-30">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
            className="w-9 h-9 bg-card/95 backdrop-blur border border-border rounded-lg flex items-center justify-center hover:bg-muted hover:border-primary/50 transition-all shadow-sm"
          >
            <Icon name="Plus" size={16} />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}
            className="w-9 h-9 bg-card/95 backdrop-blur border border-border rounded-lg flex items-center justify-center hover:bg-muted hover:border-primary/50 transition-all shadow-sm"
          >
            <Icon name="Minus" size={16} />
          </button>
        </div>

        {/* Map Hint */}
        {!location?.coordinates && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30">
            <div className="bg-card/95 backdrop-blur px-4 py-2 rounded-full text-xs text-text-secondary flex items-center gap-2 shadow-lg border border-border">
              <Icon name="MousePointer" size={12} />
              <span>Click on the map to select location</span>
            </div>
          </div>
        )}
      </div>

      {/* Location Status */}
      {location?.coordinates && (
        <div className="flex items-start gap-3 p-3 bg-success/10 rounded-xl border border-success/20">
          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
            <Icon name="CheckCircle" size={16} className="text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-success">Location Selected</p>
            <p className="text-xs text-text-secondary mt-0.5 truncate">
              {location?.address || `${location?.coordinates?.lat?.toFixed(6)}, ${location?.coordinates?.lng?.toFixed(6)}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;