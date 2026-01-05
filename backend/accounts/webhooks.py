"""
Clerk Webhook Handler
Handles webhook events from Clerk for automatic user synchronization
"""
import json
import hmac
import hashlib
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


def verify_webhook_signature(request):
    """
    Verify that the webhook request is actually from Clerk
    """
    # Get the signature from headers
    svix_id = request.headers.get('svix-id')
    svix_timestamp = request.headers.get('svix-timestamp')
    svix_signature = request.headers.get('svix-signature')
    
    if not all([svix_id, svix_timestamp, svix_signature]):
        return False
    
    # Get webhook secret from settings
    webhook_secret = getattr(settings, 'CLERK_WEBHOOK_SECRET', None)
    
    if not webhook_secret:
        print("⚠️ CLERK_WEBHOOK_SECRET not configured")
        return True  # Allow in development if not configured
    
    # Construct the signed content
    signed_content = f'{svix_id}.{svix_timestamp}.{request.body.decode()}'
    
    # Create HMAC signature
    secret_bytes = webhook_secret.encode()
    signature = hmac.new(
        secret_bytes,
        signed_content.encode(),
        hashlib.sha256
    ).digest()
    
    # Compare signatures
    expected_signature = signature.hex()
    
    # Svix signature format: "v1,signature1 v1,signature2"
    signatures = svix_signature.split(' ')
    for sig in signatures:
        if sig.startswith('v1,'):
            provided_sig = sig[3:]  # Remove 'v1,' prefix
            if hmac.compare_digest(expected_signature, provided_sig):
                return True
    
    return False


@csrf_exempt
@require_http_methods(["POST"])
def clerk_webhook(request):
    """
    Handle webhook events from Clerk
    
    Events handled:
    - user.created: Create user in Django
    - user.updated: Update user in Django
    - user.deleted: Delete user from Django
    """
    
    # Verify webhook signature
    if not verify_webhook_signature(request):
        print("❌ Invalid webhook signature")
        return HttpResponse('Invalid signature', status=401)
    
    try:
        # Parse webhook payload
        payload = json.loads(request.body)
        event_type = payload.get('type')
        data = payload.get('data', {})
        
        print(f"📥 Received webhook: {event_type}")
        
        if event_type == 'user.created':
            handle_user_created(data)
        elif event_type == 'user.updated':
            handle_user_updated(data)
        elif event_type == 'user.deleted':
            handle_user_deleted(data)
        else:
            print(f"ℹ️ Unhandled event type: {event_type}")
        
        return JsonResponse({'success': True, 'event': event_type})
        
    except Exception as e:
        print(f"💥 Webhook error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


def handle_user_created(data):
    """
    Handle user.created event
    Create user in Django database
    """
    clerk_user_id = data.get('id')
    
    if not clerk_user_id:
        print("❌ No user ID in webhook data")
        return
    
    # Get email
    email_addresses = data.get('email_addresses', [])
    email = None
    if email_addresses:
        email = email_addresses[0].get('email_address')
    
    if not email:
        print("❌ No email in webhook data")
        return
    
    # Get name
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')
    full_name = f"{first_name} {last_name}".strip() or email.split('@')[0]
    
    # Get role from metadata
    unsafe_metadata = data.get('unsafe_metadata', {})
    public_metadata = data.get('public_metadata', {})
    role = unsafe_metadata.get('role') or public_metadata.get('role', 'user')
    
    # Get phone
    phone_numbers = data.get('phone_numbers', [])
    phone = ''
    if phone_numbers:
        phone = phone_numbers[0].get('phone_number', '')
    
    # Create or update user
    user, created = User.objects.update_or_create(
        clerk_user_id=clerk_user_id,
        defaults={
            'email': email,
            'fullName': full_name,
            'role': role,
            'phone': phone,
            'is_active': True,
        }
    )
    
    action = "Created" if created else "Updated"
    print(f"✅ {action} user: {email} (role: {role})")


def handle_user_updated(data):
    """
    Handle user.updated event
    Update user in Django database
    """
    clerk_user_id = data.get('id')
    
    if not clerk_user_id:
        print("❌ No user ID in webhook data")
        return
    
    try:
        user = User.objects.get(clerk_user_id=clerk_user_id)
        
        # Update email
        email_addresses = data.get('email_addresses', [])
        if email_addresses:
            user.email = email_addresses[0].get('email_address')
        
        # Update name
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        if first_name or last_name:
            user.fullName = f"{first_name} {last_name}".strip() or user.email.split('@')[0]
        
        # Update role (only if not manually set to admin)
        unsafe_metadata = data.get('unsafe_metadata', {})
        public_metadata = data.get('public_metadata', {})
        new_role = unsafe_metadata.get('role') or public_metadata.get('role')
        
        if new_role and user.role == 'user':
            # Only update if current role is 'user' (preserve admin/authority roles set in Django)
            user.role = new_role
        
        # Update phone
        phone_numbers = data.get('phone_numbers', [])
        if phone_numbers:
            user.phone = phone_numbers[0].get('phone_number', '')
        
        user.save()
        print(f"✅ Updated user: {user.email}")
        
    except User.DoesNotExist:
        print(f"⚠️ User not found in Django, creating: {clerk_user_id}")
        handle_user_created(data)


def handle_user_deleted(data):
    """
    Handle user.deleted event
    Delete user from Django database
    """
    clerk_user_id = data.get('id')
    
    if not clerk_user_id:
        print("❌ No user ID in webhook data")
        return
    
    try:
        user = User.objects.get(clerk_user_id=clerk_user_id)
        email = user.email
        user.delete()
        print(f"🗑️ Deleted user: {email}")
        
    except User.DoesNotExist:
        print(f"ℹ️ User not found in Django: {clerk_user_id}")
