import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import MapContainer from './components/MapContainer';
import FilterPanel from './components/FilterPanel';
import SearchBar from './components/SearchBar';
import MapLegend from './components/MapLegend';
import MapStats from './components/MapStats';
import Icon from '../../components/AppIcon';

const MapView = () => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const [filters, setFilters] = useState({
    categories: [],
    statuses: [],
    priority: '',
    dateRange: 'all',
    minVotes: 0,
    showResolved: true
  });

  // Mock issues data
  const mockIssues = [
  {
    id: 1,
    title: "Pothole on Main Street causing traffic delays",
    description: "Large pothole near the intersection of Main St and 5th Ave is causing significant traffic delays and potential vehicle damage. Multiple residents have reported this issue.",
    category: "Infrastructure",
    status: "Open",
    priority: "high",
    votes: 23,
    comments: 8,
    location: { lat: 40.7128, lng: -74.0060 },
    address: "Main St & 5th Ave, New York, NY",
    reportedBy: "Sarah Johnson",
    reportedDate: "2025-11-08T10:30:00Z",
    image: "https://images.unsplash.com/photo-1728340964368-59c3192e44e6",
    imageAlt: "Large pothole in asphalt road with visible damage and debris"
  },
  {
    id: 2,
    title: "Broken streetlight creating safety hazard",
    description: "Streetlight at the corner of Oak Avenue has been non-functional for over a week, creating a safety concern for pedestrians during evening hours.",
    category: "Public Safety",
    status: "In Progress",
    priority: "medium",
    votes: 15,
    comments: 4,
    location: { lat: 40.7589, lng: -73.9851 },
    address: "Oak Avenue & 3rd Street, New York, NY",
    reportedBy: "Michael Chen",
    reportedDate: "2025-11-07T14:15:00Z",
    image: "https://images.unsplash.com/photo-1699028979799-72e40a73fdfd",
    imageAlt: "Dark street corner with non-functioning streetlight pole at night"
  },
  {
    id: 3,
    title: "Illegal dumping in Central Park area",
    description: "Construction debris and household waste have been illegally dumped near the park entrance, affecting the environment and park aesthetics.",
    category: "Environment",
    status: "Under Review",
    priority: "medium",
    votes: 31,
    comments: 12,
    location: { lat: 40.7829, lng: -73.9654 },
    address: "Central Park West Entrance, New York, NY",
    reportedBy: "Emily Rodriguez",
    reportedDate: "2025-11-06T09:45:00Z",
    image: "https://images.unsplash.com/photo-1686853301512-66ac40f1e3e5",
    imageAlt: "Pile of construction debris and household waste dumped near park entrance"
  },
  {
    id: 4,
    title: "Traffic signal malfunction at busy intersection",
    description: "Traffic light system at Broadway and 42nd Street is malfunctioning, causing confusion and potential accidents during rush hour.",
    category: "Transportation",
    status: "Open",
    priority: "high",
    votes: 45,
    comments: 18,
    location: { lat: 40.7580, lng: -73.9855 },
    address: "Broadway & 42nd Street, New York, NY",
    reportedBy: "David Park",
    reportedDate: "2025-11-09T16:20:00Z",
    image: "https://images.unsplash.com/photo-1567563549378-81212b9631e4",
    imageAlt: "Busy intersection with malfunctioning traffic lights and confused pedestrians"
  },
  {
    id: 5,
    title: "Graffiti vandalism on public building",
    description: "Extensive graffiti has appeared on the side of the public library building, requiring professional cleaning and restoration.",
    category: "Public Safety",
    status: "Resolved",
    priority: "low",
    votes: 8,
    comments: 3,
    location: { lat: 40.7614, lng: -73.9776 },
    address: "Public Library, 5th Avenue, New York, NY",
    reportedBy: "Lisa Thompson",
    reportedDate: "2025-11-05T11:30:00Z",
    image: "https://images.unsplash.com/photo-1545558477-860f4ce119a8",
    imageAlt: "Brick wall of public building covered with colorful graffiti tags"
  },
  {
    id: 6,
    title: "Sidewalk crack creating accessibility issues",
    description: "Large crack in sidewalk on Madison Avenue is making it difficult for wheelchair users and people with mobility aids to navigate safely.",
    category: "Infrastructure",
    status: "In Progress",
    priority: "medium",
    votes: 19,
    comments: 7,
    location: { lat: 40.7505, lng: -73.9934 },
    address: "Madison Avenue, New York, NY",
    reportedBy: "Robert Kim",
    reportedDate: "2025-11-08T13:45:00Z",
    image: "https://images.unsplash.com/photo-1498857228921-1140c960770c",
    imageAlt: "Cracked concrete sidewalk with visible gap creating accessibility barrier"
  },
  {
    id: 7,
    title: "Water main leak flooding street",
    description: "Underground water main has burst on Lexington Avenue, causing street flooding and potential water service disruption to nearby buildings.",
    category: "Utilities",
    status: "Open",
    priority: "high",
    votes: 67,
    comments: 25,
    location: { lat: 40.7549, lng: -73.9707 },
    address: "Lexington Avenue, New York, NY",
    reportedBy: "Maria Gonzalez",
    reportedDate: "2025-11-10T06:15:00Z",
    image: "https://images.unsplash.com/photo-1665905270352-37f4e1c008c4",
    imageAlt: "Street flooded with water from burst underground pipe with emergency barriers"
  },
  {
    id: 8,
    title: "Noise pollution from construction site",
    description: "Construction work starting before permitted hours is causing noise disturbance to residential area, violating city noise ordinances.",
    category: "Public Safety",
    status: "Under Review",
    priority: "low",
    votes: 12,
    comments: 6,
    location: { lat: 40.7282, lng: -74.0776 },
    address: "West Village Construction Site, New York, NY",
    reportedBy: "James Wilson",
    reportedDate: "2025-11-09T07:30:00Z",
    image: "https://images.unsplash.com/photo-1735158895758-41156f9d00c0",
    imageAlt: "Construction site with heavy machinery and workers in residential neighborhood"
  }];


  // Filter issues based on current filters
  const getFilteredIssues = () => {
    return mockIssues?.filter((issue) => {
      // Category filter
      if (filters?.categories?.length > 0 && !filters?.categories?.includes(issue?.category)) {
        return false;
      }

      // Status filter
      if (filters?.statuses?.length > 0 && !filters?.statuses?.includes(issue?.status)) {
        return false;
      }

      // Priority filter
      if (filters?.priority && issue?.priority !== filters?.priority) {
        return false;
      }

      // Votes filter
      if (issue?.votes < filters?.minVotes) {
        return false;
      }

      // Show resolved filter
      if (!filters?.showResolved && issue?.status === 'Resolved') {
        return false;
      }

      // Date range filter (simplified)
      const issueDate = new Date(issue.reportedDate);
      const now = new Date();

      switch (filters?.dateRange) {
        case 'today':
          return issueDate?.toDateString() === now?.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return issueDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return issueDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return issueDate >= quarterAgo;
        default:
          return true;
      }
    });
  };

  const filteredIssues = getFilteredIssues();

  const handleLocationSearch = (location) => {
    console.log('Searching for location:', location);
    // In a real app, this would update the map center and search for nearby issues
  };

  const handleIssueSearch = (query) => {
    const results = mockIssues?.filter((issue) =>
    issue?.title?.toLowerCase()?.includes(query?.toLowerCase()) ||
    issue?.description?.toLowerCase()?.includes(query?.toLowerCase())
    );
    setSearchResults(results);
    console.log('Issue search results:', results);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      statuses: [],
      priority: '',
      dateRange: 'all',
      minVotes: 0,
      showResolved: true
    });
  };

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 h-screen flex">
        {/* Main Map Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Controls Bar */}
          <div className="bg-surface border-b border-border p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <SearchBar
                  onLocationSearch={handleLocationSearch}
                  onIssueSearch={handleIssueSearch} />

              </div>

              {/* Filter Toggle & Stats */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 text-sm text-text-secondary">
                  <span>Showing {filteredIssues?.length} of {mockIssues?.length} issues</span>
                </div>
                
                <button
                  onClick={toggleFilterPanel}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border civic-transition ${
                  isFilterPanelOpen ?
                  'bg-primary text-primary-foreground border-primary' :
                  'bg-surface text-foreground border-border hover:bg-muted'}`
                  }>

                  <Icon name="Filter" size={16} />
                  <span className="hidden sm:inline">Filters</span>
                  {(filters?.categories?.length > 0 || filters?.statuses?.length > 0 || filters?.priority || filters?.dateRange !== 'all' || filters?.minVotes > 0) &&
                  <div className="w-2 h-2 bg-error rounded-full" />
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative">
            <MapContainer
              filteredIssues={filteredIssues}
              onIssueSelect={setSelectedIssue}
              selectedIssue={selectedIssue} />

            
            {/* Map Legend */}
            <MapLegend />
            
            {/* Map Stats - Desktop Only */}
            <div className="hidden xl:block absolute top-4 left-4 w-64">
              <MapStats
                totalIssues={mockIssues?.length}
                filteredIssues={filteredIssues}
                filters={filters} />

            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className={`${isFilterPanelOpen ? 'block' : 'hidden'} lg:block lg:w-80 flex-shrink-0`}>
          <FilterPanel
            isOpen={isFilterPanelOpen}
            onToggle={toggleFilterPanel}
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters} />

        </div>
      </div>
      {/* Mobile Stats Modal */}
      {isFilterPanelOpen &&
      <div className="xl:hidden fixed bottom-20 left-4 right-4 z-40">
          <MapStats
          totalIssues={mockIssues?.length}
          filteredIssues={filteredIssues}
          filters={filters} />

        </div>
      }
    </div>);

};

export default MapView;