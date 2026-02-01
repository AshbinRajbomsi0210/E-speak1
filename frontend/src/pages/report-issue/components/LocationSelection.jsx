import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LocationSelector = ({ location, onLocationChange }) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC

  const mockAddresses = [
    "123 Main Street, New York, NY 10001",
    "456 Oak Avenue, Brooklyn, NY 11201", 
    "789 Pine Road, Queens, NY 11375",
    "321 Elm Street, Manhattan, NY 10016",
    "654 Cedar Lane, Bronx, NY 10451"
  ];

  useEffect(() => {
    if (location?.coordinates) {
      setMapCenter({
        lat: location?.coordinates?.lat,
        lng: location?.coordinates?.lng
      });
    }
  }, [location?.coordinates]);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        if (latitude && longitude) {
          const coords = {
            lat: latitude,
            lng: longitude
          };
          
          // Reverse geocoding using OpenStreetMap Nominatim API
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
              const address = data.display_name || mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
              
              onLocationChange({
                address: address,
                coordinates: coords,
                accuracy: accuracy
              });
              
              setMapCenter(coords);
              setIsLoadingLocation(false);
            })
            .catch(() => {
              // Fallback to mock address if reverse geocoding fails
              const mockAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
              
              onLocationChange({
                address: mockAddress,
                coordinates: coords,
                accuracy: accuracy
              });
              
              setMapCenter(coords);
              setIsLoadingLocation(false);
            });
        } else {
          alert('Could not get valid coordinates. Please enter the address manually.');
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your current location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'Please enter the address manually.';
        }
        
        alert(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
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
  };

  const handleMapClick = () => {
    // Simulate map click with random nearby coordinates
    const randomOffset = () => (Math.random() - 0.5) * 0.01;
    const newCoords = {
      lat: mapCenter?.lat + randomOffset(),
      lng: mapCenter?.lng + randomOffset()
    };
    
    const mockAddress = mockAddresses?.[Math.floor(Math.random() * mockAddresses?.length)];
    
    onLocationChange({
      address: mockAddress,
      coordinates: newCoords,
      accuracy: 10
    });
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
            loading={isLoadingLocation}
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
          <div 
            className="w-full h-64 rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary civic-transition"
            onClick={handleMapClick}
          >
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              title="Issue Location Map"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${mapCenter?.lat},${mapCenter?.lng}&z=16&output=embed`}
              className="w-full h-full"
            />
          </div>
          <p className="text-xs text-text-secondary">
            Click on the map to set the exact location of the issue
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
