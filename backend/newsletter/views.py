from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from .models import NewsletterSubscription
from .serializers import NewsletterSubscriptionSerializer


def send_confirmation_email(email):
    """Send a welcome confirmation email to new subscribers"""
    subject = 'Welcome to E-speak Newsletter! 🎉'
    
    message = f"""
Hello!

Thank you for subscribing to the E-speak newsletter!

You'll now receive:
✅ Weekly updates about community issues in your area
✅ Information about resolved problems and ongoing work
✅ Community events and civic engagement opportunities
✅ Impact reports showing the change we're creating together

We're excited to keep you informed about what's happening in your community!

If you ever want to unsubscribe, you can do so by visiting our website.

Best regards,
The E-speak Team

---
This email was sent to {email}
E-speak - Making Your Voice Heard
    """
    
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to E-speak! 🎉</h1>
            </div>
            
            <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                    Hello!
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                    Thank you for subscribing to the <strong>E-speak newsletter</strong>!
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
                    <h3 style="color: #10b981; margin-top: 0;">You'll now receive:</h3>
                    <ul style="list-style: none; padding-left: 0;">
                        <li style="padding: 8px 0;">✅ Weekly updates about community issues in your area</li>
                        <li style="padding: 8px 0;">✅ Information about resolved problems and ongoing work</li>
                        <li style="padding: 8px 0;">✅ Community events and civic engagement opportunities</li>
                        <li style="padding: 8px 0;">✅ Impact reports showing the change we're creating together</li>
                    </ul>
                </div>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                    We're excited to keep you informed about what's happening in your community!
                </p>
                
                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    If you ever want to unsubscribe, you can do so by visiting our website.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
                        Best regards,<br>
                        <strong>The E-speak Team</strong>
                    </p>
                </div>
                
                <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                    <p>This email was sent to {email}</p>
                    <p><strong>E-speak</strong> - Making Your Voice Heard</p>
                </div>
            </div>
        </body>
    </html>
    """
    
    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@e-speak.com'),
        recipient_list=[email],
        html_message=html_message,
        fail_silently=False,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def subscribe_newsletter(request):
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'success': False, 'message': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if email already exists
    existing_subscription = NewsletterSubscription.objects.filter(email=email).first()
    
    if existing_subscription:
        if existing_subscription.is_active:
            return Response(
                {'success': False, 'message': 'This email is already subscribed to our newsletter'},
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # Reactivate if previously unsubscribed
            existing_subscription.is_active = True
            existing_subscription.unsubscribed_at = None
            existing_subscription.save()
            return Response(
                {'success': True, 'message': 'Welcome back! Your subscription has been reactivated.'},
                status=status.HTTP_200_OK
            )
    
    # Create new subscription
    serializer = NewsletterSubscriptionSerializer(data={'email': email})
    
    if serializer.is_valid():
        subscription = serializer.save()
        
        # Send confirmation email
        try:
            send_confirmation_email(subscription.email)
        except Exception as e:
            print(f"Failed to send confirmation email: {e}")
            # Still return success even if email fails
        
        return Response(
            {'success': True, 'message': 'Successfully subscribed! Check your inbox for confirmation.'},
            status=status.HTTP_201_CREATED
        )
    
    return Response(
        {'success': False, 'message': 'Invalid email address'},
        status=status.HTTP_400_BAD_REQUEST
    )
