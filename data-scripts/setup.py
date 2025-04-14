import os
import logging

def create_directories():
    """
    Create necessary directories for the project.
    This includes the 'data/raw' and 'data/processed' folders.
    """
    # Determine the base directory (assumed to be one level above the current script)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    # Define paths for raw and processed data directories
    RAW_DIR = os.path.join(BASE_DIR, '../data/raw')
    PROCESSED_DIR = os.path.join(BASE_DIR, '../data/processed')
    
    # Create directories if they don't exist
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    
    logging.info(f"Directories created (or already exist): {RAW_DIR}, {PROCESSED_DIR}")

if __name__ == "__main__":
    # Configure logging to include timestamps and message levels
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    create_directories()
    print("Setup complete: Required directories are created.")
