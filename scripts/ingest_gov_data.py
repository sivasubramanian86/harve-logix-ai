import os
import io
import urllib.request
import pandas as pd
import psycopg2
from sqlalchemy import create_engine
import uuid

# Expected Indian State-wise Crop Yield dataset format
# The dataset generally has columns: State_Name, District_Name, Crop_Year, Season, Crop, Area, Production

DATASET_URL = "https://raw.githubusercontent.com/ritveek19/EDA_CropProduction/master/crop_production.csv"

def fetch_dataset():
    print(f"[*] Downloading Open Data CSV from {DATASET_URL}...")
    try:
        req = urllib.request.Request(DATASET_URL, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        csv_data = response.read().decode('utf-8')
        df = pd.read_csv(io.StringIO(csv_data))
        print(f"[+] Successfully downloaded and parsed {len(df)} rows.")
        return df
    except Exception as e:
        print(f"[-] Failed to download dataset: {e}")
        print("[*] Falling back to structured sample data generation for demonstration.")
        return generate_sample_data()

def generate_sample_data():
    # Fallback to realistic mock data replicating the Gov CSV structure
    data = {
        'State_Name': ['Maharashtra', 'Punjab', 'Gujarat', 'Tamil Nadu', 'Maharashtra'],
        'District_Name': ['PUNE', 'PATIALA', 'SURAT', 'MADURAI', 'NAGPUR'],
        'Crop_Year': [2020, 2020, 2021, 2021, 2020],
        'Season': ['Kharif', 'Rabi', 'Kharif', 'Rabi', 'Kharif'],
        'Crop': ['Cotton', 'Wheat', 'Groundnut', 'Rice', 'Cotton'],
        'Area': [1500.5, 2000.0, 1200.0, 1800.0, 3000.0],
        'Production': [2500.0, 8000.0, 1800.0, 5000.0, 6000.0]
    }
    return pd.DataFrame(data)

def ingest_to_postgres(df):
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("[-] Error: DATABASE_URL environment variable is not set!")
        print("[-] Please copy your AWS RDS 'postgresql://...' connection string before running.")
        return

    print(f"[*] Connecting to database at {db_url.split('@')[-1]}...")
    
    # We use SQLAlchemy to easily push the DataFrame to PostgreSQL
    # If the URL is typical prisma format: postgresql://user:pass@host:port/dbname
    engine = create_engine(db_url)
    
    # Clean up the dataset a bit
    print("[*] Cleaning dataset and computing Yield (Production / Area)...")
    df = df.dropna(subset=['Area', 'Production']).copy()
    
    # Ensure no divide by zero
    df = df[df['Area'] > 0]
    df['Yield'] = df['Production'] / df['Area']

    # Map the DataFrame columns to match our Prisma `OpenCropYield` model
    prisma_mapping = pd.DataFrame({
        'id': [str(uuid.uuid4()) for _ in range(len(df))],
        'stateName': df['State_Name'],
        'districtName': df['District_Name'],
        'cropYear': df['Crop_Year'],
        'season': df['Season'],
        'crop': df['Crop'],
        'area': df['Area'],
        'production': df['Production'],
        'yield': df['Yield']
    })

    # To respect AWS free tier, we will sample down to 5000 rows if the dataset is massive
    if len(prisma_mapping) > 5000:
        print("[*] Downsampling large dataset to 5,000 rows to respect free-tier database limits...")
        prisma_mapping = prisma_mapping.sample(n=5000, random_state=42)

    print(f"[*] Ingesting {len(prisma_mapping)} rows into PostgreSQL 'OpenCropYield' table...")
    
    try:
        # Using schema mapping "OpenCropYield" which maps exactly to Prisma table structure
        # (Table names in postgres via prisma are identical to the model name implicitly)
        prisma_mapping.to_sql('OpenCropYield', engine, if_exists='append', index=False)
        print("[+] Ingestion complete! The database is now populated with real-world yield data.")
    except Exception as e:
        print(f"[-] Ingestion failed: {e}")

if __name__ == "__main__":
    df = fetch_dataset()
    if df is not None:
        ingest_to_postgres(df)
