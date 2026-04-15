# auth.py
from flask import Blueprint, jsonify, request, redirect, url_for, session, current_app  # ✅ FIX: added current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
from app.models.user_model import User
from app.extensions import db, mail, oauth, bcrypt
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

def generate_reset_token(email):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt='password-reset-salt')

def confirm_reset_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=expiration)
        return email
    except (SignatureExpired, BadTimeSignature):
        return None

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": getattr(user, 'role', 'user')
        }
    }), 200

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    # ✅ FIX: accept both "username" and "name" from frontend
    username = data.get("username") or data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([username, email, password]):
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409

    new_user = User(username=username, email=email)
    new_user.password_hash = generate_password_hash(password)
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.id))
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email
        }
    }), 201

@auth_bp.route('/google/login')
def google_login():
    redirect_uri = url_for('auth.google_authorized', _external=True)
    print(f"=== GOOGLE LOGIN STARTING, redirect_uri={redirect_uri} ===")
    return oauth.google.authorize_redirect(redirect_uri)

@auth_bp.route('/google/authorized')
def google_authorized():
    print("=== GOOGLE CALLBACK STARTED ===")
    state_from_google = request.args.get("state")
    state_in_session = session.get("state")
    print(f"Google sent state: '{state_from_google}'")
    print(f"Session has state: '{state_in_session}'")
    print(f"Session keys: {list(session.keys())}")

    try:
        token = oauth.google.authorize_access_token()
        print("✅ TOKEN SUCCESS!")

        user_info = token.get("userinfo")
        if not user_info:
            user_info = oauth.google.parse_id_token(token)

        email = user_info["email"]
        name = user_info.get("name", email.split("@")[0])

        user = User.query.filter_by(email=email).first()
        if not user:
            username = name.replace(" ", "_").lower()
            user = User(username=username, email=email)
            db.session.add(user)
            db.session.commit()

        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24)
        )
        print(f"✅ LOGIN SUCCESS for {email}")
        return redirect(f"http://localhost:5173/auth/callback?token={access_token}")

    except Exception as e:
        print("=== GOOGLE AUTH FAILED ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        return redirect("http://localhost:5173/login?error=google")

@auth_bp.route("/reset", methods=["POST"])
def reset_request():
    data = request.json
    email = data.get("email")
    user = User.query.filter_by(email=email).first()

    if user:
        token = generate_reset_token(email)
        reset_link = f"http://localhost:5173/reset-password?token={token}"
        msg = Message(
            "Password Reset Request",
            sender=current_app.config.get("MAIL_USERNAME"),
            recipients=[email]
        )
        msg.body = f"To reset your password visit: {reset_link}"
        try:
            mail.send(msg)
        except Exception as e:
            return jsonify({"error": f"Email failed: {str(e)}"}), 500
        return jsonify({"message": "Reset link sent"}), 200
    return jsonify({"error": "Email not found"}), 404

@auth_bp.route("/reset/<token>", methods=["POST"])
def reset_with_token(token):
    email = confirm_reset_token(token)
    if not email:
        return jsonify({"error": "Invalid or expired token"}), 400

    data = request.json
    password = data.get("password")
    user = User.query.filter_by(email=email).first()
    user.password_hash = generate_password_hash(password)
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200

@auth_bp.route('/profile')
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "username": user.username,
        "role": getattr(user, 'role', 'user'),
        "email": user.email
    })