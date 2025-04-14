import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Get the absolute path to the data directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
DATA_PROCESSED_DIR = Path(os.path.join(PROJECT_ROOT, "data", "processed"))

# Create the data/processed directory if it doesn't exist
DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

# Use the correct database path
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATA_PROCESSED_DIR}/real_estate.db"

# Create SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create base class for models
Base = declarative_base()

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import models after Base is defined
from models.neighborhood import NeighborhoodDemographics
from models.property import PropertyAssessment
from models.crime import CrimeIncident
from models.school import School
from models.mbta import MBTAStop
from models.restaurant import RestaurantInspection

def init_db():
    """Initialize the database by creating all tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

def get_db():
    """
    Dependency function that yields database sessions.
    Used in FastAPI/Flask route handlers to get a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
