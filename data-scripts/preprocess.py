import os
import pandas as pd
import geopandas as gpd
import zipfile
import logging
import fiona
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from shapely.geometry import Point

if not hasattr(fiona, 'path'):
    fiona.path = lambda x: x
fiona.drvsupport.supported_drivers['GeoJSON'] = 'rw'

# Configure logging to include timestamps and log levels.
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Define directories based on the project structure.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(BASE_DIR, '../data/raw')
PROCESSED_DIR = os.path.join(BASE_DIR, '../data/processed')
os.makedirs(PROCESSED_DIR, exist_ok=True)

def map_to_neighborhoods(df, lat_col, lon_col):
    """
    Map coordinates to Boston neighborhoods using the neighborhoods GeoJSON file.
    Returns the DataFrame with an added 'neighborhood' column.
    """
    try:
        # Load Boston neighborhoods GeoJSON
        neighborhoods_path = os.path.join(RAW_DIR, 'boston-neighborhoods.geojson')
        neighborhoods = gpd.read_file(neighborhoods_path)
        
        # Print column names for debugging
        logging.info(f"Neighborhoods GeoJSON columns: {neighborhoods.columns.tolist()}")
        
        # Create Point geometries from coordinates
        geometry = [Point(xy) for xy in zip(df[lon_col], df[lat_col])]
        points = gpd.GeoDataFrame(df, geometry=geometry, crs=neighborhoods.crs)
        
        # Perform spatial join
        joined = gpd.sjoin(points, neighborhoods, how='left', predicate='within')
        
        # Get the neighborhood name column (try different possible names)
        neighborhood_col = None
        for col in ['Name', 'neighborhood', 'NEIGHBORHO']:
            if col in joined.columns:
                neighborhood_col = col
                break
        
        if neighborhood_col is None:
            raise ValueError("Could not find neighborhood name column in GeoJSON file")
        
        # Add neighborhood column to original DataFrame
        df['neighborhood'] = joined[neighborhood_col]
        return df
    except Exception as e:
        logging.error(f"Error mapping coordinates to neighborhoods: {e}")
        return df

def calculate_affordability_metrics(property_df, demographics_df):
    """
    Calculate affordability metrics for each neighborhood.
    Returns a DataFrame with affordability scores.
    """
    # Calculate median property value per neighborhood
    neighborhood_values = property_df.groupby('neighborhood')['av_total'].median()
    
    # Calculate median income per neighborhood
    neighborhood_income = demographics_df.groupby('neighborhood')['median_income'].median()
    
    # Calculate affordability ratio (property value / annual income)
    affordability_ratio = neighborhood_values / neighborhood_income
    
    # Normalize affordability scores (0-100, where 0 is most affordable)
    scaler = MinMaxScaler(feature_range=(0, 100))
    affordability_score = scaler.fit_transform(affordability_ratio.values.reshape(-1, 1))
    
    # Create DataFrame with results
    affordability_df = pd.DataFrame({
        'neighborhood': affordability_ratio.index,
        'median_property_value': neighborhood_values,
        'median_income': neighborhood_income,
        'affordability_ratio': affordability_ratio,
        'affordability_score': affordability_score.flatten()
    })
    
    return affordability_df

def process_property_assessment():
    """
    Load the property assessment data, remove duplicates, handle missing values,
    and save the cleaned data.
    """
    file_path = os.path.join(RAW_DIR, 'property-assessment-fy2025.csv')
    try:
        # Read CSV with specific dtypes to handle mixed types
        df = pd.read_csv(file_path, low_memory=False)
        logging.info(f"Property assessment data loaded with shape: {df.shape}")
        
        # Print column names for debugging
        logging.info(f"Property assessment columns: {df.columns.tolist()}")
        
        # Drop duplicate rows
        df.drop_duplicates(inplace=True)
        
        # Convert TOTAL_VALUE to numeric, handling currency format
        df['TOTAL_VALUE'] = df['TOTAL_VALUE'].replace('[\$,]', '', regex=True).astype(float)
        
        # Handle missing values
        df['TOTAL_VALUE'] = df['TOTAL_VALUE'].fillna(df['TOTAL_VALUE'].median())
        
        # Map coordinates to neighborhoods
        if 'neighborhood' not in df.columns and 'Lat' in df.columns and 'Long' in df.columns:
            df = map_to_neighborhoods(df, 'Lat', 'Long')
        
        cleaned_path = os.path.join(PROCESSED_DIR, 'property-assessment-fy2025_clean.csv')
        df.to_csv(cleaned_path, index=False)
        logging.info(f"Cleaned property assessment data saved to {cleaned_path}")
        return df
    except Exception as e:
        logging.error(f"Error processing property assessment data: {e}")
        return None

