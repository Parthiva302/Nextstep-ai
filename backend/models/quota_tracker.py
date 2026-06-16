from sqlalchemy import Column, Integer, String, Float, DateTime, create_engine, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import os

Base = declarative_base()

class APIUsage(Base):
    """Track API usage for cost control and quotas"""
    __tablename__ = "api_usage"
    
    id = Column(Integer, primary_key=True)
    model = Column(String, index=True)  # Which model used
    tokens_input = Column(Integer)
    tokens_output = Column(Integer)
    cost = Column(Float)  # Cost in dollars
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    status = Column(String)  # 'success' or 'error'
    error_message = Column(String, nullable=True)

class QuotaTracker:
    """Track and manage API quotas"""
    
    def __init__(self, db_url):
        self.engine = create_engine(db_url)
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
    
    def log_usage(self, model: str, tokens_input: int, tokens_output: int, 
                  cost: float, status: str = "success", error_msg: str = None):
        """Log API usage for tracking"""
        session = self.Session()
        try:
            usage = APIUsage(
                model=model,
                tokens_input=tokens_input,
                tokens_output=tokens_output,
                cost=cost,
                status=status,
                error_message=error_msg
            )
            session.add(usage)
            session.commit()
        finally:
            session.close()
    
    def get_daily_cost(self):
        """Get today's total cost"""
        session = self.Session()
        try:
            today = datetime.utcnow().date()
            # Handling sqlite vs postgres for date casting could be tricky. 
            # Doing a simple fallback for dates that works in most SQL:
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            total = session.query(
                func.sum(APIUsage.cost)
            ).filter(
                APIUsage.timestamp >= today_start,
                APIUsage.status == "success"
            ).scalar()
            return total or 0.0
        finally:
            session.close()
    
    def get_monthly_cost(self):
        """Get this month's total cost"""
        session = self.Session()
        try:
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            total = session.query(
                func.sum(APIUsage.cost)
            ).filter(
                APIUsage.timestamp >= thirty_days_ago,
                APIUsage.status == "success"
            ).scalar()
            return total or 0.0
        finally:
            session.close()
    
    def is_over_daily_limit(self, limit: float) -> bool:
        """Check if daily cost exceeded"""
        return self.get_daily_cost() > limit
    
    def is_over_monthly_limit(self, limit: float) -> bool:
        """Check if monthly cost exceeded"""
        return self.get_monthly_cost() > limit
