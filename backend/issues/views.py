from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .serializers import IssueSerializer, IssueCommentSerializer
from .models import Issue, IssuePhoto, IssueVote, IssueComment

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
    VOTE_THRESHOLD = 10
    
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
    """
    try:
        issue = Issue.objects.get(pk=pk)
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {"success": False, "message": "Status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status
        issue.status = new_status
        issue.save()
        
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
