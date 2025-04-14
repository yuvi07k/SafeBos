# backend/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from dbConnection import SessionLocal, init_db, get_db
from models import NeighborhoodDemographics, PropertyAssessment, CrimeIncident, School, MBTAStop, RestaurantInspection
from sqlalchemy import func, case
import logging
import sys
import traceback
from flask_caching import Cache
import os
import json

# Configure logging to output to both file and console
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('server.log')
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable CORS for all routes with more permissive settings
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
        "expose_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Initialize database
logger.info("Initializing database...")
init_db()
logger.info("Database initialized successfully")

# Initialize cache
cache = Cache(app, config={
    'CACHE_TYPE': 'simple',
    'CACHE_DEFAULT_TIMEOUT': 300  # 5 minutes
})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    logger.info("Health check requested")
    return jsonify({"status": "ok"})

@app.route('/api/neighborhoods', methods=['GET'])
def get_neighborhoods():
    """
    API endpoint to retrieve all neighborhood demographics.
    Queries the 'neighborhood_demographics' table and returns JSON.
    """
    db = next(get_db())
    try:
        logger.info("Fetching neighborhoods...")
        neighborhoods = db.query(NeighborhoodDemographics.neighborhood).distinct().all()
        logger.info(f"Found {len(neighborhoods)} neighborhoods")
        return jsonify([n[0] for n in neighborhoods])
    except Exception as e:
        logger.error(f"Error fetching neighborhoods: {str(e)}")
        return jsonify({"error": "Failed to fetch neighborhoods"}), 500

@app.route('/api/neighborhood-boundaries', methods=['GET'])
@cache.cached(timeout=300)  # Cache for 5 minutes
def get_neighborhood_boundaries():
    """API endpoint to retrieve neighborhood boundaries in GeoJSON format."""
    db = next(get_db())
    try:
        logger.info("Fetching neighborhood boundaries...")
        
        # First check if we have any neighborhoods
        neighborhood_count = db.query(func.count(NeighborhoodDemographics.id)).scalar()
        logger.info(f"Total neighborhoods in database: {neighborhood_count}")
        
        if neighborhood_count == 0:
            logger.error("No neighborhoods found in database")
            return jsonify({"error": "No neighborhood data available"}), 500
        
        # Get neighborhood data with aggregated statistics using subqueries for better performance
        neighborhoods = db.query(
            NeighborhoodDemographics.neighborhood,
            func.coalesce(
                db.query(func.count(School.id))
                .filter(School.neighborhood == NeighborhoodDemographics.neighborhood)
                .scalar_subquery(),
                0
            ).label('school_count'),
            func.coalesce(
                db.query(func.count(MBTAStop.id))
                .filter(MBTAStop.neighborhood == NeighborhoodDemographics.neighborhood)
                .scalar_subquery(),
                0
            ).label('transit_stops'),
            func.coalesce(
                db.query(func.avg(CrimeIncident.crime_rate))
                .filter(CrimeIncident.neighborhood == NeighborhoodDemographics.neighborhood)
                .scalar_subquery(),
                0
            ).label('crime_rate'),
            func.coalesce(
                db.query(func.avg(PropertyAssessment.total_value))
                .filter(PropertyAssessment.neighborhood == NeighborhoodDemographics.neighborhood)
                .scalar_subquery(),
                0
            ).label('median_home_value')
        ).all()
        
        logger.info(f"Found {len(neighborhoods)} neighborhoods with statistics")
        logger.info(f"Sample neighborhood names from database: {[nb.neighborhood for nb in neighborhoods[:5]]}")
        
        # Read the GeoJSON file
        geojson_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'raw', 'boston-neighborhoods.geojson')
        logger.info(f"Reading GeoJSON file from: {geojson_path}")
        
        with open(geojson_path, 'r') as f:
            geojson_data = json.load(f)
        
        logger.info(f"GeoJSON file loaded with {len(geojson_data['features'])} features")
        logger.info(f"Sample neighborhood names from GeoJSON: {[f['properties'].get('name') for f in geojson_data['features'][:5]]}")
        
        # Create a dictionary of neighborhood statistics
        stats_dict = {nb.neighborhood: {
            'school_count': nb.school_count,
            'transit_stops': nb.transit_stops,
            'crime_rate': float(nb.crime_rate),
            'median_home_value': float(nb.median_home_value)
        } for nb in neighborhoods}
        
        logger.info(f"Sample statistics from database: {list(stats_dict.items())[:3]}")
        
        # Update the GeoJSON features with our statistics
        matched_count = 0
        for feature in geojson_data['features']:
            neighborhood_name = feature['properties'].get('neighborhood')
            if neighborhood_name in stats_dict:
                feature['properties'].update(stats_dict[neighborhood_name])
                matched_count += 1
                logger.info(f"Updated neighborhood {neighborhood_name} with stats: {stats_dict[neighborhood_name]}")
            else:
                logger.warning(f"No matching statistics found for neighborhood: {neighborhood_name}")
                logger.warning(f"Available properties: {feature['properties']}")
        
        logger.info(f"Successfully matched {matched_count} neighborhoods with statistics")
        logger.info("Successfully generated neighborhood boundaries response")
        return jsonify(geojson_data)
    except Exception as e:
        logger.error(f"Error fetching neighborhood boundaries: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to fetch neighborhood boundaries"}), 500

