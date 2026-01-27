from rest_framework import serializers
from .models import Issue, IssuePhoto, IssueVote, IssueComment

class IssuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssuePhoto
        fields = ['id', 'image']

class IssueCommentSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user_name')
    userEmail = serializers.EmailField(source='user_email')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = IssueComment
        fields = ['id', 'issue', 'userName', 'userEmail', 'comment', 'parent', 'createdAt', 'updatedAt', 'replies']
        read_only_fields = ('id', 'createdAt', 'updatedAt')

    def get_replies(self, obj):
        if obj.replies.exists():
            return IssueCommentSerializer(obj.replies.all(), many=True).data
        return []

class IssueSerializer(serializers.ModelSerializer):
    reporterName = serializers.CharField(source='reporter_name', required=True)
    reporterEmail = serializers.EmailField(source='reporter_email', required=True)
    reporterPhone = serializers.CharField(source='reporter_phone', required=False, allow_blank=True)
    isAnonymous = serializers.BooleanField(source='is_anonymous', required=False, default=False)
    photos = IssuePhotoSerializer(many=True, read_only=True)
    commentCount = serializers.SerializerMethodField()
    voteScore = serializers.SerializerMethodField()
    displayName = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = [
            'id', 'report_id', 'title', 'description', 'category', 'priority',
            'reporterName', 'reporterEmail', 'reporterPhone', 'isAnonymous', 'displayName',
            'address', 'latitude', 'longitude', 'status', 'upvotes', 'downvotes', 
            'voteScore', 'views', 'commentCount', 'created_at', 'photos'
        ]
        read_only_fields = ('id', 'report_id', 'status', 'upvotes', 'downvotes', 'views', 'created_at', 'voteScore', 'commentCount', 'displayName')

    def get_displayName(self, obj):
        """Return 'Anonymous' if user chose anonymous reporting, otherwise return reporter name"""
        if obj.is_anonymous:
            return 'Anonymous'
        return obj.reporter_name

    def get_commentCount(self, obj):
        return obj.comments.count()

    def get_voteScore(self, obj):
        return obj.upvotes - obj.downvotes
