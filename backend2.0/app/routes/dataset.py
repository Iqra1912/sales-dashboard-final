import os
import json
from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for, flash
from ..models.sales_model import SalesData as Sales
from ..models.dataset_model import Dataset
from ..extensions import db
import pandas as pd
from flask import Blueprint, jsonify, session
from ..models.dataset_model import Dataset
from ..extensions import db

datasets_bp = Blueprint("datasets", __name__)

@datasets_bp.route("/", methods=["GET"])
def list_datasets():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error":"not logged in"}),401

    datasets = Dataset.query.filter_by(user_id=user_id).all()

    result = []

    for d in datasets:
        result.append({
            "id": d.id,
            "filename": d.filename,
            "uploaded_at": d.uploaded_at
        })

    return jsonify(result)


@datasets_bp.route("/<int:id>", methods=["DELETE"])
def delete_dataset(id):

    dataset = Dataset.query.get(id)

    if not dataset:
        return jsonify({"error":"dataset not found"}),404

    db.session.delete(dataset)
    db.session.commit()

    return jsonify({"message":"dataset deleted"})

# ✅ FIX: renamed to match import in __init__.py
datasets_bp = Blueprint('datasets', __name__)


@datasets_bp.route('/dashboard')
def dashboard():
    user_id = session.get("user_id")
    if not user_id:
        flash("Please login first", "danger")
        return redirect(url_for("auth.login"))

    latest = Dataset.query.filter_by(user_id=user_id)\
                          .order_by(Dataset.uploaded_at.desc())\
                          .first()

    if latest:
        revenue_data = latest.get_revenue_dict()
        top_products = latest.get_top_products_dict()
        stats = {
            "total_users": 1250,
            "revenue": latest.total_revenue or 0,
            "active_sessions": 320,
            "last_filename": latest.filename
        }
    else:
        revenue_data = {}
        top_products = {}
        stats = {
            "total_users": 0,
            "revenue": 0,
            "active_sessions": 0,
            "last_filename": "No file uploaded"
        }

    return render_template(
        'dashboard.html',
        revenue_data=revenue_data,
        top_products=top_products,
        stats=stats
    )


@datasets_bp.route('/api/dashboard/kpis', methods=['GET'])
def get_kpis():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    dataset_id = request.args.get('dataset_id', type=int)
    if not dataset_id:
        return jsonify({"error": "dataset_id required"}), 400

    query = Sales.query.filter_by(dataset_id=dataset_id)

    try:
        engine = db.engine
        with engine.connect() as conn:
            df = pd.read_sql(query.statement, conn)
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    if df.empty:
        return jsonify({"message": "No data", "revenue": 0}), 200

    return jsonify({
        "revenue": round(float(df['sales'].sum()), 2),
        "profit": round(float(df['profit'].sum()), 2),
        "region_performance": df.groupby('region')['sales'].sum().to_dict(),
        "total_records": len(df)
    })
