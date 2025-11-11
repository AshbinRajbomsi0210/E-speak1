import React from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentReportsSection = () => {
  const recentReports = [
  {
    id: 1,
    title: "Pothole on Main Street",
    description: "Large pothole causing traffic issues near the downtown intersection. Multiple vehicles have been damaged.",
    image: "https://images.unsplash.com/photo-1728340964368-59c3192e44e6",
    imageAlt: "Large pothole in asphalt road with damaged edges and debris",
    category: "Infrastructure",
    status: "Under Review",
    location: "Main St & 5th Ave",
    votes: 23,
    comments: 8,
    timeAgo: "2 hours ago",
    priority: "high"
  },
  {
    id: 2,
    title: "Broken Streetlight",
    description: "Street light has been out for over a week, creating safety concerns for pedestrians during evening hours.",
    image: "https://images.unsplash.com/photo-1583207301768-beb6ff8cc347",
    imageAlt: "Tall metal streetlight pole against evening sky with non-functioning bulb",
    category: "Public Safety",
    status: "In Discussion",
    location: "Oak Avenue",
    votes: 15,
    comments: 12,
    timeAgo: "5 hours ago",
    priority: "medium"
  },
  {
    id: 3,
    title: "Illegal Dumping Site",
    description: "Construction debris and household waste illegally dumped in the park area, affecting local wildlife and visitors.",
    image: "https://images.unsplash.com/photo-1608267815410-398827cb4816",
    imageAlt: "Pile of construction debris and waste materials dumped in green park area",
    category: "Environment",
    status: "Adopted",
    location: "Riverside Park",
    votes: 42,
    comments: 18,
    timeAgo: "1 day ago",
    priority: "high"
  },
  {
    id: 4,
    title: "Damaged Playground Equipment",
    description: "Swing set chains are broken and slide has sharp edges. Safety hazard for children using the playground.",
    image: "https://images.unsplash.com/photo-1731817381879-fa6c7d2ffd49",
    imageAlt: "Children\'s playground with damaged swing set and broken safety equipment",
    category: "Public Safety",
    status: "Resolved",
    location: "Community Center",
    votes: 31,
    comments: 6,
    timeAgo: "3 days ago",
    priority: "high"
  },
  {
    id: 5,
    title: "Overgrown Vegetation",
    description: "Bushes and trees blocking sidewalk visibility and pedestrian access on the residential street.",
    image: "https://images.unsplash.com/photo-1727931742344-d85811b89f75",
    imageAlt: "Overgrown green bushes and vegetation blocking concrete sidewalk path",
    category: "Infrastructure",
    status: "Under Review",
    location: "Elm Street",
    votes: 9,
    comments: 3,
    timeAgo: "1 week ago",
    priority: "low"
  },
  {
    id: 6,
    title: "Water Main Leak",
    description: "Continuous water leak from underground pipe causing flooding and potential foundation damage to nearby buildings.",
    image: "https://images.unsplash.com/photo-1564326971730-8ca2d3ac7016",
    imageAlt: "Water gushing from broken underground pipe creating puddle on street surface",
    category: "Infrastructure",
    status: "In Discussion",
    location: "Cedar Boulevard",
    votes: 67,
    comments: 24,
    timeAgo: "4 hours ago",
    priority: "high"
  }];


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
    <section className="py-16 lg:py-24 bg-muted/30">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {recentReports?.map((report) => {
            const priorityInfo = getPriorityIcon(report?.priority);

            return (
              <Link key={report?.id} to={`/issues/${report?.id}`} className="block">
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
                        <div className="flex items-center">
                          <Icon name="ThumbsUp" size={14} className="text-text-secondary mr-1" />
                          <span className="text-sm text-text-secondary">{report?.votes}</span>
                        </div>
                        <div className="flex items-center">
                          <Icon name="MessageCircle" size={14} className="text-text-secondary mr-1" />
                          <span className="text-sm text-text-secondary">{report?.comments}</span>
                        </div>
                      </div>
                      <Icon name="ArrowRight" size={16} className="text-text-secondary" />
                    </div>
                  </div>
                </div>
              </Link>);

          })}
        </div>

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