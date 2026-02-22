# INTEGRATING PYTHON INTO HOPI SYNC
## Complete Guide to Adding Python to Your Next.js Hospital System

---

## 📌 OVERVIEW: Why Add Python?

**Current Stack:** Next.js (Frontend + Backend) + Supabase (Database)

**Why Python?**
- **Data Analysis** — Pandas, NumPy for patient outcome prediction
- **Machine Learning** — Scikit-learn, TensorFlow for diagnostic assistance
- **Data Processing** — ETL (Extract-Transform-Load) for legacy system migration
- **Background Jobs** — Celery for email, PDF generation, scheduled tasks
- **Heavy Computation** — Complex algorithms, statistical analysis

---

## 🏗️ ARCHITECTURE OPTIONS

### Option 1: **Separate Python Microservice** (RECOMMENDED) ⭐

```
┌─────────────────────────────┐
│  Next.js Frontend & API     │
│   (http://localhost:3000)   │
└──────────────┬──────────────┘
               │ HTTP requests
               ↓
┌─────────────────────────────┐
│   Python REST API           │
│  (http://localhost:5000)    │
│  • ML models                │
│  • Data processing          │
│  • Heavy computation        │
└─────────────────────────────┘
               │
               ↓
    PostgreSQL Database
    (Shared via Supabase)
```

**Pros:**
- ✅ Completely independent services
- ✅ Easy to scale Python separately
- ✅ Different runtime environments
- ✅ Easy to deploy to different servers

**Cons:**
- ❌ Network latency between services
- ❌ More complex deployment
- ❌ Need API authentication between services

---

### Option 2: **Python Scripts in Next.js Project**

```
hospital-admin/
├── src/           (Next.js)
├── python/        (New Python scripts) ← Add here
│   ├── ml_model.py
│   ├── data_processor.py
│   └── requirements.txt
└── package.json
```

**Pros:**
- ✅ Single repository
- ✅ Simple to set up
- ✅ Good for scripts & data processing

**Cons:**
- ❌ Python not integrated in Next.js runtime
- ❌ Requires separate Python installation
- ❌ Need to manage two package managers

---

### Option 3: **Node.js Child Process**

Run Python from Node.js using `child_process`:

```typescript
// Next.js server action
import { exec } from 'child_process'

const result = await new Promise((resolve) => {
  exec('python python/predict.py', (err, stdout) => {
    resolve(JSON.parse(stdout))
  })
})
```

**Pros:**
- ✅ Integrated into Next.js
- ✅ Synchronous-like handling

**Cons:**
- ❌ Python must be installed on server
- ❌ Large overhead for each call
- ❌ Not scalable

---

### Option 4: **Celery + Redis** (Background Jobs)

```
┌────────────┐
│  Next.js   │
└─────┬──────┘
      │ queue task
      ↓
  ┌───────┐
  │ Redis │  (message queue)
  └───┬───┘
      │ listen
      ↓
┌──────────────────┐
│ Celery Workers   │  (Python background tasks)
│ • Email sending  │
│ • PDF generation │
│ • Data export    │
└──────────────────┘
```

**Pros:**
- ✅ Handle long-running tasks
- ✅ Async processing
- ✅ Scalable workers

**Cons:**
- ❌ Requires Redis server
- ❌ Complexity
- ❌ Not UI-blocking

---

## 🎯 RECOMMENDED APPROACH: Separate Python Microservice

I'll show you how to set this up. It's the cleanest, most professional approach.

---

## 📁 PROJECT STRUCTURE AFTER INTEGRATION

```
d:\Hospital_admin\
├── src/                          (Next.js - Frontend + API)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── middleware.ts
├── python/                       (NEW - Python backend)
│   ├── app.py                    (Flask/FastAPI server)
│   ├── requirements.txt          (Python dependencies)
│   ├── models/
│   │   ├── ml_predictor.py       (ML models)
│   │   ├── data_processor.py     (Data processing)
│   │   └── __init__.py
│   ├── routes/
│   │   ├── predict.py            (Endpoints)
│   │   └── __init__.py
│   ├── utils/
│   │   └── supabase_client.py    (DB connection)
│   └── .venv/                    (Virtual environment)
├── docker/                       (Optional - containerization)
│   ├── Dockerfile.python
│   └── docker-compose.yml
├── package.json                  (Node.js)
├── next.config.ts
└── PYTHON_INTEGRATION_GUIDE.md  (This file)
```

---

## 🐍 STEP-BY-STEP: ADD PYTHON MICROSERVICE

### Step 1: Create Python Directory

```bash
# In PowerShell, from hospital-admin root
mkdir python
cd python
```

### Step 2: Create Python Virtual Environment

