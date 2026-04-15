from app import db

class UploadHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dataset_id = db.Column(db.Integer)
    filename = db.Column(db.String(255))
    uploaded_at = db.Column(db.DateTime)
