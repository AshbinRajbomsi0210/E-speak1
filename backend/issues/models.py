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
    status = models.CharField(max_length=50, default='Submitted')
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
