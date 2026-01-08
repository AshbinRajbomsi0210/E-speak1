"""
URL configuration for AI Chatbot
"""
from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.ChatView.as_view(), name='ai-chat'),
    path('ingest/', views.IngestDataView.as_view(), name='ai-ingest'),
    path('stats/', views.StatsView.as_view(), name='ai-stats'),
]
