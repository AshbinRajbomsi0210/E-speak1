"""
FAISS vector store for similarity search
"""
import faiss
import numpy as np
import pickle
from pathlib import Path
from typing import List, Tuple
import logging

logger = logging.getLogger(__name__)


class VectorStore:
    """FAISS-based vector store for semantic search"""
    
    def __init__(self, dimension: int):
        """
        Initialize vector store
        
        Args:
            dimension: Embedding vector dimension
        """
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.documents = []
        logger.info(f"Vector store initialized with dimension {dimension}")
    
    def add_documents(self, embeddings: np.ndarray, documents: List[str]):
        """
        Add documents with embeddings to the store
        
        Args:
            embeddings: Document embeddings
            documents: Original document texts
        """
        if embeddings.shape[1] != self.dimension:
            raise ValueError(f"Expected dimension {self.dimension}, got {embeddings.shape[1]}")
        
        self.index.add(embeddings.astype('float32'))
        self.documents.extend(documents)
        logger.info(f"Added {len(documents)} documents. Total: {len(self.documents)}")
    
    def search(self, query_embedding: np.ndarray, k: int = 5) -> Tuple[List[str], List[float]]:
        """
        Search for similar documents
        
        Args:
            query_embedding: Query embedding vector
            k: Number of results to return
        
        Returns:
            Tuple of (documents, distances)
        """
        if len(self.documents) == 0:
            return [], []
        
        k = min(k, len(self.documents))
        
        distances, indices = self.index.search(
            query_embedding.reshape(1, -1).astype('float32'),
            k
        )
        
        results = [self.documents[i] for i in indices[0]]
        scores = distances[0].tolist()
        
        return results, scores
    
    def save(self, path: str):
        """Save vector store to disk"""
        path = Path(path)
        path.mkdir(parents=True, exist_ok=True)
        
        faiss.write_index(self.index, str(path / 'faiss.index'))
        
        with open(path / 'documents.pkl', 'wb') as f:
            pickle.dump(self.documents, f)
        
        logger.info(f"Vector store saved to {path}")
    
    def load(self, path: str):
        """Load vector store from disk"""
        path = Path(path)
        
        self.index = faiss.read_index(str(path / 'faiss.index'))
        
        with open(path / 'documents.pkl', 'rb') as f:
            self.documents = pickle.load(f)
        
        logger.info(f"Vector store loaded from {path}. {len(self.documents)} documents.")
    
    def get_stats(self) -> dict:
        """Get vector store statistics"""
        return {
            'total_documents': len(self.documents),
            'dimension': self.dimension,
            'index_size': self.index.ntotal
        }
