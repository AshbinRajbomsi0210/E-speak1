from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'polls', views.PollViewSet, basename='poll')
router.register(r'discussions', views.DiscussionViewSet, basename='discussion')

urlpatterns = [
    path('', include(router.urls)),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('activity-feed/', views.activity_feed, name='activity-feed'),
    path('user-progress/', views.user_progress, name='user-progress'),
    path('stats/', views.community_stats, name='community-stats'),
]
