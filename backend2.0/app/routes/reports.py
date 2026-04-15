from flask import Blueprint, send_file
import pandas as pd
import io

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/excel")
def export_excel():

    df_json = session.get("latest_df")

    df = pd.read_json(io.StringIO(df_json))

    buffer = io.BytesIO()

    df.to_excel(buffer,index=False)

    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="report.xlsx",
        mimetype="application/vnd.ms-excel"
    )
