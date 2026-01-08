"""
REST API Views for Civic AI Chatbot
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import logging

from .rag_pipeline import RAGPipeline

logger = logging.getLogger(__name__)

# Singleton pipeline instance
_rag_pipeline = None


def get_pipeline():
    """Get or create RAG pipeline singleton"""
    global _rag_pipeline
    if _rag_pipeline is None:
        _rag_pipeline = RAGPipeline(
            socrata_token=getattr(settings, 'SOCRATA_APP_TOKEN', None),
            embedding_model=getattr(settings, 'EMBEDDING_MODEL', 'all-MiniLM-L6-v2'),
            vector_store_path=getattr(settings, 'VECTOR_STORE_PATH', 'civic_ai/vector_store')
        )
    return _rag_pipeline


class ChatAPIView(APIView):
    """
    Handle chatbot queries
    POST /api/civic-ai/chat/
    Body: { "question": "What are common noise complaints?" }
    """
    
    def post(self, request):
        question = request.data.get('question', '').strip()
        
        if not question:
            return Response(
                {'error': 'Question is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            pipeline = get_pipeline()
            result = pipeline.query(question, k=5)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Chat error: {e}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class IngestDataAPIView(APIView):
    """
    Trigger data ingestion
    POST /api/civic-ai/ingest/
    Body: { "days_back": 90, "total_limit": 5000 }
    """
    
    def post(self, request):
        days_back = request.data.get('days_back', 90)
        total_limit = request.data.get('total_limit', 5000)
        batch_size = request.data.get('batch_size', 1000)
        
        try:
            pipeline = get_pipeline()
            stats = pipeline.ingest_data(
                days_back=days_back,
                total_limit=total_limit,
                batch_size=batch_size
            )
            
            if 'error' in stats:
                return Response(stats, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'message': 'Data ingestion completed successfully',
                'stats': stats
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Ingestion error: {e}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StatsAPIView(APIView):
    """
    Get vector store statistics
    GET /api/civic-ai/stats/
    """
    
    def get(self, request):
        try:
            pipeline = get_pipeline()
            stats = pipeline.get_stats()
            
            return Response(stats, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Stats error: {e}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
