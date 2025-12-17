"""
Test endpoints to verify Clerk authentication and connections
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Public endpoint to check if backend is running
    GET /api/accounts/test/health/
    """
    return Response({
        'status': 'healthy',
        'message': 'Django backend is running',
        'database': 'connected' if connection.ensure_connection() is None else 'disconnected'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def database_check(request):
    """
    Check PostgreSQL database connection
    GET /api/accounts/test/database/
    """
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()[0]
        
        # Count users
        user_count = User.objects.count()
        
        return Response({
            'status': 'connected',
            'database': 'PostgreSQL',
            'version': db_version,
            'total_users': user_count,
            'message': 'Database connection successful'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Database connection failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def clerk_auth_test(request):
    """
    Test Clerk authentication
    Requires valid Clerk JWT token
    GET /api/accounts/test/clerk-auth/
    Headers: Authorization: Bearer <clerk-token>
    """
    user = request.user
    
    return Response({
        'status': 'authenticated',
        'message': 'Clerk authentication successful',
        'user': {
            'id': user.id,
            'clerk_user_id': user.clerk_user_id,
            'email': user.email,
            'fullName': user.fullName,
            'role': user.role,
            'phone': user.phone,
            'is_active': user.is_active,
            'date_joined': user.date_joined.isoformat(),
        },
        'authentication_method': 'Clerk JWT',
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def connection_test(request):
    """
    Complete connection test
    GET /api/accounts/test/connections/
    """
    results = {
        'backend': 'running',
        'database': 'unknown',
        'clerk_configured': False,
        'users_in_db': 0,
        'request_from': request.META.get('HTTP_ORIGIN', 'unknown'),
    }
    
    # Test database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
        results['database'] = 'connected'
        results['users_in_db'] = User.objects.count()
    except Exception as e:
        results['database'] = f'error: {str(e)}'
    
    # Check Clerk configuration
    from django.conf import settings
    results['clerk_configured'] = bool(
        getattr(settings, 'CLERK_SECRET_KEY', None) and
        getattr(settings, 'CLERK_PUBLISHABLE_KEY', None)
    )
    results['clerk_domain'] = getattr(settings, 'CLERK_DOMAIN', 'not set')
    
    # Check if authenticated
    if request.user.is_authenticated:
        results['current_user'] = {
            'email': request.user.email,
            'role': request.user.role,
            'clerk_id': request.user.clerk_user_id,
        }
    else:
        results['current_user'] = 'not authenticated'
    
    return Response(results, status=status.HTTP_200_OK)
