from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.core.mail import send_mass_mail, send_mail
from django.conf import settings
from .serializers import IssueSerializer, IssueCommentSerializer
from .models import Issue, IssuePhoto, IssueVote, IssueComment, Notification

@api_view(['POST'])
def create_issue(request):
    serializer = IssueSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        issue = serializer.save()

        # Handle photo uploads
        files = request.FILES.getlist('photos')
        for f in files:
            IssuePhoto.objects.create(issue=issue, image=f)

        return Response(
            {
                "success": True,
                "message": "Issue created successfully",
                "data": IssueSerializer(issue, context={'request': request}).data
            },
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def list_issues(request):
    """
    List all issues with optional filtering and search
    Query params: category, status, priority, search, sort
    """
    issues = Issue.objects.all().order_by('-created_at')
    
    # Filtering
    category = request.GET.get('category')
    if category and category != 'all':
        issues = issues.filter(category__iexact=category)
    
    status_filter = request.GET.get('status')
    if status_filter and status_filter != 'all':
        issues = issues.filter(status__iexact=status_filter)
    
    priority = request.GET.get('priority')
    if priority and priority != 'all':
        issues = issues.filter(priority__iexact=priority)
    
    # Search
    search = request.GET.get('search')
    if search:
        issues = issues.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(address__icontains=search)
        )
    
    # Sorting
    sort = request.GET.get('sort', 'newest')
    if sort == 'oldest':
        issues = issues.order_by('created_at')
    elif sort == 'title':
        issues = issues.order_by('title')
    
    serializer = IssueSerializer(issues, many=True, context={'request': request})
    return Response({
        "success": True,
        "count": issues.count(),
        "data": serializer.data
    })

