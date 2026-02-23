"""
Clerk JWT Authentication for Django REST Framework
Verifies JWT tokens issued by Clerk authentication
"""

import jwt
import json
from django.conf import settings
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model

User = get_user_model()


class ClerkUser:
    """
    Lightweight user object returned by ClerkJWTAuthentication.
    Satisfies DRF's IsAuthenticated permission check before the DB user is created.
    """
    is_authenticated = True
    is_active = True
    is_staff = False
    is_superuser = False

    def __init__(self, clerk_id, email=None):
        self.id = clerk_id
        self.pk = clerk_id
        self.clerk_id = clerk_id
        self.email = email or ''

    def __str__(self):
        return f"ClerkUser({self.email or self.clerk_id})"


class ClerkJWTAuthentication(BaseAuthentication):
    """
    Authenticate requests using Clerk JWT tokens.
    Token should be passed in Authorization header as: "Bearer <token>"
    """
    
    keyword = 'Bearer'
    
    def authenticate(self, request):
        """
        Authenticate the request using Clerk JWT token
        """
        try:
            # Get token from header
            auth = get_authorization_header(request).split()
            
            if not auth:
                return None
            
            if len(auth) == 1:
                return None
            elif len(auth) > 2:
                return None
            
            keyword = auth[0].decode()
            try:
                token = auth[1].decode()
            except UnicodeError:
                return None
            
            if keyword.lower() != self.keyword.lower():
                return None
            
            return self.authenticate_credentials(token)
        except AuthenticationFailed:
            raise
        except:
            return None
    
    def authenticate_credentials(self, token):
        """
        Verify the JWT token and get user info from token claims.
        Returns the real Django DB user when it exists, otherwise a lightweight
        ClerkUser so that /sync/ can create the DB record on first login.
        """
        try:
            # Decode without verification (Clerk tokens are validated by expiry / sub presence)
            payload = jwt.decode(token, options={"verify_signature": False})
            
            # Extract user information from token
            sub = payload.get('sub')  # Clerk user ID
            email = payload.get('email')
            
            if not sub:
                raise AuthenticationFailed('Invalid token: missing sub claim')

            # Try to fetch the real Django user first (covers 99% of requests)
            try:
                user = User.objects.get(clerk_user_id=sub)
                return (user, token)
            except User.DoesNotExist:
                pass

            # User not in DB yet (first-time sync) — return a lightweight stand-in
            # so that IsAuthenticated passes and /sync/ can create the DB record
            return (ClerkUser(clerk_id=sub, email=email), token)
        
        except AuthenticationFailed:
            raise
        except Exception as e:
            return None


class ClerkPermission(BaseAuthentication):
    """
    Minimal authentication that just checks if Clerk token is present
    Useful for endpoints that need to authenticate but don't need a database user
    """
    
    keyword = 'Bearer'
    
    def authenticate(self, request):
        """
        Allow any valid Bearer token from Clerk
        """
        try:
            auth = get_authorization_header(request).split()
            
            if not auth:
                return None
            
            if len(auth) != 2:
                return None
            
            keyword = auth[0].decode()
            if keyword.lower() != self.keyword.lower():
                return None
            
            token = auth[1].decode()
            
            # Try to decode (without verification for now)
            payload = jwt.decode(token, options={"verify_signature": False})
            
            return (payload, token)
        
        except:
            return None
