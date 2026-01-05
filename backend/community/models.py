from django.db import models
from accounts.models import CustomUser


class Poll(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('ended', 'Ended'),
        ('draft', 'Draft'),
    ]
    
    CATEGORY_CHOICES = [
        ('transportation', 'Transportation'),
        ('environment', 'Environment'),
        ('safety', 'Safety'),
        ('general', 'General'),
        ('infrastructure', 'Infrastructure'),
        ('education', 'Education'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='polls_created')
    created_at = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def total_votes(self):
        return sum(option.votes_count for option in self.options.all())
    
    @property
    def comments_count(self):
        return self.comments.count()


class PollOption(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.poll.title} - {self.text}"
    
    @property
    def votes_count(self):
        return self.votes.count()


class PollVote(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='votes')
    option = models.ForeignKey(PollOption, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='poll_votes')
    voted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['poll', 'user']
        ordering = ['-voted_at']
    
    def __str__(self):
        return f"{self.user.email} voted on {self.poll.title}"


class PollComment(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='poll_comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.email} on {self.poll.title}"


class Discussion(models.Model):
    CATEGORY_CHOICES = [
        ('safety', 'Safety'),
        ('infrastructure', 'Infrastructure'),
        ('environment', 'Environment'),
        ('transportation', 'Transportation'),
        ('general', 'General'),
    ]
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='discussions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def comments_count(self):
        return self.comments.count()


class DiscussionComment(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='discussion_comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.email} on {self.discussion.title}"


class UserActivity(models.Model):
    ACTIVITY_TYPES = [
        ('issue_reported', 'Issue Reported'),
        ('issue_resolved', 'Issue Resolved'),
        ('poll_created', 'Poll Created'),
        ('poll_voted', 'Poll Voted'),
        ('discussion_created', 'Discussion Created'),
        ('comment_added', 'Comment Added'),
        ('government_response', 'Government Response'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField()
    related_item = models.CharField(max_length=255, blank=True)
    points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'User activities'
    
    def __str__(self):
        return f"{self.user.email} - {self.activity_type}"


class UserBadge(models.Model):
    BADGE_TYPES = [
        ('top_reporter', 'Top Reporter'),
        ('problem_solver', 'Problem Solver'),
        ('discussion_leader', 'Discussion Leader'),
        ('active_voter', 'Active Voter'),
        ('community_helper', 'Community Helper'),
        ('civic_champion', 'Civic Champion'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='badges')
    badge_type = models.CharField(max_length=50, choices=BADGE_TYPES)
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'badge_type']
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.badge_type}"


class UserPoints(models.Model):
    LEVEL_CHOICES = [
        ('rising_star', 'Rising Star'),
        ('engaged_voter', 'Engaged Voter'),
        ('active_citizen', 'Active Citizen'),
        ('community_helper', 'Community Helper'),
        ('civic_champion', 'Civic Champion'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='points')
    total_points = models.IntegerField(default=0)
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES, default='rising_star')
    
    def __str__(self):
        return f"{self.user.email} - {self.total_points} points"
    
    def add_points(self, points):
        self.total_points += points
        self.update_level()
        self.save()
    
    def update_level(self):
        if self.total_points >= 2500:
            self.level = 'civic_champion'
        elif self.total_points >= 2000:
            self.level = 'community_helper'
        elif self.total_points >= 1500:
            self.level = 'active_citizen'
        elif self.total_points >= 1000:
            self.level = 'engaged_voter'
        else:
            self.level = 'rising_star'
