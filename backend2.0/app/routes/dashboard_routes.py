from flask import Blueprint, jsonify
from services.analytics import (
    get_kpis,
    revenue_trend,
    product_performance,
    region_distribution
)

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/kpis")
def kpis():
    return jsonify(get_kpis())

@dashboard_bp.route("/revenue-trend")
def revenue():
    return jsonify(revenue_trend())

@dashboard_bp.route("/product-performance")
def product():
    return jsonify(product_performance())

@dashboard_bp.route("/region-distribution")
def region():
    return jsonify(region_distribution())
