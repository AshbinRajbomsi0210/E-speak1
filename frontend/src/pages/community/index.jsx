import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
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

const API_BASE_URL = 'http://127.0.0.1:8000/api/community';

const Community = () => {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('polls');
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [polls, setPolls] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [communityStats, setCommunityStats] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadedTabs, setLoadedTabs] = useState({ polls: false });

  // Fetch data from backend
  useEffect(() => {
    fetchPolls();
  }, [filterStatus, filterCategory]);

  // Load tab data when switching tabs
  useEffect(() => {
    if (activeTab === 'discussions' && !loadedTabs.discussions) {
      fetchDiscussions();
    } else if (activeTab === 'leaderboard' && !loadedTabs.leaderboard) {
      fetchLeaderboard();
    } else if (activeTab === 'activity' && !loadedTabs.activity) {
      fetchActivity();
    }
  }, [activeTab]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const pollsParams = new URLSearchParams();
      if (filterStatus !== 'all') pollsParams.append('status', filterStatus);
      if (filterCategory !== 'all') pollsParams.append('category', filterCategory);

      const [pollsRes, progressRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/polls/?${pollsParams}`, { headers }),
        fetch(`${API_BASE_URL}/user-progress/`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/stats/`, { headers }).catch(() => null)
      ]);

      if (pollsRes.ok) {
        const pollsData = await pollsRes.json();
        const pollsArray = Array.isArray(pollsData) ? pollsData : (pollsData.results || []);
        setPolls(pollsArray);
      } else {
        setPolls([]);
      }

      if (progressRes?.ok) {
        const progressData = await progressRes.json();
        setUserProgress(progressData);
      }

      if (statsRes?.ok) {
        const statsData = await statsRes.json();
        setCommunityStats(statsData);
      }

      setLoadedTabs(prev => ({ ...prev, polls: true }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching polls:', error);
      setPolls([]);
      setLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const token = await getToken();
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      
      const discussionsRes = await fetch(`${API_BASE_URL}/discussions/`, { headers });
      if (discussionsRes.ok) {
        const discussionsData = await discussionsRes.json();
        const discussionsArray = Array.isArray(discussionsData) ? discussionsData : (discussionsData.results || []);
        setDiscussions(discussionsArray);
      }
      setLoadedTabs(prev => ({ ...prev, discussions: true }));
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const token = await getToken();
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      
      const leaderboardRes = await fetch(`${API_BASE_URL}/leaderboard/?limit=10`, { headers });
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        const leaderboardArray = Array.isArray(leaderboardData) ? leaderboardData : (leaderboardData.results || []);
        setLeaders(leaderboardArray);
      }
      setLoadedTabs(prev => ({ ...prev, leaderboard: true }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchActivity = async () => {
    try {
      const token = await getToken();
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      
      const activityRes = await fetch(`${API_BASE_URL}/activity-feed/?limit=20`, { headers });
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        const activityArray = Array.isArray(activityData) ? activityData : (activityData.results || []);
        setActivities(activityArray);
      }
      setLoadedTabs(prev => ({ ...prev, activity: true }));
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const fetchData = async () => {
    // Refresh current tab data
    if (activeTab === 'polls') {
      await fetchPolls();
    } else if (activeTab === 'discussions') {
      await fetchDiscussions();
    } else if (activeTab === 'leaderboard') {
      await fetchLeaderboard();
    } else if (activeTab === 'activity') {
      await fetchActivity();
    }
  };

  const handleVote = async (pollId, optionId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ option_id: optionId }),
      });

      if (response.ok) {
        const updatedPoll = await response.json();
        setPolls(prevPolls => 
          prevPolls.map(poll => poll.id === pollId ? updatedPoll : poll)
        );
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  const handleCreatePoll = async (newPollData) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/polls/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPollData),
      });

      if (response.ok) {
        const createdPoll = await response.json();
        setIsCreatePollOpen(false);
        // Refresh all data to get the new poll and updated user progress
        await fetchData();
      } else {
        const error = await response.json();
        alert('Failed to create poll: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll. Please try again.');
    }
  };

  const getFilteredPolls = () => {
    return polls;
  };

  const tabItems = [
  { id: 'polls', label: 'Polls', icon: 'Vote' },
  { id: 'discussions', label: 'Discussions', icon: 'MessageSquare' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy' },
  { id: 'activity', label: 'Activity', icon: 'Activity' }];


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-text-secondary">Loading community data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                    {getFilteredPolls()?.length > 0 ? (
                      getFilteredPolls()?.map((poll) =>
                        <PollCard key={poll?.id} poll={poll} onVote={handleVote} />
                      )
                    ) : (
                      <div className="civic-card p-8 text-center">
                        <Icon name="Vote" size={48} className="mx-auto text-text-secondary mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Polls Available</h3>
                        <p className="text-text-secondary mb-4">
                          Be the first to create a poll and engage your community!
                        </p>
                        <Button onClick={() => setIsCreatePollOpen(true)}>
                          Create First Poll
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              }

              {activeTab === 'discussions' &&
              <DiscussionThread discussions={discussions} />
              }

              {activeTab === 'leaderboard' &&
              <LeaderboardCard leaders={leaders} />
              }

              {activeTab === 'activity' &&
              <ActivityFeed activities={activities} />
              }
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Progress */}
              {userProgress && <UserProgress userStats={userProgress} />}

              {/* Quick Stats */}
              <div className="civic-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Community Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Active Polls</span>
                    <span className="font-semibold text-foreground">{communityStats.active_polls || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Total Polls</span>
                    <span className="font-semibold text-foreground">{communityStats.total_polls || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Total Members</span>
                    <span className="font-semibold text-foreground">{communityStats.total_members || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Total Votes</span>
                    <span className="font-semibold text-success">{communityStats.total_votes || 0}</span>
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
