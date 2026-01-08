"""
Django management command to ingest NYC 311 data
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from civic_ai.rag_pipeline import RAGPipeline


class Command(BaseCommand):
    help = 'Fetch and index NYC 311 civic data into vector store'

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
            default=5000,
            help='Total number of records to fetch (default: 5000)'
        )
        parser.add_argument(
            '--batch',
            type=int,
            default=1000,
            help='Batch size for fetching (default: 1000)'
        )

    def handle(self, *args, **options):
        days = options['days']
        limit = options['limit']
        batch = options['batch']
        
        self.stdout.write(
            self.style.WARNING(
                f'\nFetching NYC 311 data: {days} days back, up to {limit} records...\n'
            )
        )
        
        # Initialize pipeline
        pipeline = RAGPipeline(
            socrata_token=getattr(settings, 'SOCRATA_APP_TOKEN', None),
            embedding_model=getattr(settings, 'EMBEDDING_MODEL', 'all-MiniLM-L6-v2'),
            vector_store_path=getattr(settings, 'VECTOR_STORE_PATH', 'civic_ai/vector_store')
        )
        
        try:
            # Run ingestion
            stats = pipeline.ingest_data(
                days_back=days,
                total_limit=limit,
                batch_size=batch
            )
            
            if 'error' in stats:
                self.stdout.write(self.style.ERROR(f"\nError: {stats['error']}"))
                return
            
            # Display results
            self.stdout.write(self.style.SUCCESS('\n✓ Ingestion completed successfully!\n'))
            self.stdout.write(f"  Total documents: {stats['total_documents']}")
            self.stdout.write(f"  Embedding dimension: {stats['dimension']}")
            self.stdout.write(f"  Index type: {stats['index_type']}")
            self.stdout.write(f"  Index size: {stats['index_size']}\n")
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\nError during ingestion: {e}'))
            raise
