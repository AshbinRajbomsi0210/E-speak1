import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import PollCard from './components/PollCard';
import LeaderboardCard from './components/LeaderboardCard';
import ActivityFeed from './components/ActivityFeed';
import CreatePollModal from './components/CreatePollModal';
import DiscussionThread from './components/DiscussionThread';
import UserProgress from './components/UserProgress';

const Community = () => {
  const [activeTab, setActiveTab] = useState('polls');
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [polls, setPolls] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data
  const mockPolls = [
  {
    id: 1,
    title: "Should we install more bike lanes on Main Street?",
    description: "The city is considering adding dedicated bike lanes to improve cycling safety and reduce traffic congestion. This would require removing some parking spaces.",
    options: [
    { text: "Yes, install bike lanes", votes: 156 },
    { text: "No, keep parking spaces", votes: 89 },
    { text: "Install partial bike lanes", votes: 67 },
    { text: "Need more information", votes: 23 }],

    status: "active",
    category: "transportation",
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)?.toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)?.toISOString(),
    commentsCount: 42,
    hasUserVoted: false
  },
  {
    id: 2,
    title: "Community Garden Location Selection",
    description: "Help us choose the best location for our new community garden project. The garden will provide fresh produce and educational opportunities for residents.",
    options: [
    { text: "Central Park East Side", votes: 234 },
    { text: "Riverside Community Center", votes: 198 },
    { text: "Lincoln Elementary School", votes: 145 }],

    status: "active",
    category: "environment",
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)?.toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)?.toISOString(),
    commentsCount: 67,
    hasUserVoted: true
  },
  {
    id: 3,
    title: "Extended Library Hours Proposal",
    description: "The library board is considering extending operating hours to include evenings and weekends to better serve working families and students.",
    options: [
    { text: "Extend to 9 PM weekdays", votes: 312 },
    { text: "Add Saturday hours", votes: 278 },
    { text: "Keep current hours", votes: 45 }],

    status: "ended",
    category: "general",
    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)?.toISOString(),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)?.toISOString(),
    commentsCount: 89,
    hasUserVoted: true
  }];


  const mockLeaders = [
  {
    id: 1,
    name: "Bikash Shrestha",
    avatar: "https://ui-avatars.com/api/?name=Bikash+Shrestha&background=0D8ABC&color=fff",
    avatarAlt: "Bikash Shrestha avatar",
    points: 2847,
    level: "Civic Champion",
    topBadge: "Top Reporter",
    recentActivity: "Reported 3 issues this week",
    issuesReported: 45,
    issuesResolved: 32,
    pollsVoted: 67
  },
  {
    id: 2,
    name: "Anjali Tamang",
    avatar: "https://ui-avatars.com/api/?name=Anjali+Tamang&background=6366F1&color=fff",
    avatarAlt: "Anjali Tamang avatar",
    points: 2156,
    level: "Community Helper",
    topBadge: "Problem Solver",
    recentActivity: "Voted on 5 polls today",
    issuesReported: 38,
    issuesResolved: 28,
    pollsVoted: 54
  },
  {
    id: 3,
    name: "Rajesh Gurung",
    avatar: "https://ui-avatars.com/api/?name=Rajesh+Gurung&background=EC4899&color=fff",
    avatarAlt: "Rajesh Gurung avatar",
    points: 1923,
    level: "Active Citizen",
    topBadge: "Discussion Leader",
    recentActivity: "Started 2 discussions",
    issuesReported: 29,
    issuesResolved: 21,
    pollsVoted: 48
  },
  {
    id: 4,
    name: "Sita Rai",
    avatar: "https://ui-avatars.com/api/?name=Sita+Rai&background=10B981&color=fff",
    avatarAlt: "Sita Rai avatar",
    points: 1678,
    level: "Engaged Voter",
    topBadge: "Active Voter",
    recentActivity: "Commented on 8 issues",
    issuesReported: 25,
    issuesResolved: 18,
    pollsVoted: 42
  },
  {
    id: 5,
    name: "Pramod Thapa",
    avatar: "https://ui-avatars.com/api/?name=Pramod+Thapa&background=F59E0B&color=fff",
    avatarAlt: "Pramod Thapa avatar",
    points: 1445,
    level: "Rising Star",
    topBadge: "Community Helper",
    recentActivity: "Resolved 2 issues",
    issuesReported: 22,
    issuesResolved: 16,
    pollsVoted: 35
  }];


  const mockActivities = [
  {
    id: 1,
    type: "government_response",
    user: {
      name: "City Planning Dept",
      avatar: "https://ui-avatars.com/api/?name=City+Planning&background=3B82F6&color=fff",
      avatarAlt: "City Planning Dept avatar"
    },
    description: "Responded to the Main Street bike lane proposal with detailed implementation timeline",
    relatedItem: "Main Street Bike Lane Poll",
    timestamp: new Date(Date.now() - 15 * 60 * 1000)?.toISOString()
  },
  {
    id: 2,
    type: "poll_created",
    user: {
      name: "Community Board",
      avatar: "https://ui-avatars.com/api/?name=Community+Board&background=8B5CF6&color=fff",
      avatarAlt: "Community Board avatar"
    },
    description: "Created a new poll about weekend farmers market location",
    relatedItem: "Weekend Farmers Market Poll",
    timestamp: new Date(Date.now() - 45 * 60 * 1000)?.toISOString()
  },
  {
    id: 3,
    type: "issue_resolved",
    user: {
      name: "Public Works",
      avatar: "https://ui-avatars.com/api/?name=Public+Works&background=10B981&color=fff",
      avatarAlt: "Public Works avatar"
    },
    description: "Marked the broken streetlight on Oak Avenue as resolved",
    relatedItem: "Streetlight Repair #4521",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)?.toISOString()
  },
  {
    id: 4,
    type: "comment_added",
    user: {
      name: "Sunita Karki",
      avatar: "https://ui-avatars.com/api/?name=Sunita+Karki&background=EC4899&color=fff",
      avatarAlt: "Sunita Karki avatar"
    },
    description: "Added a detailed comment about traffic safety concerns in the school zone",
    relatedItem: "School Zone Safety Discussion",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)?.toISOString()
  },
  {
    id: 5,
    type: "vote_cast",
    user: {
      name: "Ramesh Maharjan",
      avatar: "https://ui-avatars.com/api/?name=Ramesh+Maharjan&background=F59E0B&color=fff",
      avatarAlt: "Ramesh Maharjan avatar"
    },
    description: "Voted in favor of extended library hours proposal",
    relatedItem: "Library Hours Extension Poll",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)?.toISOString()
  }];


  const mockDiscussions = [
  {
    id: 1,
    title: "Traffic Safety Improvements Needed on School Routes",
    preview: "Parents are concerned about speeding vehicles during school hours. We need better crosswalks and speed bumps...",
    author: {
      name: "Sarita Poudel",
      avatar: "https://ui-avatars.com/api/?name=Sarita+Poudel&background=EF4444&color=fff",
      avatarAlt: "Sarita Poudel avatar"
    },
    category: "safety",
    repliesCount: 23,
    views: 156,
    upvotes: 45,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)?.toISOString(),
    isPinned: true,
    replies: [
    {
      id: 1,
      author: {
        name: "Dipak Basnet",
        avatar: "https://ui-avatars.com/api/?name=Dipak+Basnet&background=14B8A6&color=fff",
        avatarAlt: "Dipak Basnet avatar"
      },
      content: "We're currently conducting a traffic study on these routes. Results should be available next month.",
      upvotes: 12,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)?.toISOString()
    }]

  },
  {
    id: 2,
    title: "Community Center Renovation Plans",
    preview: "The community center needs updates to better serve our growing population. What improvements should we prioritize?",
    author: {
      name: "Manoj Khadka",
      avatar: "https://ui-avatars.com/api/?name=Manoj+Khadka&background=6366F1&color=fff",
      avatarAlt: "Manoj Khadka avatar"
    },
    category: "infrastructure",
    repliesCount: 18,
    views: 89,
    upvotes: 32,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)?.toISOString(),
    isPinned: false,
    replies: []
  }];


  const mockUserStats = {
    name: "Krishna Adhikari",
    avatar: "https://ui-avatars.com/api/?name=Krishna+Adhikari&background=0D8ABC&color=fff&size=128",
    avatarAlt: "Krishna Adhikari avatar",
    level: 5,
    title: "Community Helper",
    location: "Kathmandu Metropolitan",
    currentPoints: 1847,
    nextLevelPoints: 2500,
    totalReports: 23,
    totalVotes: 67,
    totalComments: 145,
    streak: 12,
    badges: ["Top Reporter", "Active Voter", "Community Helper"],
    recentAchievements: [
    {
      title: "Consistent Contributor",
      description: "Participated for 10 consecutive days",
      points: 100
    },
    {
      title: "Poll Creator",
      description: "Created your first community poll",
      points: 50
    }]

  };

  useEffect(() => {
    setPolls(mockPolls);
  }, []);

  const handleVote = (pollId, optionIndex) => {
    setPolls((prevPolls) =>
    prevPolls?.map((poll) => {
      if (poll?.id === pollId) {
        const updatedOptions = poll?.options?.map((option, index) => {
          if (index === optionIndex) {
            return { ...option, votes: option?.votes + 1 };
          }
          return option;
        });
        return { ...poll, options: updatedOptions, hasUserVoted: true };
      }
      return poll;
    })
    );
  };

  const handleCreatePoll = (newPoll) => {
    setPolls((prevPolls) => [newPoll, ...prevPolls]);
  };

  const getFilteredPolls = () => {
    return polls?.filter((poll) => {
      const statusMatch = filterStatus === 'all' || poll?.status === filterStatus;
      const categoryMatch = filterCategory === 'all' || poll?.category === filterCategory;
      return statusMatch && categoryMatch;
    });
  };

  const tabItems = [
  { id: 'polls', label: 'Polls', icon: 'Vote' },
  { id: 'discussions', label: 'Discussions', icon: 'MessageSquare' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy' },
  { id: 'activity', label: 'Activity', icon: 'Activity' }];


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Community Hub</h1>
                <p className="mt-2 text-text-secondary">
                  Engage with your community through polls, discussions, and collaborative decision-making
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatePollOpen(true)}
                  iconName="Plus"
                  iconPosition="left">

                  Create Poll
                </Button>
                <Link to="/report-issue">
                  <Button variant="default" iconName="AlertCircle" iconPosition="left">
                    Report Issue
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabItems?.map((tab) =>
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap civic-transition ${
                  activeTab === tab?.id ?
                  'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-foreground hover:border-border'}`
                  }>

                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'polls' &&
              <div className="space-y-6">
                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Icon name="Filter" size={16} className="text-text-secondary" />
                      <span className="text-sm font-medium text-foreground">Filters:</span>
                    </div>
                    
                    <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e?.target?.value)}
                    className="h-9 px-3 py-1 text-sm border-2 border-slate-300 rounded-lg bg-white text-slate-900 font-medium shadow-sm hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 cursor-pointer">

                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="ended">Ended</option>
                    </select>
                    
                    <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e?.target?.value)}
                    className="h-9 px-3 py-1 text-sm border-2 border-slate-300 rounded-lg bg-white text-slate-900 font-medium shadow-sm hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 cursor-pointer">

                      <option value="all">All Categories</option>
                      <option value="general">General</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="environment">Environment</option>
                      <option value="transportation">Transportation</option>
                      <option value="safety">Safety</option>
                    </select>
                  </div>

                  {/* Polls List */}
                  <div className="space-y-4">
                    {getFilteredPolls()?.map((poll) =>
                  <PollCard key={poll?.id} poll={poll} onVote={handleVote} />
                  )}
                  </div>
                </div>
              }

              {activeTab === 'discussions' &&
              <DiscussionThread discussions={mockDiscussions} />
              }

              {activeTab === 'leaderboard' &&
              <LeaderboardCard leaders={mockLeaders} />
              }

              {activeTab === 'activity' &&
              <ActivityFeed activities={mockActivities} />
              }
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Progress */}
              <UserProgress userStats={mockUserStats} />

              {/* Quick Stats */}
              <div className="civic-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Community Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Active Polls</span>
                    <span className="font-semibold text-foreground">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Total Participants</span>
                    <span className="font-semibold text-foreground">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Issues Resolved</span>
                    <span className="font-semibold text-foreground">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">This Week</span>
                    <span className="font-semibold text-success">+23</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="civic-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/report-issue" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start" iconName="Plus" iconPosition="left">
                      Report New Issue
                    </Button>
                  </Link>
                  <Link to="/map-view" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start" iconName="Map" iconPosition="left">
                      View Issue Map
                    </Button>
                  </Link>
                  <Link to="/issues" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start" iconName="List" iconPosition="left">
                      Browse All Issues
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={isCreatePollOpen}
        onClose={() => setIsCreatePollOpen(false)}
        onCreatePoll={handleCreatePoll} />

    </div>);

};

export default Community;
