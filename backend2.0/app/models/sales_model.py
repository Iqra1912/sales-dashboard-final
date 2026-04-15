from app.extensions import db

class SalesData(db.Model):
    __tablename__ = "sales_data"

    id = db.Column(db.Integer, primary_key=True)
    region = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    sales = db.Column(db.Float, nullable=False)        # Revenue
    profit = db.Column(db.Float, nullable=False)
    units_sold = db.Column(db.Integer, nullable=False)
    date_recorded = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f"<SalesData {self.category} in {self.region}>"
