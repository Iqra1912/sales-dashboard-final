from flask import Blueprint, request, jsonify
import pandas as pd
import io
import re
from app.utils.dataset_analyzer import analyze_dataset
from app.utils.insight_generator import generate_insights, generate_kpis

upload_bp = Blueprint("upload", __name__)

MAX_FILE_SIZE_MB = 50

def _clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    # 1. Clean Headers: remove spaces, lowercase, remove special characters
    df.columns = [re.sub(r'[^\w\s]', '', str(col)).strip().lower().replace(" ", "_") for col in df.columns]
    
    # 2. Handle N/A and Missing Data
    df = df.dropna(how="all") # Drop completely empty rows
    
    # 3. Smart Numeric Conversion (for currency like "$367K")
    for col in df.columns:
        if df[col].dtype == 'object':
            # Remove currency symbols and commas
            cleaned = df[col].astype(str).str.replace(r'[$,%]', '', regex=True)
            # Try to convert to numeric, if 80% of data becomes valid numbers, keep it
            num_series = pd.to_numeric(cleaned, errors='coerce')
            if num_series.notna().sum() > (len(df) * 0.8):
                df[col] = num_series
    
    return df.fillna(0) # Replace remaining N/A with 0 for chart safety

@upload_bp.route("/upload", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    filename = file.filename.lower()

    try:
        if filename.endswith('.csv'):
            # Use utf-8-sig to handle Excel-exported CSVs with BOM
            file_bytes = file.read()
            df = pd.read_csv(io.BytesIO(file_bytes), encoding='utf-8-sig', sep=None, engine='python')
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        else:
            return jsonify({"error": "Unsupported file format. Use CSV or Excel."}), 400

        # Run Data Cleaning
        df = _clean_dataframe(df)

        if df.empty:
            return jsonify({"error": "Dataset is empty after cleaning."}), 400

        # Generate Data for Frontend
        return jsonify({
            "charts": analyze_dataset(df),
            "insights": generate_insights(df),
            "kpis": generate_kpis(df),
            "total_rows": len(df),
            "columns": df.columns.tolist()
        })

    except Exception as e:
        return jsonify({"error": f"Processing error: {str(e)}"}), 500
