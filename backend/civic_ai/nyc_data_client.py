"""
NYC Open Data API Client
Fetches 311 Service Requests via Socrata OData API
"""
import requests
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class NYCOpenDataClient:
    """
    Client for fetching NYC 311 Service Requests
    Dataset: https://data.cityofnewyork.us/resource/erm2-nwe9.json
    """
    
    BASE_URL = "https://data.cityofnewyork.us/resource/erm2-nwe9.json"
    
    def __init__(self, app_token: Optional[str] = None):
        """
        Initialize client
        
        Args:
            app_token: Optional Socrata API token for higher rate limits
        """
        self.app_token = app_token
        self.session = requests.Session()
        if app_token:
            self.session.headers.update({'X-App-Token': app_token})
    
    def fetch_service_requests(
        self,
        days_back: int = 90,
        limit: int = 5000,
        status: str = 'Closed',
        offset: int = 0
    ) -> List[Dict]:
        """
        Fetch service requests from NYC Open Data
        
        Args:
            days_back: How many days back to fetch
            limit: Maximum records per request
            status: Filter by status (Closed, Open, etc)
            offset: Pagination offset
        
        Returns:
            List of service request records
        """
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            
            params = {
                '$limit': limit,
                '$offset': offset,
                '$order': 'closed_date DESC',
                '$where': f"closed_date >= '{start_date.isoformat()}' AND status = '{status}'"
            }
            
            logger.info(f"Fetching NYC 311 data: {limit} records, offset {offset}")
            
            response = self.session.get(
                self.BASE_URL,
                params=params,
                timeout=60
            )
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Retrieved {len(data)} records")
            
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return []
    
    def fetch_all_batches(
        self,
        days_back: int = 90,
        total_limit: int = 10000,
        batch_size: int = 1000
    ) -> List[Dict]:
        """
        Fetch multiple batches of data with pagination
        
        Args:
            days_back: How many days back to fetch
            total_limit: Total records to fetch
            batch_size: Records per batch
        
        Returns:
            Combined list of all records
        """
        all_records = []
        offset = 0
        
        while len(all_records) < total_limit:
            batch = self.fetch_service_requests(
                days_back=days_back,
                limit=batch_size,
                offset=offset
            )
            
            if not batch:
                break
            
            all_records.extend(batch)
            offset += batch_size
            
            logger.info(f"Total fetched: {len(all_records)}")
            
            if len(batch) < batch_size:
                break
        
        return all_records[:total_limit]
