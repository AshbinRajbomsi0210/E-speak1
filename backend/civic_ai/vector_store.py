"""
Vector Store using FAISS
Handles storage and similarity search of embeddings
"""
import faiss
import numpy as np
import pickle
import json
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class VectorStore:
    """FAISS-based vector store for semantic search"""
    
    def __init__(self, dimension: int, index_type: str = 'flat'):
        """
        Initialize vector store
        
        Args:
            dimension: Embedding dimension
            index_type: Type of FAISS index ('flat' or 'ivf')
        """
        self.dimension = dimension
        self.index_type = index_type
        
        if index_type == 'flat':
            self.index = faiss.IndexFlatL2(dimension)
        else:
            # IVF index for larger datasets
            quantizer = faiss.IndexFlatL2(dimension)
            self.index = faiss.IndexIVFFlat(quantizer, dimension, 100)
        
        self.documents = []
        self.metadatas = []
        
        logger.info(f"Vector store initialized: {index_type}, dimension {dimension}")
    
    def add(
        self,
        embeddings: np.ndarray,
        texts: List[str],
        metadatas: Optional[List[Dict]] = None
    ):
        """
        Add documents with embeddings to the store
        
        Args:
            embeddings: Document embeddings (N x D)
            texts: Document texts
            metadatas: Optional metadata for each document
        """
        if embeddings.shape[1] != self.dimension:
            raise ValueError(
                f"Embedding dimension {embeddings.shape[1]} != {self.dimension}"
            )
        
        # Train IVF index if needed
        if isinstance(self.index, faiss.IndexIVFFlat) and not self.index.is_trained:
            logger.info("Training IVF index...")
            self.index.train(embeddings.astype('float32'))
        
        self.index.add(embeddings.astype('float32'))
        self.documents.extend(texts)
        
        if metadatas:
            self.metadatas.extend(metadatas)
        else:
            self.metadatas.extend([{}] * len(texts))
        
        logger.info(f"Added {len(texts)} documents. Total: {len(self.documents)}")
    
    def search(
        self,
        query_embedding: np.ndarray,
        k: int = 5
    ) -> Tuple[List[str], List[Dict], List[float]]:
        """
        Search for similar documents
        
        Args:
            query_embedding: Query embedding vector
            k: Number of results
        
        Returns:
            Tuple of (texts, metadatas, distances)
        """
        if len(self.documents) == 0:
            return [], [], []
        
        k = min(k, len(self.documents))
        
        distances, indices = self.index.search(
            query_embedding.reshape(1, -1).astype('float32'),
            k
        )
        
        texts = [self.documents[i] for i in indices[0]]
        metadatas = [self.metadatas[i] for i in indices[0]]
        scores = distances[0].tolist()
        
        return texts, metadatas, scores
    
    def save(self, directory: str):
        """
        Save vector store to disk
        
        Args:
            directory: Directory to save to
        """
        path = Path(directory)
        path.mkdir(parents=True, exist_ok=True)
        
        # Save FAISS index
        faiss.write_index(self.index, str(path / 'faiss.index'))
        
        # Save documents and metadata
        with open(path / 'documents.pkl', 'wb') as f:
            pickle.dump(self.documents, f)
        
        with open(path / 'metadatas.json', 'w') as f:
            json.dump(self.metadatas, f)
        
        # Save config
        config = {
            'dimension': self.dimension,
            'index_type': self.index_type,
            'total_documents': len(self.documents)
        }
        with open(path / 'config.json', 'w') as f:
            json.dump(config, f)
        
        logger.info(f"Vector store saved to {directory}")
    
    def load(self, directory: str):
        """
        Load vector store from disk
        
        Args:
            directory: Directory to load from
        """
        path = Path(directory)
        
        # Load config
        with open(path / 'config.json', 'r') as f:
            config = json.load(f)
        
        # Load FAISS index
        self.index = faiss.read_index(str(path / 'faiss.index'))
        
        # Load documents
        with open(path / 'documents.pkl', 'rb') as f:
            self.documents = pickle.load(f)
        
        # Load metadata
        with open(path / 'metadatas.json', 'r') as f:
            self.metadatas = json.load(f)
        
        self.dimension = config['dimension']
        self.index_type = config['index_type']
        
        logger.info(f"Vector store loaded: {config['total_documents']} documents")
    
    def get_stats(self) -> Dict:
        """Get statistics about the vector store"""
        return {
            'total_documents': len(self.documents),
            'dimension': self.dimension,
            'index_type': self.index_type,
            'index_size': self.index.ntotal
        }
