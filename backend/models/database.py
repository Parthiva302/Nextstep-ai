import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.settings import settings

# Connection pooling configurations for production database
is_sqlite = "sqlite" in settings.DATABASE_URL
engine_args = {}
if not is_sqlite:
    engine_args = {
        "pool_size": 5,          # Min active connections
        "max_overflow": 15,      # Max overflow connections (Max total = 20)
        "pool_timeout": 30,      # 30s connection acquisition timeout
        "pool_recycle": 1800,    # Recycle connections every 30m
    }
else:
    engine_args = {
        "connect_args": {"check_same_thread": False}
    }

engine = create_engine(settings.DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
