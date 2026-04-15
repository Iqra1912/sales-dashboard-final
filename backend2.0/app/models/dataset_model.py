from app.extensions import db
from datetime import datetime
import json

class Dataset(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    filename = db.Column(db.String(200))

    upload_date = db.Column(db.DateTime)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))

    # Aggregated data we will show on dashboard
    total_revenue = db.Column(db.Float, default=0.0)
    revenue_by_month_json = db.Column(db.Text)      # stores {"2025-03": 12400, ...}
    top_products_json = db.Column(db.Text)          # stores {"Laptop Pro": 6500, ...}
    row_count = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f"<Dataset {self.filename}>"
 
    # Helper methods (optional but useful)
    def get_revenue_dict(self):
        return json.loads(self.revenue_by_month_json) if self.revenue_by_month_json else {}

    def get_top_products_dict(self):
        return json.loads(self.top_products_json) if self.top_products_json else {}
    