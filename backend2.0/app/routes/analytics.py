from flask import Blueprint, jsonify, session
import pandas as pd
import io

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/<int:dataset_id>")
def analytics(dataset_id):

    df_json = session.get("latest_df")

    if not df_json:
        return jsonify({"error":"no dataset"}),400

    df = pd.read_json(io.StringIO(df_json))

    df.columns = df.columns.str.lower()

    numeric = df.select_dtypes(include="number").columns

    revenue_col = numeric[0]

    avg = df[revenue_col].mean()
    max_val = df[revenue_col].max()
    min_val = df[revenue_col].min()

    return jsonify({
        "average": float(avg),
        "highest": float(max_val),
        "lowest": float(min_val)
    })
