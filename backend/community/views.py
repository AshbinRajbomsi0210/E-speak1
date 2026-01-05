from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q, Prefetch
from django.utils import timezone
from .models import (
    Poll, PollOption, PollVote, PollComment,
    Discussion, DiscussionComment, UserActivity, UserBadge, UserPoints
)
from .serializers import (
    PollSerializer, CreatePollSerializer, PollVoteSerializer, PollCommentSerializer,
    DiscussionSerializer, CreateDiscussionSerializer, DiscussionCommentSerializer,
    UserActivitySerializer, LeaderboardSerializer, UserProgressSerializer
)
from accounts.permissions import IsAdmin, IsAuthority


class PollViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Poll.objects.all().prefetch_related(
            'options__votes',
            Prefetch('comments', queryset=PollComment.objects.select_related('user'))
        )
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreatePollSerializer
        return PollSerializer
    
    def create(self, request, *args, **kwargs):
        """Override create to return full poll data with PollSerializer"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        poll = self.perform_create(serializer)
        
        # Return full poll data using PollSerializer
        output_serializer = PollSerializer(poll, context={'request': request})
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        poll = serializer.save(created_by=self.request.user)
        
        # Award points for creating poll
        user_points, created = UserPoints.objects.get_or_create(user=self.request.user)
        user_points.add_points(50)
        
        # Create activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='poll_created',
            description=f"Created poll: {poll.title}",
            related_item=poll.title,
            points=50
        )
        
        return poll
    
    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        poll = self.get_object()
        option_id = request.data.get('option_id')
        
        try:
            option = PollOption.objects.get(id=option_id, poll=poll)
        except PollOption.DoesNotExist:
            return Response(
                {'error': 'Invalid option'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PollVoteSerializer(
            data={'poll': poll.id, 'option': option.id},
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Award points for voting
            user_points, created = UserPoints.objects.get_or_create(user=request.user)
            user_points.add_points(10)
            
            # Create activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='poll_voted',
                description=f"Voted on poll: {poll.title}",
                related_item=poll.title,
                points=10
            )
            
            return Response(
                PollSerializer(poll, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        poll = self.get_object()
        text = request.data.get('text')
        
        if not text:
            return Response(
                {'error': 'Comment text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        comment = PollComment.objects.create(
            poll=poll,
            user=request.user,
            text=text
        )
        
        # Award points for commenting
        user_points, created = UserPoints.objects.get_or_create(user=request.user)
        user_points.add_points(5)
        
        # Create activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='comment_added',
            description=f"Commented on poll: {poll.title}",
            related_item=poll.title,
            points=5
        )
        
        return Response(
            PollCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        poll = self.get_object()
        comments = poll.comments.select_related('user').all()
        serializer = PollCommentSerializer(comments, many=True)
        return Response(serializer.data)


class DiscussionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Discussion.objects.all().select_related('author').prefetch_related(
            Prefetch('comments', queryset=DiscussionComment.objects.select_related('user'))
        )
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateDiscussionSerializer
        return DiscussionSerializer
    
    def perform_create(self, serializer):
        discussion = serializer.save(author=self.request.user)
        
        # Award points for creating discussion
        user_points, created = UserPoints.objects.get_or_create(user=self.request.user)
        user_points.add_points(30)
        
        # Create activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='discussion_created',
            description=f"Started discussion: {discussion.title}",
            related_item=discussion.title,
            points=30
        )
    
    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        discussion = self.get_object()
        text = request.data.get('text')
        parent_id = request.data.get('parent_id')
        
        if not text:
            return Response(
                {'error': 'Comment text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        parent = None
        if parent_id:
            try:
                parent = DiscussionComment.objects.get(id=parent_id, discussion=discussion)
            except DiscussionComment.DoesNotExist:
                return Response(
                    {'error': 'Invalid parent comment'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        comment = DiscussionComment.objects.create(
            discussion=discussion,
            user=request.user,
            text=text,
            parent=parent
        )
        
        # Award points for commenting
        user_points, created = UserPoints.objects.get_or_create(user=request.user)
        user_points.add_points(5)
        
        # Create activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='comment_added',
            description=f"Commented on discussion: {discussion.title}",
            related_item=discussion.title,
            points=5
        )
        
        return Response(
            DiscussionCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def leaderboard(request):
    """Get top users by points"""
    limit = int(request.query_params.get('limit', 10))
    
    user_points = UserPoints.objects.select_related('user').prefetch_related(
        'user__badges', 'user__activities'
    ).order_by('-total_points')[:limit]
    
    serializer = LeaderboardSerializer(user_points, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def activity_feed(request):
    """Get recent activities from all users"""
    limit = int(request.query_params.get('limit', 20))
    
    activities = UserActivity.objects.select_related('user').order_by('-created_at')[:limit]
    serializer = UserActivitySerializer(activities, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_progress(request):
    """Get current user's progress, points, badges"""
    user_points, created = UserPoints.objects.get_or_create(user=request.user)
    serializer = UserProgressSerializer(user_points)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def community_stats(request):
    """Get community statistics"""
    stats = {
        'total_polls': Poll.objects.count(),
        'active_polls': Poll.objects.filter(status='active').count(),
        'total_discussions': Discussion.objects.count(),
        'total_votes': PollVote.objects.count(),
        'total_members': UserPoints.objects.count(),
        'total_activities': UserActivity.objects.count(),
    }
    return Response(stats)
