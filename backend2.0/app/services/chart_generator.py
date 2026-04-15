def detect_charts(df):

    charts = []

    numeric_cols = df.select_dtypes(include=['int64','float64']).columns
    category_cols = df.select_dtypes(include=['object']).columns

    if len(numeric_cols) > 0:
        charts.append({
            "type": "line",
            "x": df.columns[0],
            "y": numeric_cols[0]
        })

    if len(category_cols) > 0 and len(numeric_cols) > 0:
        charts.append({
            "type": "bar",
            "x": category_cols[0],
            "y": numeric_cols[0]
        })

    return charts
