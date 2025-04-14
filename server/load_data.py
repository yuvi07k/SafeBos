import pandas as pd
import geopandas as gpd
from sqlalchemy.orm import Session
from dbConnection import SessionLocal, init_db
from models.neighborhood import NeighborhoodDemographics
from models.property import PropertyAssessment
from models.crime import CrimeIncident
from models.school import School
from models.mbta import MBTAStop
from models.restaurant import RestaurantInspection
import logging
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the absolute path to the data directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
DATA_PROCESSED_DIR = Path(os.path.join(PROJECT_ROOT, "data", "processed"))

def inspect_csv(file_path):
    """Inspect CSV file columns."""
    try:
        df = pd.read_csv(file_path, nrows=0)
        columns = df.columns.tolist()
        logger.info(f"Columns in {file_path}:")
        for col in columns:
            logger.info(f"  - {col}")
        return columns
    except Exception as e:
        logger.error(f"Error inspecting CSV file {file_path}: {e}")
        return None

def clean_currency(value):
    """Convert currency string to float."""
    if pd.isna(value):
        return None
    if isinstance(value, str):
        return float(value.replace('$', '').replace(',', ''))
    return float(value)

def clean_percentage(value):
    """Convert percentage string to float."""
    if pd.isna(value):
        return None
    if isinstance(value, str):
        return float(value.replace('%', '')) / 100
    return float(value)

def load_neighborhood_demographics(db: Session):
    """Load neighborhood demographics data."""
    try:
        file_path = DATA_PROCESSED_DIR / 'neighborhood_demographics.csv'
        logger.info(f"Loading data from: {file_path}")
        
        # Inspect the CSV file first
        columns = inspect_csv(file_path)
        if not columns:
            return
            
        df = pd.read_csv(file_path)
        
        # Clean population by removing commas
        df['population'] = df['population'].astype(str).str.replace(',', '').astype(int)
        
        # Clean percentage columns
        percentage_columns = [
            'age_0_9_years', 'age_10_19_years', 'age_20_34_years', 'age_35_54_years',
            'age_55_64_years', 'age_65_years_and_over', 'less_than_high_school',
            'high_school_or_ged', 'some_college_or_associate_degree',
            'bachelor_degree_or_higher', 'white', 'black_or_african_american',
            'hispanic', 'asian_or_pi', 'other'
        ]
        
        for col in percentage_columns:
            if col in df.columns:
                df[col] = df[col].astype(str).str.replace('%', '').astype(float) / 100
        
        # Clean currency columns
        currency_columns = ['per_capita_income', 'median_family_income']
        for col in currency_columns:
            if col in df.columns:
                df[col] = df[col].astype(str).str.replace('$', '').str.replace(',', '').astype(float)
        
        for _, row in df.iterrows():
            demographics = NeighborhoodDemographics(
                neighborhood=row['neighborhood'],
                population=row['population'],
                age_0_9_years=row['age_0_9_years'],
                age_10_19_years=row['age_10_19_years'],
                age_20_34_years=row['age_20_34_years'],
                age_35_54_years=row['age_35_54_years'],
                age_55_64_years=row['age_55_64_years'],
                age_65_years_and_over=row['age_65_years_and_over'],
                less_than_high_school=row['less_than_high_school'],
                high_school_or_ged=row['high_school_or_ged'],
                some_college_or_associate_degree=row['some_college_or_associate_degree'],
                bachelor_degree_or_higher=row['bachelor_degree_or_higher'],
                white=row['white'],
                black_or_african_american=row['black_or_african_american'],
                hispanic=row['hispanic'],
                asian_or_pi=row['asian_or_pi'],
                other=row['other'],
                per_capita_income=row['per_capita_income'],
                median_family_income=row['median_family_income']
            )
            db.add(demographics)
        
        db.commit()
        logger.info("Neighborhood demographics data loaded successfully")
    except Exception as e:
        logger.error(f"Error loading neighborhood demographics data: {e}")
        db.rollback()

def load_property_assessment(db: Session):
    """Load property assessment data."""
    try:
        file_path = DATA_PROCESSED_DIR / 'property-assessment-fy2025_clean.csv'
        logger.info(f"Loading data from: {file_path}")
        
        # Inspect the CSV file first
        columns = inspect_csv(file_path)
        if not columns:
            return
            
        df = pd.read_csv(file_path, low_memory=False)
        
        # Clean numeric columns by removing commas, dollar signs, and empty spaces
        numeric_columns = ['land_sf', 'gross_area', 'living_area', 'land_value', 
                         'bldg_value', 'total_value', 'gross_tax']
        
        for col in numeric_columns:
            if col in df.columns:
                df[col] = df[col].astype(str).str.replace('$', '').str.replace(',', '').str.strip()
                df[col] = df[col].replace('', '0').replace('nan', '0').replace('NA', '0')
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        for _, row in df.iterrows():
            property_data = PropertyAssessment(
                pid=row['pid'],
                st_name=row['st_name'],
                city=row['city'],
                zip_code=row['zip_code'],
                land_sf=float(row['land_sf']),
                gross_area=float(row['gross_area']),
                living_area=float(row['living_area']),
                land_value=float(row['land_value']),
                bldg_value=float(row['bldg_value']),
                total_value=float(row['total_value']),
                gross_tax=float(row['gross_tax']),
                yr_built=int(row['yr_built']) if pd.notna(row['yr_built']) else None,
                yr_remodel=int(row['yr_remodel']) if pd.notna(row['yr_remodel']) else None,
                int_con=row['int_con'],
                ext_con=row['ext_con'],
                overall_con=row['overall_con'],
                bed_rms=int(row['bed_rms']) if pd.notna(row['bed_rms']) else 0,
                full_bth=int(row['full_bth']) if pd.notna(row['full_bth']) else 0,
                hlf_bth=int(row['hlf_bth']) if pd.notna(row['hlf_bth']) else 0,
                kitchens=int(row['kitchens']) if pd.notna(row['kitchens']) else 0,
                heat_type=row['heat_type'],
                ac_type=row['ac_type'],
                fireplaces=int(row['fireplaces']) if pd.notna(row['fireplaces']) else 0,
                num_parking=int(row['num_parking']) if pd.notna(row['num_parking']) else 0,
                neighborhood=row['neighborhood']
            )
            db.add(property_data)
        
        db.commit()
        logger.info("Property assessment data loaded successfully")
    except Exception as e:
        logger.error(f"Error loading property assessment data: {e}")
        db.rollback()

