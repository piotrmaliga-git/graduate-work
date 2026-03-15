import os
import time
from datetime import datetime
import importlib.util
from typing import Callable

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import models using importlib.util for non-standard names
def load_model_module(module_name, file_path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

# Get the models directory path
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

available_models: list[str] = []
model_load_errors: dict[str, str] = {}


def _build_unavailable_classifier(model_name: str) -> Callable[[str], tuple[str, str]]:
    def _classifier(_: str) -> tuple[str, str]:
        reason = model_load_errors.get(model_name, "model is unavailable")
        return (
            f"error: model {model_name} is unavailable",
            f"Model {model_name} could not be loaded during startup: {reason}",
        )

    return _classifier


def _register_model(
    model_name: str,
    module_name: str,
    filename: str,
    classifier_name: str,
) -> Callable[[str], tuple[str, str]]:
    file_path = os.path.join(MODELS_DIR, filename)

    try:
        module = load_model_module(module_name, file_path)
        classifier = getattr(module, classifier_name)
        available_models.append(model_name)
        return classifier
    except Exception as error:
        model_load_errors[model_name] = str(error)
        return _build_unavailable_classifier(model_name)


classify_with_gpt4_1 = _register_model("gpt-4.1", "gpt_4_1", "gpt_4.1.py", "classify_with_gpt4_1")
classify_with_mistral_7b = _register_model("mistral-7b", "mistral_7b", "mistral_7b.py", "classify_with_mistral_7b")
classify_with_llama_cloud = _register_model("llama-cloud", "llama_cloud", "llama_cloud.py", "classify_with_llama_cloud")

try:
    gemini_module = load_model_module('gemini', os.path.join(MODELS_DIR, 'gemini_2.5-pro.py'))
    classify_with_gemini = gemini_module.classify_with_gemini
    available_models.append("gemini-2.5-pro")
except Exception as error:
    model_load_errors["gemini-2.5-pro"] = str(error)

    def classify_with_gemini(_: str, __: str) -> tuple[str, str]:
        reason = model_load_errors.get("gemini-2.5-pro", "model is unavailable")
        return (
            "error: model gemini-2.5-pro is unavailable",
            f"Model gemini-2.5-pro could not be loaded during startup: {reason}",
        )


bielik2_path = os.path.join(MODELS_DIR, 'bielik2_4bit.py')
classify_with_bielik2 = None
if os.path.exists(bielik2_path):
    classify_with_bielik2 = _register_model(
        "bielik-2-4bit",
        "bielik2_4bit",
        "bielik2_4bit.py",
        "classify_with_bielik2",
    )

load_dotenv()

app = FastAPI()

# CORS configuration for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    email_text: str
    model_name: str = "gpt-4.1"
    sender: str
    title: str


@app.get("/")
async def root():
    return {
        "message": "Phishing Detection API",
        "available_models": available_models,
        "model_load_errors": model_load_errors,
    }


@app.post("/analyze")
async def analyze_email(request: EmailRequest):
    """Analyze a single email."""
    model = request.model_name

    # Start timing
    start_time = time.time()

    # Call the appropriate model
    if model == "gpt-4.1":
        result = classify_with_gpt4_1(request.email_text)
    elif model == "gemini-2.5-pro":
        result = classify_with_gemini(request.email_text, model)
    elif model == "mistral-7b":
        result = classify_with_mistral_7b(request.email_text)
    elif model == "llama-cloud":
        result = classify_with_llama_cloud(request.email_text)
    elif model == "bielik-2-4bit":
        if classify_with_bielik2 is None:
            raise HTTPException(status_code=400, detail="Model bielik-2-4bit is not available in this backend build")
        result = classify_with_bielik2(request.email_text)
    else:
        raise HTTPException(status_code=400, detail="Unknown model")

    prediction, reason = result

    if isinstance(prediction, str) and prediction.startswith("error:"):
        raise HTTPException(status_code=400, detail=prediction)

    end_time = time.time()
    response_time_ms = round((end_time - start_time) * 1000, 2)

    response = {
        "model": model,
        "prediction": prediction,
        "reason": reason,
        "timestamp": datetime.utcnow().isoformat(),
        "response_time_ms": response_time_ms,
        "sender": request.sender,
        "title": request.title
    }
    return response

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000)