import pandas as pd
import numpy as np

def clean_sales_data(file_path):
    # Load the file based on extension
    if file_path.endswith('.xlsx'):
        df = pd.read_excel(file_path)
    else:
        df = pd.read_csv(file_path)

    # 1. Handle Missing Values: Fill numeric with 0, categorical with 'Unknown'
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(0)
    
    categorical_cols = df.select_dtypes(include=['object']).columns
    df[categorical_cols] = df[categorical_cols].fillna('Unknown')

    # 2. Standardize Date column (assuming a column named 'Date' or 'Close Date')
    date_col = next((col for col in df.columns if 'date' in col.lower()), None)
    if date_col:
        df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
        df = df.dropna(subset=[date_col]) # Remove rows where date is completely invalid

    # 3. Clean Price/Value columns (remove '$' or commas)
    value_col = next((col for col in df.columns if 'value' in col.lower() or 'price' in col.lower()), None)
    if value_col and df[value_col].dtype == 'object':
        df[value_col] = df[value_col].replace(r'[\$,]', '', regex=True).astype(float)

    return df
