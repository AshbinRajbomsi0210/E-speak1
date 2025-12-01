from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()  # This ensures your custom User model is used

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('fullName', 'email', 'password', 'password2', 'phone', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        print(validated_data)
        validated_data.pop('password2')  # remove password2, it is not part of the model
        user = User(
            fullName=validated_data['fullName'],
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
            role=validated_data.get('role', 'user')
        )
        print(user)
        user.set_password(validated_data['password'])
        print(user)
        user.save()
        print(user)
        return user

