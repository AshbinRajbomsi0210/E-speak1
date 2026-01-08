from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.submit_contact_message, name='submit_contact'),
]
