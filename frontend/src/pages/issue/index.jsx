import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import IssueCard from './components/IssueCard';
import FilterControls from './components/FilterControls';
import IssueStats from './components/IssueStats';
import LoadingCard from './components/LoadingCard';
import EmptyState from './components/EmptyState';

const Issues = () => {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Fetch issues from backend
  useEffect(() => {
    fetchIssues();
  }, [selectedCategory, selectedStatus, selectedPriority, searchQuery, sortBy]);

  // Check user votes after issues are loaded
  useEffect(() => {
    if (isSignedIn && user?.emailAddresses?.[0]?.emailAddress && issues.length > 0) {
      checkUserVotes();
    }
  }, [isSignedIn, user, issues.length]);

  const checkUserVotes = async () => {
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    if (!userEmail) return;

    try {
      const voteChecks = issues.map(issue => 
        fetch(`http://127.0.0.1:8000/api/issues/${issue.id}/check-upvote/?voter_email=${encodeURIComponent(userEmail)}`)
          .then(res => res.json())
          .then(data => ({ issueId: issue.id, hasVoted: data.data?.has_voted || false }))
          .catch(() => ({ issueId: issue.id, hasVoted: false }))
      );

      const results = await Promise.all(voteChecks);
      
      setIssues(prev => prev.map(issue => {
        const voteStatus = results.find(r => r.issueId === issue.id);
        return voteStatus ? { ...issue, hasVoted: voteStatus.hasVoted } : issue;
      }));
    } catch (error) {
      console.error('Error checking votes:', error);
    }
  };

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedPriority !== 'all') params.append('priority', selectedPriority);
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sort', sortBy);

      const response = await fetch(`http://127.0.0.1:8000/api/issues/list/?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        // Transform backend data to match frontend format
        const transformedIssues = data.data.map(issue => ({
          id: issue.id,
          reportId: issue.report_id,
          title: issue.title,
          description: issue.description,
          category: issue.category,
          status: issue.status,
          priority: issue.priority,
          location: issue.address,
          latitude: issue.latitude,
          longitude: issue.longitude,
          images: issue.photos?.map(p => p.image) || [],
          votes: issue.upvotes || 0,
          comments: 0, // Will be implemented with comments system
          hasVoted: false, // Will check on mount
          timeAgo: getTimeAgo(new Date(issue.created_at)),
          reporter: {
            name: issue.reporterName || 'Anonymous',
            avatar: null,
            avatarAlt: ''
          },
          createdAt: new Date(issue.created_at)
        }));
        setIssues(transformedIssues);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    return 'just now';
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = issues?.length;
    const inDiscussion = issues?.filter((issue) => issue?.status === 'In Discussion')?.length;
    const underReview = issues?.filter((issue) => issue?.status === 'Under Review')?.length;
    const resolved = issues?.filter((issue) => issue?.status === 'Resolved')?.length;

    return { total, inDiscussion, underReview, resolved };
  }, [issues]);

  // Filter issues (already filtered by backend, but keep for local search)
  const filteredIssues = useMemo(() => {
    return issues;
  }, [issues]);

  const hasActiveFilters = selectedCategory !== 'all' ||
  selectedStatus !== 'all' ||
  selectedPriority !== 'all' ||
  searchQuery?.length > 0;

  const handleVote = async (issueId) => {
    if (!authenticated) {
      navigate('/login', { state: { from: '/issues' } });
      return;
    }

    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    try {
      const endpoint = issue.hasVoted 
        ? `http://127.0.0.1:8000/api/issues/${issueId}/remove-upvote/`
        : `http://127.0.0.1:8000/api/issues/${issueId}/upvote/`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voter_email: user?.email })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setIssues(prev => prev.map(item => 
          item.id === issueId
            ? { ...item, votes: data.data.upvotes, hasVoted: !item.hasVoted }
            : item
        ));
      } else {
        alert(data.message || 'Failed to update vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error updating vote');
    }
  };

  const handleComment = (issueId) => {
    console.log('Commenting on issue:', issueId);
    // Will be implemented with comments system
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSortBy('newest');
  };

  const toggleFilters = () => {
    setIsFiltersExpanded(!isFiltersExpanded);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Community Issues
              </h1>
              <p className="text-text-secondary">
                Browse and engage with issues reported by your community
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <Button variant="outline" asChild>
                <Link to="/map-view">
                  <Icon name="Map" size={16} />
                  <span className="ml-2">Map View</span>
                </Link>
              </Button>
              
              <Button variant="default" asChild>
                <Link to="/report-issue">
                  <Icon name="Plus" size={16} />
                  <span className="ml-2">Report Issue</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <IssueStats stats={stats} />

          {/* Filter Controls */}
          <FilterControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedPriority={selectedPriority}
            onPriorityChange={setSelectedPriority}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
            isFiltersExpanded={isFiltersExpanded}
            onToggleFilters={toggleFilters} />


          {/* Results Count */}
          {!isLoading &&
          <div className="flex items-center justify-between py-4">
              <p className="text-sm text-text-secondary">
                Showing {filteredIssues?.length} issues
              </p>
              
              {hasActiveFilters &&
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-text-secondary hover:text-foreground">

                  <Icon name="X" size={14} />
                  <span className="ml-1">Clear filters</span>
                </Button>
            }
            </div>
          }

          {/* Issues Grid */}
          <div className="space-y-6">
            {isLoading ?
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(6)]?.map((_, index) =>
              <LoadingCard key={index} />
              )}
              </div> :
            filteredIssues?.length > 0 ?
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredIssues?.map((issue) =>
              <IssueCard
                key={issue?.id}
                issue={issue}
                onVote={handleVote}
                onComment={handleComment} />

              )}
              </div> :

            <EmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters} />

            }
          </div>

          {/* Load More Button (for pagination) */}
          {!isLoading && filteredIssues?.length > 0 && filteredIssues?.length >= 10 &&
          <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                <Icon name="ChevronDown" size={16} />
                <span className="ml-2">Load More Issues</span>
              </Button>
            </div>
          }
        </div>
      </main>
    </div>);

};

export default Issues;
