from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import IssueSerializer
from .models import Issue, IssuePhoto

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
