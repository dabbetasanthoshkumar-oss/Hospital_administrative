# 🏥 HOPI SYNC - Complete Python Integration Guide

This guide shows you how to run the Next.js hospital system with Python AI/ML microservice integration. All existing code remains untouched.

## 📋 What We've Added

### New Files Created:
1. **`src/lib/python-client.ts`** - Wrapper for Python API calls
2. **`src/app/dashboard/ai-actions.ts`** - Server actions for AI features
3. **`src/components/ai-diagnosis-suggestion.tsx`** - AI suggestion component
4. **`src/components/patient-health-analytics.tsx`** - Patient health widget

### Python Backend:
- **`python/app.py`** - Flask REST API with 5 endpoints
- **`python/models/ml_predictor.py`** - Disease prediction ML engine
- **`python/models/data_processor.py`** - Patient analytics & risk scoring
- **`python/utils/supabase_client.py`** - Supabase connection
- **`python/requirements.txt`** - Python dependencies
- **`python/.env`** - Configuration

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Python Service

Open a **new terminal** in the project root and run:

```bash
# Navigate to python directory
cd python

# Create virtual environment (first time only)
python -m venv .venv

# Activate virtual environment
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1

# On Windows CMD:
.venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Start the Flask API server
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

**Keep this terminal open** - it will run throughout your session.

### Step 2: Start Next.js (if not running)

Open **another terminal** and run:

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 15.1.9
```

Now both services are running:
- ✅ Next.js: `http://localhost:3000`
- ✅ Python: `http://localhost:5000`

---

## 🎯 How It Works

### Architecture Diagram

```
┌──────────────────────────────────┐
│      Next.js Frontend (3000)     │
│  ├─ Medical Records Form         │
│  ├─ Patient Dashboard            │
│  └─ Doctor Profiles              │
└──────────────┬──────────────────┘
               │ (HTTP Fetch)
               │
┌──────────────▼──────────────────┐
│   Python API Server (5000)       │
│  ├─ Disease Prediction           │
│  ├─ Patient Risk Analysis        │
│  ├─ Diagnosis History            │
│  └─ Health Metrics               │
└──────────────┬──────────────────┘
               │ (Supabase SDK)
               │
┌──────────────▼──────────────────┐
│    PostgreSQL (Supabase)        │
│  ├─ Medical Records             │
│  ├─ Patient Data                │
│  └─ Doctor Profiles             │
└─────────────────────────────────┘
```

### Data Flow Example: AI Diagnosis Suggestion

```
1. User enters symptoms in Medical Records form
                ↓
2. Clicks "Get AI Diagnosis Suggestion"
                ↓
3. Frontend calls: getAIDiagnosisSuggestions(['fever', 'cough'])
                ↓
4. Server action calls: predictDisease(['fever', 'cough'])
                ↓
5. Python client sends HTTP POST to: http://localhost:5000/api/predict-disease
                ↓
6. Flask processes request with ML model
   - Matches symptoms to 20+ diseases
   - Calculates confidence score
   - Determines severity level
   - Generates recommendations
                ↓
7. Returns: { disease: "Pneumonia", confidence: 0.92, severity: "high", ... }
                ↓
8. Component displays suggestion with "Use This Diagnosis" button
                ↓
9. User clicks button → diagnosis auto-fills in form
```

---

## 💡 Features & How to Use Them

### Feature 1: AI Diagnosis Suggestions

**Location:** Medical Records Form (`/dashboard/records/new`)

**What it does:**
- User enters symptoms (fever, cough, fatigue, etc.)
- Clicks "Get AI Diagnosis Suggestion"
- Python ML engine predicts disease with:
  - Disease name
  - Confidence percentage (0-100%)
  - Severity level (low/moderate/high/critical)
  - Matching symptoms
  - Clinical recommendations
  - Follow-up timeline

**Code:**
```typescript
import { getAIDiagnosisSuggestions } from '@/app/dashboard/ai-actions'

const result = await getAIDiagnosisSuggestions(['fever', 'cough'])
// Returns: { suggestedDiagnosis: "Pneumonia", confidence: "92.3", ... }
```

