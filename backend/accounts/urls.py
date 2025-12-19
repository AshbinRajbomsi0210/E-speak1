from django.urls import path
from . import views
from . import test_views

urlpatterns = [
    # Legacy Django auth (keep for backward compatibility)
    path('login/', views.LoginAPIView.as_view(), name='login'),
    path('register/', views.RegisterAPIView.as_view(), name='register'),
    
    # Clerk-based authentication
    path('me/', views.current_user, name='current-user'),
    path('invite-authority/', views.invite_authority, name='invite-authority'),
    path('users/', views.list_users, name='list-users'),
    
    # Test endpoints
    path('test/health/', test_views.health_check, name='health-check'),
    path('test/database/', test_views.database_check, name='database-check'),
    path('test/clerk-auth/', test_views.clerk_auth_test, name='clerk-auth-test'),
    path('test/connections/', test_views.connection_test, name='connection-test'),
]
