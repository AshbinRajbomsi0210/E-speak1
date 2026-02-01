import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SimilarIssues = ({ title, description, category, onSelectIssue }) => {
  const [similarIssues, setSimilarIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const searchSimilar = async () => {
      // Only search if we have enough text
      if (!title || title.length < 3) {
        setSimilarIssues([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (title) params.append('title', title);
        if (description) params.append('description', description);
        if (category) params.append('category', category);

        const response = await fetch(`http://127.0.0.1:8000/api/issues/search-similar/?${params}`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
          setSimilarIssues(data.data);
          setExpanded(true);
        } else {
          setSimilarIssues([]);
        }
      } catch (error) {
        console.error('Error searching similar issues:', error);
        setSimilarIssues([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchSimilar();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [title, description, category]);

  if (similarIssues.length === 0) {
    return null;
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="bg-card rounded-lg border border-warning/30 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-warning/10 rounded-lg flex-shrink-0">
            <Icon name="AlertTriangle" size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Similar Issues Found</h3>
            <p className="text-sm text-text-secondary">
              We found {similarIssues.length} similar issue{similarIssues.length > 1 ? 's' : ''} that might be related to yours. 
              Consider upvoting an existing report instead of creating a duplicate.
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 hover:bg-muted rounded-lg civic-transition"
        >
          <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={20} />
        </button>
      </div>

      {expanded && (
        <div className="space-y-3">
          {similarIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 civic-transition"
            >
              <div className="flex items-start justify-between space-x-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-text-secondary">{issue.report_id}</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded capitalize">
                      {issue.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-foreground">{issue.title}</h4>
                  <p className="text-sm text-text-secondary line-clamp-2">{issue.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-text-secondary">
                    <div className="flex items-center space-x-1">
                      <Icon name="MapPin" size={12} />
                      <span>{issue.address || 'No address'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="ThumbsUp" size={12} />
                      <span>{issue.upvotes} upvotes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} />
                      <span>{getTimeAgo(issue.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/issue/${issue.id}`, '_blank')}
                  >
                    <Icon name="ExternalLink" size={14} className="mr-1" />
                    View
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.location.href = `/issue/${issue.id}#vote-section`}
                  >
                    <Icon name="ThumbsUp" size={14} className="mr-1" />
                    Upvote
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default SimilarIssues;