### Feature 2: Patient Health Analytics

**Location:** Patient Dashboard (when viewing patient details)

**What it does:**
- Shows AI-calculated risk score (0-100%)
- Displays total visits & visit frequency
- Lists unique diagnoses
- Shows upcoming appointments
- Provides AI recommendations
- Shows last visit date

**Add to any patient view:**
```typescript
import { PatientHealthAnalytics } from '@/components/patient-health-analytics'

export default function PatientPage({ patientId }) {
  return <PatientHealthAnalytics patientId={patientId} />
}
```

### Feature 3: Patient Risk Scoring

**Available for:**
- Billing module - identify high-risk patients
- Analytics - risk trend analysis
- Patient profiles - preventive care planning

**Usage:**
```typescript
import { calculatePatientRisk } from '@/app/dashboard/ai-actions'

const risk = await calculatePatientRisk(patient_id)
// Returns: { riskScore: "45.3", riskLevel: "medium", recommendations: [...] }
```

---

## 🔧 Configuration

### Python API Key

Located in `python/.env`:

```env
PYTHON_API_KEY=dev-key-12345
```

**Note:** This is development mode. For production, generate a secure key:

```python
import secrets
secrets.token_urlsafe(32)
```

### Custom API URL

If running Python on different host, update in `.env`:

```env
NEXT_PUBLIC_PYTHON_API_URL=http://your-python-server:5000
```

### Supabase Credentials

Python automatically uses your Supabase credentials from `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 📊 API Endpoints Reference

All endpoints require header: `X-API-Key: dev-key-12345`

### Health Check
```bash
GET /health
# Response: { status: "running", service: "HOPI SYNC Python API" }
```

### Predict Disease
```bash
POST /api/predict-disease
Content-Type: application/json
X-API-Key: dev-key-12345

{
  "symptoms": ["fever", "cough", "fatigue"]
}

# Response:
{
  "disease": "Pneumonia",
  "confidence": 0.92,
  "severity": "high",
  "symptoms": ["fever", "cough"],
  "recommendations": [
    "Prescribe antibiotic therapy",
    "Chest X-ray recommended",
    "Monitor oxygen levels"
  ],
  "follow_up_in_days": 3
}
```

### Patient Analysis
```bash
GET /api/patient-analysis/{patient_id}
X-API-Key: dev-key-12345

# Response:
{
  "patient_id": "...",
  "total_visits": 12,
  "unique_diagnoses": ["Hypertension", "Diabetes"],
  "visit_frequency": 2.4,
  "risk_score": 0.65,
  "last_visit_date": "2024-02-10",
  "current_month_appointments": 2,
  "total_billing": 2500.00
}
```

### Patient Risk Score
```bash
GET /api/patient-risk/{patient_id}
X-API-Key: dev-key-12345

# Response:
{
  "risk_score": 0.65,
  "risk_level": "high",
  "recommendations": [
    "Increase monitoring frequency",
    "Preventive health screening recommended",
    "Consider lifestyle intervention program"
  ]
}
```

### Diagnosis History
```bash
GET /api/diagnosis-history/{patient_id}
X-API-Key: dev-key-12345

# Response:
[
  {
    "diagnosis": "Hypertension",
    "date": "2024-01-15",
    "doctor": "Dr. Smith",
    "record_id": "..."
  }
]
```

---

## 🧠 ML Model Features

### Disease Prediction (20+ diseases)

The Python backend recognizes diseases including:
- Influenza
- COVID-19
- Pneumonia
- Heart Attack
- Appendicitis
- Meningitis
- Gastroenteritis
- Diabetes
- Hypertension
- And 12+ more...

### Symptom Mapping (100+ symptoms)

Common symptoms mapped:
- Fever, chills, body aches
- Cough, sore throat, congestion
- Nausea, vomiting, diarrhea
- Chest pain, shortness of breath
- Headache, dizziness, confusion
- Rash, itching, swelling
- And many more...

---

## ⚠️ Troubleshooting

### Python Service Not Starting

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
cd python
pip install -r requirements.txt
```

**Error:** `Address already in use (port 5000)`

