from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import LoginSerializer, RegisterSerializer

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