@app.route('/api/affordability', methods=['GET'])
def get_affordability():
    """
    API endpoint to calculate and return price-to-income ratios for each neighborhood.
    """
    db = next(get_db())
    try:
        # Get city-wide median income by getting all values and calculating median in Python
        incomes = db.query(
            NeighborhoodDemographics.median_family_income
        ).filter(
            NeighborhoodDemographics.median_family_income.isnot(None),
            NeighborhoodDemographics.median_family_income > 0
        ).all()
        
        if not incomes:
            logger.error("No income data found")
            return jsonify({"error": "No income data available"}), 500
            
        income_values = sorted([income[0] for income in incomes])
        mid = len(income_values) // 2
        city_median_income = income_values[mid] if len(income_values) % 2 else (income_values[mid-1] + income_values[mid]) / 2
        logger.info(f"City median income: {city_median_income}")

        # Get city-wide median price by getting all values and calculating median in Python
        prices = db.query(
            PropertyAssessment.total_value
        ).filter(
            PropertyAssessment.total_value.isnot(None),
            PropertyAssessment.total_value > 0
        ).all()
        
        if not prices:
            logger.error("No price data found")
            return jsonify({"error": "No price data available"}), 500
            
        price_values = sorted([price[0] for price in prices])
        mid = len(price_values) // 2
        city_median_price = price_values[mid] if len(price_values) % 2 else (price_values[mid-1] + price_values[mid]) / 2
        logger.info(f"City median price: {city_median_price}")

        # Get neighborhood-specific data
        logger.info("Fetching neighborhood-specific data...")
        # First get all neighborhoods
        neighborhoods_raw = db.query(
            NeighborhoodDemographics.neighborhood,
            NeighborhoodDemographics.median_family_income
        ).filter(
            NeighborhoodDemographics.median_family_income.isnot(None),
            NeighborhoodDemographics.median_family_income > 0
        ).all()

        neighborhoods_data = []
        total_price_to_income_ratio = 0

        # Calculate median price for each neighborhood
        for n in neighborhoods_raw:
            # Get all property values for this neighborhood
            property_values = db.query(
                PropertyAssessment.total_value
            ).filter(
                PropertyAssessment.neighborhood == n.neighborhood,
                PropertyAssessment.total_value.isnot(None),
                PropertyAssessment.total_value > 0
            ).all()
            
            if not property_values:
                logger.warning(f"No property values found for neighborhood {n.neighborhood}")
                continue

            # Calculate median price
            values = sorted([p[0] for p in property_values])
            mid = len(values) // 2
            median_price = values[mid] if len(values) % 2 else (values[mid-1] + values[mid]) / 2

            if n.median_family_income is None or median_price is None:
                logger.warning(f"Skipping neighborhood {n.neighborhood} due to missing data")
                continue
                
            price_to_income_ratio = median_price / n.median_family_income
            total_price_to_income_ratio += price_to_income_ratio
            
            neighborhoods_data.append({
                "name": n.neighborhood,
                "median_price": median_price,
                "median_income": n.median_family_income,
                "price_to_income_ratio": price_to_income_ratio
            })

        if not neighborhoods_data:
            logger.error("No valid neighborhood data after processing")
            return jsonify({"error": "No valid neighborhood data available"}), 500

        # Calculate median price-to-income ratio
        median_price_to_income_ratio = total_price_to_income_ratio / len(neighborhoods_data)

        logger.info("Successfully calculated price-to-income ratios")
        return jsonify({
            "city_median_price": city_median_price,
            "city_median_income": city_median_income,
            "median_price_to_income_ratio": median_price_to_income_ratio,
            "neighborhoods": neighborhoods_data
        })
    except Exception as e:
        logger.error(f"Error calculating price-to-income ratios: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to calculate price-to-income ratios"}), 500