**Solution:**
```powershell
# Find and kill the process using port 5000
netstat -ano | findstr :5000
taskkill /PID {PID} /F

# Then restart the Python service
```

### API Key Authentication Error

**Error:** `"error": "Unauthorized"`

**Solution:**
- Check `X-API-Key` header matches value in `python/.env`
- Default: `dev-key-12345`

**Check connection:**
```bash
# In any terminal, test the health endpoint
curl http://localhost:5000/health

# Should return: { "status": "running", ... }
```

### "Python service is not running" Message

**Solution:**
1. Open new terminal
2. Run:
   ```bash
   cd python
   .\.venv\Scripts\Activate.ps1
   python app.py
   ```
3. Wait for: `Running on http://127.0.0.1:5000`
4. Don't close this terminal during development

### Network Connection Issues

**If using different machines:**

Update `NEXT_PUBLIC_PYTHON_API_URL`:
```env
NEXT_PUBLIC_PYTHON_API_URL=http://your-server-ip:5000
```

---

## 🎨 Integration Examples

### Adding AI to Medical Records Form

```typescript
// In record-form.tsx
import { AIDiagnosisSuggestion } from '@/components/ai-diagnosis-suggestion'

export function RecordForm() {
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [diagnosis, setDiagnosis] = useState('')

  return (
    <>
      {/* Your existing form fields */}
      <Input
        placeholder="Enter symptoms (comma-separated)"
        onChange={(e) => setSymptoms(e.target.value.split(','))}
      />

      {/* Add AI component */}
      <AIDiagnosisSuggestion
        symptoms={symptoms}
        onSuggestionSelect={setDiagnosis}
      />

      {/* Rest of form */}
    </>
  )
}
```

### Adding Analytics to Patient Profile

```typescript
// In patient profile page
import { PatientHealthAnalytics } from '@/components/patient-health-analytics'

export default function PatientProfile({ patientId }) {
  return (
    <div>
      <h1>Patient Profile</h1>
      <PatientHealthAnalytics patientId={patientId} />
    </div>
  )
}
```

### Custom API Calls

```typescript
// In any server action
import { predictDisease, analyzePatient } from '@/lib/python-client'

export async function customAction(patientId: string) {
  const analysis = await analyzePatient(patientId)
  const prediction = await predictDisease(['fever', 'cough'])
  
  return {
    analysis,
    prediction
  }
}
```

---

## 📈 Production Setup

### Deploy Python Service

**Option 1: Heroku** (recommended for beginners)
```bash
# Install Heroku CLI, then:
heroku login
heroku create your-app-name
git push heroku main
```

**Option 2: Docker**
```bash
# Build Docker image
docker build -t hopi-python .

# Run container
docker run -p 5000:5000 hopi-python
```

**Option 3: Railway/Render**
- Connect Github repo
- Set environment variables
- Deploy with single click

### Update Production URL

After deployment, update in production `.env`:
```env
NEXT_PUBLIC_PYTHON_API_URL=https://your-python-api.vercel.app
PYTHON_API_KEY=your-secure-key
```

---

## ✨ Next Steps

1. ✅ **Start both services** (Next.js + Python)
2. ✅ **Test disease prediction** - go to `/dashboard/records/new`
3. ✅ **View patient analytics** - check patient details
4. ✅ **Explore ML predictions** - enter different symptoms
5. 🔜 Add more AI features (drug interaction checker, treatment optimizer)
6. 🔜 Deploy to production

---

## 📞 Support

If something's not working:

1. **Check Python is running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check Next.js is running:**
   ```bash
   curl http://localhost:3000
   ```

3. **Check network connectivity:**
   - Both on same machine? ✓
   - Firewall blocking port 5000? Check security settings
   - CORS enabled? ✓ Already configured

4. **Check logs:**
   - Next.js: Terminal running `npm run dev`
   - Python: Terminal running `python app.py`

---

**🎉 You now have a professional AI-powered hospital system!**

The Python integration is completely optional for core functionality but provides:
- 🧠 Intelligent diagnosis suggestions
- 📊 Patient risk analysis
- 💡 Health recommendations
- 📈 Analytics & insights

All existing features work exactly the same if Python service isn't running.
