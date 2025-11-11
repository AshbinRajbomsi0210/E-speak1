import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
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
    name: "Sarah Johnson",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10c75be77-1762273997956.png",
    avatarAlt: "Professional headshot of woman with brown hair in business attire smiling at camera",
    points: 2847,
    level: "Civic Champion",
    topBadge: "Top Reporter",
    recentActivity: "Reported 3 issues this week"
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_129d823fe-1762249053422.png",
    avatarAlt: "Professional headshot of Asian man with glasses in navy shirt",
    points: 2156,
    level: "Community Helper",
    topBadge: "Problem Solver",
    recentActivity: "Voted on 5 polls today"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1beb9fc75-1762273370028.png",
    avatarAlt: "Professional headshot of Hispanic woman with long dark hair in white blouse",
    points: 1923,
    level: "Active Citizen",
    topBadge: "Discussion Leader",
    recentActivity: "Started 2 discussions"
  },
  {
    id: 4,
    name: "David Thompson",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_19341f160-1762248855459.png",
    avatarAlt: "Professional headshot of man with beard in gray sweater outdoors",
    points: 1678,
    level: "Engaged Voter",
    topBadge: "Active Voter",
    recentActivity: "Commented on 8 issues"
  },
  {
    id: 5,
    name: "Lisa Park",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1a7390ff6-1762273732548.png",
    avatarAlt: "Professional headshot of Asian woman with short black hair in blue blazer",
    points: 1445,
    level: "Rising Star",
    topBadge: "Community Helper",
    recentActivity: "Resolved 2 issues"
  }];


  const mockActivities = [
  {
    id: 1,
    type: "government_response",
    user: {
      name: "City Planning Dept",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_175143859-1762274671012.png",
      avatarAlt: "Professional headshot of government official in suit at city hall"
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
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_19c152708-1762274558818.png",
      avatarAlt: "Professional headshot of woman in business suit at community meeting"
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
      avatar: "https://images.unsplash.com/photo-1713186273317-d1bd7e967c87",
      avatarAlt: "Professional headshot of maintenance worker in safety vest and hard hat"
    },
    description: "Marked the broken streetlight on Oak Avenue as resolved",
    relatedItem: "Streetlight Repair #4521",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)?.toISOString()
  },
  {
    id: 4,
    type: "comment_added",
    user: {
      name: "Jennifer Martinez",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1beb9fc75-1762273370028.png",
      avatarAlt: "Professional headshot of Hispanic woman with curly hair in green blouse"
    },
    description: "Added a detailed comment about traffic safety concerns in the school zone",
    relatedItem: "School Zone Safety Discussion",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)?.toISOString()
  },
  {
    id: 5,
    type: "vote_cast",
    user: {
      name: "Robert Kim",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13c0c7e6e-1762273337806.png",
      avatarAlt: "Professional headshot of Asian man in casual shirt smiling outdoors"
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
      name: "Parent Council",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1274dd504-1762275023732.png",
      avatarAlt: "Professional headshot of woman with blonde hair in casual attire at school event"
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
        name: "Traffic Engineer",
        avatar: "https://images.unsplash.com/photo-1626885930974-4b69aa21bbf9",
        avatarAlt: "Professional headshot of engineer in safety vest reviewing traffic plans"
      },
      content: "We\'re currently conducting a traffic study on these routes. Results should be available next month.",
      upvotes: 12,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)?.toISOString()
    }]

  },
  {
    id: 2,
    title: "Community Center Renovation Plans",
    preview: "The community center needs updates to better serve our growing population. What improvements should we prioritize?",
    author: {
      name: "Facilities Manager",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_184e71288-1762273638271.png",
      avatarAlt: "Professional headshot of man with beard in business casual attire at community center"
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
    name: "Alex Johnson",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10fabfed3-1762273690188.png",
    avatarAlt: "Professional headshot of user with glasses in casual shirt smiling at camera",
    level: 5,
    title: "Community Helper",
    location: "Downtown District",
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
                    className="px-3 py-1 text-sm border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent">

                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="ended">Ended</option>
                    </select>
                    
                    <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e?.target?.value)}
                    className="px-3 py-1 text-sm border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent">

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
