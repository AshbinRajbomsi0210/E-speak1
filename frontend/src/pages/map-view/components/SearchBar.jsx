import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SearchBar = ({ onLocationSearch, onIssueSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('location'); // 'location' or 'issue'
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Mock location suggestions
  const locationSuggestions = [
    "Central Park, New York",
    "Times Square, New York", 
    "Brooklyn Bridge, New York",
    "Manhattan, New York",
    "Queens, New York",
    "Bronx, New York"
  ];

  // Mock issue search suggestions
  const issueSuggestions = [
    "Pothole on Main Street",
    "Broken streetlight",
    "Graffiti removal needed",
    "Traffic signal malfunction",
    "Sidewalk repair",
    "Noise complaint"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const query = e?.target?.value;
    setSearchQuery(query);

    if (query?.length > 0) {
      const currentSuggestions = searchType === 'location' ? locationSuggestions : issueSuggestions;
      const filtered = currentSuggestions?.filter(item =>
        item?.toLowerCase()?.includes(query?.toLowerCase())
      );
      setSuggestions(filtered?.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    
    if (searchType === 'location') {
      onLocationSearch(suggestion);
    } else {
      onIssueSearch(suggestion);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      if (searchType === 'location') {
        onLocationSearch(searchQuery);
      } else {
        onIssueSearch(searchQuery);
      }
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        {/* Search Type Toggle */}
        <div className="flex mb-2">
          <button
            type="button"
            onClick={() => setSearchType('location')}
            className={`px-3 py-1 text-xs font-medium rounded-l-md border ${
              searchType === 'location' ?'bg-primary text-primary-foreground border-primary' :'bg-surface text-text-secondary border-border hover:bg-muted'
            } civic-transition`}
          >
            <Icon name="MapPin" size={12} className="mr-1" />
            Location
          </button>
          <button
            type="button"
            onClick={() => setSearchType('issue')}
            className={`px-3 py-1 text-xs font-medium rounded-r-md border-t border-r border-b ${
              searchType === 'issue' ?'bg-primary text-primary-foreground border-primary' :'bg-surface text-text-secondary border-border hover:bg-muted'
            } civic-transition`}
          >
            <Icon name="Search" size={12} className="mr-1" />
            Issues
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon 
              name={searchType === 'location' ? 'MapPin' : 'Search'} 
              size={16} 
              className="text-text-secondary" 
            />
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => suggestions?.length > 0 && setShowSuggestions(true)}
            placeholder={
              searchType === 'location' ?'Search locations...' :'Search issues...'
            }
            className="w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent civic-transition"
          />
          
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-foreground civic-transition"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      </form>
      {/* Search Suggestions */}
      {showSuggestions && suggestions?.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions?.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted civic-transition flex items-center space-x-2"
            >
              <Icon 
                name={searchType === 'location' ? 'MapPin' : 'Search'} 
                size={14} 
                className="text-text-secondary flex-shrink-0" 
              />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;