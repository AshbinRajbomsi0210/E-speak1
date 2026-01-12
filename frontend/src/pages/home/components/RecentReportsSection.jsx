import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentReportsSection = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/issues/list/?sort=newest');
      const data = await response.json();
      
      if (data.success) {
        const transformedIssues = data.data.slice(0, 6).map(issue => ({
          id: issue.id,
          title: issue.title,
          description: issue.description,
          image: issue.photos?.length > 0 ? issue.photos[0].image : null,
          imageAlt: issue.title,
          category: issue.category,
          status: issue.status,
          location: issue.address,
          upvotes: issue.upvotes || 0,
          downvotes: issue.downvotes || 0,
          votes: (issue.upvotes || 0) - (issue.downvotes || 0),
          comments: issue.commentCount || 0,
          timeAgo: getTimeAgo(new Date(issue.created_at)),
          priority: issue.priority.toLowerCase()
        }));
        setRecentReports(transformedIssues);
      }
    } catch (error) {
      console.error('Error fetching recent reports:', error);
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

  const handleInteraction = (e) => {
    if (!isSignedIn) {
      e.preventDefault();
      navigate('/login', { state: { from: '/' } });
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-success text-success-foreground';
      case 'Under Review':
        return 'bg-warning text-warning-foreground';
      case 'Adopted':
        return 'bg-primary text-primary-foreground';
      case 'In Discussion':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return { icon: 'AlertTriangle', color: 'text-error' };
      case 'medium':
        return { icon: 'AlertCircle', color: 'text-warning' };
      case 'low':
        return { icon: 'Info', color: 'text-accent' };
      default:
        return { icon: 'AlertCircle', color: 'text-text-secondary' };
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Recent Community Reports
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl">
              Stay updated with the latest civic issues reported by your neighbors and track their progress
            </p>
          </div>
          <div className="mt-6 lg:mt-0">
            <Link to="/issues">
              <Button variant="outline" iconName="ArrowRight" iconPosition="right">
                View All Issues
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="civic-card h-full animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentReports.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="FileText" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-lg text-text-secondary">No issues reported yet. Be the first to report!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {recentReports?.map((report) => {
            const priorityInfo = getPriorityIcon(report?.priority);

            return (
              <Link key={report?.id} to={`/issue/${report?.id}`} className="block">
                <div className="civic-card civic-card-hover h-full">
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-t-lg h-48">
                    <Image
                      src={report?.image}
                      alt={report?.imageAlt}
                      className="w-full h-full object-cover" />

                    <div className="absolute top-3 left-3">
                      <span className={`civic-status-indicator ${getStatusColor(report?.status)}`}>
                        {report?.status}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                        <Icon name={priorityInfo?.icon} size={16} className={priorityInfo?.color} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {report?.category}
                      </span>
                      <span className="text-sm text-text-secondary">{report?.timeAgo}</span>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                      {report?.title}
                    </h3>
                    
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                      {report?.description}
                    </p>

                    <div className="flex items-center text-sm text-text-secondary mb-4">
                      <Icon name="MapPin" size={14} className="mr-1" />
                      <span className="truncate">{report?.location}</span>
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={handleInteraction}
                          className="flex items-center hover:text-primary civic-transition"
                        >
                          <Icon name="ThumbsUp" size={14} className="text-text-secondary mr-1" />
                          <span className="text-sm text-text-secondary">{report?.votes}</span>
                        </button>
                        <button 
                          onClick={handleInteraction}
                          className="flex items-center hover:text-primary civic-transition"
                        >
                          <Icon name="MessageCircle" size={14} className="text-text-secondary mr-1" />
                          <span className="text-sm text-text-secondary">{report?.comments}</span>
                        </button>
                      </div>
                      <span className="text-sm font-medium text-primary flex items-center space-x-1">
                        <span>View Details</span>
                        <Icon name="ArrowRight" size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>);

          })}
        </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="civic-card p-8 lg:p-12 bg-gradient-to-r from-primary/5 to-accent/5">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              See an Issue in Your Community?
            </h3>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Your report can make a difference. Join thousands of citizens working together to improve our communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/report-issue">
                <Button size="lg" iconName="Plus" iconPosition="left" className="w-full sm:w-auto">
                  Report New Issue
                </Button>
              </Link>
              <Link to="/community">
                <Button variant="outline" size="lg" iconName="Users" iconPosition="left" className="w-full sm:w-auto">
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default RecentReportsSection;