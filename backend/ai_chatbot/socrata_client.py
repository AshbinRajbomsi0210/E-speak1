"""
NYC Open Data 311 Service Requests Client
"""
import requests
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class SocrataClient:
    """Client for fetching NYC 311 Service Requests"""
    
    BASE_URL = "https://data.cityofnewyork.us/resource/erm2-nwe9.json"
    
    def __init__(self, app_token: Optional[str] = None):
        self.app_token = app_token
        self.session = requests.Session()
        if app_token:
            self.session.headers.update({'X-App-Token': app_token})
    
    def fetch_recent_issues(
        self,
        days: int = 90,
        limit: int = 1000,
        status: str = 'Closed'
    ) -> List[Dict]:
        """
        Fetch recent resolved 311 service requests
        
        Args:
            days: Number of days to look back
            limit: Maximum records
            status: Filter by status (default: Closed)
        
        Returns:
            List of service request records
        """
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            params = {
                '$limit': limit,
                '$order': 'closed_date DESC',
                '$where': f"closed_date >= '{start_date.isoformat()}' AND status = '{status}'"
            }
            
            logger.info(f"Fetching NYC 311 data: {params}")
            
            response = self.session.get(self.BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Fetched {len(data)} records")
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching data: {e}")
            return []
