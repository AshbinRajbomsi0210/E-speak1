import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (location?.coordinates) {
      setMapCenter({
        lat: location?.coordinates?.lat,
        lng: location?.coordinates?.lng
      });
    }
  }, [location?.coordinates]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Forward geocoding — search address using Nominatim
  const searchAddress = useCallback(async (query) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        { headers: { 'User-Agent': 'E-speak-Civic-App' } }
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowDropdown(data.length > 0);
      }
    } catch (error) {
      console.error('Address search error:', error);
    }
    setIsSearching(false);
  }, []);

  // Select a search result
  const handleSelectResult = (result) => {
    const coords = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    onLocationChange({
      address: result.display_name,
      coordinates: coords,
      accuracy: 10
    });
    setMapCenter(coords);
    setZoomLevel(16);
    setShowDropdown(false);
    setSearchResults([]);
  };

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
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        console.log('Got location:', latitude, longitude);
        
        if (latitude !== undefined && longitude !== undefined) {
          const coords = {
            lat: latitude,
            lng: longitude
          };
          
          // Get address from coordinates
          const address = await reverseGeocode(coords.lat, coords.lng);
          
          onLocationChange({
            address: address,
            coordinates: coords,
            accuracy: accuracy
          });
          
          setMapCenter(coords);
          setZoomLevel(16);
          setIsLoadingLocation(false);
          setLocationStatus('success');
          
          // Clear success status after 3 seconds
          setTimeout(() => setLocationStatus(null), 3000);
        } else {
          alert('Could not get valid coordinates. Please try again or enter address manually.');
          setIsLoadingLocation(false);
          setLocationStatus('error');
        }
      },
      (error) => {
        console.error('Geolocation error:', error.code, error.message);
        setIsLoadingLocation(false);
        setLocationStatus('error');
        
        let errorMessage = 'Unable to get your current location. ';
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage += 'Location information is unavailable.';
            break;
          case 3: // TIMEOUT
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'Please enter the address manually or click on the map.';
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );
  };

  const handleAddressChange = (e) => {
    const address = e?.target?.value;
    onLocationChange({
      ...location,
      address
    });

    // Debounced forward geocoding search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(address);
    }, 400);
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
          ref={inputRef}
          type="text"
          placeholder="Search for an address or click on the map below"
          value={location?.address || ''}
          onChange={handleAddressChange}
          onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
          className="w-full pl-10"
        />
        {isSearching ? (
          <Icon name="Loader" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
        ) : (
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        )}

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto"
          >
            {searchResults.map((result, index) => (
              <button
                key={result.place_id || index}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full text-left px-4 py-3 hover:bg-muted/70 transition-colors flex items-start gap-3 border-b border-border/50 last:border-b-0"
              >
                <Icon name="MapPin" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{result.display_name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{result.type?.replace(/_/g, ' ')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
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
            selectedLocation={location?.coordinates}
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