import pandas as pd
from .extensions import db
from .models.sales_model import SalesData

def process_and_store_file(file, dataset_name, user_id):
    if file.filename.endswith('.csv'):
        df = pd.read_csv(file)
    else:
        df = pd.read_excel(file)

    # Basic cleaning
    required = ['Order Date', 'Region', 'Category', 'Sales', 'Profit']
    if not all(col in df.columns for col in required):
        raise ValueError("Missing required columns in file")

    df = df.dropna(subset=required)
    df['Order Date'] = pd.to_datetime(df['Order Date'], errors='coerce')
    df = df.dropna(subset=['Order Date'])
    df = df[df['Sales'] > 0]

    # Store data
    records = []
    for _, row in df.iterrows():
        records.append(SalesData(
            order_date=row['Order Date'],
            region=str(row['Region']),
            category=str(row['Category']),
            sales=float(row['Sales']),
            profit=float(row['Profit'])
        ))

    db.session.bulk_save_objects(records)
    db.session.commit()

    return len(records)
