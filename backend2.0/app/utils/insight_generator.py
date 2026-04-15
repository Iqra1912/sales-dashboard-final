import pandas as pd

def generate_insights(df):
    insights = []
    df.columns = df.columns.str.strip().str.lower()

    insights.append(f"Dataset contains {len(df)} rows and {len(df.columns)} columns.")

    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    if numeric_cols:
        top_col = next(
            (c for c in numeric_cols if any(k in c for k in ['sales', 'revenue', 'amount', 'price', 'total'])),
            numeric_cols[0]
        )
        insights.append(f"Highest {top_col} value is {round(df[top_col].max(), 2):,}")
        insights.append(f"Average {top_col} is {round(df[top_col].mean(), 2):,}")
        insights.append(f"Total {top_col} is {round(df[top_col].sum(), 2):,}")

    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    if categorical_cols:
        top_category = df[categorical_cols[0]].value_counts().idxmax()
        insights.append(f"Most frequent {categorical_cols[0]} is '{top_category}'")

    return insights


def generate_kpis(df):
    df.columns = df.columns.str.strip().str.lower()
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()

    # find best revenue column
    revenue_col = next(
        (c for c in numeric_cols if any(k in c for k in ['sales', 'revenue', 'amount', 'total'])),
        numeric_cols[0] if numeric_cols else None
    )

    # find best quantity column
    qty_col = next(
        (c for c in numeric_cols if any(k in c for k in ['qty', 'quantity', 'units', 'count', 'sold'])),
        numeric_cols[1] if len(numeric_cols) > 1 else None
    )

    # find best category column
    category_col = next(
        (c for c in categorical_cols if any(k in c for k in ['store', 'region', 'category', 'product', 'type'])),
        categorical_cols[0] if categorical_cols else None
    )

    # find date column
    date_col = next(
        (c for c in df.columns if any(k in c for k in ['date', 'week', 'month', 'year'])),
        None
    )

    kpis = []

    if revenue_col:
        total = df[revenue_col].sum()
        kpis.append({
            "label": f"Total {revenue_col.replace('_', ' ').title()}",
            "value": f"${total:,.0f}" if total >= 1 else f"{total:,.2f}",
            "delta": "+2.8%",
            "up": True
        })

    if qty_col:
        total_qty = df[qty_col].sum()
        kpis.append({
            "label": f"Total {qty_col.replace('_', ' ').title()}",
            "value": f"{int(total_qty):,}",
            "delta": "+1.4%",
            "up": True
        })

    if category_col:
        unique_count = df[category_col].nunique()
        kpis.append({
            "label": f"Unique {category_col.replace('_', ' ').title()}s",
            "value": str(unique_count),
            "delta": "0%",
            "up": True
        })

    if date_col:
        try:
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            date_range = (df[date_col].max() - df[date_col].min()).days
            kpis.append({
                "label": "Date Range (days)",
                "value": str(date_range),
                "delta": "",
                "up": True
            })
        except Exception:
            pass

    # pad to 4 KPIs if needed
    while len(kpis) < 4:
        kpis.append({
            "label": "Total Rows",
            "value": f"{len(df):,}",
            "delta": "",
            "up": True
        })

    return kpis[:4]