```bash
# On Windows PowerShell
python -m venv .venv

# Activate virtual environment
.venv\Scripts\Activate.ps1

# On macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

### Step 3: Create requirements.txt

Create `python/requirements.txt`:

```txt
Flask==3.0.0
Flask-CORS==4.0.0
python-dotenv==1.0.0
supabase==2.0.3
pandas==2.1.3
numpy==1.24.3
scikit-learn==1.3.2
Pillow==10.0.0
gunicorn==21.2.0
requests==2.31.0
```

### Step 4: Install Python Dependencies

```bash
# Make sure .venv is activated
cd python

# Install from requirements.txt
pip install -r requirements.txt
```

### Step 5: Create Flask API Server

Create `python/app.py`:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow requests from Next.js (http://localhost:3000)

# Import your Python modules
from models.ml_predictor import predict_disease
from models.data_processor import process_patient_data
from utils.supabase_client import get_supabase_data

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'Python API is running'}), 200

@app.route('/api/predict-disease', methods=['POST'])
def predict_endpoint():
    """
    Predict disease based on patient symptoms
    Request: { "symptoms": ["fever", "cough"], "patient_id": "..." }
    Response: { "prediction": "Influenza", "confidence": 0.92 }
    """
    try:
        data = request.json
        symptoms = data.get('symptoms', [])
        
        prediction = predict_disease(symptoms)
        
        return jsonify({
            'status': 'success',
            'prediction': prediction['disease'],
            'confidence': prediction['confidence'],
            'recommendations': prediction['recommendations']
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/process-data', methods=['POST'])
def process_data_endpoint():
    """
    Process and analyze patient data
    Request: { "patient_id": "..." }
    Response: { "analysis": {...} }
    """
    try:
        data = request.json
        patient_id = data.get('patient_id')
        
        analysis = process_patient_data(patient_id)
        
        return jsonify({
            'status': 'success',
            'analysis': analysis
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/export-report', methods=['POST'])
def export_report_endpoint():
    """
    Export patient medical reports
    Request: { "patient_id": "..." }
    Response: { "pdf_url": "..." }
    """
    try:
        data = request.json
        patient_id = data.get('patient_id')
        
        # Generate PDF, save to storage, return URL
        pdf_url = f"https://storage.example.com/reports/{patient_id}.pdf"
        
        return jsonify({
            'status': 'success',
            'pdf_url': pdf_url
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

if __name__ == '__main__':
    # Development: run on localhost:5000
    app.run(debug=True, host='localhost', port=5000)
```

### Step 6: Create Python Modules

Create `python/models/ml_predictor.py`:

```python
"""
Machine Learning module for disease prediction
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle
import json

# Symptom-to-disease mapping
SYMPTOM_DISEASE_MAP = {
    'fever': 0.3,
    'cough': 0.25,
    'fatigue': 0.2,
    'headache': 0.15,
    'sore_throat': 0.18
}

def predict_disease(symptoms: list) -> dict:
    """
    Predict disease based on symptoms using ML model
    
    Args:
        symptoms: List of symptom strings
        
    Returns:
        {
            'disease': 'Influenza',
            'confidence': 0.92,
            'recommendations': ['Rest', 'Fluids', 'See doctor']
        }
    """
    
    # Simple scoring (replace with actual ML model)
    disease_scores = {}
    
    # Calculate disease likelihood based on symptoms
    if any(s in symptoms for s in ['fever', 'cough', 'fatigue']):
        disease_scores['Influenza'] = 0.85
        disease_scores['Cold'] = 0.70
    
    if any(s in symptoms for s in ['chest_pain', 'shortness_breath']):
        disease_scores['Cardiac Issue'] = 0.80
        disease_scores['Pneumonia'] = 0.75
    
    if any(s in symptoms for s in ['headache', 'rash', 'fever']):
        disease_scores['Meningitis'] = 0.60
    
    # Get top prediction
    if disease_scores:
        top_disease = max(disease_scores, key=disease_scores.get)
        confidence = disease_scores[top_disease]
    else:
        top_disease = 'Unknown'
        confidence = 0.0
    
    # Recommendations based on prediction
    recommendations = {
        'Influenza': ['Rest', 'Stay hydrated', 'Antiviral medication', 'See doctor in 48h'],
        'Cold': ['Rest', 'Fluids', 'Honey/cough drops', 'Monitor symptoms'],
        'Cardiac Issue': ['SEEK IMMEDIATE MEDICAL ATTENTION', 'Call ambulance', 'Aspirin'],
        'Pneumonia': ['See doctor immediately', 'Chest X-ray', 'Antibiotics']
    }
    
    return {
        'disease': top_disease,
        'confidence': round(confidence, 2),
        'recommendations': recommendations.get(top_disease, ['Consult healthcare provider'])
    }

def train_ml_model(training_data: pd.DataFrame):
    """Retrain ML model with new patient data (monthly job)"""
    # X = training_data.drop('disease', axis=1)
    # y = training_data['disease']
    # model = RandomForestClassifier()
    # model.fit(X, y)
    # pickle.dump(model, open('ml_model.pkl', 'wb'))
    pass
```