def process_crime_reports():
    """
    Load the crime incident reports, remove duplicates, filter rows missing coordinates,
    and save the cleaned data.
    """
    file_path = os.path.join(RAW_DIR, 'crime-incident-reports.csv')
    try:
        # Read CSV with specific dtypes to handle mixed types
        df = pd.read_csv(file_path, low_memory=False)
        logging.info(f"Crime incident reports loaded with shape: {df.shape}")
        
        df.drop_duplicates(inplace=True)
        df = df.dropna(subset=['Lat', 'Long'])
        
        # Map coordinates to neighborhoods
        df = map_to_neighborhoods(df, 'Lat', 'Long')
        
        # Calculate crime rate per neighborhood
        crime_counts = df.groupby('neighborhood').size()
        total_crimes = crime_counts.sum()
        crime_rate = (crime_counts / total_crimes) * 1000  # Crimes per 1000 residents
        
        # Add crime rate to DataFrame
        df['crime_rate'] = df['neighborhood'].map(crime_rate)
        
        cleaned_path = os.path.join(PROCESSED_DIR, 'crime-incident-reports_clean.csv')
        df.to_csv(cleaned_path, index=False)
        logging.info(f"Cleaned crime incident reports saved to {cleaned_path}")
        return df
    except Exception as e:
        logging.error(f"Error processing crime incident reports: {e}")
        return None

def process_open_space():
    """
    Process open space GeoJSON file.
    """
    file_path = os.path.join(RAW_DIR, 'open-space.geojson')
    try:
        gdf = gpd.read_file(file_path, driver='GeoJSON')
        logging.info(f"Open space data loaded with shape: {gdf.shape}")
        
        gdf = gdf.drop_duplicates()
        gdf = gdf[gdf.is_valid]
        
        # Convert to a projected CRS for accurate area calculations
        gdf = gdf.to_crs('EPSG:3857')  # Web Mercator projection
        
        # Calculate open space area per neighborhood
        gdf['area'] = gdf.geometry.area
        
        cleaned_path = os.path.join(PROCESSED_DIR, 'open-space_clean.geojson')
        gdf.to_file(cleaned_path, driver='GeoJSON')
        logging.info(f"Cleaned open space data saved to {cleaned_path}")
        return gdf
    except Exception as e:
        logging.error(f"Error processing open space geojson: {e}")
        return None

def process_boston_neighborhoods():
    """
    Process Boston neighborhoods GeoJSON file.
    """
    file_path = os.path.join(RAW_DIR, 'boston-neighborhoods.geojson')
    try:
        gdf = gpd.read_file(file_path, driver='GeoJSON')
        logging.info(f"Boston neighborhoods data loaded with shape: {gdf.shape}")
        
        gdf = gdf.drop_duplicates()
        
        cleaned_path = os.path.join(PROCESSED_DIR, 'boston-neighborhoods_clean.geojson')
        gdf.to_file(cleaned_path, driver='GeoJSON')
        logging.info(f"Cleaned Boston neighborhoods data saved to {cleaned_path}")
        return gdf
    except Exception as e:
        logging.error(f"Error processing Boston neighborhoods geojson: {e}")
        return None

def process_schools():
    """
    Load schools data, remove duplicates, and save the cleaned data.
    """
    file_path = os.path.join(RAW_DIR, 'schools.csv')
    try:
        df = pd.read_csv(file_path)
        logging.info(f"Schools data loaded with shape: {df.shape}")
        
        df.drop_duplicates(inplace=True)
        
        # Rename columns to match model
        df = df.rename(columns={
            'CITY': 'neighborhood',
            'Lat': 'latitude',
            'Long': 'longitude'
        })
        
        # Map coordinates to neighborhoods if available
        if 'latitude' in df.columns and 'longitude' in df.columns:
            df = map_to_neighborhoods(df, 'latitude', 'longitude')
        
        # Log the distribution of neighborhoods
        if 'neighborhood' in df.columns:
            logging.info("Neighborhood distribution in schools data:")
            logging.info(df['neighborhood'].value_counts())
        
        cleaned_path = os.path.join(PROCESSED_DIR, 'schools_clean.csv')
        df.to_csv(cleaned_path, index=False)
        logging.info(f"Cleaned schools data saved to {cleaned_path}")
        return df
    except Exception as e:
        logging.error(f"Error processing schools data: {e}")
        return None