@app.route('/api/neighborhood-summary/<neighborhood>', methods=['GET'])
def get_neighborhood_summary(neighborhood):
    """
    API endpoint to get a comprehensive summary of a specific neighborhood.
    """
    db = next(get_db())
    try:
        # Get demographics with error handling
        demographics = db.query(NeighborhoodDemographics).filter(
            NeighborhoodDemographics.neighborhood == neighborhood
        ).first()

        if not demographics:
            return jsonify({"error": "Neighborhood not found"}), 404

        # Get property values for median calculation
        property_values = db.query(
            PropertyAssessment.total_value,
            PropertyAssessment.living_area,
            PropertyAssessment.yr_built
        ).filter(
            PropertyAssessment.neighborhood == neighborhood,
            PropertyAssessment.total_value.isnot(None),
            PropertyAssessment.total_value > 0
        ).all()

        total_properties = len(property_values)
        
        if total_properties > 0:
            # Calculate medians
            values = sorted([p.total_value for p in property_values])
            areas = sorted([p.living_area for p in property_values if p.living_area is not None])
            years = sorted([p.yr_built for p in property_values if p.yr_built is not None])
            
            mid_value = len(values) // 2
            mid_area = len(areas) // 2 if areas else 0
            mid_year = len(years) // 2 if years else 0
            
            median_property_value = values[mid_value] if len(values) % 2 else (values[mid_value-1] + values[mid_value]) / 2
            median_living_area = areas[mid_area] if areas and len(areas) % 2 else (areas[mid_area-1] + areas[mid_area]) / 2 if areas else 0
            median_year_built = years[mid_year] if years and len(years) % 2 else (years[mid_year-1] + years[mid_year]) / 2 if years else 0
        else:
            median_property_value = 0
            median_living_area = 0
            median_year_built = 0

        # Get amenities counts with optimized queries
        schools_count = db.query(func.count(School.id)).filter(
            School.neighborhood == neighborhood
        ).scalar()

        mbta_stops_count = db.query(func.count(MBTAStop.id)).filter(
            MBTAStop.neighborhood == neighborhood
        ).scalar()

        restaurants_count = db.query(func.count(RestaurantInspection.id)).filter(
            RestaurantInspection.neighborhood == neighborhood
        ).scalar()

        # Get crime statistics
        crime_stats = db.query(
            func.count(CrimeIncident.id).label('total_crimes'),
            func.avg(CrimeIncident.crime_rate).label('crime_rate')
        ).filter(
            CrimeIncident.neighborhood == neighborhood
        ).first()

        # Handle None values and convert to appropriate types
        property_stats_dict = {
            "median_property_value": float(median_property_value),
            "total_properties": total_properties,
            "median_living_area": float(median_living_area),
            "median_year_built": float(median_year_built),
        }

        crime_stats_dict = {
            "total_crimes": crime_stats.total_crimes if crime_stats else 0,
            "crime_rate": float(crime_stats.crime_rate) if crime_stats and crime_stats.crime_rate else 0
        }

        amenities_dict = {
            "schools": schools_count,
            "mbta_stops": mbta_stops_count,
            "restaurants": restaurants_count
        }

        return jsonify({
            "neighborhood": neighborhood,
            "demographics": {
                "population": demographics.population,
                "median_family_income": demographics.median_family_income,
                "per_capita_income": demographics.per_capita_income,
                "age_distribution": {
                    "age_0_9": demographics.age_0_9_years,
                    "age_10_19": demographics.age_10_19_years,
                    "age_20_34": demographics.age_20_34_years,
                    "age_35_54": demographics.age_35_54_years,
                    "age_55_64": demographics.age_55_64_years,
                    "age_65_plus": demographics.age_65_years_and_over
                },
                "education": {
                    "less_than_high_school": demographics.less_than_high_school,
                    "high_school_or_ged": demographics.high_school_or_ged,
                    "some_college": demographics.some_college_or_associate_degree,
                    "bachelor_plus": demographics.bachelor_degree_or_higher
                },
                "race_ethnicity": {
                    "white": demographics.white,
                    "black": demographics.black_or_african_american,
                    "hispanic": demographics.hispanic,
                    "asian": demographics.asian_or_pi,
                    "other": demographics.other
                }
            },
            "property_stats": property_stats_dict,
            "crime_stats": crime_stats_dict,
            "amenities": amenities_dict
        })
    except Exception as e:
        logger.error(f"Error fetching neighborhood summary: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to fetch neighborhood summary"}), 500