def load_crime_incidents(db: Session):
    """Load crime incident data."""
    try:
        file_path = DATA_PROCESSED_DIR / 'crime-incident-reports_clean.csv'
        logger.info(f"Loading data from: {file_path}")
        
        # Inspect the CSV file first
        columns = inspect_csv(file_path)
        if not columns:
            return
            
        df = pd.read_csv(file_path)
        
        for _, row in df.iterrows():
            crime = CrimeIncident(
                incident_number=row['incident_number'],
                offense_code=row['offense_code'],
                offense_description=row['offense_description'],
                date=pd.to_datetime(row['date']),
                day_of_week=row['day_of_week'],
                hour=int(row['hour']) if pd.notna(row['hour']) else None,
                street=row['street'],
                latitude=float(row['latitude']) if pd.notna(row['latitude']) else None,
                longitude=float(row['longitude']) if pd.notna(row['longitude']) else None,
                neighborhood=row['neighborhood'],
                crime_rate=float(row['crime_rate']) if pd.notna(row['crime_rate']) else 0
            )
            db.add(crime)
        
        db.commit()
        logger.info("Crime incident data loaded successfully")
    except Exception as e:
        logger.error(f"Error loading crime incident data: {e}")
        db.rollback()

def load_schools(db: Session):
    """Load school data."""
    try:
        file_path = DATA_PROCESSED_DIR / 'schools_clean.csv'
        logger.info(f"Loading data from: {file_path}")
        
        # Inspect the CSV file first
        columns = inspect_csv(file_path)
        if not columns:
            return
            
        df = pd.read_csv(file_path)
        
        for _, row in df.iterrows():
            school = School(
                neighborhood=row['neighborhood'],
                name=row['name'],
                longitude=float(row['longitude']) if pd.notna(row['longitude']) else None,
                latitude=float(row['latitude']) if pd.notna(row['latitude']) else None
            )
            db.add(school)
        
        db.commit()
        logger.info("School data loaded successfully")
    except Exception as e:
        logger.error(f"Error loading school data: {e}")
        db.rollback()

def load_mbta_stops(db: Session):
    """Load MBTA stops data."""
    try:
        file_path = DATA_PROCESSED_DIR / 'mbta_stops_clean.csv'
        logger.info(f"Loading data from: {file_path}")
        
        # Inspect the CSV file first
        columns = inspect_csv(file_path)
        if not columns:
            return
            
        df = pd.read_csv(file_path)
        
        for _, row in df.iterrows():
            stop = MBTAStop(
                stop_id=row['stop_id'],
                stop_name=row['stop_name'],
                stop_lat=float(row['stop_lat']) if pd.notna(row['stop_lat']) else None,
                stop_lon=float(row['stop_lon']) if pd.notna(row['stop_lon']) else None,
                stop_url=row['stop_url'],
                wheelchair_boarding=row['wheelchair_boarding'],
                on_street=row['on_street'],
                at_street=row['at_street'],
                neighborhood=row['neighborhood']
            )
            db.add(stop)
        
        db.commit()
        logger.info("MBTA stops data loaded successfully")
    except Exception as e:
        logger.error(f"Error loading MBTA stops data: {e}")
        db.rollback()

def load_restaurant_inspections(db: Session):
    """Load restaurant inspection data."""
    try:
        file_path = DATA_PROCESSED_DIR / 'restaurant-inspections_clean.csv'
        logger.info(f"Loading data from: {file_path}")
        
        # Inspect the CSV file first
        columns = inspect_csv(file_path)
        if not columns:
            return
            
        df = pd.read_csv(file_path)
        
        for _, row in df.iterrows():
            inspection = RestaurantInspection(
                business_name=row['businessname'],
                address=row['address'],
                latitude=float(row['latitude']),
                longitude=float(row['longitude']),
                neighborhood=row['neighborhood']
            )
            db.add(inspection)
        
        db.commit()
        logger.info("Restaurant inspection data loaded successfully")
    except Exception as e:
        logger.error(f"Error loading restaurant inspection data: {e}")
        db.rollback()

def main():
    """Main function to load all data."""
    try:
        # Initialize database
        init_db()
        
        # Create session
        db = SessionLocal()
        
        try:
            # Load all data
            load_neighborhood_demographics(db)
            load_property_assessment(db)
            load_crime_incidents(db)
            load_schools(db)
            load_mbta_stops(db)
            load_restaurant_inspections(db)
            
            logger.info("All data loaded successfully")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error in main data loading: {e}")

if __name__ == "__main__":
    main() 