from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .serializers import IssueSerializer
from .models import Issue, IssuePhoto, IssueVote

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
    Upvote an issue - requires voter_email in request body
    """
    try:
        issue = Issue.objects.get(pk=pk)
        voter_email = request.data.get('voter_email')
        
        if not voter_email:
            return Response(
                {"success": False, "message": "voter_email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already voted
        existing_vote = IssueVote.objects.filter(issue=issue, voter_email=voter_email).first()
        if existing_vote:
            return Response(
                {"success": False, "message": "You have already upvoted this issue"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create vote and increment upvotes
        IssueVote.objects.create(issue=issue, voter_email=voter_email)
        issue.upvotes += 1
        issue.save()
        
        return Response({
            "success": True,
            "message": "Issue upvoted successfully",
            "data": {"upvotes": issue.upvotes}
        })
    except Issue.DoesNotExist:
        return Response(
            {"success": False, "message": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
def remove_upvote(request, pk):
    """
    Remove upvote from an issue - requires voter_email in request body
    """
    try:
        issue = Issue.objects.get(pk=pk)
        voter_email = request.data.get('voter_email')
        
        if not voter_email:
            return Response(
                {"success": False, "message": "voter_email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if vote exists
        vote = IssueVote.objects.filter(issue=issue, voter_email=voter_email).first()
        if not vote:
            return Response(
                {"success": False, "message": "You haven't upvoted this issue"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove vote and decrement upvotes
        vote.delete()
        issue.upvotes = max(0, issue.upvotes - 1)
        issue.save()
        
        return Response({
            "success": True,
            "message": "Upvote removed successfully",
            "data": {"upvotes": issue.upvotes}
        })
    except Issue.DoesNotExist:
        return Response(
            {"success": False, "message": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
def check_upvote(request, pk):
    """
    Check if user has upvoted an issue
    Query param: voter_email
    """
    try:
        issue = Issue.objects.get(pk=pk)
        voter_email = request.GET.get('voter_email')
        
        if not voter_email:
            return Response(
                {"success": False, "message": "voter_email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        has_voted = IssueVote.objects.filter(issue=issue, voter_email=voter_email).exists()
        
        return Response({
            "success": True,
            "data": {"has_voted": has_voted}
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
