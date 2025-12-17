from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email must be provided")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    # Clerk integration - this is the source of truth for auth
    clerk_user_id = models.CharField(max_length=255, unique=True, null=True, blank=True, 
                                     help_text="Unique Clerk user ID")
    
    # User info synced from Clerk
    fullName = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, default='user', 
                           choices=[('user', 'User'), ('admin', 'Admin'), ('authority', 'Authority')])
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Django admin access
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['fullName']

    def __str__(self):
        return f"{self.email} ({self.role})"
    
    @property
    def username(self):
        return self.email
    
    @property
    def is_authority(self):
        """Check if user is an authority"""
        return self.role == 'authority'
    
    @property
    def is_admin_user(self):
        """Check if user is an admin"""
        return self.role == 'admin'

