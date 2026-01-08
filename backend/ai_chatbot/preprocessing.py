"""
Document preprocessing for NYC 311 data
"""
import re
from typing import List, Dict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class DocumentPreprocessor:
    """Preprocess NYC 311 records into searchable documents"""
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        return text
    
    @staticmethod
    def create_document(record: Dict) -> str:
        """
        Convert NYC 311 record into a descriptive document
        
        Args:
            record: NYC 311 service request record
        
        Returns:
            Formatted document string
        """
        parts = []
        
        # Issue type
        complaint_type = record.get('complaint_type', 'Unknown Issue')
        parts.append(f"Issue Type: {complaint_type}")
        
        # Description
        descriptor = record.get('descriptor', '')
        if descriptor:
            parts.append(f"Description: {descriptor}")
        
        # Location info
        borough = record.get('borough', '')
        if borough:
            parts.append(f"Borough: {borough}")
        
        # Agency responsible
        agency = record.get('agency_name', '')
        if agency:
            parts.append(f"Responsible Agency: {agency}")
        
        # Resolution description
        resolution = record.get('resolution_description', '')
        if resolution:
            parts.append(f"Resolution: {resolution}")
        
        # Timeline
        created_date = record.get('created_date', '')
        closed_date = record.get('closed_date', '')
        if created_date and closed_date:
            try:
                created = datetime.fromisoformat(created_date.replace('Z', '+00:00'))
                closed = datetime.fromisoformat(closed_date.replace('Z', '+00:00'))
                days = (closed - created).days
                parts.append(f"Resolution Time: {days} days")
            except:
                pass
        
        # Status
        status = record.get('status', '')
        if status:
            parts.append(f"Status: {status}")
        
        document = ". ".join(parts) + "."
        return DocumentPreprocessor.clean_text(document)
    
    @staticmethod
    def process_batch(records: List[Dict]) -> List[str]:
        """
        Process multiple records into documents
        
        Args:
            records: List of NYC 311 records
        
        Returns:
            List of formatted documents
        """
        documents = []
        
        for record in records:
            try:
                doc = DocumentPreprocessor.create_document(record)
                if doc:
                    documents.append(doc)
            except Exception as e:
                logger.warning(f"Error processing record: {e}")
                continue
        
        logger.info(f"Processed {len(documents)} documents from {len(records)} records")
        return documents
