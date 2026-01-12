import React, { useEffect, useState } from 'react';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [activityStats, setActivityStats] = useState({
    reportsSubmitted: 0,
    commentsPosted: 0,
    votesGiven: 0,
    recentActivity: []
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [userIssues, setUserIssues] = useState([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);

  // Auto-sync user to backend when profile loads
  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && user && isLoaded) {
        try {
          const token = await getToken();
          
          if (!token) {
            console.log('⏳ Token not ready yet');
            return;
          }
          
          const response = await fetch('http://127.0.0.1:8000/api/accounts/me/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            console.log('✅ User synced to backend');
          } else {
            console.error('❌ Sync failed:', response.status);
          }
        } catch (error) {
          console.error('💥 User sync error:', error);
        }
      }
    };
    
    // Add a small delay to ensure token is ready
    const timer = setTimeout(() => {
      syncUser();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isSignedIn, user, getToken, isLoaded]);

  // Fetch user activity stats
  useEffect(() => {
    const fetchActivityStats = async () => {
      if (!isSignedIn || !user?.emailAddresses?.[0]?.emailAddress) {
        setIsLoadingStats(false);
        return;
      }

      const userEmail = user.emailAddresses[0].emailAddress;
      
      try {
        // Fetch user's reported issues
        const issuesResponse = await fetch(`http://127.0.0.1:8000/api/issues/list/`);
        const issuesData = await issuesResponse.json();
        
        const userIssues = issuesData.success ? issuesData.data.filter(issue => {
          const issueEmail = issue.reporterEmail || issue.reporter_email;
          return issueEmail?.toLowerCase() === userEmail.toLowerCase();
        }) : [];

        // Fetch detailed info for each issue (comments count)
        const issuesWithDetails = await Promise.all(
          userIssues.map(async (issue) => {
            try {
              const commentsRes = await fetch(`http://127.0.0.1:8000/api/issues/${issue.id}/comments/`);
              const commentsData = await commentsRes.json();
              const commentCount = commentsData.success ? (commentsData.count || 0) : 0;

              return {
                ...issue,
                commentCount,
                voteScore: (issue.upvotes || 0) - (issue.downvotes || 0)
              };
            } catch (error) {
              console.error(`Error fetching comments for issue ${issue.id}:`, error);
              return {
                ...issue,
                commentCount: 0,
                voteScore: (issue.upvotes || 0) - (issue.downvotes || 0)
              };
            }
          })
        );

        setUserIssues(issuesWithDetails);
        setIsLoadingIssues(false);

        // Fetch user's votes
        const votesResponse = await fetch(`http://127.0.0.1:8000/api/issues/list/`);
        const votesData = await votesResponse.json();
        let totalVotes = 0;
        
        if (votesData.success) {
          // Check votes for each issue
          const voteChecks = await Promise.all(
            votesData.data.map(issue =>
              fetch(`http://127.0.0.1:8000/api/issues/${issue.id}/check-upvote/?voter_email=${encodeURIComponent(userEmail)}`)
                .then(res => res.json())
                .catch(() => ({ data: { has_voted: false } }))
            )
          );
          totalVotes = voteChecks.filter(v => v.data?.has_voted).length;
        }

        // Fetch user's comments
        let totalComments = 0;
        if (votesData.success) {
          const commentChecks = await Promise.all(
            votesData.data.map(issue =>
              fetch(`http://127.0.0.1:8000/api/issues/${issue.id}/comments/`)
                .then(res => res.json())
                .then(data => data.success ? data.data.filter(c => c.userEmail === userEmail).length : 0)
                .catch(() => 0)
            )
          );
          totalComments = commentChecks.reduce((sum, count) => sum + count, 0);
        }

        // Build recent activity
        const recentActivity = userIssues
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
          .map(issue => ({
            type: 'report',
            title: issue.title,
            date: new Date(issue.created_at),
            status: issue.status,
            id: issue.id
          }));

        setActivityStats({
          reportsSubmitted: userIssues.length,
          commentsPosted: totalComments,
          votesGiven: totalVotes,
          recentActivity
        });
      } catch (error) {
        console.error('Error fetching activity stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchActivityStats();
  }, [isSignedIn, user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Discussion':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Under Review':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'Adopted':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Resolved':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      <div className="pt-20 max-w-3xl mx-auto px-4 space-y-8">
        <div className="civic-card p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-semibold">
              {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {user?.fullName || user?.firstName || 'Guest'}
              </h1>
              <p className="text-text-secondary text-sm">
                {user?.emailAddresses?.[0]?.emailAddress || 'Not signed in'}
              </p>
              {user?.unsafeMetadata?.role && (
                <div className="mt-1 inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-muted text-text-secondary capitalize">
                  <Icon name={user.unsafeMetadata.role === 'admin' ? 'Shield' : user.unsafeMetadata.role === 'authority' ? 'Award' : 'User'} size={14} />
                  <span>{user.unsafeMetadata.role}</span>
                </div>
              )}
            </div>
          </div>
          {!isSignedIn && (
            <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
              <p>You are currently not signed in. Choose a role from the header Sign In menu or go to the full login page.</p>
              <Link to="/login" className="text-primary hover:underline inline-flex items-center space-x-1 text-sm">
                <Icon name="LogIn" size={14} />
                <span>Go to Login</span>
              </Link>
            </div>
          )}
          {isSignedIn && (
            <div className="flex flex-wrap gap-3">
              {(user?.unsafeMetadata?.role === 'admin' || user?.publicMetadata?.role === 'admin') && (
                <Link to="/admin">
                  <Button variant="primary">
                    <Icon name="Shield" size={16} />
                    <span className="ml-2">Admin Dashboard</span>
                  </Button>
                </Link>
              )}
              {(user?.unsafeMetadata?.role === 'authority' || user?.publicMetadata?.role === 'authority') && (
                <Link to="/authority">
                  <Button variant="primary">
                    <Icon name="Award" size={16} />
                    <span className="ml-2">Authority Dashboard</span>
                  </Button>
                </Link>
              )}
              <Button variant="outline" iconName="LogOut" onClick={handleSignOut}>Sign Out</Button>
            </div>
          )}
        </div>
        {isSignedIn && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="civic-card p-5 space-y-2">
              <h2 className="text-lg font-medium">Account Details</h2>
              <div className="text-sm text-text-secondary space-y-1">
                <div><span className="font-medium text-foreground">Email:</span> {user?.emailAddresses?.[0]?.emailAddress}</div>
                <div className="capitalize"><span className="font-medium text-foreground">Role:</span> {user?.unsafeMetadata?.role || 'user'}</div>
                <div><span className="font-medium text-foreground">Phone:</span> {user?.unsafeMetadata?.phone || 'Not provided'}</div>
                <div><span className="font-medium text-foreground">Member Since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
            <div className="civic-card p-5 space-y-4">
              <h2 className="text-lg font-medium">Activity Snapshot</h2>
              
              {isLoadingStats ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{activityStats.reportsSubmitted}</div>
                      <div className="text-xs text-text-secondary mt-1">Reports</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-500">{activityStats.commentsPosted}</div>
                      <div className="text-xs text-text-secondary mt-1">Comments</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-500">{activityStats.votesGiven}</div>
                      <div className="text-xs text-text-secondary mt-1">Votes</div>
                    </div>
                  </div>

                  {activityStats.recentActivity.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
                      <div className="space-y-2">
                        {activityStats.recentActivity.map((activity, index) => (
                          <Link 
                            key={index}
                            to={`/issue/${activity.id}`}
                            className="block p-2 rounded border border-border hover:bg-muted/50 civic-transition"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Icon name="FileText" size={14} className="text-primary" />
                                  <span className="text-sm font-medium line-clamp-1">{activity.title}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-text-secondary">
                                    {activity.date.toLocaleDateString()}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                    {activity.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {activityStats.reportsSubmitted === 0 && (
                    <div className="text-center py-4">
                      <Icon name="Inbox" size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-sm text-text-secondary mb-3">No activity yet</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/report-issue">
                          <Icon name="Plus" size={14} />
                          <span className="ml-2">Report Your First Issue</span>
                        </Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* My Reported Issues Section */}
        {isSignedIn && (
          <div className="civic-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Reported Issues</h2>
              <Button variant="outline" size="sm" asChild>
                <Link to="/report-issue">
                  <Icon name="Plus" size={14} />
                  <span className="ml-2">Report New Issue</span>
                </Link>
              </Button>
            </div>

            {isLoadingIssues ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse border border-border rounded-lg p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : userIssues.length > 0 ? (
              <div className="space-y-3">
                {userIssues.map((issue) => (
                  <Link
                    key={issue.id}
                    to={`/issue/${issue.id}`}
                    className="block border border-border rounded-lg p-4 hover:bg-muted/30 civic-transition"
                  >
                    <div className="space-y-3">
                      {/* Title and Status */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                          {issue.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full border shrink-0 ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </div>

                      {/* Description Preview */}
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {issue.description}
                      </p>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center space-x-4 text-xs text-text-secondary">
                          <div className="flex items-center space-x-1">
                            <Icon name="Calendar" size={14} />
                            <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="MapPin" size={14} />
                            <span className="line-clamp-1">{issue.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Engagement Stats */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Icon name="ArrowUp" size={16} className="text-orange-500" />
                          <span className="font-medium">{issue.upvotes || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="ArrowDown" size={16} className="text-blue-500" />
                          <span className="font-medium">{issue.downvotes || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={`font-bold ${issue.voteScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {issue.voteScore >= 0 ? '+' : ''}{issue.voteScore}
                          </span>
                          <span className="text-xs text-text-secondary">net score</span>
                        </div>
                        <div className="flex items-center space-x-1 ml-auto">
                          <Icon name="MessageCircle" size={16} className="text-blue-600" />
                          <span className="font-medium">{issue.commentCount || 0}</span>
                          <span className="text-xs text-text-secondary">comments</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="FileQuestion" size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Issues Reported Yet</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Start making a difference in your community by reporting your first issue
                </p>
                <Button variant="default" asChild>
                  <Link to="/report-issue">
                    <Icon name="Plus" size={16} />
                    <span className="ml-2">Report an Issue</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
