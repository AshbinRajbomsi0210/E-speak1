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
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch issues from backend
  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/issues/list/`);
      const data = await response.json();
      
      if (data.success) {
        const transformedIssues = data.data
          .filter(issue => issue.latitude && issue.longitude)
          .map(issue => ({
            id: issue.id,
            title: issue.title,
            description: issue.description,
            category: issue.category,
            status: issue.status,
            priority: issue.priority?.toLowerCase(),
            votes: 0,
            comments: 0,
            location: { 
              lat: parseFloat(issue.latitude), 
              lng: parseFloat(issue.longitude) 
            },
            address: issue.address,
            reportedBy: issue.reporterName || 'Anonymous',
            reportedDate: issue.created_at,
            images: issue.photos?.map(p => p.image) || []
          }));
        
        setIssues(applyClientSideFilters(transformedIssues));
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyClientSideFilters = (issuesList) => {
    return issuesList.filter((issue) => {
      if (filters.categories.length > 0 && !filters.categories.includes(issue.category)) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(issue.status)) return false;
      if (filters.priority && issue.priority !== filters.priority) return false;
      if (issue.votes < filters.minVotes) return false;
      if (!filters.showResolved && issue.status === 'Resolved') return false;

      const issueDate = new Date(issue.reportedDate);
      const now = new Date();
      switch (filters.dateRange) {
        case 'today': return issueDate.toDateString() === now.toDateString();
        case 'week': return issueDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'month': return issueDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'quarter': return issueDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        default: return true;
      }
    });
  };

  const filteredIssues = issues;

  const handleLocationSearch = (location) => {
    console.log('Searching for location:', location);
    // In a real app, this would update the map center and search for nearby issues
  };

  const handleIssueSearch = (query) => {
    const results = issues.filter((issue) =>
      issue.title?.toLowerCase().includes(query.toLowerCase()) ||
      issue.description?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
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
                  <span>Showing {filteredIssues.length} issues</span>
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
                totalIssues={issues.length}
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
          totalIssues={issues.length}
          filteredIssues={filteredIssues}
          filters={filters} />

        </div>
      }
    </div>);

};

export default MapView;