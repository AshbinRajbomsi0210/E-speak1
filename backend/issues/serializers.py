from rest_framework import serializers
from .models import Issue, IssuePhoto

class IssuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssuePhoto
        fields = ['id', 'image']

class IssueSerializer(serializers.ModelSerializer):
    reporterName = serializers.CharField(source='reporter_name', required=True)
    reporterEmail = serializers.EmailField(source='reporter_email', required=True)
    reporterPhone = serializers.CharField(source='reporter_phone', required=False, allow_blank=True)
    photos = IssuePhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Issue
        fields = [
            'id', 'report_id', 'title', 'description', 'category', 'priority',
            'reporterName', 'reporterEmail', 'reporterPhone',
            'address', 'status', 'created_at', 'photos'
        ]
        read_only_fields = ('id', 'report_id', 'status', 'created_at')