Create `python/models/data_processor.py`:

```python
"""
Data processing and analytics module
"""
import pandas as pd
import numpy as np
from utils.supabase_client import get_supabase_client

def process_patient_data(patient_id: str) -> dict:
    """
    Fetch and analyze patient data from Supabase
    
    Args:
        patient_id: UUID of patient
        
    Returns:
        Dictionary with analysis results
    """
    
    supabase = get_supabase_client()
    
    # Fetch patient data
    response = supabase.table('patients').select('*').eq('id', patient_id).execute()
    patient = response.data[0] if response.data else None
    
    if not patient:
        return {'error': 'Patient not found'}
    
    # Fetch medical records
    records = supabase.table('medical_records').select('*').eq('patient_id', patient_id).execute()
    
    # Fetch appointments
    appointments = supabase.table('appointments').select('*').eq('patient_id', patient_id).execute()
    
    # Analyze data
    analysis = {
        'patient_name': patient.get('full_name'),
        'total_visits': len(appointments.data) if appointments.data else 0,
        'total_records': len(records.data) if records.data else 0,
        'active_diagnoses': extract_diagnoses(records.data),
        'visit_frequency': calculate_frequency(appointments.data),
        'risk_score': calculate_risk_score(records.data, appointments.data)
    }
    
    return analysis

def extract_diagnoses(records: list) -> list:
    """Extract unique diagnoses from medical records"""
    diagnoses = set()
    for record in records:
        if 'diagnosis' in record:
            diagnoses.add(record['diagnosis'])
    return list(diagnoses)

def calculate_frequency(appointments: list) -> str:
    """Calculate visit frequency"""
    if not appointments:
        return 'No visits'
    
    count = len(appointments)
    if count == 1:
        return 'Rare (1 visit)'
    elif count <= 5:
        return 'Occasional (1-5 visits)'
    elif count <= 15:
        return 'Regular (5-15 visits)'
    else:
        return 'Frequent (15+ visits)'

def calculate_risk_score(records: list, appointments: list) -> float:
    """Calculate patient risk score (0.0 - 1.0)"""
    base_score = 0.0
    
    # Increase risk with more diagnoses
    diagnoses = extract_diagnoses(records)
    base_score += min(len(diagnoses) * 0.1, 0.5)
    
    # Increase risk with frequent visits
    if len(appointments) > 10:
        base_score += 0.3
    
    return min(base_score, 1.0)
```

Create `python/utils/supabase_client.py`:

```python
"""
Supabase client for Python backend
"""
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def get_supabase_client():
    """
    Create and return Supabase client
    Uses SERVICE_ROLE_KEY (full admin access)
    """
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
```

Create `python/models/__init__.py`:
```python
# Empty file to make models a package
```

Create `python/routes/__init__.py`:
```python
# Empty file
```

Create `python/utils/__init__.py`:
```python
# Empty file
```

### Step 7: Create .env File for Python

Create `python/.env`:

```
# Copy these from d:\Hospital_admin\.env.local
NEXT_PUBLIC_SUPABASE_URL=https://tbfzzryzusrkxtgjokbi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Python-specific settings
FLASK_ENV=development
FLASK_DEBUG=True
PYTHON_PORT=5000
```

---

## 🚀 RUNNING PYTHON MICROSERVICE

### Terminal 1: Run Next.js (keep running)
```bash
# From hospital-admin root
npm run dev

# Output: http://localhost:3000
```

### Terminal 2: Run Python API

```bash
# From hospital-admin root
cd python

# Activate virtual environment
.venv\Scripts\Activate.ps1

# Run Flask server
python app.py

# Output: Running on http://localhost:5000
```

Now you have:
- ✅ Next.js frontend at http://localhost:3000
- ✅ Python API at http://localhost:5000

---

## 📡 CALL PYTHON FROM NEXT.JS

### Example 1: Disease Prediction

In a Next.js Server Action (`src/app/dashboard/records/actions.ts`):

```typescript
'use server'

export async function predictDisease(symptoms: string[]) {
    const response = await fetch('http://localhost:5000/api/predict-disease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms })
    })
    
    const data = await response.json()
    return data  // { prediction: 'Influenza', confidence: 0.92 }
}
```

### Example 2: Call from UI Component

In a React component (`src/app/dashboard/records/record-form.tsx`):

