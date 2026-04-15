import pandas as pd

df = pd.read_csv("data/sales.csv")

def get_kpis():

    total_revenue = df["Revenue"].sum()
    total_orders = df["Orders"].sum()
    total_profit = df["Profit"].sum()
    total_customers = df["Customer"].nunique()

    return {
        "revenue": total_revenue,
        "orders": total_orders,
        "profit": total_profit,
        "customers": total_customers
    }

def revenue_trend():

    trend = (
        df.groupby("Date")["Revenue"]
        .sum()
        .reset_index()
        .sort_values("Date")
    )

    return trend.to_dict(orient="records")

def product_performance():

    product = (
        df.groupby("Product")["Revenue"]
        .sum()
        .reset_index()
    )

    return product.to_dict(orient="records")

def region_distribution():

    region = (
        df.groupby("Region")["Revenue"]
        .sum()
        .reset_index()
    )

    return region.to_dict(orient="records")