def process_mbta_gtfs():
    """
    Extract and clean MBTA GTFS data.
    """
    zip_path = os.path.join(RAW_DIR, 'mbta-gtfs.zip')
    extract_dir = os.path.join(RAW_DIR, 'mbta_gtfs')
    try:
        if not os.path.exists(extract_dir):
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            logging.info(f"Extracted MBTA GTFS data to {extract_dir}")
        
        # Process stops
        stops_path = os.path.join(extract_dir, 'stops.txt')
        if os.path.exists(stops_path):
            df = pd.read_csv(stops_path, low_memory=False)
            logging.info(f"MBTA stops data loaded with shape: {df.shape}")
            
            # Map coordinates to neighborhoods
            if 'stop_lat' in df.columns and 'stop_lon' in df.columns:
                df = map_to_neighborhoods(df, 'stop_lat', 'stop_lon')
            
            cleaned_path = os.path.join(PROCESSED_DIR, 'mbta_stops_clean.csv')
            df.to_csv(cleaned_path, index=False)
            logging.info(f"Cleaned MBTA stops data saved to {cleaned_path}")
            return df
        else:
            logging.warning("stops.txt not found in MBTA GTFS data.")
            return None
    except Exception as e:
        logging.error(f"Error processing MBTA GTFS data: {e}")
        return None

def process_restaurant_inspections():
    """
    Load restaurant inspection data, remove duplicates,
    and save the cleaned data.
    """
    file_path = os.path.join(RAW_DIR, 'restaurant-inspections.csv')
    try:
        df = pd.read_csv(file_path, low_memory=False)
        logging.info(f"Restaurant inspections data loaded with shape: {df.shape}")
        
        df.drop_duplicates(inplace=True)
        
        # Map coordinates to neighborhoods if available
        if 'Lat' in df.columns and 'Long' in df.columns:
            df = map_to_neighborhoods(df, 'Lat', 'Long')
        
        cleaned_path = os.path.join(PROCESSED_DIR, 'restaurant-inspections_clean.csv')
        df.to_csv(cleaned_path, index=False)
        logging.info(f"Cleaned restaurant inspections data saved to {cleaned_path}")
        return df
    except Exception as e:
        logging.error(f"Error processing restaurant inspections data: {e}")
        return None

def create_neighborhood_summary():
    """
    Create a comprehensive summary of all neighborhood metrics.
    """
    try:
        # Load all processed data
        property_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'property-assessment-fy2025_clean.csv'), low_memory=False)
        crime_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'crime-incident-reports_clean.csv'), low_memory=False)
        schools_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'schools_clean.csv'), low_memory=False)
        mbta_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'mbta_stops_clean.csv'), low_memory=False)
        restaurants_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'restaurant-inspections_clean.csv'), low_memory=False)
        
        # Create neighborhood summary DataFrame
        summary_df = pd.DataFrame()
        
        # Add metrics from each dataset
        if 'neighborhood' in property_df.columns and 'TOTAL_VALUE' in property_df.columns:
            summary_df['median_property_value'] = property_df.groupby('neighborhood')['TOTAL_VALUE'].median()
        
        if 'neighborhood' in crime_df.columns and 'crime_rate' in crime_df.columns:
            summary_df['crime_rate'] = crime_df.groupby('neighborhood')['crime_rate'].mean()
        
        if 'neighborhood' in schools_df.columns:
            summary_df['school_count'] = schools_df.groupby('neighborhood').size()
        
        if 'neighborhood' in mbta_df.columns:
            summary_df['mbta_stops'] = mbta_df.groupby('neighborhood').size()
        
        if 'neighborhood' in restaurants_df.columns:
            summary_df['restaurant_count'] = restaurants_df.groupby('neighborhood').size()
        
        # Calculate composite scores
        scaler = MinMaxScaler()
        for col in summary_df.columns:
            if col not in ['neighborhood']:  # Skip non-numeric columns
                summary_df[f'{col}_score'] = scaler.fit_transform(summary_df[[col]])
        
        # Save summary
        summary_path = os.path.join(PROCESSED_DIR, 'neighborhood_summary.csv')
        summary_df.to_csv(summary_path)
        logging.info(f"Neighborhood summary saved to {summary_path}")
        return summary_df
    except Exception as e:
        logging.error(f"Error creating neighborhood summary: {e}")
        return None

def main():
    # Process all datasets
    property_df = process_property_assessment()
    crime_df = process_crime_reports()
    open_space_gdf = process_open_space()
    schools_df = process_schools()
    mbta_df = process_mbta_gtfs()
    restaurants_df = process_restaurant_inspections()
    neighborhoods_gdf = process_boston_neighborhoods()
    
    # Create neighborhood summary
    summary_df = create_neighborhood_summary()
    
    logging.info("All data processing completed successfully")

if __name__ == "__main__":
    main()
