from flask import Blueprint, request, jsonify
from app.models.dataset_model import Dataset
from app.services.ai_service import ask_dataset_question
import pandas as pd

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/ask", methods=["POST"])
def ask():

    question = request.json.get("question")

    dataset = Dataset.query.order_by(Dataset.uploaded_at.desc()).first()

    if not dataset:
        return jsonify({"answer":"No dataset uploaded yet."})

    df = pd.read_json(dataset.data)

    answer = ask_dataset_question(df, question)

    return jsonify({"answer":answer})
