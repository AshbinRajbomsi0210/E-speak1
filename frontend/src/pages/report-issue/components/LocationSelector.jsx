import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import InteractiveMap from '../../../components/InteractiveMap';

const LocationSelector = ({ location, onLocationChange }) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 27.7172, lng: 85.3240 }); // Default to Kathmandu
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
    <div className="bg-card rounded-lg border border-border p-6 civic-shadow-card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-lg">
          <Icon name="MapPin" size={20} className="text-success" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Issue Location</h2>
          <p className="text-sm text-text-secondary">Specify where the issue is located</p>
        </div>
      </div>
      <div className="space-y-6">
        {/* Address Input */}
        <div className="space-y-4">
          <Input
            label="Street Address"
            type="text"
            placeholder="Enter the exact address or nearest landmark"
            value={location?.address || ''}
            onChange={handleAddressChange}
            required
            description="Be as specific as possible for accurate location"
          />
          
          <Button
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            iconName="Navigation"
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
          </Button>
        </div>

        {/* Interactive Map */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Pinpoint Location on Map
          </label>
          <div className="relative w-full h-80 rounded-lg overflow-hidden border-2 border-border hover:border-primary civic-transition">
            {isReverseGeocoding && (
              <div className="absolute inset-0 bg-black/50 z-[2000] flex items-center justify-center">
                <div className="bg-white px-6 py-4 rounded-lg shadow-xl flex items-center space-x-3">
                  <div className="animate-spin">
                    <Icon name="Loader" size={20} className="text-primary" />
                  </div>
                  <span className="text-foreground font-medium">Getting address...</span>
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
            
            {/* Custom Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[1000]">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
                className="flex items-center justify-center w-10 h-10 bg-surface border border-border rounded-lg shadow-lg hover:bg-muted civic-transition"
                title="Zoom in"
              >
                <Icon name="Plus" size={16} />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}
                className="flex items-center justify-center w-10 h-10 bg-surface border border-border rounded-lg shadow-lg hover:bg-muted civic-transition"
                title="Zoom out"
              >
                <Icon name="Minus" size={16} />
              </button>
              <button
                onClick={getCurrentLocation}
                className="flex items-center justify-center w-10 h-10 bg-surface border border-border rounded-lg shadow-lg hover:bg-muted civic-transition"
                title="Reset to my location"
              >
                <Icon name="MapPin" size={16} />
              </button>
            </div>
            
            {/* Map Info */}
            <div className="absolute top-4 left-4 bg-surface border border-border rounded-lg shadow-lg px-4 py-3 z-[1000]">
              <div className="text-sm font-semibold text-foreground flex items-center space-x-2">
                <Icon name="MapPin" size={16} className="text-primary" />
                <span>Select Location</span>
              </div>
              <div className="text-xs text-text-secondary mt-1">
                Zoom Level: {zoomLevel}
              </div>
            </div>
          </div>
          <p className="text-xs text-text-secondary flex items-center space-x-1">
            <Icon name="Info" size={14} className="text-primary" />
            <span>Click anywhere on the map to set the exact location of the issue</span>
          </p>
        </div>

        {/* Location Details */}
        {location?.coordinates && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Icon name="CheckCircle" size={16} className="mr-2 text-success" />
              Location Confirmed
            </h4>
            <div className="space-y-1 text-xs text-text-secondary">
              <p>Address: {location?.address}</p>
              <p>Coordinates: {location?.coordinates?.lat?.toFixed(6)}, {location?.coordinates?.lng?.toFixed(6)}</p>
              {location?.accuracy && (
                <p>Accuracy: ±{Math.round(location?.accuracy)} meters</p>
              )}
            </div>
          </div>
        )}

        {/* Location Tips */}
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
            <Icon name="Info" size={16} className="mr-2 text-warning" />
            Location Guidelines
          </h4>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>• Provide the most specific address possible</li>
            <li>• Use landmarks if exact address is unknown</li>
            <li>• Ensure the pin is placed at the exact issue location</li>
            <li>• Double-check coordinates for accuracy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;