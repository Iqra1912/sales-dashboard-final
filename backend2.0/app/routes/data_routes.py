from flask import Blueprint, request, jsonify
import pandas as pd

data_bp = Blueprint("data", __name__)

@data_bp.route("/upload", methods=["POST"])
def upload():

    file = request.files["file"]

    if file.filename.endswith(".csv"):
        df = pd.read_csv(file)
    else:
        df = pd.read_excel(file)

    numeric = df.select_dtypes(include="number").columns.tolist()
    categorical = df.select_dtypes(include="object").columns.tolist()

    charts = []

    if numeric and categorical:
        grouped = df.groupby(categorical[0])[numeric[0]].sum()

        charts.append({
            "type": "bar",
            "labels": grouped.index.tolist(),
            "data": grouped.values.tolist(),
            "title": f"{numeric[0]} by {categorical[0]}"
        })

    preview = df.head(5).to_dict(orient="records")

    return jsonify({
        "charts": charts,
        "preview": preview
    })
