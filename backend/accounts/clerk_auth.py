"""
Clerk JWT Authentication for Django
Verifies Clerk tokens and syncs users automatically
"""
import jwt
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

User = get_user_model()

class ClerkAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class that verifies Clerk JWT tokens
    and automatically syncs users to Django database
    """
    
    def authenticate(self, request):
        """
        Authenticate the request and return a two-tuple of (user, token).
        """
        # Get the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return None  # Let other auth methods try
        
        token = auth_header.split(' ')[1]
        
        try:
            # Verify and decode the JWT token
            user_data = self.verify_clerk_token(token)
            
            # Get or create user in Django
            user = self.sync_user(user_data)
            
            return (user, token)
            
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {str(e)}')
    
    def verify_clerk_token(self, token):
        """
        Verify Clerk JWT token and extract user data
        """
        try:
            # Get Clerk's public keys (JWKS)
            jwks_url = f"https://{settings.CLERK_DOMAIN}/.well-known/jwks.json"
            jwks_response = requests.get(jwks_url)
            jwks = jwks_response.json()
            
            # Decode the JWT header to get the key ID
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get('kid')
            
            # Find the matching public key
            public_key = None
            for key in jwks['keys']:
                if key['kid'] == kid:
                    public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                    break
            
            if not public_key:
                raise Exception("Public key not found")
            
            # Verify and decode the token
            # Note: Clerk tokens may not have 'aud' claim, so we don't verify it
            decoded = jwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                options={
                    "verify_aud": False,  # Clerk tokens don't always include audience
                    "verify_signature": True,
                    "verify_exp": True,
                }
            )
            
            return decoded
            
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {str(e)}')
    
    def sync_user(self, clerk_data):
        """
        Get or create Django user from Clerk data
        Syncs user information on each request
        """
        # Clerk user ID from 'sub' claim
        clerk_user_id = clerk_data.get('sub')
        
        if not clerk_user_id:
            raise exceptions.AuthenticationFailed('Invalid user data from Clerk: missing sub')
        
        # ALWAYS fetch full user info from Clerk API to get metadata
        user_info = get_clerk_user_info(clerk_user_id)
        
        if not user_info:
            print(f"⚠️ Failed to fetch user info from Clerk API for {clerk_user_id}")
            print(f"⚠️ Falling back to JWT data (may not have metadata)")
            user_info = clerk_data
        
        # Get email from various possible locations
        email = None
        if isinstance(user_info.get('email_addresses'), list) and user_info['email_addresses']:
            email = user_info['email_addresses'][0].get('email_address')
        else:
            email = user_info.get('email') or clerk_data.get('email')
        
        if not email:
            raise exceptions.AuthenticationFailed('Invalid user data from Clerk: missing email')
        
        # Get user name
        first_name = user_info.get('first_name', '') or clerk_data.get('given_name', '')
        last_name = user_info.get('last_name', '') or clerk_data.get('family_name', '')
        full_name = f"{first_name} {last_name}".strip() or email.split('@')[0]
        
        # Extract role and phone from metadata
        unsafe_metadata = user_info.get('unsafe_metadata', {}) or clerk_data.get('unsafe_metadata', {})
        public_metadata = user_info.get('public_metadata', {}) or clerk_data.get('public_metadata', {})
        
        role = unsafe_metadata.get('role') or public_metadata.get('role', 'user')
        phone = unsafe_metadata.get('phone', '')
        
        print(f"🔍 Syncing user: {email}")
        print(f"   Clerk role from metadata: {role}")
        print(f"   unsafe_metadata: {unsafe_metadata}")
        
        # Get phone from phone_numbers array if available
        if not phone and isinstance(user_info.get('phone_numbers'), list) and user_info['phone_numbers']:
            phone = user_info['phone_numbers'][0].get('phone_number', '')
        
        # Get or create user
        user, created = User.objects.get_or_create(
            clerk_user_id=clerk_user_id,
            defaults={
                'email': email,
                'fullName': full_name,
                'role': role,
                'phone': phone,
                'is_active': True,
            }
        )
        
        print(f"   Created new user: {created}")
        print(f"   Final Django role: {user.role}")
        
        # Update user info if not created (sync on each login)
        # IMPORTANT: Don't override role if already set in Django (Django is source of truth for role)
        if not created:
            user.email = email
            user.fullName = full_name
            # Only update role from Clerk if user doesn't already have a role set
            # This allows admins to manually set roles in Django that persist
            if user.role == 'user' and role != 'user':
                user.role = role
            user.phone = phone or user.phone  # Keep existing phone if not provided
            user.save()
        
        return user


def get_clerk_user_info(clerk_user_id):
    """
    Fetch full user info from Clerk API
    Useful for admin operations like inviting authorities
    """
    try:
        headers = {
            'Authorization': f'Bearer {settings.CLERK_SECRET_KEY}',
            'Content-Type': 'application/json',
        }
        
        response = requests.get(
            f'https://api.clerk.com/v1/users/{clerk_user_id}',
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        return None
        
    except Exception as e:
        print(f"Error fetching Clerk user: {e}")
        return None
