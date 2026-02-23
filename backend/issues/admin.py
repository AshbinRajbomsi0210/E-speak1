from django.contrib import admin
from .models import Issue, IssuePhoto, Notification


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('report_id', 'title', 'reporter_name', 'reporter_email', 'status', 'created_at')
    search_fields = ('report_id', 'title', 'reporter_name', 'reporter_email')

admin.site.register(IssuePhoto)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient_email', 'title', 'notification_type', 'new_status', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'new_status')
    search_fields = ('recipient_email', 'title')