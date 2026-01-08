"""
RAG Pipeline
Orchestrates the complete Retrieval-Augmented Generation flow
"""
from pathlib import Path
from typing import Dict, List, Optional
import logging

from .nyc_data_client import NYCOpenDataClient
from .document_processor import DocumentProcessor
from .embedding_service import EmbeddingService
from .vector_store import VectorStore

logger = logging.getLogger(__name__)


class RAGPipeline:
    """
    Complete RAG pipeline for civic AI chatbot
    """
    
    def __init__(
        self,
        socrata_token: Optional[str] = None,
        embedding_model: str = 'all-MiniLM-L6-v2',
        vector_store_path: str = 'vector_store',
        index_type: str = 'flat'
    ):
        """
        Initialize RAG pipeline
        
        Args:
            socrata_token: NYC Open Data API token
            embedding_model: Sentence transformer model name
            vector_store_path: Path to save/load vector store
            index_type: FAISS index type
        """
        self.data_client = NYCOpenDataClient(socrata_token)
        self.embedding_service = EmbeddingService(embedding_model)
        self.vector_store = VectorStore(
            dimension=self.embedding_service.get_dimension(),
            index_type=index_type
        )
        self.vector_store_path = Path(vector_store_path)
        
        # Try to load existing vector store
        if self.vector_store_path.exists():
            try:
                self.vector_store.load(str(self.vector_store_path))
                logger.info("Loaded existing vector store")
            except Exception as e:
                logger.warning(f"Could not load vector store: {e}")
    
    def ingest_data(
        self,
        days_back: int = 90,
        total_limit: int = 5000,
        batch_size: int = 1000
    ) -> Dict:
        """
        Fetch, process, and index civic data
        
        Args:
            days_back: Days to look back
            total_limit: Total records to fetch
            batch_size: Batch size for fetching
        
        Returns:
            Statistics about ingestion
        """
        logger.info(f"Starting data ingestion: {total_limit} records, {days_back} days back")
        
        # Fetch data
        logger.info("Fetching data from NYC Open Data...")
        records = self.data_client.fetch_all_batches(
            days_back=days_back,
            total_limit=total_limit,
            batch_size=batch_size
        )
        
        if not records:
            logger.error("No data fetched")
            return {'error': 'No data fetched'}
        
        logger.info(f"Fetched {len(records)} records")
        
        # Process into documents
        logger.info("Processing documents...")
        documents = DocumentProcessor.process_batch(records)
        
        if not documents:
            logger.error("No documents created")
            return {'error': 'No documents created'}
        
        logger.info(f"Created {len(documents)} documents")
        
        # Extract texts and metadata
        texts = [doc['text'] for doc in documents]
        metadatas = [doc['metadata'] for doc in documents]
        
        # Generate embeddings
        logger.info("Generating embeddings...")
        embeddings = self.embedding_service.embed(
            texts,
            batch_size=32,
            show_progress=True
        )
        
        # Add to vector store
        logger.info("Adding to vector store...")
        self.vector_store.add(embeddings, texts, metadatas)
        
        # Save vector store
        logger.info("Saving vector store...")
        self.vector_store.save(str(self.vector_store_path))
        
        stats = self.vector_store.get_stats()
        logger.info(f"Ingestion complete: {stats}")
        
        return stats
    
    def query(
        self,
        question: str,
        k: int = 5,
        generate_answer: bool = True
    ) -> Dict:
        """
        Query the RAG system
        
        Args:
            question: User question
            k: Number of context documents to retrieve
            generate_answer: Whether to generate an answer
        
        Returns:
            Dictionary with answer and context
        """
        # Generate query embedding
        query_embedding = self.embedding_service.embed([question])[0]
        
        # Search vector store
        texts, metadatas, scores = self.vector_store.search(query_embedding, k=k)
        
        if not texts:
            return {
                'answer': "I don't have enough data to answer this question. Please try re-indexing the data.",
                'context': [],
                'confidence': 0.0
            }
        
        # Build context
        context = []
        for i, (text, metadata, score) in enumerate(zip(texts, metadatas, scores)):
            context.append({
                'text': text,
                'metadata': metadata,
                'score': float(score),
                'rank': i + 1
            })
        
        if not generate_answer:
            return {
                'context': context,
                'question': question
            }
        
        # Generate answer (simple summarization for now)
        answer = self._synthesize_answer(question, context)
        
        # Calculate confidence (inverse of distance)
        confidence = max(0.0, min(1.0, 1.0 - (scores[0] / 10.0)))
        
        return {
            'answer': answer,
            'context': context[:3],  # Return top 3 for response
            'confidence': confidence,
            'question': question
        }
    
    def _synthesize_answer(self, question: str, context: List[Dict]) -> str:
        """
        Synthesize a concise answer from context patterns.
        Focus on brief, direct insights without verbose formatting.
        
        Args:
            question: User question
            context: Retrieved context documents
        
        Returns:
            Concise civic insights answer (2-4 sentences)
        """
        # Extract patterns from context
        complaint_types = []
        agencies = []
        
        for item in context:
            metadata = item['metadata']
            complaint_types.append(metadata.get('complaint_type', ''))
            agencies.append(metadata.get('agency', ''))
        
        # Build concise answer (2-3 sentences max)
        sentences = []
        
        # Issue types sentence
        unique_complaints = list(set([c for c in complaint_types if c]))[:3]
        if unique_complaints:
            sentences.append(f"Issues like {', '.join(unique_complaints).lower()} are common in urban areas.")
        
        # Departments sentence
        unique_agencies = list(set([a for a in agencies if a]))
        if unique_agencies:
            generalized_agencies = []
            for agency in unique_agencies[:2]:
                agency_lower = agency.lower()
                if 'police' in agency_lower:
                    generalized_agencies.append('Police/Law Enforcement')
                elif 'sanitation' in agency_lower or 'environmental' in agency_lower:
                    generalized_agencies.append('Sanitation Services')
                elif 'transport' in agency_lower or 'highway' in agency_lower:
                    generalized_agencies.append('Transportation Department')
                elif 'building' in agency_lower or 'housing' in agency_lower:
                    generalized_agencies.append('Housing/Building Department')
                elif 'parks' in agency_lower:
                    generalized_agencies.append('Parks Department')
                else:
                    generalized_agencies.append('Municipal Services')
            
            if generalized_agencies:
                dept_list = ', '.join(list(set(generalized_agencies)))
                sentences.append(f"They're typically handled by {dept_list}.")
        
        # e-Speak mention
        sentences.append("You can report similar issues through e-Speak.")
        
        return " ".join(sentences)
    
    def get_stats(self) -> Dict:
        """Get pipeline statistics"""
        return self.vector_store.get_stats()
