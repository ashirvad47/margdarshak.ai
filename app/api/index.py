import os
import sys
import joblib
import pandas as pd
import numpy as np
import requests # For downloading files
from typing import List, Dict, Any, Tuple, Union 

from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel, Field as PydanticField
from pathlib import Path # For robust path handling

# --- Configuration Constants ---

# FOR LOCAL TESTING: Assign your S3 URLs directly.
# Make sure these are your REAL S3 public URLs.
MODEL_URL = "https://career-pred.s3.ap-south-1.amazonaws.com/career_prediction_model_pipeline.joblib"
LABEL_ENCODER_URL = "https://career-pred.s3.ap-south-1.amazonaws.com/career_label_encoder.joblib"
FEATURE_COLUMNS_URL = "https://career-pred.s3.ap-south-1.amazonaws.com/career_feature_columns.joblib"

# WHEN DEPLOYING TO VERCEL, you would use os.getenv like this,
# and set these environment variables (MODEL_S3_URL, etc.) in the Vercel dashboard:
# MODEL_URL = os.getenv("MODEL_S3_URL", "default_placeholder_if_var_not_set_model.joblib")
# LABEL_ENCODER_URL = os.getenv("LABEL_ENCODER_S3_URL", "default_placeholder_if_var_not_set_encoder.joblib")
# FEATURE_COLUMNS_URL = os.getenv("FEATURE_COLUMNS_S3_URL", "default_placeholder_if_var_not_set_features.joblib")


# --- Temporary File Paths on Vercel (or local /tmp) ---
# Vercel provides a writable /tmp directory
TEMP_DIR = Path("/tmp") # Use Path("/tmp") for Vercel/Linux.
# For local Windows testing, if C:\tmp doesn't exist or you have permission issues,
# you might want to change TEMP_DIR for local runs, e.g., to Path(".") to use the current directory.
# However, it's best to try and make /tmp (or C:\tmp) work if possible to mirror Vercel.
MODEL_FILEPATH_TEMP: Path = TEMP_DIR / "career_prediction_model_pipeline.joblib"
LABEL_ENCODER_FILEPATH_TEMP: Path = TEMP_DIR / "career_label_encoder.joblib"
FEATURE_COLUMNS_FILEPATH_TEMP: Path = TEMP_DIR / "career_feature_columns.joblib"

TOP_N_PREDICTIONS: int = 5

# --- Global Variables for Loaded Components ---
# These will be loaded once when the API starts
MODEL: Any = None
LABEL_ENCODER: Any = None
FEATURE_COLUMNS: List[str] = None

# --- Pydantic Models for Input and Output ---
class PredictionFeatures(BaseModel):
    # Define fields based on your model's expected input features
    # This is an example structure; you MUST update this to match ALL your features
    # and their expected data types (str, float, int).
    # The keys here (e.g., "Field", "GPA") must exactly match the keys
    # your friend's frontend will send in the `userData` object.
    Field: str = PydanticField(..., example="B.Tech CSE")
    GPA: float = PydanticField(..., example=8.5)
    Leadership_Positions: int = PydanticField(..., example=1, ge=0) # ge=0 means greater than or equal to 0
    Research_Experience: int = PydanticField(..., example=0, ge=0)
    Industry_Certifications: int = PydanticField(..., example=1, ge=0)
    Extracurricular_Activities: int = PydanticField(..., example=2, ge=0)
    Internships: int = PydanticField(..., example=1, ge=0)
    Projects: int = PydanticField(..., example=3, ge=0)
    Field_Specific_Courses: int = PydanticField(..., example=4, ge=0)
    Coding_Skills: int = PydanticField(..., example=3, ge=0, le=5) # le=5 means less than or equal to 5 (assuming a scale)
    Communication_Skills: int = PydanticField(..., example=3, ge=0, le=5)
    Problem_Solving_Skills: int = PydanticField(..., example=4, ge=0, le=5)
    Teamwork_Skills: int = PydanticField(..., example=3, ge=0, le=5)
    Analytical_Skills: int = PydanticField(..., example=3, ge=0, le=5)
    Presentation_Skills: int = PydanticField(..., example=2, ge=0, le=5)
    Networking_Skills: int = PydanticField(..., example=1, ge=0, le=5)
    # ... Add ALL other features your model expects, with correct types and examples.

