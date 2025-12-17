from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
import requests
from .serializers import LoginSerializer, RegisterSerializer
from .permissions import IsAdmin

User = get_user_model()  # Use your custom User model

class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'fullName': user.fullName,
                'email': user.email,
                'role': user.role,
                'phone': getattr(user, 'phone', ''),
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    def post(self, request):
        print("Hi")
        print(request.data)
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']


        # Authenticate using email
        user = authenticate(request, email=email, password=password)

        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'fullName': user.fullName,
                'email': user.email,
                'role': user.role,
                'phone': getattr(user, 'phone', ''),
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)


# ==================== CLERK-BASED AUTHORITY MANAGEMENT ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def invite_authority(request):
    """
    Admin endpoint to invite a new authority user via Clerk
    
    POST /api/accounts/invite-authority/
    Body: {
        "email": "authority@example.com",
        "first_name": "John",
        "last_name": "Doe"
    }
    """
    email = request.data.get('email')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Create invitation via Clerk API
        headers = {
            'Authorization': f'Bearer {settings.CLERK_SECRET_KEY}',
            'Content-Type': 'application/json',
        }
        
        payload = {
            'email_address': email,
            'public_metadata': {},
            'unsafe_metadata': {
                'role': 'authority',  # Pre-assign authority role
            },
            'notify': True,  # Send invitation email
        }
        
        # Add name if provided
        if first_name:
            payload['first_name'] = first_name
        if last_name:
            payload['last_name'] = last_name
        
        # Send invitation via Clerk API
        response = requests.post(
            'https://api.clerk.com/v1/invitations',
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            invitation_data = response.json()
            return Response({
                'success': True,
                'message': f'Invitation sent to {email}',
                'invitation_id': invitation_data.get('id'),
                'status': invitation_data.get('status'),
            }, status=status.HTTP_200_OK)
        else:
            error_data = response.json()
            return Response({
                'error': 'Failed to send invitation',
                'details': error_data
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {'error': f'Server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Get current authenticated user info
    
    GET /api/accounts/me/
    """
    user = request.user
    return Response({
        'id': user.id,
        'clerk_user_id': user.clerk_user_id,
        'email': user.email,
        'fullName': user.fullName,
        'role': user.role,
        'phone': user.phone,
        'is_active': user.is_active,
        'date_joined': user.date_joined,
    }, status=status.HTTP_200_OK)