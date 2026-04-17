import pandas as pd
from flask import current_app

def process_uploaded_file(file_path):
    df = pd.read_excel(file_path)           # or pd.read_csv(...)
    
    # Basic cleaning / validation
    required_cols = ['date', 'product', 'quantity', 'revenue']
    if not all(col in df.columns for col in required_cols):
        raise ValueError("Missing required columns")
    
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.to_period('M')
    
    # Aggregates
    stats = {
        'total_revenue': float(df['revenue'].sum()),
        'revenue_by_month': df.groupby('month')['revenue'].sum().to_dict(),
        'top_products': df.groupby('product')['revenue'].sum().nlargest(5).to_dict(),
        'row_count': len(df),
    }
    
    return stats, df  # return stats for dashboard, df if you want to show table preview
