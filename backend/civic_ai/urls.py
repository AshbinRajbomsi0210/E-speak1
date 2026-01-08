"""
URL Configuration for Civic AI
"""
from django.urls import path
from . import views

app_name = 'civic_ai'

urlpatterns = [
    path('chat/', views.ChatAPIView.as_view(), name='chat'),
    path('ingest/', views.IngestDataAPIView.as_view(), name='ingest'),
    path('stats/', views.StatsAPIView.as_view(), name='stats'),
]
