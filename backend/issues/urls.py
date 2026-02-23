from django.urls import path
from .views import (
    create_issue,
    list_issues,
    get_issue,
    update_issue,
    delete_issue,
    get_stats,
    upvote_issue,
    check_upvote,
    search_similar_issues,
    update_issue_status,
    get_comments,
    create_comment,
    delete_comment,
    increment_views,
    get_notifications,
    mark_notification_read,
    mark_all_notifications_read,
)

urlpatterns = [
    path('create/', create_issue, name='issues-create'),
    path('list/', list_issues, name='issues-list'),
    path('<int:pk>/', get_issue, name='issues-get'),
    path('<int:pk>/update/', update_issue, name='issues-update'),
    path('<int:pk>/update-status/', update_issue_status, name='issues-update-status'),
    path('<int:pk>/delete/', delete_issue, name='issues-delete'),
    path('<int:pk>/vote/', upvote_issue, name='issues-vote'),
    path('<int:pk>/check-upvote/', check_upvote, name='issues-check-upvote'),
    path('<int:pk>/increment-views/', increment_views, name='issues-increment-views'),
    path('<int:pk>/comments/', get_comments, name='issues-get-comments'),
    path('<int:pk>/comments/create/', create_comment, name='issues-create-comment'),
    path('<int:pk>/comments/<int:comment_id>/delete/', delete_comment, name='issues-delete-comment'),
    path('stats/', get_stats, name='issues-stats'),
    path('search-similar/', search_similar_issues, name='issues-search-similar'),
    # Notification endpoints
    path('notifications/', get_notifications, name='notifications-list'),
    path('notifications/<int:notification_id>/read/', mark_notification_read, name='notification-read'),
    path('notifications/mark-all-read/', mark_all_notifications_read, name='notifications-mark-all-read'),
]


