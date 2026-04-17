# create_users.py
from app import create_app
from app.extensions import db, bcrypt
from app.models.user_model import User

app = create_app()

with app.app_context():
    db.create_all()

    # Check if user already exists
    existing = User.query.filter_by(email="admin@test.com").first()
    if existing:
    else:
        hashed = bcrypt.generate_password_hash("admin123").decode("utf-8")
        user = User(
            username="admin",
            email="admin@test.com",      # ✅ email was missing
            password_hash=hashed,
            role="admin"
        )
        db.session.add(user)
        db.session.commit()