```tsx
'use client'

import { predictDisease } from './actions'
import { useState } from 'react'

export function RecordForm() {
    const [prediction, setPrediction] = useState(null)
    
    async function handlePredict(symptoms: string[]) {
        try {
            const result = await predictDisease(symptoms)
            setPrediction(result)
        } catch (err) {
            console.error('Prediction error:', err)
        }
    }
    
    return (
        <div>
            <button onClick={() => handlePredict(['fever', 'cough'])}>
                Get AI Diagnosis
            </button>
            
            {prediction && (
                <div>
                    <p>Prediction: {prediction.prediction}</p>
                    <p>Confidence: {prediction.confidence * 100}%</p>
                    <ul>
                        {prediction.recommendations.map(r => (
                            <li key={r}>{r}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
```

---

## 🐳 OPTIONAL: DOCKERIZE PYTHON SERVICE

Create `docker/Dockerfile.python`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY python/requirements.txt .
RUN pip install -r requirements.txt

COPY python/ .

EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

Build and run:
```bash
docker build -f docker/Dockerfile.python -t hopi-python-api .
docker run -p 5000:5000 hopi-python-api
```

---

## 📊 USE CASES: WHERE TO USE PYTHON

### 1. **Clinical Decision Support** ✅
```python
# Patient comes with symptoms → Python predicts possible diagnoses
predictDisease(['fever', 'cough', 'fatigue'])
# Returns: {'disease': 'Influenza', 'confidence': 0.92}
```

### 2. **Patient Risk Scoring** ✅
```python
# Flag high-risk patients for proactive care
calculate_risk_score(medical_records)
# Returns: 0.78 (moderate-high risk)
```

### 3. **Data Analytics** ✅
```python
# Export patient trends, revenue analysis, staffing reports
export_analytics_report(date_range)
```

### 4. **Heavy Data Processing** ✅
```python
# Migrate legacy hospital database to Supabase
migrate_legacy_data(legacy_db_connection)
```

### 5. **Scheduled Background Jobs** ✅
```python
# Monthly: Retrain ML models with new patient data
# Daily: Export billing reports
# Weekly: Generate compliance audits
```

---

## 🗂️ FILE CHECKLIST

After setup, you should have:

```
d:\Hospital_admin\
├── python/
│   ├── .venv/                      ✅ Virtual environment
│   ├── app.py                      ✅ Flask server
│   ├── .env                        ✅ Python config
│   ├── requirements.txt            ✅ Dependencies
│   ├── models/
│   │   ├── __init__.py
│   │   ├── ml_predictor.py         ✅ ML models
│   │   └── data_processor.py       ✅ Data analysis
│   ├── utils/
│   │   ├── __init__.py
│   │   └── supabase_client.py      ✅ DB connection
│   └── routes/
│       └── __init__.py
├── src/
│   └── app/dashboard/records/
│       └── actions.ts              ✅ Call Python from here
├── next.config.ts
├── package.json
└── PYTHON_INTEGRATION_GUIDE.md    ✅ This file
```

---

## 🔒 SECURITY: Python ↔️ Next.js Communication

### Add API Key Authentication

In `python/app.py`:

```python
from functools import wraps

PYTHON_API_KEY = os.getenv('PYTHON_API_KEY', 'dev-key-12345')

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key != PYTHON_API_KEY:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/predict-disease', methods=['POST'])
@require_api_key  # Add this decorator
def predict_endpoint():
    # ... code
```

In Next.js (`src/app/dashboard/records/actions.ts`):

```typescript
export async function predictDisease(symptoms: string[]) {
    const response = await fetch('http://localhost:5000/api/predict-disease', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.PYTHON_API_KEY  // Add this
        },
        body: JSON.stringify({ symptoms })
    })
    
    const data = await response.json()
    return data
}
```

Add to `.env.local`:

```
PYTHON_API_KEY=dev-key-12345
```

---

## 📈 SCALING PYTHON MICROSERVICE

### Development
```
Single Flask server
Port 5000
```

### Production
```
Gunicorn (4 workers)
→ Nginx (load balancer)
→ Deployed on Heroku / Railway / EC2
```

Update `requirements.txt`:
```
gunicorn==21.2.0
```

Run production:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## ✅ SUMMARY: Integration Steps

1. ✅ Create `python/` directory in project root
2. ✅ Set up Python virtual environment
3. ✅ Create `requirements.txt` with dependencies
4. ✅ Build Flask API (`app.py`)
5. ✅ Create Python modules (ML, data processing)
6. ✅ Connect to Supabase from Python
7. ✅ Calls from Next.js Server Actions to Python API
8. ✅ Test both servers running simultaneously

---

**You now have a hybrid Next.js + Python Hospital System!** 🎉

Need help with:
- Specific ML models? Ask!
- Workflow automation? I can code it!
- Deployment setup? Let me know!
