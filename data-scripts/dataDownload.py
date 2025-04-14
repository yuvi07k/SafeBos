import os
import requests
import logging

# Configure logging with timestamps and log levels
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Determine the base directory (assumed to be one level above the current script)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Set the raw data directory path relative to the project structure
RAW_DIR = os.path.join(BASE_DIR, '../data/raw')
os.makedirs(RAW_DIR, exist_ok=True)

# Dictionary mapping filenames to their download URLs
DATASETS = {
    "property-assessment-fy2025.csv": "https://data.boston.gov/dataset/e02c44d2-3c64-459c-8fe2-e1ce5f38a035/resource/6b7e460e-33f6-4e61-80bc-1bef2e73ac54/download/fy2025-property-assessment-data_12_30_2024.csv",
    "crime-incident-reports.csv": "https://data.boston.gov/dataset/6220d948-eae2-4e4b-8723-2dc8e67722a3/resource/b973d8cb-eeb2-4e7e-99da-c92938efc9c0/download/tmp310wm06c.csv",
    "neighborhood-demographics.xlsx": "https://data.boston.gov/dataset/8202abf2-8434-4934-959b-94643c7dac18/resource/7154cc09-55c4-4acd-99a5-3a233d11e699/download/neighborhoodsummaryclean_1950-2010.xlsx",
    "open-space.geojson": "https://data.boston.gov/dataset/66a3324e-066f-4caf-897b-a2b4dcb8bc42/resource/ccc038ce-5602-42d0-b4c6-87f60c116ea3/download/open_space.geojson",
    "schools.csv": "https://data.boston.gov/dataset/4df4b9c7-239d-4643-ac21-a22b42c832df/resource/6ceeff38-a0db-46df-b5be-f8cfdea0186d/download/public_schools.csv",
    "mbta-gtfs.zip": "https://cdn.mbta.com/MBTA_GTFS.zip",
    "restaurant-inspections.csv": "https://data.boston.gov/dataset/5e4182e3-ba1e-4511-88f8-08a70383e1b6/resource/f1e13724-284d-478c-b8bc-ef042aa5b70b/download/tmpcx_lnkre.csv",
    "boston-neighborhoods.geojson": "https://data.boston.gov/dataset/5997399b-c665-4600-848f-a2a32834f009/resource/42a271c9-486d-4f9e-adc2-63e4bf47fe3e/download/boston_neighborhood_boundaries_approximated_by_2020_census_tracts.geojson"
}

def download_file(url, filename):
    """
    Download a file from the given URL and save it in the RAW_DIR.
    Handles errors and logs each step of the process.
    """
    file_path = os.path.join(RAW_DIR, filename)
    logging.info(f"Starting download for {filename} from {url}")
    
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()  # Raise an exception for HTTP errors
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:  # Filter out keep-alive chunks
                    f.write(chunk)
        logging.info(f"Successfully downloaded {filename} and saved to {file_path}")
    except requests.RequestException as e:
        logging.error(f"Error downloading {filename}: {e}")

def main():
    # Loop through each dataset and download it
    for filename, url in DATASETS.items():
        download_file(url, filename)

if __name__ == "__main__":
    main()
