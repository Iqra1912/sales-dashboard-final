from flask import Blueprint, request, jsonify
import pandas as pd
from app.utils.dataset_analyzer import analyze_dataset
from app.utils.insight_generator import generate_insights

upload_bp = Blueprint("upload", __name__)

@upload_bp.route("/upload", methods=["POST"])
def upload_file():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file)
        elif file.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file)
        else:
            return jsonify({"error": "Unsupported format"}), 400

        df.columns = df.columns.str.strip().str.lower()

        # ✅ DYNAMIC KPI DETECTION
        kpis = detect_kpis(df)
        charts = analyze_dataset(df)
        insights = generate_insights(df)

        return jsonify({
            "data": df.head(100).to_dict(orient="records"),
            "charts": charts,
            "insights": insights,
            "kpis": kpis,
            "columns": df.columns.tolist(),
            "total_rows": len(df)
        })

    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


def detect_kpis(df):
    kpis = []
    numeric_cols = df.select_dtypes(include='number').columns.tolist()
    categorical_cols = df.select_dtypes(include='object').columns.tolist()

    # Total rows
    kpis.append({
        "label": "Total Records",
        "value": f"{len(df):,}",
        "icon": "📊"
    })

    # Revenue/Sales column
    revenue_col = next(
        (c for c in numeric_cols if any(k in c for k in
         ['sales', 'revenue', 'amount', 'price', 'total', 'income'])),
        None
    )
    if revenue_col:
        total = df[revenue_col].sum()
        avg = df[revenue_col].mean()
        kpis.append({
            "label": f"Total {revenue_col.replace('_', ' ').title()}",
            "value": f"${total:,.0f}",
            "icon": "💰"
        })
        kpis.append({
            "label": f"Avg {revenue_col.replace('_', ' ').title()}",
            "value": f"${avg:,.0f}",
            "icon": "📈"
        })

    # Store/Branch/Location count
    store_col = next(
        (c for c in df.columns if any(k in c for k in
         ['store', 'branch', 'location', 'outlet', 'region'])),
        None
    )
    if store_col:
        count = df[store_col].nunique()
        kpis.append({
            "label": f"Unique {store_col.replace('_', ' ').title()}s",
            "value": str(count),
            "icon": "🏪"
        })

    # Product/Category count
    product_col = next(
        (c for c in categorical_cols if any(k in c for k in
         ['product', 'category', 'item', 'type', 'name', 'sku'])),
        None
    )
    if product_col:
        count = df[product_col].nunique()
        kpis.append({
            "label": f"Unique {product_col.replace('_', ' ').title()}s",
            "value": str(count),
            "icon": "📦"
        })

    # Date range
    date_col = next(
        (c for c in df.columns if 'date' in c or 'week' in c or 'month' in c),
        None
    )
    if date_col:
        try:
            dates = pd.to_datetime(df[date_col], errors='coerce').dropna()
            if len(dates) > 0:
                kpis.append({
                    "label": "Date Range",
                    "value": f"{dates.min().strftime('%b %Y')} – {dates.max().strftime('%b %Y')}",
                    "icon": "📅"
                })
        except:
            pass

    # Top performing store/product
    if store_col and revenue_col:
        try:
            top = df.groupby(store_col)[revenue_col].sum().idxmax()
            kpis.append({
                "label": f"Top {store_col.replace('_', ' ').title()}",
                "value": str(top),
                "icon": "🏆"
            })
        except:
            pass

    return kpis