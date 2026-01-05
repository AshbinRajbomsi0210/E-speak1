from django.contrib import admin
from .models import (
    Poll, PollOption, PollVote, PollComment,
    Discussion, DiscussionComment, UserActivity, UserBadge, UserPoints
)


class PollOptionInline(admin.TabularInline):
    model = PollOption
    extra = 2


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'status', 'created_by', 'created_at', 'end_date']
    list_filter = ['status', 'category', 'created_at']
    search_fields = ['title', 'description']
    inlines = [PollOptionInline]


@admin.register(PollVote)
class PollVoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'poll', 'option', 'voted_at']
    list_filter = ['voted_at']
    search_fields = ['user__email', 'poll__title']


@admin.register(PollComment)
class PollCommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'poll', 'text_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'poll__title', 'text']
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text


@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'author', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['title', 'content', 'author__email']


@admin.register(DiscussionComment)
class DiscussionCommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'discussion', 'text_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'discussion__title', 'text']
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'activity_type', 'description', 'points', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user__email', 'description']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge_type', 'earned_at']
    list_filter = ['badge_type', 'earned_at']
    search_fields = ['user__email']


@admin.register(UserPoints)
class UserPointsAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_points', 'level']
    list_filter = ['level']
    search_fields = ['user__email']
    ordering = ['-total_points']
