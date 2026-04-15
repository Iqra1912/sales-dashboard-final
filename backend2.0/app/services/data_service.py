import pandas as pd
from app.extensions import db
from app.models.sales_model import SalesData
from datetime import datetime
import json

def process_sales_file(file_path):
    """Returns stats dictionary from uploaded file"""
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        # ← Change these column names to match your actual Excel file
        df = df.rename(columns={
            'Date': 'date', 'date': 'date',
            'Product': 'product', 'product': 'product',
            'Revenue': 'revenue', 'revenue': 'revenue',
            'Quantity': 'quantity'
        })

        df['date'] = pd.to_datetime(df['date'])
        df['month'] = df['date'].dt.strftime('%Y-%m')

        monthly_revenue = df.groupby('month')['revenue'].sum().round(2).to_dict()
        top_products = df.groupby('product')['revenue'].sum().nlargest(5).round(2).to_dict()

        stats = {
            "total_revenue": float(df['revenue'].sum()),
            "revenue_by_month": monthly_revenue,
            "top_products": top_products,
            "row_count": len(df),
            "filename": file_path.split('/')[-1]
        }
        return stats, df

    except Exception as e:
        raise Exception(f"Processing failed: {str(e)}")
class DataService:

    @staticmethod
    def clean_dataframe(df):

        df.columns = df.columns.str.lower().str.strip()
        df = df.fillna(0)

        return df


    @staticmethod
    def detect_revenue_column(df):

        numeric = df.select_dtypes(include="number").columns

        for col in numeric:
            if "sales" in col or "revenue" in col:
                return col

        return numeric[0]
