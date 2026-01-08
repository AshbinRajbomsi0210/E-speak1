"""
Management command to ingest NYC 311 data
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from ai_chatbot.rag_pipeline import RAGPipeline


class Command(BaseCommand):
    help = 'Fetch and index NYC 311 civic data for RAG'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Number of days to look back (default: 90)'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=1000,
            help='Maximum number of records to fetch (default: 1000)'
        )

    def handle(self, *args, **options):
        days = options['days']
        limit = options['limit']
        
        self.stdout.write(f'Fetching NYC 311 data (last {days} days, limit {limit})...')
        
        socrata_token = getattr(settings, 'SOCRATA_APP_TOKEN', None)
        vector_store_path = getattr(settings, 'VECTOR_STORE_PATH', 'ai_chatbot/vector_store')
        
        pipeline = RAGPipeline(
            socrata_token=socrata_token,
            vector_store_path=vector_store_path
        )
        
        try:
            pipeline.ingest_data(days=days, limit=limit)
            
            stats = pipeline.get_stats()
            
            self.stdout.write(self.style.SUCCESS(
                f'\nSuccess! Indexed {stats["total_documents"]} documents'
            ))
            self.stdout.write(f'  - Dimension: {stats["dimension"]}')
            self.stdout.write(f'  - Index size: {stats["index_size"]}')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))
            raise
