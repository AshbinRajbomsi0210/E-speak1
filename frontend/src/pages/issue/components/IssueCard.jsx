import React from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import VoteButtons from '../../../components/VoteButtons';

const IssueCard = ({ issue, onVote, onComment, onShare }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Discussion':
        return 'bg-warning text-warning-foreground';
      case 'Under Review':
        return 'bg-accent text-accent-foreground';
      case 'Adopted':
        return 'bg-primary text-primary-foreground';
      case 'Resolved':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Infrastructure':
        return 'bg-blue-100 text-blue-800';
      case 'Public Safety':
        return 'bg-red-100 text-red-800';
      case 'Environment':
        return 'bg-green-100 text-green-800';
      case 'Transportation':
        return 'bg-purple-100 text-purple-800';
      case 'Health':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return { icon: 'AlertTriangle', color: 'text-red-500' };
      case 'Medium':
        return { icon: 'AlertCircle', color: 'text-yellow-500' };
      case 'Low':
        return { icon: 'Info', color: 'text-blue-500' };
      default:
        return { icon: 'Info', color: 'text-gray-500' };
    }
  };

  const priorityConfig = getPriorityIcon(issue?.priority);

  return (
    <div className="civic-card civic-card-hover p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className={`civic-status-indicator ${getCategoryColor(issue?.category)}`}>
            {issue?.category}
          </span>
          <Icon 
            name={priorityConfig?.icon} 
            size={16} 
            className={priorityConfig?.color} 
          />
        </div>
        <span className={`civic-status-indicator ${getStatusColor(issue?.status)}`}>
          {issue?.status}
        </span>
      </div>
      {/* Image */}
      {issue?.image && (
        <div className="w-full h-48 overflow-hidden rounded-lg">
          <Image
            src={issue?.image}
            alt={issue?.imageAlt}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {/* Content */}
      <div className="space-y-3">
        <Link 
          to={`/issue/${issue?.id}`}
          className="block hover:text-primary civic-transition"
        >
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">
            {issue?.title}
          </h3>
        </Link>
        
        <p className="text-text-secondary text-sm line-clamp-3">
          {issue?.description}
        </p>

        {/* Location */}
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Icon name="MapPin" size={14} />
          <span>{issue?.location}</span>
        </div>

        {/* Reporter Info */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 overflow-hidden rounded-full">
            <Image
              src={issue?.reporter?.avatar}
              alt={issue?.reporter?.avatarAlt}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm text-text-secondary">
            by {issue?.reporter?.name}
          </span>
          <span className="text-xs text-text-secondary">
            • {issue?.timeAgo}
          </span>
        </div>
      </div>
      {/* Actions - Reddit Style */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          {/* Reddit-style voting */}
          <VoteButtons
            voteScore={issue?.voteScore || (issue?.upvotes - (issue?.downvotes || 0))}
            userVote={issue?.userVote}
            onVote={(voteType) => onVote(issue?.id, voteType)}
            size="small"
            className="bg-muted/50 border border-border"
          />

          {/* Comments */}
          <button
            onClick={() => onComment(issue?.id)}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-muted/50 border border-border hover:bg-muted text-text-secondary hover:text-foreground civic-transition"
          >
            <Icon name="MessageCircle" size={18} />
            <span className="text-sm font-bold">{issue?.commentCount || issue?.comments || 0}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => onShare && onShare(issue?.id)}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-muted/50 border border-border hover:bg-muted text-text-secondary hover:text-foreground civic-transition"
          >
            <Icon name="Share2" size={18} />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/issue/${issue?.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
