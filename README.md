# Boston Real Estate Decision Support Tool

A comprehensive tool for analyzing and comparing Boston neighborhoods based on various factors including property values, crime rates, school locations, transportation options, and more.

## Features

- Property value analysis and affordability metrics
- Crime rate statistics by neighborhood
- School locations and counts
- MBTA transit accessibility
- Restaurant and amenity information
- Neighborhood demographics
- Interactive map visualization
- Search and filter capabilities

## Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL (optional, SQLite is used by default)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/real-estate-tool.git
cd real-estate-tool
```

2. Install Python dependencies:
```bash
cd server
pip install -r requirements.txt
```

3. Install Node.js dependencies:
```bash
cd ../client
npm install
```

4. Set up environment variables:
```bash
# Create a .env file in the server directory
cd ../server
touch .env
```

Add the following to your .env file:
```
DATABASE_URL=sqlite:///./real_estate.db
# If using PostgreSQL:
# DATABASE_URL=postgresql://username:password@localhost:5432/real_estate
```

## Data Setup

1. Download the required datasets from Analyze Boston:
   - Property Assessment Data
   - Crime Incident Reports
   - Neighborhood Demographics
   - MBTA GTFS Data
   - Open Space Data
   - Schools Data
   - Restaurant Inspections

2. Place the raw data files in the `data/raw` directory.

3. Run the data processing pipeline:
```bash
python server/run_pipeline.py
```

## Running the Application

1. Start the backend server:
```bash
cd server
python app.py
```

2. In a new terminal, start the frontend development server:
```bash
cd client
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Neighborhood Data
- `GET /api/neighborhoods` - Get all neighborhood demographics
- `GET /api/neighborhood-summary/<neighborhood>` - Get detailed summary for a specific neighborhood

### Affordability
- `GET /api/affordability` - Get affordability metrics for all neighborhoods

### Search
- `GET /api/search` - Search neighborhoods based on criteria
  - Query parameters:
    - `min_price`: Minimum property value
    - `max_price`: Maximum property value
    - `min_income`: Minimum median family income
    - `max_crime`: Maximum crime rate
    - `min_schools`: Minimum number of schools
    - `min_mbta`: Minimum number of MBTA stops

## Project Structure

```
real-estate-tool/
├── client/                 # React frontend
├── server/                 # Flask backend
│   ├── models/            # Database models
│   ├── app.py             # Main application
│   ├── dbConnection.py    # Database connection
│   ├── load_data.py       # Data loading script
│   └── requirements.txt   # Python dependencies
├── data/
│   ├── raw/              # Raw data files
│   └── processed/        # Processed data files
├── data-scripts/         # Data processing scripts
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by [Analyze Boston](https://data.boston.gov/)
- MBTA data from [MBTA Developer Portal](https://www.mbta.com/developers)
- Inspired by the need for better real estate decision-making tools 