"""
RAG Pipeline for Civic Analytics Chatbot
"""
from pathlib import Path
from typing import Dict, List
import logging

from .socrata_client import SocrataClient
from .embeddings import EmbeddingModel
from .vector_store import VectorStore
from .preprocessing import DocumentPreprocessor
from .system_prompt import SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class RAGPipeline:
    """End-to-end RAG pipeline for civic analytics"""
    
    def __init__(
        self,
        socrata_token: str = None,
        embedding_model: str = 'all-MiniLM-L6-v2',
        vector_store_path: str = 'vector_store'
    ):
        """
        Initialize RAG pipeline
        
        Args:
            socrata_token: NYC Open Data API token
            embedding_model: Embedding model name
            vector_store_path: Path to save/load vector store
        """
        self.socrata_client = SocrataClient(socrata_token)
        self.embedding_model = EmbeddingModel(embedding_model)
        self.vector_store = VectorStore(self.embedding_model.get_dimension())
        self.vector_store_path = Path(vector_store_path)
        
        # Load existing vector store if available
        if self.vector_store_path.exists():
            try:
                self.vector_store.load(str(self.vector_store_path))
                logger.info("Loaded existing vector store")
            except Exception as e:
                logger.warning(f"Could not load vector store: {e}")
    
    def ingest_data(self, days: int = 90, limit: int = 1000):
        """
        Fetch and index NYC 311 data
        
        Args:
            days: Number of days to look back
            limit: Maximum records to fetch
        """
        logger.info(f"Fetching NYC 311 data (last {days} days, limit {limit})")
        
        # Fetch data
        records = self.socrata_client.fetch_recent_issues(days=days, limit=limit)
        
        if not records:
            logger.error("No data fetched")
            return
        
        # Preprocess into documents
        documents = DocumentPreprocessor.process_batch(records)
        
        if not documents:
            logger.error("No documents created")
            return
        
        # Generate embeddings
        logger.info(f"Generating embeddings for {len(documents)} documents")
        embeddings = self.embedding_model.encode(documents)
        
        # Add to vector store
        self.vector_store.add_documents(embeddings, documents)
        
        # Save vector store
        self.vector_store.save(str(self.vector_store_path))
        
        logger.info(f"Successfully indexed {len(documents)} documents")
    
    def generate_answer(self, query: str, k: int = 5) -> Dict:
        """
        Generate answer using RAG
        
        Args:
            query: User question
            k: Number of context documents to retrieve
        
        Returns:
            Dictionary with answer, sources, and metadata
        """
        # Generate query embedding
        query_embedding = self.embedding_model.encode([query])[0]
        
        # Search vector store
        relevant_docs, scores = self.vector_store.search(query_embedding, k=k)
        
        if not relevant_docs:
            return {
                'answer': "I don't have enough data to answer this question. Please try ingesting more NYC 311 data first.",
                'sources': [],
                'confidence': 0.0
            }
        
        # Build context
        context = "\n\n".join([f"[{i+1}] {doc}" for i, doc in enumerate(relevant_docs)])
        
        # Build prompt (for LLM integration later)
        prompt = f"""{SYSTEM_PROMPT}

Retrieved Context:
{context}

User Question: {query}

Based on the retrieved NYC 311 data above, provide a clear and factual answer."""
        
        # For now, return the context and prompt
        # In production, you'd send this to an LLM like OpenAI or Anthropic
        answer = f"""Based on the NYC 311 historical data:

{self._synthesize_context(relevant_docs, query)}

---
Note: This analysis is based on retrieved historical NYC 311 service request data. The patterns observed may be applicable to other urban contexts but should be interpreted accordingly."""
        
        confidence = 1.0 - (scores[0] / 10.0 if scores else 0.5)
        
        return {
            'answer': answer,
            'sources': relevant_docs[:3],
            'confidence': min(max(confidence, 0.0), 1.0),
            'prompt': prompt  # For debugging or LLM integration
        }
    
    def _synthesize_context(self, documents: List[str], query: str) -> str:
        """
        Simple context synthesis (can be replaced with LLM)
        """
        # Extract key information from documents
        issues = []
        agencies = []
        resolutions = []
        
        for doc in documents:
            if "Issue Type:" in doc:
                issue_type = doc.split("Issue Type:")[1].split(".")[0].strip()
                issues.append(issue_type)
            
            if "Responsible Agency:" in doc:
                agency = doc.split("Responsible Agency:")[1].split(".")[0].strip()
                agencies.append(agency)
            
            if "Resolution Time:" in doc:
                resolution = doc.split("Resolution Time:")[1].split(".")[0].strip()
                resolutions.append(resolution)
        
        # Build summary
        summary_parts = []
        
        if issues:
            unique_issues = list(set(issues))[:3]
            summary_parts.append(f"Common issue types in the data: {', '.join(unique_issues)}")
        
        if agencies:
            unique_agencies = list(set(agencies))[:3]
            summary_parts.append(f"Agencies typically involved: {', '.join(unique_agencies)}")
        
        if resolutions:
            summary_parts.append(f"Resolution times vary, with examples including: {', '.join(resolutions[:3])}")
        
        if summary_parts:
            return "\n\n".join(summary_parts)
        else:
            return "The retrieved data shows various civic service patterns. Please refer to the specific cases below for details."
    
    def get_stats(self) -> Dict:
        """Get pipeline statistics"""
        return self.vector_store.get_stats()