@app.route('/api/search', methods=['GET'])
def search_neighborhoods():
    """
    API endpoint to search properties based on filters.
    Returns all properties if no filters are applied.
    """
    db = next(get_db())
    try:
        # Get query parameters with defaults
        neighborhood = request.args.get('neighborhood', '')
        min_price = request.args.get('minPrice', type=float, default=0)
        max_price = request.args.get('maxPrice', type=float, default=float('inf'))
        bedrooms = request.args.get('bedrooms', type=int, default=None)
        bathrooms = request.args.get('bathrooms', type=float, default=None)

        # Build base query to get all properties first
        base_query = db.query(PropertyAssessment)

        # Apply filters only if they are provided
        if neighborhood:
            base_query = base_query.filter(PropertyAssessment.neighborhood == neighborhood)
        if min_price > 0:
            base_query = base_query.filter(PropertyAssessment.total_value >= min_price)
        if max_price < float('inf'):
            base_query = base_query.filter(PropertyAssessment.total_value <= max_price)
        if bedrooms is not None:
            base_query = base_query.filter(PropertyAssessment.bed_rms == bedrooms)
        if bathrooms is not None:
            # Calculate total bathrooms (full + half)
            total_bathrooms = func.coalesce(PropertyAssessment.full_bth, 0) + func.coalesce(PropertyAssessment.hlf_bth, 0) * 0.5
            base_query = base_query.filter(total_bathrooms == bathrooms)

        # Get all properties for each neighborhood
        properties = base_query.all()
        
        # Group properties by neighborhood
        neighborhood_properties = {}
        for prop in properties:
            if prop.neighborhood not in neighborhood_properties:
                neighborhood_properties[prop.neighborhood] = []
            neighborhood_properties[prop.neighborhood].append(prop)

        # Calculate statistics for each neighborhood
        results = []
        for neighborhood, props in neighborhood_properties.items():
            if not props:
                continue

            # Filter out null and zero values for median price calculation
            valid_values = [p.total_value for p in props if p.total_value is not None and p.total_value > 0]
            if valid_values:
                values = sorted(valid_values)
                mid = len(values) // 2
                median_price = values[mid] if len(values) % 2 else (values[mid-1] + values[mid]) / 2
            else:
                median_price = 0

            results.append({
                'neighborhood': neighborhood,
                'median_price': float(median_price),
                'property_count': len(valid_values)  # Only count valid properties
            })

        return jsonify(results)
    except Exception as e:
        logger.error(f"Error searching properties: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to search properties"}), 500

