"""
REST API views for AI Chatbot
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import logging

from .rag_pipeline import RAGPipeline

logger = logging.getLogger(__name__)

# Singleton RAG pipeline
_rag_pipeline = None


def get_rag_pipeline():
    """Get or create RAG pipeline instance"""
    global _rag_pipeline
    if _rag_pipeline is None:
        socrata_token = getattr(settings, 'SOCRATA_APP_TOKEN', None)
        vector_store_path = getattr(settings, 'VECTOR_STORE_PATH', 'ai_chatbot/vector_store')
        _rag_pipeline = RAGPipeline(
            socrata_token=socrata_token,
            vector_store_path=vector_store_path
        )
    return _rag_pipeline


class ChatView(APIView):
    """Handle chat queries"""
    
    def post(self, request):
        query = request.data.get('query', '').strip()
        
        if not query:
            return Response(
                {'error': 'Query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            pipeline = get_rag_pipeline()
            result = pipeline.generate_answer(query)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class IngestDataView(APIView):
    """Trigger data ingestion"""
    
    def post(self, request):
        days = request.data.get('days', 90)
        limit = request.data.get('limit', 1000)
        
        try:
            pipeline = get_rag_pipeline()
            pipeline.ingest_data(days=days, limit=limit)
            
            stats = pipeline.get_stats()
            
            return Response({
                'message': 'Data ingestion completed',
                'stats': stats
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in ingestion: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StatsView(APIView):
    """Get vector store statistics"""
    
    def get(self, request):
        try:
            pipeline = get_rag_pipeline()
            stats = pipeline.get_stats()
            
            return Response(stats, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