class PredictionInput(BaseModel):
    # This matches the structure your friend is sending: JSON.stringify(userData)
    # where userData is an object of features.
    features: PredictionFeatures

class CareerPrediction(BaseModel):
    career: str
    probability: float

class PredictionOutput(BaseModel):
    predicted_career: str
    top_predictions: List[CareerPrediction]

# --- FastAPI App Initialization ---
app = FastAPI(title="Career Prediction API")

# --- Helper Functions ---
def download_file_from_url(url: str, destination_path: Path) -> None:
    """Downloads a file from a URL to a local path."""
    print(f"Attempting to download from {url} to {destination_path}...")
    try:
        # Ensure the destination directory exists
        destination_path.parent.mkdir(parents=True, exist_ok=True)
        
        with requests.get(url, stream=True, timeout=120) as r: # Increased timeout for large files
            r.raise_for_status()  # Raises an HTTPError for bad responses (4XX or 5XX)
            with open(destination_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        print(f"Successfully downloaded to {destination_path}. Size: {destination_path.stat().st_size} bytes")
    except requests.exceptions.RequestException as e:
        print(f"Error downloading {url}: {e}")
        raise RuntimeError(f"Failed to download critical file {url}. Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during download of {url}: {e}")
        raise RuntimeError(f"Unexpected error downloading {url}. Error: {e}")


def load_all_components_from_s3():
    """
    Downloads models from S3 (if not already present) and loads them.
    This function will be called at startup.
    """
    global MODEL, LABEL_ENCODER, FEATURE_COLUMNS
    
    # Ensure TEMP_DIR exists (especially for local Windows testing if not C:\tmp)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Ensured temporary directory exists: {TEMP_DIR.resolve()}")

    # --- MODIFICATION: Clean up old/potentially corrupt files before download attempts ---
    # This is aggressive but helps ensure fresh downloads for testing this EOF issue.
    # For production, you might want a more nuanced caching or validation strategy.
    files_to_clean = [MODEL_FILEPATH_TEMP, LABEL_ENCODER_FILEPATH_TEMP, FEATURE_COLUMNS_FILEPATH_TEMP]
    print(f"Cleaning up potentially old files in {TEMP_DIR} before download...")
    for file_path_to_clean in files_to_clean:
        if file_path_to_clean.exists():
            try:
                print(f"Deleting existing file: {file_path_to_clean}")
                file_path_to_clean.unlink()
            except OSError as e:
                print(f"Warning: Could not delete {file_path_to_clean}. Error: {e}. Proceeding with download check.")
    # --- END MODIFICATION ---

    files_to_download = [
        (MODEL_URL, MODEL_FILEPATH_TEMP, "Model"),
        (LABEL_ENCODER_URL, LABEL_ENCODER_FILEPATH_TEMP, "Label Encoder"),
        (FEATURE_COLUMNS_URL, FEATURE_COLUMNS_FILEPATH_TEMP, "Feature Columns")
    ]

    for url, path, name in files_to_download:
        # Basic check for placeholder URL or if URL is not a valid http/https URL
        if not url.startswith(("http://", "https://")):
            print(f"ERROR: Invalid or placeholder URL detected for {name}: {url}. Please set the correct S3 URL.")
            raise ValueError(f"Invalid or missing S3 URL for {name}. Update script or environment variables.")
        
        # Download if not exists (it shouldn't due to cleanup) or if somehow it's still there and empty
        if not path.exists() or path.stat().st_size == 0: 
            print(f"{name} not found locally at {path} or is empty. Downloading from S3...")
            download_file_from_url(url, path)
        else:
            # This case should ideally not be hit frequently with the cleanup logic above for local testing.
            print(f"{name} unexpectedly still exists at {path} (Size: {path.stat().st_size} bytes) after cleanup attempt. Skipping download.")

    try:
        if not MODEL_FILEPATH_TEMP.exists() or MODEL_FILEPATH_TEMP.stat().st_size == 0:
            raise FileNotFoundError(f"Model file failed to download or is empty: {MODEL_FILEPATH_TEMP}")
        MODEL = joblib.load(MODEL_FILEPATH_TEMP)
        print(f"Successfully loaded model from: {MODEL_FILEPATH_TEMP}")

        if not LABEL_ENCODER_FILEPATH_TEMP.exists() or LABEL_ENCODER_FILEPATH_TEMP.stat().st_size == 0:
            raise FileNotFoundError(f"Label encoder file failed to download or is empty: {LABEL_ENCODER_FILEPATH_TEMP}")
        LABEL_ENCODER = joblib.load(LABEL_ENCODER_FILEPATH_TEMP)
        print(f"Successfully loaded label encoder from: {LABEL_ENCODER_FILEPATH_TEMP}")

        if not FEATURE_COLUMNS_FILEPATH_TEMP.exists() or FEATURE_COLUMNS_FILEPATH_TEMP.stat().st_size == 0:
            raise FileNotFoundError(f"Feature columns file failed to download or is empty: {FEATURE_COLUMNS_FILEPATH_TEMP}")
        FEATURE_COLUMNS = joblib.load(FEATURE_COLUMNS_FILEPATH_TEMP)
        print(f"Successfully loaded feature columns from: {FEATURE_COLUMNS_FILEPATH_TEMP}")

        if not isinstance(FEATURE_COLUMNS, list):
            print(f"Warning: Expected feature columns to be a list, but got {type(FEATURE_COLUMNS)}.")
        
        print("All ML components loaded successfully.")

    except FileNotFoundError as e:
        print(f"Error: A required .joblib file was not found after download attempt. Details: {e}")
        raise RuntimeError(f"Failed to load essential components from {TEMP_DIR}: {e}")
    except Exception as e: # Catching a broader exception for joblib loading issues
        print(f"An unexpected error occurred while loading .joblib files from {TEMP_DIR}: {e}")
        # Adding more specific error info for joblib loading
        if isinstance(e, (EOFError, ValueError)) and "reading array data" in str(e):
             print("This joblib loading error often indicates a corrupt or incomplete file. Ensure the file on S3 is valid and was uploaded correctly.")
        raise RuntimeError(f"Unexpected error during component loading from {TEMP_DIR}: {e}")

def create_input_dataframe(input_features: PredictionFeatures, feature_columns_list: List[str]) -> pd.DataFrame:
    """
    Creates a Pandas DataFrame from the Pydantic model of input features,
    ensuring correct column order and types as expected by the model.
    """
    input_data_dict = input_features.model_dump()
    missing_features = [col for col in feature_columns_list if col not in input_data_dict]
    if missing_features:
        raise HTTPException(
            status_code=400,
            detail=f"Missing features in input: {', '.join(missing_features)}. Required: {', '.join(feature_columns_list)}"
        )
    ordered_data: Dict[str, Any] = {feature_name: input_data_dict.get(feature_name) for feature_name in feature_columns_list}
    return pd.DataFrame([ordered_data], columns=feature_columns_list)

# --- FastAPI Lifespan Event for Loading Models ---
@app.on_event("startup")
async def startup_event():
    """
    Load ML components when the application starts.
    """
    print("--- Career Prediction API Initializing (Startup Event) ---")
    try:
        load_all_components_from_s3()
        if MODEL is None or LABEL_ENCODER is None or FEATURE_COLUMNS is None:
            raise RuntimeError("One or more ML components failed to load properly. Check logs.")
        print("--- ML Components Ready ---")
    except Exception as e:
        print(f"FATAL: Failed to initialize ML components during startup: {e}")
        # Forcing exit if startup fails critically.
        # This helps in Vercel by making the deployment failure more obvious.
        sys.exit(f"Critical startup failure: {e}") 


# --- Prediction Endpoint ---
@app.post("/predict/", response_model=PredictionOutput)
async def predict_career_api(payload: PredictionInput = Body(...)):
    """
    Receives candidate details (as a 'features' object in the payload),
    makes a prediction, and returns results.
    """
    if MODEL is None or LABEL_ENCODER is None or FEATURE_COLUMNS is None:
        print("Error: ML Model or components are not available. Startup might have failed.")
        raise HTTPException(
            status_code=503, # Service Unavailable
            detail="ML Model is not available or not loaded. Please check server logs."
        )

    print(f"\nReceived input for prediction: {payload.features}")

    try:
        input_df = create_input_dataframe(payload.features, FEATURE_COLUMNS)
    except HTTPException as e: 
        raise e
    except Exception as e:
        print(f"Error creating DataFrame from input: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid input data format: {str(e)}")

    print(f"\nProcessing input DataFrame:\n{input_df.to_string()}")

    try:
        predicted_label_encoded = MODEL.predict(input_df)
        predicted_career_name = LABEL_ENCODER.inverse_transform(predicted_label_encoded)[0]
        response_data = {"predicted_career": predicted_career_name, "top_predictions": []}

        if hasattr(MODEL, "predict_proba"):
            probabilities = MODEL.predict_proba(input_df)[0] 
            top_n_indices = np.argsort(probabilities)[::-1][:TOP_N_PREDICTIONS]
            top_predictions_list = [
                {"career": LABEL_ENCODER.classes_[i], "probability": float(probabilities[i])}
                for i in top_n_indices
            ]
            response_data["top_predictions"] = top_predictions_list
        else:
            print("(Probability scores are not available for this model type or configuration.)")

        print(f"---> Predicted Career: {predicted_career_name} <---")
        if response_data["top_predictions"]:
             print(f"\nTop {TOP_N_PREDICTIONS} Career Predictions (with probabilities):")
             for pred_item in response_data["top_predictions"]:
                 print(f"  - {pred_item['career']}: {pred_item['probability']*100:.2f}%")
        
        output = PredictionOutput(**response_data)
        return output

    except Exception as e:
        print(f"\nAn error occurred during the prediction phase: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# --- Root Endpoint (Optional, for health check or basic info) ---
@app.get("/")
async def root():
    model_status = "LOADED" if MODEL else "NOT LOADED"
    le_status = "LOADED" if LABEL_ENCODER else "NOT LOADED"
    fc_status = "LOADED" if FEATURE_COLUMNS else "NOT LOADED"
    
    return {
        "message": "Career Prediction API is running.",
        "model_status": model_status,
        "label_encoder_status": le_status,
        "feature_columns_status": fc_status,
        "expected_sklearn_version": "1.2.2",
        "expected_numpy_version": "1.23.5",
        "temp_dir_path": str(TEMP_DIR.resolve()),
        "temp_model_path_exists": MODEL_FILEPATH_TEMP.exists(),
        "temp_label_encoder_path_exists": LABEL_ENCODER_FILEPATH_TEMP.exists(),
        "temp_feature_columns_path_exists": FEATURE_COLUMNS_FILEPATH_TEMP.exists()
    }

# For local testing:
# if __name__ == "__main__":
#     import uvicorn
#     print("Attempting to run API locally with Uvicorn on http://127.0.0.1:8000")
#     # The URLs are now hardcoded above for local testing.
#     # When deploying to Vercel, you'd use environment variables.
#     uvicorn.run("index:app", host="127.0.0.1", port=8000, reload=True) # Correct way to call for uvicorn.run if __main__