@app.route('/api/visualizations/neighborhood-comparison', methods=['GET'])
def get_neighborhood_comparison():
    """
    API endpoint to get data for neighborhood comparison visualizations.
    """
    db = next(get_db())
    try:
        neighborhoods = db.query(NeighborhoodDemographics).all()
        
        comparison_data = []
        for n in neighborhoods:
            # Get property values for median calculation
            property_values = db.query(
                PropertyAssessment.total_value
            ).filter(
                PropertyAssessment.neighborhood == n.neighborhood,
                PropertyAssessment.total_value.isnot(None),
                PropertyAssessment.total_value > 0
            ).all()
            
            if property_values:
                values = sorted([p[0] for p in property_values])
                mid = len(values) // 2
                median_property_value = values[mid] if len(values) % 2 else (values[mid-1] + values[mid]) / 2
            else:
                median_property_value = 0
            
            # Get crime data for median calculation
            crime_rates = db.query(
                CrimeIncident.crime_rate
            ).filter(
                CrimeIncident.neighborhood == n.neighborhood,
                CrimeIncident.crime_rate.isnot(None)
            ).all()
            
            if crime_rates:
                rates = sorted([c[0] for c in crime_rates])
                mid = len(rates) // 2
                median_crime_rate = rates[mid] if len(rates) % 2 else (rates[mid-1] + rates[mid]) / 2
            else:
                median_crime_rate = 0
            
            comparison_data.append({
                "neighborhood": n.neighborhood,
                "population": n.population,
                "median_family_income": n.median_family_income,
                "median_property_value": median_property_value,
                "median_crime_rate": median_crime_rate,
                "school_count": db.query(School).filter(School.neighborhood == n.neighborhood).count(),
                "mbta_stops_count": db.query(MBTAStop).filter(MBTAStop.neighborhood == n.neighborhood).count(),
                "restaurant_count": db.query(RestaurantInspection).filter(RestaurantInspection.neighborhood == n.neighborhood).count()
            })
        
        return jsonify(comparison_data)
    except Exception as e:
        logger.error(f"Error generating neighborhood comparison data: {str(e)}")
        return jsonify({"error": "Failed to generate neighborhood comparison data"}), 500

@app.route('/api/visualizations/crime-trends', methods=['GET'])
def get_crime_trends():
    """
    API endpoint to get data for crime trend visualizations.
    """
    db = next(get_db())
    try:
        # Get crime data grouped by month and neighborhood
        crimes = db.query(
            CrimeIncident.neighborhood,
            func.strftime('%Y-%m', CrimeIncident.date).label('month'),
            func.count(CrimeIncident.id).label('crime_count')
        ).group_by(
            CrimeIncident.neighborhood,
            func.strftime('%Y-%m', CrimeIncident.date)
        ).all()
        
        # Format the data for visualization
        trends_data = {}
        for crime in crimes:
            if crime.neighborhood not in trends_data:
                trends_data[crime.neighborhood] = []
            trends_data[crime.neighborhood].append({
                "month": crime.month,
                "crime_count": crime.crime_count
            })
        
        return jsonify(trends_data)
    except Exception as e:
        logger.error(f"Error generating crime trends data: {str(e)}")
        return jsonify({"error": "Failed to generate crime trends data"}), 500

@app.route('/api/visualizations/property-distribution', methods=['GET'])
def get_property_distribution():
    """
    API endpoint to get data for property distribution visualizations.
    """
    db = next(get_db())
    try:
        neighborhoods = db.query(PropertyAssessment.neighborhood).distinct().all()
        
        distribution_data = []
        for n in neighborhoods:
            # Get property values for this neighborhood
            property_values = db.query(
                PropertyAssessment.total_value
            ).filter(
                PropertyAssessment.neighborhood == n.neighborhood,
                PropertyAssessment.total_value.isnot(None),
                PropertyAssessment.total_value > 0
            ).all()
            
            if property_values:
                values = sorted([p[0] for p in property_values])
                mid = len(values) // 2
                median_value = values[mid] if len(values) % 2 else (values[mid-1] + values[mid]) / 2
                
                distribution_data.append({
                    "neighborhood": n.neighborhood,
                    "property_count": len(values),
                    "median_value": median_value
                })
        
        return jsonify(distribution_data)
    except Exception as e:
        logger.error(f"Error generating property distribution data: {str(e)}")
        return jsonify({"error": "Failed to generate property distribution data"}), 500

