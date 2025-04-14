import os
from pathlib import Path
import logging
from dbConnection import init_db, SessionLocal, Base, engine
from models import (
    NeighborhoodDemographics,
    PropertyAssessment,
    CrimeIncident,
    School,
    MBTAStop,
    RestaurantInspection
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_database():
    """Reset the database by dropping all tables and recreating them."""
    try:
        # Get database path
        db_path = Path('data/processed/real_estate.db')
        
        # Delete database file if it exists
        if db_path.exists():
            os.remove(db_path)
            logger.info("Deleted existing database file")
        
        # Drop all tables
        Base.metadata.drop_all(bind=engine)
        logger.info("Dropped all existing tables")
        
        # Initialize new database
        init_db()
        logger.info("Created new database")
        
        # Verify tables were created
        db = SessionLocal()
        try:
            # Try to query each table to verify they exist
            db.query(NeighborhoodDemographics).first()
            db.query(PropertyAssessment).first()
            db.query(CrimeIncident).first()
            db.query(School).first()
            db.query(MBTAStop).first()
            db.query(RestaurantInspection).first()
            logger.info("All tables created successfully")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error resetting database: {e}")
        raise

if __name__ == "__main__":
    reset_database() 