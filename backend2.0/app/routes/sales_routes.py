from flask import Blueprint, request, jsonify
from app.services.data_service import DataService
from app.models.sales_model import SalesData
import os

# Define the blueprint
sales_bp = Blueprint('sales', __name__)

@sales_bp.route('/upload', methods=['POST'])
def upload_file():
    # Check if a file was actually sent
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        # Save file temporarily to process it
        filepath = os.path.join("app/data", file.filename)
        file.save(filepath)
        
        # Call the DataService we created earlier
        result = DataService.process_and_save_csv(filepath)
        
        # Clean up the file after processing
        os.remove(filepath)
        
        return jsonify(result), 200

@sales_bp.route('/dashboard-data', methods=['GET'])
def get_dashboard_data():
    # Fetch all data from SQLite
    data = SalesData.query.all()
    
    # Format it for React/Chart.js
    output = []
    for item in data:
        output.append({
            "region": item.region,
            "category": item.category,
            "sales": item.sales,
            "profit": item.profit,
            "units": item.units_sold
        })
    
    return jsonify(output), 200