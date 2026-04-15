# dataset_analyzer.py
import pandas as pd

def analyze_dataset(df):
    charts = []

    df.columns = df.columns.str.strip().str.lower()
    numeric_cols = df.select_dtypes(include='number').columns.tolist()
    categorical_cols = df.select_dtypes(include='object').columns.tolist()

    # detect best revenue column
    revenue_col = next(
        (c for c in numeric_cols if any(k in c for k in ['sales', 'revenue', 'amount', 'price', 'total'])),
        numeric_cols[0] if numeric_cols else None
    )

    # detect best category column
    category_col = next(
        (c for c in categorical_cols if any(k in c for k in ['region', 'category', 'product', 'store', 'type', 'name'])),
        categorical_cols[0] if categorical_cols else None
    )

    # detect date column
    date_col = next(
        (c for c in df.columns if 'date' in c or 'week' in c or 'month' in c or 'year' in c),
        None
    )

    # 🟢 Bar chart - top categories by revenue
    if category_col and revenue_col:
        grouped = df.groupby(category_col)[revenue_col].sum().nlargest(10)
        charts.append({
            "type": "bar",
            "title": f"Top {category_col} by {revenue_col}",
            "labels": [str(x) for x in grouped.index.tolist()],
            "values": [round(float(x), 2) for x in grouped.values.tolist()]
        })

    # 🔵 Line chart - trend over time
    if date_col and revenue_col:
        try:
            df[date_col] = pd.to_datetime(df[date_col], dayfirst=True, errors='coerce')
            df = df.dropna(subset=[date_col])
            trend = df.groupby(df[date_col].dt.to_period('M'))[revenue_col].sum()
            charts.append({
                "type": "line",
                "title": f"{revenue_col} trend over time",
                "labels": [str(x) for x in trend.index.tolist()],
                "values": [round(float(x), 2) for x in trend.values.tolist()]
            })
        except Exception as e:
            print("Line chart error:", e)
    elif revenue_col:
        # fallback - show numeric trend by row index (sampled)
        sampled = df[revenue_col].dropna().iloc[::max(1, len(df)//20)]
        charts.append({
            "type": "line",
            "title": f"{revenue_col} trend",
            "labels": [str(i) for i in range(len(sampled))],
            "values": [round(float(x), 2) for x in sampled.values.tolist()]
        })

    # 🟣 Pie chart - category distribution (top 6 only)
    if category_col:
        value_counts = df[category_col].value_counts().nlargest(6)
        charts.append({
            "type": "pie",
            "title": f"{category_col} distribution",
            "labels": [str(x) for x in value_counts.index.tolist()],
            "values": [int(x) for x in value_counts.values.tolist()]
        })

    return charts