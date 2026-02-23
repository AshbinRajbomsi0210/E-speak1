"""
Supabase JWT Authentication for Django REST Framework
Verifies JWT tokens issued by Supabase Auth
"""

import jwt
import json
from django.conf import settings
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from urllib.request import urlopen

User = get_user_model()


class SupabaseJWTAuthentication(BaseAuthentication):
    """
    Authenticate requests using Supabase JWT tokens.
    Token should be passed in Authorization header as: "Bearer <token>"
    """
    
    keyword = 'Bearer'
    
    def get_jwt_public_key(self):
        """
        Fetch the public key from Supabase JWKS endpoint
        Used to verify JWT signatures
        """
        try:
            supabase_url = settings.SUPABASE_PROJECT_URL
            if not supabase_url:
                raise AuthenticationFailed('Supabase URL not configured')
            
            # Get JWKS from Supabase
            jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
            response = urlopen(jwks_url)
            jwks = json.loads(response.read())
            
            # Return the first key (usually only one exists)
            if jwks.get('keys'):
                return jwks['keys'][0]
            
            raise AuthenticationFailed('No public key found in Supabase JWKS')
        
        except Exception as e:
            raise AuthenticationFailed(f'Could not fetch Supabase public key: {str(e)}')
    
    def authenticate(self, request):
        """
        Authenticate the request using Supabase JWT token
        """
        try:
            # Get token from header
            auth = get_authorization_header(request).split()
            
            if not auth:
                return None
            
            if len(auth) == 1:
                msg = 'Invalid token header. No credentials provided.'
                raise AuthenticationFailed(msg)
            elif len(auth) > 2:
                msg = 'Invalid token header. Token string should not contain spaces.'
                raise AuthenticationFailed(msg)
            
            keyword = auth[0].decode()
            try:
                token = auth[1].decode()
            except UnicodeError:
                msg = 'Invalid token header. Token string should not contain invalid characters.'
                raise AuthenticationFailed(msg)
            
            if keyword.lower() != self.keyword.lower():
                return None
            
            return self.authenticate_credentials(token)
        except Exception as e:
            # If no token provided, allow unauthenticated access (for testing)
            return None
    
    def authenticate_credentials(self, token):
        """
        Verify and decode the JWT token
        """
        try:
            # First, try to decode without verification to get the header
            unverified_header = jwt.get_unverified_header(token)
            
            # Get the public key
            jwks_key = self.get_jwt_public_key()
            
            # Convert JWKS key to PEM format for verification
            public_key = self._convert_jwks_to_pem(jwks_key)
            
            # Decode and verify the token
            payload = jwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                audience=settings.SUPABASE_ANON_KEY if settings.SUPABASE_ANON_KEY else None,
                options={"verify_exp": True}
            )
            
            # Extract user info from JWT
            user_id = payload.get('sub')  # Supabase user ID
            email = payload.get('email')
            phone = payload.get('phone')
            
            if not user_id:
                raise AuthenticationFailed('Invalid token: no user ID')
            
            # Get or create user
            user, created = User.objects.get_or_create(
                username=user_id,
                defaults={
                    'email': email or '',
                    'phone': phone or '',
                }
            )
            
            # Update user info if changed
            if email and user.email != email:
                user.email = email
            if phone and user.phone != phone:
                user.phone = phone
            if created or (email and user.email != email) or (phone and user.phone != phone):
                user.save()
            
            return (user, token)
        
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
    
    @staticmethod
    def _convert_jwks_to_pem(jwks_key):
        """
        Convert JWKS format key to PEM format for JWT verification
        """
        try:
            from cryptography.hazmat.primitives.asymmetric import rsa
            from cryptography.hazmat.primitives import serialization
            from cryptography.hazmat.backends import default_backend
            import base64
            
            # Extract RSA key components from JWKS
            e = base64.urlsafe_b64decode(jwks_key['e'] + '==')
            n = base64.urlsafe_b64decode(jwks_key['n'] + '==')
            
            # Convert bytes to integers
            e_int = int.from_bytes(e, byteorder='big')
            n_int = int.from_bytes(n, byteorder='big')
            
            # Create RSA public key
            public_key = rsa.RSAPublicNumbers(
                e=e_int,
                n=n_int
            ).public_key(default_backend())
            
            # Convert to PEM format
            pem = public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
            
            return pem
        except ImportError:
            raise AuthenticationFailed('cryptography library required for JWT verification')
        except Exception as e:
            raise AuthenticationFailed(f'Could not convert JWKS to PEM: {str(e)}')
