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
from models.clinical_engine import check_drug_interactions, get_smart_health_recommendations
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

@app.route('/api/hospital-insights', methods=['GET'])
@require_api_key
def hospital_insights():
    """
    AI Hospital Strategy & Insights
    Provides high-level performance analysis and anomaly detection
    """
    # In a real app, this would query the DB for trends
    insights = [
        {
            "id": 1,
            "title": "Revenue Optimization",
            "content": "Billing efficiency has increased by 14% this month due to faster insurance processing.",
            "type": "positive"
        },
        {
            "id": 2,
            "title": "Resource Allocation",
            "content": "Wait times in the morning shift are averaging 45 mins. Suggest allocating an additional nurse to the OPD.",
            "type": "warning"
        },
        {
            "id": 3,
            "title": "Clinical Anomaly",
            "content": "There is a 5% spike in respiratory cases in the last 48 hours. Suggest monitoring for local seasonal trends.",
            "type": "info"
        }
    ]
    
    return jsonify({
        "insights": insights,
        "health_score": 92,
        "trend": "upward"
    })

@app.route('/api/ai-chat', methods=['POST'])
@require_api_key
def ai_chat():
    """
    Clinical Copilot Chat API
    Simulates a medical LLM with access to hospital context
    """
    data = request.json
    message = data.get('message', '').lower()
    
    # Simple rule-based mock for now
    if 'patient' in message or 'records' in message:
        response = "I can access patient records through the clinical database. Are you looking for a specific patient's history or recent vitals?"
    elif 'medicine' in message or 'pharmacy' in message or 'stock' in message:
        response = "The pharmacy inventory is currently being monitored. We have alerts for low-stock items like Insulin and Amoxicillin."
    elif 'appointment' in message or 'schedule' in message:
        response = "I can assist with scheduling. Most doctors have optimal availability in the mornings. Would you like me to suggest a time slot?"
    elif 'abnormal' in message or 'risk' in message:
        response = "I've analyzed recent results. There are 2 patients with high risk scores and 3 abnormal lab results requiring your review."
    else:
        response = "I am your Clinical Copilot. I can help you analyze medical records, check inventory, or manage your schedule. How can I assist you right now?"
        
    return jsonify({
        "response": response,
        "context": "clinical_assistant"
    })

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

@app.route('/api/check-interactions', methods=['POST'])
@require_api_key
def check_interactions_endpoint():
    """
    Check for drug interactions
    """
    try:
        data = request.json
        medicines = data.get('medicines', [])
        alerts = check_drug_interactions(medicines)
        return jsonify({'alerts': alerts}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/smart-tips/<patient_id>', methods=['GET'])
@require_api_key
def get_smart_tips_endpoint(patient_id):
    """
    Get personalized health recommendations
    """
    try:
        analysis = process_patient_data(patient_id)
        tips = get_smart_health_recommendations(analysis)
        return jsonify({'tips': tips}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ==================== DATA PROCESSING ENDPOINTS ====================

@app.route('/api/analyze-lab-result', methods=['POST'])
@require_api_key
def analyze_lab_result():
    """
    AI-powered lab result analysis
    Flags abnormal values based on reference ranges
    """
    data = request.json
    value = float(data.get('value', 0))
    ref_range = data.get('reference_range', '') # format: "min - max"
    
    try:
        # Extract min/max from range string
        import re
        ranges = re.findall(r"[-+]?\d*\.\d+|\d+", ref_range)
        if len(ranges) >= 2:
            min_val = float(ranges[0])
            max_val = float(ranges[1])
            
            status = 'normal'
            if value < min_val:
                status = 'abnormal'
                insight = f"Value is lower than reference range ({min_val}). Potential deficiency."
            elif value > max_val:
                status = 'abnormal'
                insight = f"Value is higher than reference range ({max_val}). Potential elevation."
            else:
                insight = "Value is within normal physiological limits."
                
            return jsonify({
                "status": status,
                "insight": insight,
                "severity": "high" if status == 'abnormal' else "low"
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    return jsonify({"status": "unknown", "insight": "Could not parse reference range."})

@app.route('/api/patient-analysis/<patient_id>', methods=['GET'])
@require_api_key
def analyze_patient_endpoint(patient_id):
    """
    Analyze patient health data (GET)
    
    Response:
    {
        "status": "success",
        "analysis": {
            "patient_id": "...",
            "total_visits": 5,
            "risk_score": 0.65,
            "last_visit_date": "...",
            ...
        }
    }
    """
    try:
        if not patient_id:
            return jsonify({'status': 'error', 'message': 'patient_id is required'}), 400
        
        analysis = process_patient_data(patient_id)
        
        # Flatten for frontend expectation if needed, but the current process_patient_data 
        # should return the required fields.
        return jsonify(analysis), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

# ==================== UTILITY ENDPOINTS ====================

@app.route('/api/patient-risk/<patient_id>', methods=['GET'])
@require_api_key
def get_risk_score(patient_id):
    """Calculate patient risk score (0.0 - 1.0)"""
    try:
        analysis = process_patient_data(patient_id)
        
        return jsonify({
            'risk_score': analysis.get('risk_score', 0.0),
            'risk_level': 'high' if analysis.get('risk_score', 0.0) > 0.7 else 'medium' if analysis.get('risk_score', 0.0) > 0.3 else 'low',
            'recommendations': analysis.get('active_diagnoses', [])
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/diagnosis-history/<patient_id>', methods=['GET'])
@require_api_key
def get_diagnoses(patient_id):
    """Get all diagnoses for a patient"""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table('medical_records').select('diagnosis, created_at, id').eq('patient_id', patient_id).execute()
        
        history = []
        for r in response.data:
            history.append({
                'diagnosis': r.get('diagnosis'),
                'date': r.get('created_at'),
                'record_id': r.get('id'),
                'doctor': 'System' # Could join with profiles for doctor name
            })
        
        return jsonify(history), 200
        
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
    
    app.run(debug=debug, host='0.0.0.0', port=port)
