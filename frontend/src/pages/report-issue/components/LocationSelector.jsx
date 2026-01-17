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
          setZoomLevel(14);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = 'Unable to get your current location. ';
          
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage += 'Location permission was denied. Please enable location access in your browser settings.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage += 'Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            errorMessage += 'Location request timed out.';
          }
          
          alert(errorMessage + ' Please enter the address manually.');
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by this browser. Please enter the address manually.');
      setIsLoadingLocation(false);
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
    <div className="space-y-3">
      {/* Address Input & Current Location */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Location</label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter address or click map"
            value={location?.address || ''}
            onChange={handleAddressChange}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            size="sm"
            className="px-3"
            title="Use current location"
          >
            <Icon name="Navigation" size={16} />
          </Button>
        </div>
      </div>

      {/* Interactive Map - Compact */}
      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors" style={{ zIndex: 1 }}>
        {isReverseGeocoding && (
          <div className="absolute inset-0 bg-black/30 z-40 flex items-center justify-center">
            <div className="bg-card px-3 py-2 rounded-lg flex items-center space-x-2 text-sm">
              <Icon name="Loader" size={14} className="text-primary animate-spin" />
              <span>Getting address...</span>
            </div>
          </div>
        )}
        
        <InteractiveMap
          issues={[]}
          center={mapCenter}
          zoom={zoomLevel}
          onClick={handleMapClick}
          clickable={true}
          height="100%"
          showControls={false}
        />
        
        {/* Compact Map Controls */}
        <div className="absolute top-2 right-2 flex gap-1 z-30">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
            className="w-8 h-8 bg-card border border-border rounded flex items-center justify-center hover:bg-muted text-sm"
          >
            <Icon name="Plus" size={14} />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}
            className="w-8 h-8 bg-card border border-border rounded flex items-center justify-center hover:bg-muted text-sm"
          >
            <Icon name="Minus" size={14} />
          </button>
        </div>
      </div>

      {/* Location Status */}
      {location?.coordinates && (
        <div className="text-xs text-text-secondary p-2 bg-muted rounded border border-border/50">
          <span className="flex items-center gap-2">
            <Icon name="CheckCircle" size={12} className="text-success" />
            {location?.address || 'Location set'}
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;