@api_view(['GET'])
def get_issue(request, pk):
    """
    Retrieve a single issue by ID
    """
    try:
        issue = Issue.objects.get(pk=pk)
        serializer = IssueSerializer(issue, context={'request': request})
        return Response({
            "success": True,
            "data": serializer.data
        })
    except Issue.DoesNotExist:
        return Response(
            {"success": False, "message": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PUT', 'PATCH'])
def update_issue(request, pk):
    """
    Update an issue
    """
    try:
        issue = Issue.objects.get(pk=pk)
        serializer = IssueSerializer(issue, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "message": "Issue updated successfully",
                "data": serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Issue.DoesNotExist:
        return Response(
            {"success": False, "message": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
def delete_issue(request, pk):
    """
    Delete an issue
    """
    try:
        issue = Issue.objects.get(pk=pk)
        issue.delete()
        return Response({
            "success": True,
            "message": "Issue deleted successfully"
        })
    except Issue.DoesNotExist:
        return Response(
            {"success": False, "message": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
def get_stats(request):
    """
    Get statistics about issues
    """
    total = Issue.objects.count()
    by_status = {}
    for s in ['Submitted', 'In Discussion', 'Under Review', 'In Progress', 'Resolved', 'Closed']:
        by_status[s] = Issue.objects.filter(status=s).count()
    
    by_category = {}
    for c in ['Infrastructure', 'Public Safety', 'Environment', 'Transportation', 'Utilities']:
        by_category[c] = Issue.objects.filter(category=c).count()
    
    by_priority = {}
    for p in ['Low', 'Medium', 'High']:
        by_priority[p] = Issue.objects.filter(priority=p).count()
    
    return Response({
        "success": True,
        "data": {
            "total": total,
            "by_status": by_status,
            "by_category": by_category,
            "by_priority": by_priority
        }
    })

@api_view(['POST'])
def increment_views(request, pk):
    """
    Increment view count for an issue only if this viewer hasn't viewed it before
    """
    try:
        issue = Issue.objects.get(pk=pk)
        viewer_id = request.data.get('viewer_id')
        
        if not viewer_id:
            # Fallback: if no viewer_id provided, use IP address
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                viewer_id = x_forwarded_for.split(',')[0].strip()
            else:
                viewer_id = request.META.get('REMOTE_ADDR', 'unknown')
        
        # Check if this viewer has already viewed this issue
        from .models import IssueView
        view_exists = IssueView.objects.filter(issue=issue, viewer_id=viewer_id).exists()
        
        if not view_exists:
            # Create view record and increment count
            IssueView.objects.create(issue=issue, viewer_id=viewer_id)
            issue.views += 1
            issue.save(update_fields=['views'])
            return Response({
                "success": True,
                "views": issue.views,
                "new_view": True
            })
        else:
            # Already viewed, return current count without incrementing
            return Response({
                "success": True,
                "views": issue.views,
                "new_view": False
            })
    except Issue.DoesNotExist:
        return Response(
            {"success": False, "message": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
def upvote_issue(request, pk):
    """
    Upvote or downvote an issue - requires voter_email and vote_type in request body
    vote_type: 'up' or 'down'
    """
    try:
        issue = Issue.objects.get(pk=pk)
        voter_email = request.data.get('voter_email')
        vote_type = request.data.get('vote_type', 'up')  # default to upvote
        
        if not voter_email:
            return Response(
                {"success": False, "message": "voter_email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already voted
        existing_vote = IssueVote.objects.filter(issue=issue, voter_email=voter_email).first()
        
        if existing_vote:
            # If same vote type, remove it
            if existing_vote.vote_type == vote_type:
                if vote_type == 'up':
                    issue.upvotes = max(0, issue.upvotes - 1)
                else:
                    issue.downvotes = max(0, issue.downvotes - 1)
                existing_vote.delete()
                issue.save()
                
                return Response({
                    "success": True,
                    "message": "Vote removed successfully",
                    "data": {
                        "upvotes": issue.upvotes,
                        "downvotes": issue.downvotes,
                        "voteScore": issue.upvotes - issue.downvotes,
                        "userVote": None
                    }
                })
            else:
                # Switch vote type
                if existing_vote.vote_type == 'up':
                    issue.upvotes = max(0, issue.upvotes - 1)
                    issue.downvotes += 1
                else:
                    issue.downvotes = max(0, issue.downvotes - 1)
                    issue.upvotes += 1
                
                existing_vote.vote_type = vote_type
                existing_vote.save()
                issue.save()
                
                # Check vote threshold
                check_vote_threshold(issue)
                
                return Response({
                    "success": True,
                    "message": "Vote updated successfully",
                    "data": {
                        "upvotes": issue.upvotes,
                        "downvotes": issue.downvotes,
                        "voteScore": issue.upvotes - issue.downvotes,
                        "userVote": vote_type
                    }
                })
        
        # Create new vote
        IssueVote.objects.create(issue=issue, voter_email=voter_email, vote_type=vote_type)
        if vote_type == 'up':
            issue.upvotes += 1
        else:
            issue.downvotes += 1
        issue.save()
        
        # Check vote threshold
        check_vote_threshold(issue)
        
        return Response({
            "success": True,
            "message": "Vote recorded successfully",
            "data": {
                "upvotes": issue.upvotes,
                "downvotes": issue.downvotes,
                "voteScore": issue.upvotes - issue.downvotes,
                "userVote": vote_type
            }
        })
    except Issue.DoesNotExist:
        return Response(
            {"success": False, "message": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )

def check_vote_threshold(issue):
    """
    Check if issue has reached vote threshold and alert authorities
    """
    VOTE_THRESHOLD = 5
    
    vote_score = issue.upvotes - issue.downvotes
    
    if vote_score >= VOTE_THRESHOLD and issue.status == 'Submitted':
        # Update status to indicate high priority
        issue.status = 'Under Review'
        issue.save()
        
        # TODO: Send email notification to authorities
        # send_mail(
        #     subject=f'High Priority Issue: {issue.report_id}',
        #     message=f'Issue "{issue.title}" has reached {vote_score} votes and requires attention.',
        #     from_email=settings.EMAIL_HOST_USER,
        #     recipient_list=['authority@example.com'],
        # )
        print(f"ALERT: Issue {issue.report_id} has reached vote threshold with {vote_score} votes!")

@api_view(['GET'])
def check_upvote(request, pk):
    """
    Check user's vote status on an issue
    Query param: voter_email
    Returns: has_voted (boolean), vote_type ('up'/'down'/null)
    """
    try:
        issue = Issue.objects.get(pk=pk)
        voter_email = request.GET.get('voter_email')
        
        if not voter_email:
            return Response(
                {"success": False, "message": "voter_email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        vote = IssueVote.objects.filter(issue=issue, voter_email=voter_email).first()
        
        return Response({
            "success": True,
            "data": {
                "has_voted": vote is not None,
                "vote_type": vote.vote_type if vote else None
            }
        })
    except Issue.DoesNotExist:
        return Response(
            {"success": False, "message": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
def search_similar_issues(request):
    """
    Search for similar issues based on title and description
    Query params: title, description, category
    """
    title = request.GET.get('title', '')
    description = request.GET.get('description', '')
    category = request.GET.get('category', '')
    
    if not title and not description:
        return Response({
            "success": True,
            "data": []
        })
    
    # Build query
    query = Q()
    if title:
        query |= Q(title__icontains=title)
    if description:
        query |= Q(description__icontains=description)
    if category:
        query &= Q(category__iexact=category)
    
    # Find similar issues
    similar_issues = Issue.objects.filter(query).order_by('-upvotes', '-created_at')[:5]
    serializer = IssueSerializer(similar_issues, many=True, context={'request': request})
    
    return Response({
        "success": True,
        "count": similar_issues.count(),
        "data": serializer.data
    })

@api_view(['PATCH'])
def update_issue_status(request, pk):
    """
    Update only the status of an issue (for authority dashboard)
    Sends email notifications and creates in-app notifications for ALL status changes.
    """
    try:
        issue = Issue.objects.get(pk=pk)
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {"success": False, "message": "Status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = issue.status
        
        # Don't send notifications if status hasn't changed
        if old_status == new_status:
            return Response({
                "success": True,
                "message": "Status unchanged",
                "data": IssueSerializer(issue, context={'request': request}).data
            })
        
        # Update status
        issue.status = new_status
        issue.save()
        
        # Send notifications for ALL status changes
        _send_status_change_notifications(issue, old_status, new_status)
        
        return Response({
            "success": True,
            "message": "Issue status updated successfully",
            "data": IssueSerializer(issue, context={'request': request}).data
        })
    except Issue.DoesNotExist:
        return Response(
            {"success": False, "message": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )


# Status display helpers
STATUS_LABELS = {
    'Submitted': '📋 Submitted',
    'Under Review': '🔍 Under Review',
    'In Discussion': '💬 In Discussion',
    'In Progress': '🔧 In Progress',
    'Resolved': '✅ Resolved',
    'Rejected': '❌ Rejected',
    'Closed': '🔒 Closed',
}

STATUS_COLORS = {
    'Submitted': '#6366f1',
    'Under Review': '#f59e0b',
    'In Discussion': '#8b5cf6',
    'In Progress': '#3b82f6',
    'Resolved': '#22c55e',
    'Rejected': '#ef4444',
    'Closed': '#6b7280',
}


def _get_notification_type(new_status):
    """Map status to notification type"""
    mapping = {
        'Resolved': 'resolved',
        'Rejected': 'rejected',
        'In Progress': 'in_progress',
        'Under Review': 'under_review',
    }
    return mapping.get(new_status, 'status_change')


def _build_status_email_html(issue, old_status, new_status, is_reporter=True):
    """Build a styled HTML email for status change notifications"""
    status_color = STATUS_COLORS.get(new_status, '#6366f1')
    status_label = STATUS_LABELS.get(new_status, new_status)
    old_label = STATUS_LABELS.get(old_status, old_status)

    if is_reporter:
        greeting = f"Dear {issue.reporter_name or 'Resident'},"
        intro = "We wanted to let you know that the status of the issue you reported has been updated."
    else:
        greeting = "Dear Community Member,"
        intro = "An issue you supported with your vote has a status update."

    html = f"""
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, {status_color}, {status_color}dd); padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">Issue Status Updated</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">{issue.report_id}</p>
            </div>
            <div style="padding: 24px;">
                <p style="color: #374151; font-size: 15px;">{greeting}</p>
                <p style="color: #6b7280; font-size: 14px;">{intro}</p>
                
                <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <h3 style="color: #111827; margin: 0 0 12px; font-size: 16px;">{issue.title}</h3>
                    <table style="width: 100%; font-size: 14px; color: #6b7280;">
                        <tr><td style="padding: 4px 0;"><strong>Category:</strong></td><td>{issue.category or 'N/A'}</td></tr>
                        <tr><td style="padding: 4px 0;"><strong>Location:</strong></td><td>{issue.address or 'N/A'}</td></tr>
                    </table>
                </div>

                <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin: 24px 0; text-align: center;">
                    <div style="display: inline-block; padding: 8px 16px; background: #f3f4f6; border-radius: 8px; color: #6b7280; font-size: 14px; font-weight: 500;">
                        {old_label}
                    </div>
                    <span style="font-size: 20px; color: #9ca3af;">→</span>
                    <div style="display: inline-block; padding: 8px 16px; background: {status_color}15; border: 2px solid {status_color}; border-radius: 8px; color: {status_color}; font-size: 14px; font-weight: 600;">
                        {status_label}
                    </div>
                </div>
    """

    if new_status == 'Resolved':
        html += """
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="color: #166534; margin: 0; font-size: 14px;">
                        <strong>Great news!</strong> This issue has been resolved. If you believe it hasn't been fully addressed, feel free to submit a new report.
                    </p>
                </div>
        """
    elif new_status == 'Rejected':
        html += """
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="color: #991b1b; margin: 0; font-size: 14px;">
                        This issue has been reviewed and could not be actioned at this time. If you have additional information, you may submit a new report.
                    </p>
                </div>
        """
    elif new_status == 'In Progress':
        html += """
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="color: #1e40af; margin: 0; font-size: 14px;">
                        The relevant authorities are now actively working on this issue. We'll notify you when there's another update.
                    </p>
                </div>
        """

    html += f"""
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
                        Best regards,<br>
                        <strong>The E-speak Team</strong>
                    </p>
                </div>
                <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                    <p>This email was sent regarding issue <strong>{issue.report_id}</strong></p>
                    <p><strong>E-speak</strong> — Making Your Voice Heard</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    return html


def _send_status_change_notifications(issue, old_status, new_status):
    """
    Send email + create in-app notification for the issue reporter only
    on ANY status change. Emails are still sent to upvoters.
    """
    import threading

    def _do_notify():
        try:
            notification_type = _get_notification_type(new_status)
            status_label = STATUS_LABELS.get(new_status, new_status)
            notif_title = f"Issue {new_status}: {issue.title}"
            notif_message = (
                f"Your issue \"{issue.title}\" ({issue.report_id}) "
                f"has been updated from {old_status} to {new_status}."
            )

            # --- In-app notification ONLY for the reporter ---
            if issue.reporter_email:
                Notification.objects.create(
                    issue=issue,
                    recipient_email=issue.reporter_email,
                    recipient_name=issue.reporter_name or '',
                    notification_type=notification_type,
                    title=notif_title,
                    message=notif_message,
                    old_status=old_status,
                    new_status=new_status,
                )

            # --- Email notifications (reporter + upvoters) ---
            upvoter_emails = list(
                IssueVote.objects.filter(issue=issue, vote_type='up')
                .values_list('voter_email', flat=True)
            )
            recipients = set()
            if issue.reporter_email:
                recipients.add(issue.reporter_email)
            recipients.update(upvoter_emails)

            if not recipients:
                print(f"No recipients to notify for issue {issue.report_id}")
                return

            subject = f"Issue Update: {issue.title} — Now {new_status} ({issue.report_id})"
            from_email = settings.DEFAULT_FROM_EMAIL

            for email in recipients:
                is_reporter = (email == issue.reporter_email)
                html_message = _build_status_email_html(issue, old_status, new_status, is_reporter)
                plain_message = (
                    f"{'Dear ' + (issue.reporter_name or 'Resident') if is_reporter else 'Dear Community Member'},\n\n"
                    f"The issue \"{issue.title}\" ({issue.report_id}) has been updated.\n\n"
                    f"Status: {old_status} → {new_status}\n"
                    f"Category: {issue.category}\n"
                    f"Location: {issue.address}\n\n"
                    f"Best regards,\nE-speak Civic Platform"
                )

                try:
                    send_mail(
                        subject=subject,
                        message=plain_message,
                        from_email=from_email,
                        recipient_list=[email],
                        html_message=html_message,
                        fail_silently=True,
                    )
                    print(f"Status change notification sent to {email} for issue {issue.report_id}")
                except Exception as e:
                    print(f"Failed to send email to {email}: {e}")

            print(f"Status notifications sent for {issue.report_id} ({old_status} → {new_status}) to {len(recipients)} recipient(s)")

        except Exception as e:
            print(f"Error sending status notifications for issue {issue.report_id}: {e}")

    thread = threading.Thread(target=_do_notify)
    thread.daemon = True
    thread.start()

# Comment endpoints
@api_view(['GET'])
def get_comments(request, pk):
    """
    Get all comments for an issue
    """
    try:
        issue = Issue.objects.get(pk=pk)
        comments = issue.comments.filter(parent=None)  # Only top-level comments
        serializer = IssueCommentSerializer(comments, many=True)
        
        return Response({
            "success": True,
            "count": comments.count(),
            "data": serializer.data
        })
    except Issue.DoesNotExist:
        return Response(
            {"success": False, "message": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def create_comment(request, pk):
    """
    Create a comment on an issue
    Required: user_email, user_name, comment
    Optional: parent (for replies)
    """
    try:
        issue = Issue.objects.get(pk=pk)
        
        user_email = request.data.get('user_email')
        user_name = request.data.get('user_name')
        comment_text = request.data.get('comment')
        parent_id = request.data.get('parent')
        
        if not all([user_email, user_name, comment_text]):
            return Response(
                {"success": False, "message": "user_email, user_name, and comment are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create comment directly using model
        comment = IssueComment.objects.create(
            issue=issue,
            user_email=user_email,
            user_name=user_name,
            comment=comment_text,
            parent_id=parent_id if parent_id else None
        )
        
        # Serialize the response
        serializer = IssueCommentSerializer(comment)
        
        return Response({
            "success": True,
            "message": "Comment posted successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Issue.DoesNotExist:
        return Response(
            {"success": False, "message": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def delete_comment(request, pk, comment_id):
    """
    Delete a comment (only by comment author)
    """
    try:
        from .models import IssueComment
        comment = IssueComment.objects.get(id=comment_id, issue_id=pk)
        
        user_email = request.data.get('user_email')
        if not user_email or comment.user_email != user_email:
            return Response(
                {"success": False, "message": "You can only delete your own comments"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comment.delete()
        return Response({
            "success": True,
            "message": "Comment deleted successfully"
        })
        
    except IssueComment.DoesNotExist:
        return Response(
            {"success": False, "message": "Comment not found"},
            status=status.HTTP_404_NOT_FOUND
        )


# ===== Notification Endpoints =====

@api_view(['GET'])
def get_notifications(request):
    """
    Get all notifications for a user by email.
    Query params: email (required), unread_only (optional)
    """
    email = request.GET.get('email')
    if not email:
        return Response(
            {"success": False, "message": "Email parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    notifications = Notification.objects.filter(recipient_email=email)

    unread_only = request.GET.get('unread_only', '').lower() == 'true'
    if unread_only:
        notifications = notifications.filter(is_read=False)

    data = []
    for n in notifications[:50]:  # Limit to 50 most recent
        data.append({
            'id': n.id,
            'issueId': n.issue.id,
            'reportId': n.issue.report_id,
            'issueTitle': n.issue.title,
            'notificationType': n.notification_type,
            'title': n.title,
            'message': n.message,
            'oldStatus': n.old_status,
            'newStatus': n.new_status,
            'isRead': n.is_read,
            'createdAt': n.created_at.isoformat(),
        })

    unread_count = Notification.objects.filter(recipient_email=email, is_read=False).count()

    return Response({
        "success": True,
        "count": len(data),
        "unreadCount": unread_count,
        "data": data
    })


@api_view(['PATCH'])
def mark_notification_read(request, notification_id):
    """
    Mark a single notification as read.
    """
    try:
        notification = Notification.objects.get(pk=notification_id)
        notification.is_read = True
        notification.save()
        return Response({"success": True, "message": "Notification marked as read"})
    except Notification.DoesNotExist:
        return Response(
            {"success": False, "message": "Notification not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
def mark_all_notifications_read(request):
    """
    Mark all notifications as read for a given email.
    Body: { email: "..." }
    """
    email = request.data.get('email')
    if not email:
        return Response(
            {"success": False, "message": "Email is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    updated = Notification.objects.filter(recipient_email=email, is_read=False).update(is_read=True)
    return Response({
        "success": True,
        "message": f"Marked {updated} notifications as read"
    })
