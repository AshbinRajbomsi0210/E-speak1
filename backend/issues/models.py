from django.db import models
from django.utils import timezone
import datetime

class Issue(models.Model):
    report_id = models.CharField(max_length=64, unique=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    priority = models.CharField(max_length=50, blank=True)
    reporter_name = models.CharField(max_length=150, blank=True)
    reporter_email = models.EmailField(blank=True)
    reporter_phone = models.CharField(max_length=50, blank=True)
    address = models.CharField(max_length=512, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=50, default='Submitted')
    upvotes = models.IntegerField(default=0)
    downvotes = models.IntegerField(default=0)
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.report_id:
            date = datetime.datetime.utcnow()
            self.report_id = f"RPT-{date.year}-{date.month:02d}{date.day:02d}-{int(datetime.datetime.utcnow().timestamp())%1000:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.report_id} - {self.title}"

class IssuePhoto(models.Model):
    issue = models.ForeignKey(Issue, related_name='photos', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='issue_photos/')

class IssueVote(models.Model):
    VOTE_CHOICES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]
    issue = models.ForeignKey(Issue, related_name='votes', on_delete=models.CASCADE)
    voter_email = models.EmailField()
    vote_type = models.CharField(max_length=10, choices=VOTE_CHOICES, default='up')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('issue', 'voter_email')

class IssueComment(models.Model):
    issue = models.ForeignKey(Issue, related_name='comments', on_delete=models.CASCADE)
    user_email = models.EmailField()
    user_name = models.CharField(max_length=150)
    comment = models.TextField()
    parent = models.ForeignKey('self', related_name='replies', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user_name} on {self.issue.report_id}"
