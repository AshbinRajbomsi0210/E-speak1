from django.urls import path
from .views import create_issue

urlpatterns = [
    path('create/', create_issue, name='issues-create'),
]


