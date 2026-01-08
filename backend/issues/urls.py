from django.urls import path
from .views import (
    create_issue,
    list_issues,
    get_issue,
    update_issue,
    delete_issue,
    get_stats,
    upvote_issue,
    remove_upvote,
    check_upvote,
    search_similar_issues,
    update_issue_status
)

urlpatterns = [
    path('create/', create_issue, name='issues-create'),
    path('list/', list_issues, name='issues-list'),
    path('<int:pk>/', get_issue, name='issues-get'),
    path('<int:pk>/update/', update_issue, name='issues-update'),
    path('<int:pk>/update-status/', update_issue_status, name='issues-update-status'),
    path('<int:pk>/delete/', delete_issue, name='issues-delete'),
    path('<int:pk>/upvote/', upvote_issue, name='issues-upvote'),
    path('<int:pk>/remove-upvote/', remove_upvote, name='issues-remove-upvote'),
    path('<int:pk>/check-upvote/', check_upvote, name='issues-check-upvote'),
    path('stats/', get_stats, name='issues-stats'),
    path('search-similar/', search_similar_issues, name='issues-search-similar'),
]


