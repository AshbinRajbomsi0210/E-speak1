import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import IssueCard from './components/IssueCard';
import FilterControls from './components/FilterControls';
import IssueStats from './components/IssueStats';
import LoadingCard from './components/LoadingCard';
import EmptyState from './components/EmptyState';

const Issues = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Mock data for issues
  const mockIssues = [
  {
    id: 1,
    title: "Broken streetlight on Main Street causing safety concerns",
    description: "The streetlight at the intersection of Main Street and Oak Avenue has been out for over a week. This creates a dangerous situation for pedestrians and drivers, especially during evening hours when visibility is poor.",
    category: "Infrastructure",
    status: "Under Review",
    priority: "High",
    location: "Main Street & Oak Avenue",
    image: "https://images.unsplash.com/photo-1706999924865-629affa7b28f",
    imageAlt: "Dark street intersection with broken streetlight at night showing poor visibility",
    votes: 47,
    comments: 12,
    hasVoted: true,
    timeAgo: "3 days ago",
    reporter: {
      name: "Sarah Johnson",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1ae7d9bdc-1762274136565.png",
      avatarAlt: "Professional headshot of woman with brown hair in white blouse smiling at camera"
    },
    createdAt: new Date('2025-11-07')
  },
  {
    id: 2,
    title: "Potholes on Elm Street need immediate repair",
    description: "Multiple large potholes have formed on Elm Street between 2nd and 5th Avenue. These are causing damage to vehicles and creating hazardous driving conditions during both day and night.",
    category: "Infrastructure",
    status: "In Discussion",
    priority: "Medium",
    location: "Elm Street (2nd-5th Ave)",
    image: "https://images.unsplash.com/photo-1728340964368-59c3192e44e6",
    imageAlt: "Large pothole in asphalt road surface with visible damage and debris",
    votes: 32,
    comments: 8,
    hasVoted: false,
    timeAgo: "5 days ago",
    reporter: {
      name: "Michael Chen",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_129d823fe-1762249053422.png",
      avatarAlt: "Professional headshot of Asian man with glasses in navy blue shirt"
    },
    createdAt: new Date('2025-11-05')
  },
  {
    id: 3,
    title: "Illegal dumping in Riverside Park affecting wildlife",
    description: "Construction debris and household waste have been illegally dumped near the river in Riverside Park. This is harming local wildlife and polluting the water source that many animals depend on.",
    category: "Environment",
    status: "Adopted",
    priority: "High",
    location: "Riverside Park, North Trail",
    image: "https://images.unsplash.com/photo-1686853301512-66ac40f1e3e5",
    imageAlt: "Pile of construction debris and trash dumped in natural park setting near water",
    votes: 89,
    comments: 23,
    hasVoted: true,
    timeAgo: "1 week ago",
    reporter: {
      name: "Emily Rodriguez",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1beb9fc75-1762273370028.png",
      avatarAlt: "Professional headshot of Hispanic woman with long dark hair in green blouse"
    },
    createdAt: new Date('2025-11-03')
  },
  {
    id: 4,
    title: "Bus stop shelter damaged and needs replacement",
    description: "The bus shelter at the corner of Pine Street has broken glass panels and a damaged roof. Commuters are exposed to weather conditions while waiting for public transportation.",
    category: "Transportation",
    status: "Resolved",
    priority: "Medium",
    location: "Pine Street Bus Stop #47",
    image: "https://images.unsplash.com/photo-1704392354269-42ad41f15398",
    imageAlt: "Damaged bus shelter with broken glass panels and people waiting in rain",
    votes: 28,
    comments: 6,
    hasVoted: false,
    timeAgo: "2 weeks ago",
    reporter: {
      name: "David Thompson",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14c9d469d-1762249131541.png",
      avatarAlt: "Professional headshot of Caucasian man with beard in dark blue suit jacket"
    },
    createdAt: new Date('2025-10-27')
  },
  {
    id: 5,
    title: "Playground equipment safety inspection needed",
    description: "Several pieces of playground equipment at Central Park show signs of wear and potential safety hazards. The swing set chains are rusted and the slide has sharp edges that could injure children.",
    category: "Public Safety",
    status: "Under Review",
    priority: "High",
    location: "Central Park Playground",
    image: "https://images.unsplash.com/photo-1591729982144-318ad4370809",
    imageAlt: "Old playground equipment with rusted swing chains and worn slide in park setting",
    votes: 56,
    comments: 15,
    hasVoted: true,
    timeAgo: "4 days ago",
    reporter: {
      name: "Lisa Park",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b2720bf6-1762273579122.png",
      avatarAlt: "Professional headshot of Asian woman with short black hair in light blue shirt"
    },
    createdAt: new Date('2025-11-06')
  },
  {
    id: 6,
    title: "Noise pollution from construction site exceeding limits",
    description: "The construction site on Broadway is operating heavy machinery before 7 AM and after 6 PM, violating city noise ordinances and disturbing residents in the surrounding neighborhood.",
    category: "Public Safety",
    status: "In Discussion",
    priority: "Medium",
    location: "Broadway Construction Site",
    image: "https://images.unsplash.com/photo-1724042302560-a300d22aea08",
    imageAlt: "Construction site with heavy machinery and workers during early morning hours",
    votes: 41,
    comments: 19,
    hasVoted: false,
    timeAgo: "6 days ago",
    reporter: {
      name: "Robert Wilson",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13733d06f-1762274568462.png",
      avatarAlt: "Professional headshot of African American man in white dress shirt and tie"
    },
    createdAt: new Date('2025-11-04')
  }];


  // Calculate stats
  const stats = useMemo(() => {
    const total = mockIssues?.length;
    const inDiscussion = mockIssues?.filter((issue) => issue?.status === 'In Discussion')?.length;
    const underReview = mockIssues?.filter((issue) => issue?.status === 'Under Review')?.length;
    const resolved = mockIssues?.filter((issue) => issue?.status === 'Resolved')?.length;

    return { total, inDiscussion, underReview, resolved };
  }, [mockIssues]);

  // Filter and sort issues
  const filteredIssues = useMemo(() => {
    let filtered = mockIssues?.filter((issue) => {
      const matchesSearch = searchQuery === '' ||
      issue?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      issue?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      issue?.location?.toLowerCase()?.includes(searchQuery?.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || issue?.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || issue?.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || issue?.priority === selectedPriority;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });

    // Sort issues
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'most-voted':
          return b?.votes - a?.votes;
        case 'most-commented':
          return b?.comments - a?.comments;
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder?.[b?.priority] - priorityOrder?.[a?.priority];
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [mockIssues, searchQuery, selectedCategory, selectedStatus, selectedPriority, sortBy]);

  const hasActiveFilters = selectedCategory !== 'all' ||
  selectedStatus !== 'all' ||
  selectedPriority !== 'all' ||
  searchQuery?.length > 0;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleVote = (issueId) => {
    console.log('Voting on issue:', issueId);
    // In a real app, this would make an API call
  };

  const handleComment = (issueId) => {
    console.log('Commenting on issue:', issueId);
    // In a real app, this would navigate to issue detail or open comment modal
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
                Showing {filteredIssues?.length} of {mockIssues?.length} issues
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
