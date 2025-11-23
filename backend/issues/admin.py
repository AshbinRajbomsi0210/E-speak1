from django.contrib import admin
from .models import Issue, IssuePhoto


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('report_id', 'title', 'reporter_name', 'reporter_email', 'status', 'created_at')
    search_fields = ('report_id', 'title', 'reporter_name', 'reporter_email')

admin.site.register(IssuePhoto)