# dashboard.py - top of file, replace flask_login import
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask import Blueprint, request, jsonify
from ..models.dataset_model import Dataset
import pandas as pd
import os

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard')
def dashboard():
    try:
        verify_jwt_in_request()  # ✅ JWT check instead of flask_login
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401

    latest = Dataset.query.order_by(Dataset.id.desc()).first()
    # ... rest stays the same
    if latest:
        stats = {
            "total_users": 1250,
            "revenue": latest.total_revenue or 0,
            "active_sessions": 320,
            "last_filename": latest.filename
        }
    else:
        stats = {
            "total_users": 0,
            "revenue": 0,
            "active_sessions": 0,
            "last_filename": "No file uploaded"
        }

    return jsonify(stats)  # ✅ JSON not HTML


@dashboard_bp.route('/kpis', methods=['GET'])
def get_kpis():
    dataset_id = request.args.get("dataset_id")

    if not dataset_id:
        return jsonify({"error": "dataset_id missing"}), 400

    dataset = Dataset.query.get(dataset_id)
    if not dataset:
        return jsonify({"error": "Dataset not found"}), 404

    # ✅ BUILD FULL PATH - fixes the CSV read failure
    base_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'uploads')
    file_path = os.path.join(base_dir, dataset.filename)

    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        return jsonify({"error": f"Could not read file: {str(e)}"}), 500

    df.columns = df.columns.str.lower().str.strip()
    df = df.fillna(0)

    numeric_cols = df.select_dtypes(include='number').columns.tolist()
    text_cols = df.select_dtypes(include='object').columns.tolist()

    if not numeric_cols:
        return jsonify({"error": "No numeric data found in dataset"}), 400

    # Revenue column detection
    revenue_col = next(
        (col for col in numeric_cols if any(k in col for k in ['revenue', 'sales', 'amount', 'income'])),
        numeric_cols[0]
    )

    # Category column detection
    category_col = next(
        (col for col in text_cols if any(k in col for k in ['region', 'category', 'product', 'area', 'type'])),
        text_cols[0] if text_cols else None
    )

    # Date column detection
    date_col = next((col for col in df.columns if 'date' in col), None)

    revenue = float(df[revenue_col].sum())
    charts = []

    if category_col:
        grouped = df.groupby(category_col)[revenue_col].sum().nlargest(5)
        charts.append({
            "type": "bar",
            "title": f"Top {category_col}",
            "labels": grouped.index.tolist(),
            "values": grouped.values.astype(float).tolist()
        })
        charts.append({
            "type": "pie",
            "title": f"{category_col} Distribution",
            "labels": grouped.index.tolist(),
            "values": grouped.values.astype(float).tolist()
        })

    if date_col:
        try:
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            df = df.dropna(subset=[date_col])
            trend = df.groupby(df[date_col].dt.to_period('M'))[revenue_col].sum()
            charts.append({
                "type": "line",
                "title": f"{revenue_col} over time",
                "labels": [str(x) for x in trend.index],
                "values": [float(x) for x in trend.values]
            })
        except Exception as e:
            print(f"[dashboard] Date trend error: {e}")  # ← was empty, now has a body

    if len(numeric_cols) >= 2:
        charts.append({
            "type": "bar",
            "title": "Numeric Comparison",
            "labels": numeric_cols[:5],
            "values": [float(df[col].sum()) for col in numeric_cols[:5]]
        })

    insights = [f"📊 {len(df)} records processed"]
    if category_col:
        top = df.groupby(category_col)[revenue_col].sum().idxmax()
        insights.append(f"🏆 Top {category_col}: {top}")
    if date_col:
        insights.append("📅 Time-based trends detected")
    if len(numeric_cols) >= 2:
        insights.append("💡 Multiple numeric fields available")

    return jsonify({
        "revenue": revenue,
        "charts": charts,
        "insights": insights
    })
