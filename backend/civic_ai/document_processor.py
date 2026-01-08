"""
Document Preprocessor
Converts structured NYC 311 records into clean text documents for RAG
"""
import re
from typing import List, Dict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Converts NYC 311 service requests into text documents"""
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        return text
    
    @staticmethod
    def record_to_document(record: Dict) -> str:
        """
        Convert a 311 record to a natural language document
        
        Args:
            record: NYC 311 service request record
        
        Returns:
            Natural language text document
        """
        parts = []
        
        # Issue identification
        complaint_type = record.get('complaint_type', 'Unknown')
        descriptor = record.get('descriptor', '')
        
        if descriptor:
            parts.append(f"A {complaint_type.lower()} issue was reported: {descriptor.lower()}.")
        else:
            parts.append(f"A {complaint_type.lower()} issue was reported.")
        
        # Location context
        borough = record.get('borough', '')
        city = record.get('city', '')
        location_type = record.get('location_type', '')
        
        if borough:
            location_str = f"The issue occurred in {borough}"
            if city and city != borough:
                location_str += f", {city}"
            if location_type:
                location_str += f", specifically at a {location_type.lower()}"
            parts.append(location_str + ".")
        
        # Agency and handling
        agency = record.get('agency_name', '')
        agency_abbr = record.get('agency', '')
        
        if agency:
            parts.append(f"The {agency} ({agency_abbr}) was responsible for handling this case.")
        
        # Resolution
        resolution = record.get('resolution_description', '')
        resolution_action = record.get('resolution_action_updated_date', '')
        
        if resolution:
            parts.append(f"Resolution: {DocumentProcessor.clean_text(resolution)}")
        
        # Timeline
        created_date = record.get('created_date', '')
        closed_date = record.get('closed_date', '')
        
        if created_date and closed_date:
            try:
                created = datetime.fromisoformat(created_date.replace('Z', '+00:00'))
                closed = datetime.fromisoformat(closed_date.replace('Z', '+00:00'))
                days = (closed - created).days
                
                if days == 0:
                    parts.append("The issue was resolved on the same day.")
                elif days == 1:
                    parts.append("The issue was resolved within 1 day.")
                else:
                    parts.append(f"The issue took {days} days to resolve.")
            except:
                pass
        
        # Status
        status = record.get('status', '')
        if status:
            parts.append(f"Final status: {status}.")
        
        document = " ".join(parts)
        return DocumentProcessor.clean_text(document)
    
    @staticmethod
    def process_batch(records: List[Dict]) -> List[Dict]:
        """
        Process multiple records into documents with metadata
        
        Args:
            records: List of NYC 311 records
        
        Returns:
            List of dictionaries with 'text' and 'metadata'
        """
        documents = []
        
        for idx, record in enumerate(records):
            try:
                text = DocumentProcessor.record_to_document(record)
                
                if not text or len(text) < 50:
                    continue
                
                metadata = {
                    'complaint_type': record.get('complaint_type', 'Unknown'),
                    'borough': record.get('borough', ''),
                    'agency': record.get('agency_name', ''),
                    'status': record.get('status', ''),
                    'unique_key': record.get('unique_key', f'record_{idx}')
                }
                
                documents.append({
                    'text': text,
                    'metadata': metadata
                })
                
            except Exception as e:
                logger.warning(f"Failed to process record {idx}: {e}")
                continue
        
        logger.info(f"Processed {len(documents)} documents from {len(records)} records")
        return documents
    
    @staticmethod
    def chunk_document(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """
        Split document into overlapping chunks
        
        Args:
            text: Document text
            chunk_size: Maximum chunk size in characters
            overlap: Overlap between chunks
        
        Returns:
            List of text chunks
        """
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                last_period = text[start:end].rfind('.')
                if last_period != -1:
                    end = start + last_period + 1
            
            chunks.append(text[start:end].strip())
            start = end - overlap
        
        return chunks
