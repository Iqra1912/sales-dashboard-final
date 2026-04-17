import os
import sys

try:
    from app import create_app
    from app.extensions import db
except ModuleNotFoundError as e:
    print(f"Error: Could not find modules. {e}")
    sys.exit(1)

# 1. Initialize the app using the factory
app = create_app()

# 2. Database & Folder Setup
with app.app_context():
    # Ensure the upload directory exists
    UPLOAD_FOLDER = os.path.join(app.root_path, 'data', 'uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    # Ensure tables exist before the app starts
    try:
        db.create_all()
    except Exception as e:
        print(f"Database initialization failed: {e}") # Added code here

# 3. Local Development Entry Point
# Moved to the far left (no indentation)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(
        debug=True,
        host='0.0.0.0',
        port=port
    )