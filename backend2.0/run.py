import os
import sys

try:
    from app import create_app
    from app.extensions import db
except ModuleNotFoundError as e:
    print(f"Missing dependency: {e.name}")
    print("Install with:  python -m pip install -r requirements.txt")
    print("Or use venv:    .venv\\Scripts\\python run.py")
    sys.exit(1)

# Initialize the app using the factory
app = create_app()

# Ensure the upload directory exists
UPLOAD_FOLDER = os.path.join(app.root_path, 'data', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

if __name__ == "__main__":
    with app.app_context():
        # This ensures tables exist before the app starts
        db.create_all()
        print("✅ Database tables verified/created.")

    # Updated part - Use Render's PORT environment variable
    port = int(os.environ.get("PORT", 8000))   # This is the important change

    app.run(
        debug=True,
        host='0.0.0.0',           # Changed from 127.0.0.1 → important for deployment
        port=port,
        use_reloader=True,
        threaded=True
    )