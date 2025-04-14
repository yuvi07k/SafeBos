import pandas as pd

# Define a dictionary to map Boston ZIP codes to neighborhoods.
# Update or expand the dictionary as needed based on your local knowledge.
zip_to_neighborhood = {
    "02134": "Allston",
    "02163": "Allston",
    "02116": "Back Bay",
    "02199": "Back Bay",
    "02108": "Beacon Hill",
    "02135": "Brighton",
    "02467": "Brighton",
    "02129": "Charlestown",
    "02111": "Chinatown",
    "02122": "Dorchester",
    "02124": "Dorchester",
    "02125": "Dorchester",
    "02110": "Downtown",
    "02203": "Downtown",
    "02211": "Downtown",
    "02201": "Downtown",
    "02128": "East Boston",
    "02228": "East Boston",
    "02151": "East Boston",
    "02115": "Fenway",
    "02215": "Fenway",
    "02171": "Harbor Islands",
    "02136": "Hyde Park",
    "02446": "Longwood",
    "02130": "Jamaica Plain",
    "02120": "Mission Hill",
    "02126": "Mattapan",
    "02109": "North End",
    "02113": "North End",
    "02131": "Roslindale",
    "02119": "Roxbury",
    "02121": "Roxbury",
    "02127": "South Boston",
    "02210": "South Boston Waterfront",
    "02118": "South End",
    "02114": "West End",
    "02132": "West Roxbury"
}

# Load your dataset from a CSV file.
# First, let's read the first line to check the actual format
with open("property-assessment-fy2025_clean.csv", 'r') as f:
    first_line = f.readline()
    print("First line of file:", first_line)

# Try reading with different delimiters
try:
    df = pd.read_csv("property-assessment-fy2025_clean.csv", delimiter=",")
except:
    try:
        df = pd.read_csv("property-assessment-fy2025_clean.csv", delimiter="\t")
    except:
        df = pd.read_csv("property-assessment-fy2025_clean.csv")

# Clean column headers by stripping extra whitespace.
df.columns = df.columns.str.strip()

# Print the actual column names for debugging
print("Actual column names:", df.columns.tolist())

# Function to safely convert a ZIP code to a zero-padded 5-digit string.
def format_zip(val):
    if pd.notna(val):
        try:
            # Some ZIP codes may be read as floats; first convert to float then int.
            return str(int(float(val))).zfill(5)
        except Exception as e:
            print(f"Could not convert value '{val}' to a 5-digit string: {e}")
            return None
    else:
        return None

# Apply the conversion function to the 'zip_code' column.
df['zip_code'] = df['zip_code'].apply(format_zip)

# Map the ZIP codes to neighborhoods using the dictionary.
df['neighborhood'] = df['zip_code'].map(zip_to_neighborhood)

# Write the modified DataFrame to a new CSV file.
output_csv = "property-assessment-fy2025_clean.csv"
df.to_csv(output_csv, index=False)

print(f"CSV file saved as {output_csv}")
