#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from accounts.models import CustomUser
from django.db import connection

# Test database connection
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    print("✓ Database connection successful")
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    exit(1)

# Check user count
try:
    user_count = CustomUser.objects.count()
    print(f"✓ Total users in database: {user_count}")
    
    # List all users
    users = CustomUser.objects.all().values('id', 'email', 'fullName', 'role', 'clerk_user_id')
    if users:
        print("\nUsers in database:")
        for user in users:
            print(f"  - ID: {user['id']}, Email: {user['email']}, Name: {user['fullName']}, Role: {user['role']}, Clerk ID: {user['clerk_user_id']}")
    else:
        print("\nNo users found in database")
except Exception as e:
    print(f"✗ Error querying users: {e}")
