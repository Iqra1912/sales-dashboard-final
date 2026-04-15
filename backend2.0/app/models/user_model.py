from app.extensions import db
from app.extensions import db, bcrypt
# Do NOT import Dataset at the top here
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    datasets = db.relationship('Dataset', backref='owner', lazy=True) # Using 'Dataset' as a string is safe
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='Analyst') # 'Admin' or 'Analyst'

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
