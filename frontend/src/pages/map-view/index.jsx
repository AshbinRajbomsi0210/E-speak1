import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import MapContainer from './components/MapContainer';
import FilterPanel from './components/FilterPanel';
import SearchBar from './components/SearchBar';
import MapLegend from './components/MapLegend';
import MapStats from './components/MapStats';
import Icon from '../../components/AppIcon';

const MapView = () => {
  const [searchParams] = useSearchParams();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allIssues, setAllIssues] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialCenter, setInitialCenter] = useState(null);

  const [filters, setFilters] = useState({
    categories: [],
    statuses: [],
    priority: '',
    dateRange: 'all',
    minVotes: 0,
    showResolved: true
  });

  // Fetch issues ONCE on mount - NOT on filter change
  useEffect(() => {
    fetchIssues();
  }, []); // Empty dependency array

  // Handle URL parameters to select specific issue from authority dashboard
  useEffect(() => {
    if (allIssues.length > 0) {
      const issueId = searchParams.get('issue');
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      
      if (issueId) {
        // Find the issue and select it
        const issue = allIssues.find(i => i.id === parseInt(issueId));
        if (issue) {
          setSelectedIssue(issue);
        }
      }
      
      if (lat && lng) {
        // Set initial center for map
        setInitialCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
      }
    }
  }, [allIssues, searchParams]);

  // Apply filters whenever filters or allIssues change
  useEffect(() => {
    if (allIssues.length > 0) {
      const filtered = applyClientSideFilters(allIssues);
      setIssues(filtered);
      
      // If there's an active search, reapply filters to search results
      if (searchQuery) {
        const searchFiltered = applyClientSideFilters(searchResults);
        setSearchResults(searchFiltered);
      }
    }
  }, [filters, allIssues]);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/issues/list/`);
      const data = await response.json();
      
      if (data.success) {
        const transformedIssues = data.data
          .filter(issue => issue.latitude && issue.longitude)
          .map(issue => {
            const normalizeStatus = (status) => {
              const statusMap = {
                'Submitted': 'Open',
                'In Discussion': 'Under Review',
                'Under Review': 'Under Review',
                'In Progress': 'In Progress',
                'Resolved': 'Resolved',
                'Closed': 'Resolved',
                'pending': 'Open',
                'in-progress': 'In Progress',
                'resolved': 'Resolved'
              };
              return statusMap[status] || status || 'Open';
            };

            const normalizePriority = (priority) => {
              if (!priority) return 'medium';
              const p = priority.toLowerCase();
              if (p === 'urgent') return 'high';
              return p;
            };

            const normalizeCategory = (category) => {
              if (!category) return 'Other';
              
              // Clean the category: remove spaces, hyphens, underscores and convert to lowercase
              const cleaned = category.toLowerCase().trim().replace(/[\s_-]/g, '');
              
              const categoryMap = {
                'infrastructure': 'Infrastructure',
                'publicsafety': 'Public Safety',
                'environment': 'Environment',
                'transportation': 'Transportation',
                'utilities': 'Utilities',
                'utility': 'Utilities'
              };
              
              return categoryMap[cleaned] || category.trim();
            };

            return {
              id: issue.id,
              title: issue.title,
              description: issue.description,
              category: normalizeCategory(issue.category),
              status: normalizeStatus(issue.status),
              priority: normalizePriority(issue.priority),
              votes: issue.upvotes || 0,
              comments: 0,
              location: { 
                lat: parseFloat(issue.latitude), 
                lng: parseFloat(issue.longitude) 
              },
              address: issue.address,
              reportedBy: issue.displayName || issue.reporterName || 'Anonymous',
              reportedDate: issue.created_at,
              images: issue.photos?.map(p => p.image) || []
            };
          });
        
        console.log('Loaded issues:', transformedIssues.length);
        console.log('Sample categories:', transformedIssues.slice(0, 5).map(i => ({
          title: i.title,
          category: i.category
        })));
        
        setAllIssues(transformedIssues);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setAllIssues([]);
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyClientSideFilters = (issuesList) => {
    try {
      console.log('=== START FILTERING ===');
      console.log('Issues to filter:', issuesList?.length || 0);
      
      if (!issuesList || issuesList.length === 0) {
        console.log('NO ISSUES!');
        return [];
      }
      
      console.log('Selected categories:', filters?.categories);
      console.log('All categories in data:', [...new Set(issuesList.map(i => i.category))]);
      
      const filtered = issuesList.filter((issue) => {
        // Category filter
        if (filters.categories && filters.categories.length > 0) {
          const match = filters.categories.includes(issue.category);
          if (match) {
            console.log('✓ FOUND:', issue.title, 'is', issue.category);
          }
          return match;
        }
      
      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(issue.status)) {
        return false;
      }
      
      // Priority filter
      if (filters.priority && issue.priority !== filters.priority) {
        return false;
      }
      
      // Minimum votes filter
      if (filters.minVotes > 0 && issue.votes < filters.minVotes) {
        return false;
      }
      
      // Show resolved filter
      if (!filters.showResolved && issue.status === 'Resolved') {
        return false;
      }

      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const issueDate = new Date(issue.reportedDate);
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            return issueDate.toDateString() === now.toDateString();
          case 'week':
            return issueDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month':
            return issueDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          case 'quarter':
            return issueDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      }
      
      return true;
    });
    
    console.log('Filtered count:', filtered.length);
    console.log('=== END FILTERING ===');
    return filtered;
    
    } catch (error) {
      console.error('FILTER ERROR:', error);
      return issuesList;
    }
  };

  const filteredIssues = searchQuery ? searchResults : issues;

  const handleLocationSearch = (location) => {
    if (!location) {
      setSearchQuery('');
      setSearchResults([]);
      return;
    }
    
    setSearchQuery(location);
    const results = allIssues.filter((issue) =>
      issue.address?.toLowerCase().includes(location.toLowerCase())
    );
    setSearchResults(applyClientSideFilters(results));
  };

  const handleIssueSearch = (query) => {
    if (!query) {
      setSearchQuery('');
      setSearchResults([]);
      return;
    }
    
    setSearchQuery(query);
    const results = allIssues.filter((issue) =>
      issue.title?.toLowerCase().includes(query.toLowerCase()) ||
      issue.description?.toLowerCase().includes(query.toLowerCase()) ||
      issue.category?.toLowerCase().includes(query.toLowerCase()) ||
      issue.address?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(applyClientSideFilters(results));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
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
        <div className="flex-1 flex flex-col">
          <div className="bg-surface border-b border-border p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <SearchBar
                  onLocationSearch={handleLocationSearch}
                  onIssueSearch={handleIssueSearch}
                  onClearSearch={handleClearSearch}
                  allIssues={allIssues}
                  hasActiveSearch={!!searchQuery}
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 text-sm text-text-secondary">
                  <span>Showing {filteredIssues.length} {searchQuery ? 'results' : 'issues'}</span>
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="ml-2 text-xs text-primary hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
                
                <button
                  onClick={toggleFilterPanel}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border civic-transition ${
                    isFilterPanelOpen
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-surface text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <Icon name="Filter" size={16} />
                  <span className="hidden sm:inline">Filters</span>
                  {(filters?.categories?.length > 0 || 
                    filters?.statuses?.length > 0 || 
                    filters?.priority || 
                    filters?.dateRange !== 'all' || 
                    filters?.minVotes > 0 ||
                    !filters?.showResolved) && (
                    <div className="w-2 h-2 bg-error rounded-full" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <MapContainer
              filteredIssues={filteredIssues}
              onIssueSelect={setSelectedIssue}
              selectedIssue={selectedIssue}
              initialCenter={initialCenter}
            />
            
            <MapLegend />
            
            <div className="hidden xl:block absolute top-4 left-4 w-64">
              <MapStats
                totalIssues={issues.length}
                filteredIssues={filteredIssues}
                filters={filters}
              />
            </div>
          </div>
        </div>

        <div className={`${isFilterPanelOpen ? 'block' : 'hidden'} lg:block lg:w-80 flex-shrink-0`}>
          <FilterPanel
            isOpen={isFilterPanelOpen}
            onToggle={toggleFilterPanel}
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {isFilterPanelOpen && (
        <div className="xl:hidden fixed bottom-20 left-4 right-4 z-40">
          <MapStats
            totalIssues={issues.length}
            filteredIssues={filteredIssues}
            filters={filters}
          />
        </div>
      )}
    </div>
  );
};

export default MapView;