from rest_framework import serializers
from .models import (
    Poll, PollOption, PollVote, PollComment,
    Discussion, DiscussionComment, UserActivity, UserBadge, UserPoints
)
from accounts.models import CustomUser


class UserBasicSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'fullName', 'avatar']
    
    def get_avatar(self, obj):
        if obj.fullName:
            name = obj.fullName
        else:
            name = obj.email.split('@')[0]
        return f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=0D8ABC&color=fff"


class PollOptionSerializer(serializers.ModelSerializer):
    votes = serializers.IntegerField(source='votes_count', read_only=True)
    
    class Meta:
        model = PollOption
        fields = ['id', 'text', 'votes', 'order']


class PollCommentSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = PollComment
        fields = ['id', 'user', 'text', 'created_at']


class PollSerializer(serializers.ModelSerializer):
    options = PollOptionSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    has_user_voted = serializers.SerializerMethodField()
    created_by = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = Poll
        fields = [
            'id', 'title', 'description', 'options', 'status', 'category',
            'end_date', 'created_at', 'comments_count', 'has_user_voted', 'created_by'
        ]
    
    def get_comments_count(self, obj):
        return obj.comments_count
    
    def get_has_user_voted(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return PollVote.objects.filter(poll=obj, user=request.user).exists()
        return False


class CreatePollSerializer(serializers.ModelSerializer):
    options = serializers.ListField(
        child=serializers.CharField(max_length=255),
        write_only=True,
        min_length=2
    )
    
    class Meta:
        model = Poll
        fields = ['title', 'description', 'category', 'end_date', 'options']
    
    def create(self, validated_data):
        options_data = validated_data.pop('options')
        poll = Poll.objects.create(**validated_data)
        
        for index, option_text in enumerate(options_data):
            PollOption.objects.create(
                poll=poll,
                text=option_text,
                order=index
            )
        
        return poll


class PollVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollVote
        fields = ['poll', 'option']
    
    def validate(self, data):
        user = self.context['request'].user
        poll = data['poll']
        
        # Check if user already voted
        if PollVote.objects.filter(poll=poll, user=user).exists():
            raise serializers.ValidationError("You have already voted on this poll.")
        
        # Check if option belongs to poll
        if data['option'].poll != poll:
            raise serializers.ValidationError("Option does not belong to this poll.")
        
        # Check if poll is active
        if poll.status != 'active':
            raise serializers.ValidationError("This poll is not active.")
        
        return data
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DiscussionCommentSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscussionComment
        fields = ['id', 'user', 'text', 'created_at', 'parent', 'replies']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return DiscussionCommentSerializer(obj.replies.all(), many=True).data
        return []


class DiscussionSerializer(serializers.ModelSerializer):
    author = UserBasicSerializer(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    comments = DiscussionCommentSerializer(many=True, read_only=True)
    preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Discussion
        fields = [
            'id', 'title', 'content', 'preview', 'category', 'author',
            'created_at', 'updated_at', 'comments_count', 'comments'
        ]
    
    def get_preview(self, obj):
        return obj.content[:150] + '...' if len(obj.content) > 150 else obj.content


class CreateDiscussionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discussion
        fields = ['title', 'content', 'category']


class UserActivitySerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    type = serializers.CharField(source='activity_type')
    timestamp = serializers.DateTimeField(source='created_at')
    
    class Meta:
        model = UserActivity
        fields = ['id', 'user', 'type', 'description', 'related_item', 'timestamp']


class UserBadgeSerializer(serializers.ModelSerializer):
    badge_name = serializers.CharField(source='get_badge_type_display')
    
    class Meta:
        model = UserBadge
        fields = ['id', 'badge_type', 'badge_name', 'earned_at']


class LeaderboardSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.fullName')
    email = serializers.EmailField(source='user.email')
    avatar = serializers.SerializerMethodField()
    points = serializers.IntegerField(source='total_points')
    level = serializers.CharField(source='get_level_display')
    top_badge = serializers.SerializerMethodField()
    recent_activity = serializers.SerializerMethodField()
    
    class Meta:
        model = UserPoints
        fields = ['id', 'name', 'email', 'avatar', 'points', 'level', 'top_badge', 'recent_activity']
    
    def get_avatar(self, obj):
        name = obj.user.fullName or obj.user.email.split('@')[0]
        return f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=0D8ABC&color=fff"
    
    def get_top_badge(self, obj):
        badge = obj.user.badges.first()
        if badge:
            return badge.get_badge_type_display()
        return "New Member"
    
    def get_recent_activity(self, obj):
        activity = obj.user.activities.first()
        if activity:
            return activity.description
        return "No recent activity"


class UserProgressSerializer(serializers.ModelSerializer):
    badges = UserBadgeSerializer(many=True, read_only=True, source='user.badges')
    recent_activities = UserActivitySerializer(many=True, read_only=True, source='user.activities')
    
    class Meta:
        model = UserPoints
        fields = ['total_points', 'level', 'badges', 'recent_activities']
