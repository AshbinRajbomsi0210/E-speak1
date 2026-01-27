import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from './AppIcon';

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const InteractiveMap = ({ 
  issues, 
  center = { lat: 27.7172, lng: 85.3240 }, 
  zoom = 12, 
  onIssueClick,
  selectedIssue,
  onClick,
  height = '100%',
  showControls = true,
  clickable = false,
  selectedLocation = null
}) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const selectedMarkerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance) return;

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: showControls,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
      touchZoom: true,
      preferCanvas: true // Use canvas for better performance
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add click handler for map
    if (clickable && onClick) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onClick({ lat, lng });
      });
    }

    setMapInstance(map);

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []); // Empty dependency array to run only once

  // Update map center and zoom when props change
  useEffect(() => {
    if (mapInstance && center) {
      mapInstance.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, mapInstance]);

  // Show marker for selected location (when clicking on map for location selection)
  useEffect(() => {
    if (!mapInstance) return;

    // Remove existing selected location marker
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    // Add new marker if selectedLocation is provided
    if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      const selectedIcon = L.divIcon({
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          ">
            <div style="
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 40px;
              height: 40px;
            ">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>
                <circle cx="12" cy="8" r="3" fill="#fff"/>
              </svg>
            </div>
            <div style="
              position: absolute;
              bottom: -8px;
              left: 50%;
              transform: translateX(-50%);
              width: 12px;
              height: 12px;
              background: rgba(239, 68, 68, 0.3);
              border-radius: 50%;
              animation: pulse 1.5s ease-out infinite;
            "></div>
          </div>
        `,
        className: 'selected-location-marker',
        iconSize: [40, 48],
        iconAnchor: [20, 40],
      });

      selectedMarkerRef.current = L.marker(
        [selectedLocation.lat, selectedLocation.lng],
        { icon: selectedIcon }
      ).addTo(mapInstance);
    }

    return () => {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove();
        selectedMarkerRef.current = null;
      }
    };
  }, [selectedLocation, mapInstance]);

  // Add/update markers when issues change
  useEffect(() => {
    if (!mapInstance || !issues) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (issues.length === 0) return;

    // Create custom icon function
    const createCustomIcon = (issue) => {
      const color = 
        issue.priority === 'high' ? '#ef4444' :
        issue.priority === 'medium' ? '#f59e0b' : '#22c55e';
      
      const iconHtml = `
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: ${color};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
          ${selectedIssue?.id === issue.id ? 'transform: scale(1.2); box-shadow: 0 4px 12px rgba(0,0,0,0.4);' : ''}
        " class="custom-marker">
          <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
            ${getCategoryIcon(issue.category)}
          </svg>
          ${issue.votes > 20 ? `
            <div style="
              position: absolute;
              top: -4px;
              right: -4px;
              background: #3b82f6;
              color: white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">${issue.votes}</div>
          ` : ''}
        </div>
      `;

      return L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });
    };

    // Add markers for each issue
    issues.forEach(issue => {
      const marker = L.marker(
        [issue.location.lat, issue.location.lng],
        { icon: createCustomIcon(issue) }
      ).addTo(mapInstance);

      // Add popup
      const popupContent = `
        <div style="min-width: 250px; max-width: 300px;">
          <h3 style="font-weight: 600; margin-bottom: 8px; color: #1f2937; font-size: 14px;">${issue.title}</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;">
            <span style="
              background: ${getCategoryColor(issue.category)}; 
              color: white; 
              padding: 3px 10px; 
              border-radius: 9999px; 
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
            ">${issue.category}</span>
            <span style="
              background: ${getStatusColor(issue.status)}; 
              color: white; 
              padding: 3px 10px; 
              border-radius: 9999px; 
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
            ">${issue.status}</span>
            ${issue.priority ? `
              <span style="
                background: ${issue.priority === 'high' || issue.priority === 'urgent' ? '#ef4444' : issue.priority === 'medium' ? '#f59e0b' : '#22c55e'};
                color: white;
                padding: 3px 10px;
                border-radius: 9999px;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
              ">${issue.priority}</span>
            ` : ''}
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-bottom: 10px; line-height: 1.5;">
            ${issue.description.substring(0, 120)}${issue.description.length > 120 ? '...' : ''}
          </p>
          ${issue.address ? `
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; color: #6b7280; font-size: 11px;">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span style="flex: 1;">${issue.address}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; gap: 12px; color: #6b7280; font-size: 11px;">
              <span style="display: flex; align-items: center; gap: 4px;">👍 <strong>${issue.votes}</strong></span>
              <span style="display: flex; align-items: center; gap: 4px;">💬 <strong>${issue.comments}</strong></span>
            </div>
            ${issue.reportedBy ? `
              <span style="color: #9ca3af; font-size: 10px;">by ${issue.reportedBy}</span>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      // Add click handler
      if (onIssueClick) {
        marker.on('click', () => {
          onIssueClick(issue);
        });
      }

      markersRef.current.push(marker);
    });

  }, [issues, mapInstance, selectedIssue, onIssueClick]);

  const getCategoryIcon = (category) => {
    const icons = {
      'Infrastructure': '<path d="M11 4a4 4 0 0 1 4 4v2h2a2 2 0 0 1 2 2v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a2 2 0 0 1 2-2h2V8a4 4 0 0 1 4-4z"/><path d="M9 15h6M12 15v5"/>',
      'Public Safety': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      'Environment': '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><path d="M16 8L2 22"/><path d="M17 3l5 5"/>',
      'Transportation': '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/>',
      'Utilities': '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>'
    };
    return icons[category] || '<circle cx="12" cy="12" r="10"/>';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Infrastructure': '#3b82f6',
      'Public Safety': '#ef4444',
      'Environment': '#22c55e',
      'Transportation': '#f59e0b',
      'Utilities': '#8b5cf6'
    };
    return colors[category] || '#6b7280';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': '#f59e0b',
      'Submitted': '#f59e0b',
      'pending': '#f59e0b',
      'In Progress': '#3b82f6',
      'in-progress': '#3b82f6',
      'Under Review': '#8b5cf6',
      'In Discussion': '#8b5cf6',
      'Resolved': '#22c55e',
      'resolved': '#22c55e',
      'Closed': '#22c55e'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div style={{ width: '100%', height: height, position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
      
      {/* Custom style for map */}
      <style>{`
        .leaflet-container {
          z-index: 1 !important;
        }
        .leaflet-pane {
          z-index: auto !important;
        }
        .leaflet-map-pane {
          z-index: 1 !important;
        }
        .leaflet-tile-pane {
          z-index: 1 !important;
        }
        .leaflet-overlay-pane {
          z-index: 2 !important;
        }
        .leaflet-shadow-pane {
          z-index: 3 !important;
        }
        .leaflet-marker-pane {
          z-index: 4 !important;
        }
        .leaflet-tooltip-pane {
          z-index: 5 !important;
        }
        .leaflet-popup-pane {
          z-index: 6 !important;
        }
        .leaflet-control {
          z-index: 10 !important;
        }
        .custom-leaflet-marker {
          background: none;
          border: none;
        }
        .custom-marker:hover {
          transform: scale(1.1);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 12px;
        }
        .custom-popup .leaflet-popup-close-button {
          font-size: 20px;
          padding: 4px 8px;
        }
        .selected-location-marker {
          background: none !important;
          border: none !important;
        }
        @keyframes pulse {
          0% {
            transform: translateX(-50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) scale(3);
            opacity: 0;
          }
        }
      `}</style>
      
      {clickable && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '12px',
          color: '#6b7280',
          zIndex: 20
        }}>
          Click anywhere on the map to set location
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