@app.route('/api/max-price', methods=['GET'])
def get_max_price():
    """
    API endpoint to get the maximum property value in the database.
    """
    db = next(get_db())
    try:
        max_price = db.query(func.max(PropertyAssessment.total_value)).scalar()
        return jsonify({"max_price": float(max_price) if max_price else 0})
    except Exception as e:
        logger.error(f"Error fetching max price: {str(e)}")
        return jsonify({"error": "Failed to fetch max price"}), 500

@app.route('/api/crime-data', methods=['GET'])
def get_crime_data():
    """API endpoint to retrieve crime data for heatmap visualization."""
    db = next(get_db())
    try:
        crimes = db.query(
            CrimeIncident.latitude,
            CrimeIncident.longitude,
            CrimeIncident.offense_code,
            CrimeIncident.offense_description,
            CrimeIncident.neighborhood
        ).filter(
            CrimeIncident.latitude.isnot(None),
            CrimeIncident.longitude.isnot(None)
        ).all()
        
        return jsonify([{
            'latitude': float(crime.latitude),
            'longitude': float(crime.longitude),
            'type': crime.offense_code,
            'description': crime.offense_description,
            'neighborhood': crime.neighborhood
        } for crime in crimes])
    except Exception as e:
        logger.error(f"Error fetching crime data: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to fetch crime data"}), 500

@app.route('/api/schools', methods=['GET'])
def get_schools():
    """API endpoint to retrieve school locations and details."""
    db = next(get_db())
    try:
        # Log the query being executed
        logger.info("Fetching schools from database...")
        
        # First check if the table exists and has data
        count = db.query(func.count(School.id)).scalar()
        logger.info(f"Total schools in database: {count}")
        
        if count == 0:
            logger.warning("No schools found in database. Checking if table exists...")
            # Check if table exists
            table_exists = db.query(func.count('*')).select_from(School).scalar() is not None
            logger.info(f"Schools table exists: {table_exists}")
            
            if not table_exists:
                logger.error("Schools table does not exist in database")
                return jsonify({"error": "Schools table does not exist"}), 500
        
        schools = db.query(
            School.id,
            School.name,
            School.latitude,
            School.longitude
        ).filter(
            School.latitude.isnot(None),
            School.longitude.isnot(None)
        ).all()
        
        logger.info(f"Found {len(schools)} schools with valid coordinates")
        
        return jsonify([{
            'id': school.id,
            'name': school.name,
            'latitude': float(school.latitude),
            'longitude': float(school.longitude)
        } for school in schools])
    except Exception as e:
        logger.error(f"Error fetching schools: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to fetch schools"}), 500

@app.route('/api/transit-stops', methods=['GET'])
def get_transit_stops():
    """API endpoint to retrieve MBTA transit stops."""
    db = next(get_db())
    try:
        stops = db.query(
            MBTAStop.id,
            MBTAStop.stop_name,
            MBTAStop.stop_lat,
            MBTAStop.stop_lon,
            MBTAStop.stop_url,
            MBTAStop.wheelchair_boarding
        ).filter(
            MBTAStop.stop_lat.isnot(None),
            MBTAStop.stop_lon.isnot(None)
        ).all()
        
        return jsonify([{
            'id': stop.id,
            'name': stop.stop_name,
            'latitude': float(stop.stop_lat),
            'longitude': float(stop.stop_lon),
            'url': stop.stop_url,
            'wheelchair_boarding': stop.wheelchair_boarding
        } for stop in stops])
    except Exception as e:
        logger.error(f"Error fetching transit stops: {str(e)}")
        return jsonify({"error": "Failed to fetch transit stops"}), 500

@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    """API endpoint to retrieve restaurant data for map visualization."""
    db = next(get_db())
    try:
        restaurants = db.query(
            RestaurantInspection.latitude,
            RestaurantInspection.longitude,
            RestaurantInspection.name,
            RestaurantInspection.neighborhood
        ).filter(
            RestaurantInspection.latitude.isnot(None),
            RestaurantInspection.longitude.isnot(None)
        ).all()
        
        return jsonify([{
            'latitude': float(restaurant.latitude),
            'longitude': float(restaurant.longitude),
            'name': restaurant.name,
            'neighborhood': restaurant.neighborhood
        } for restaurant in restaurants])
    except Exception as e:
        logger.error(f"Error fetching restaurant data: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to fetch restaurant data"}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5001)
