"""
HOPI SYNC - Python Microservice API
Hospital AI & Data Processing Service
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from functools import wraps

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS for Next.js frontend
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}})

# Import custom modules
from models.ml_predictor import predict_disease
from models.data_processor import process_patient_data
from utils.supabase_client import get_supabase_client

# API Key authentication (optional but recommended)
PYTHON_API_KEY = os.getenv('PYTHON_API_KEY', 'dev-key-12345')

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key != PYTHON_API_KEY:
            return jsonify({'error': 'Unauthorized', 'message': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

# ==================== HEALTH CHECK ====================

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint - no auth required"""
    return jsonify({
        'status': 'running',
        'service': 'HOPI SYNC Python API',
        'version': '1.0.0'
    }), 200

# ==================== PREDICTION ENDPOINTS ====================

@app.route('/api/predict-disease', methods=['POST'])
@require_api_key
def predict_disease_endpoint():
    """
    Predict disease based on symptoms using ML
    
    Request:
    {
        "symptoms": ["fever", "cough", "fatigue"]
    }
    
    Response:
    {
        "status": "success",
        "prediction": {
            "disease": "Influenza",
            "confidence": 0.92,
            "recommendations": ["Rest", "Fluids", "See doctor"]
        }
    }
    """
    try:
        data = request.json
        symptoms = data.get('symptoms', [])
        
        if not symptoms:
            return jsonify({'status': 'error', 'message': 'Symptoms list is required'}), 400
        
        prediction = predict_disease(symptoms)
        
        return jsonify({
            'status': 'success',
            'prediction': prediction
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

# ==================== DATA PROCESSING ENDPOINTS ====================

@app.route('/api/process-patient', methods=['POST'])
@require_api_key
def process_patient_endpoint():
    """
    Process and analyze patient data from Supabase
    
    Request:
    {
        "patient_id": "550e8400-e29b-41d4-a716-446655440000"
    }
    
    Response:
    {
        "status": "success",
        "analysis": {
            "patient_name": "Rajesh Kumar",
            "total_visits": 5,
            "risk_score": 0.65,
            "active_diagnoses": ["Hypertension", "Diabetes"]
        }
    }
    """
    try:
        data = request.json
        patient_id = data.get('patient_id')
        
        if not patient_id:
            return jsonify({'status': 'error', 'message': 'patient_id is required'}), 400
        
        analysis = process_patient_data(patient_id)
        
        return jsonify({
            'status': 'success',
            'analysis': analysis
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

# ==================== UTILITY ENDPOINTS ====================

@app.route('/api/risk-score/<patient_id>', methods=['GET'])
@require_api_key
def get_risk_score(patient_id):
    """Calculate patient risk score (0.0 - 1.0)"""
    try:
        analysis = process_patient_data(patient_id)
        
        return jsonify({
            'status': 'success',
            'patient_id': patient_id,
            'risk_score': analysis.get('risk_score', 0.0)
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/diagnoses/<patient_id>', methods=['GET'])
@require_api_key
def get_diagnoses(patient_id):
    """Get all diagnoses for a patient"""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table('medical_records').select('diagnosis').eq('patient_id', patient_id).execute()
        
        diagnoses = list(set(r['diagnosis'] for r in response.data if r.get('diagnosis')))
        
        return jsonify({
            'status': 'success',
            'patient_id': patient_id,
            'diagnoses': diagnoses
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'status': 'error', 'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

# ==================== MAIN ====================

if __name__ == '__main__':
    port = int(os.getenv('PYTHON_PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"""
    ╔════════════════════════════════════════╗
    ║     HOPI SYNC Python API Starting      ║
    ║     http://localhost:{port}               ║
    ║     API Key: {PYTHON_API_KEY[:20]}...   ║
    ╚════════════════════════════════════════╝
    """)
    
    app.run(debug=debug, host='localhost', port=port)
