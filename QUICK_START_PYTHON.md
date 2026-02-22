# Quick Start: Running Both Next.js + Python

## 📁 Your New Project Structure

```
d:\Hospital_admin\
├── src/                    (Next.js frontend)
├── python/                 (Python API - NEW!)
│   ├── app.py             ← Flask server
│   ├── .env               ← Python config
│   ├── requirements.txt    ← Dependencies
│   ├── models/
│   │   ├── ml_predictor.py        ← Disease prediction
│   │   └── data_processor.py      ← Patient analytics
│   └── utils/
│       └── supabase_client.py     ← DB connection
├── PYTHON_INTEGRATION_GUIDE.md    ← Full documentation
└── QUICK_START_PYTHON.md          ← This file
```

---

## 🚀 STEP 1: Install Python Dependencies

**Terminal 1 (Python setup):**

```powershell
# Navigate to python directory
cd d:\Hospital_admin\python

# Create virtual environment
python -m venv .venv

# Activate it (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Install all dependencies
pip install -r requirements.txt

# Verify Flask was installed
python -c "import flask; print(f'Flask {flask.__version__} installed')"
```

**Expected output:**
```
Flask 3.0.0 installed
```

---

## 🎯 STEP 2: Start Python API (Terminal 1)

```powershell
# Make sure you're in python/ directory with .venv activated
cd d:\Hospital_admin\python
.venv\Scripts\Activate.ps1

# Run Flask server
python app.py
```

**Expected output:**
```
═════════════════════════════════════════
   HOPI SYNC Python API Starting
   http://localhost:5000
   API Key: dev-key-12345...
═════════════════════════════════════════
```

✅ **Python API is running at http://localhost:5000**

---

## ⚛️ STEP 3: Start Next.js (Terminal 2 - keep running)

```powershell
# New PowerShell terminal
cd d:\Hospital_admin

# Start Next.js dev server
npm run dev
```

**Expected output:**
```
▲ Next.js 15.1.9
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

✅ **Next.js frontend is running at http://localhost:3000**

---

## 🧪 STEP 4: Test Python API (Terminal 3)

```powershell
# New PowerShell terminal

# Test health check (no auth needed)
curl -X GET http://localhost:5000/health

# Test disease prediction (requires API key)
curl -X POST http://localhost:5000/api/predict-disease `
  -H "Content-Type: application/json" `
  -H "X-API-Key: dev-key-12345" `
  -d '{"symptoms": ["fever", "cough", "fatigue"]}'
```

**Expected response:**
```json
{
  "status": "success",
  "prediction": {
    "disease": "Influenza",
    "confidence": 0.92,
    "severity": "moderate",
    "recommendations": ["Rest", "Stay hydrated", "Antiviral medication"],
    "follow_up": "48 hours"
  }
}
```

---

## 💻 STEP 5: Call Python from Next.js

### Create a Server Action

In `src/app/dashboard/records/actions.ts`, add:

```typescript
'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ... existing code ...

// NEW: Call Python API for disease prediction
export async function predictDisease(symptoms: string[]) {
    try {
        const response = await fetch('http://localhost:5000/api/predict-disease', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': process.env.PYTHON_API_KEY || 'dev-key-12345'
            },
            body: JSON.stringify({ symptoms })
        })
        
        if (!response.ok) {
            return { error: `Python API error: ${response.status}` }
        }
        
        const data = await response.json()
        return data
        
    } catch (err: any) {
        return { error: `Failed to predict: ${err.message}` }
    }
}

// NEW: Analyze patient data using Python
export async function analyzePatient(patientId: string) {
    try {
        const response = await fetch('http://localhost:5000/api/process-patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': process.env.PYTHON_API_KEY || 'dev-key-12345'
            },
            body: JSON.stringify({ patient_id: patientId })
        })
        
        if (!response.ok) {
            return { error: `Python API error: ${response.status}` }
        }
        
        const data = await response.json()
        return data
        
    } catch (err: any) {
        return { error: `Failed to analyze: ${err.message}` }
    }
}
```

### Use in React Component

In `src/app/dashboard/records/record-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { predictDisease } from './actions'
import { Loader2, Brain } from 'lucide-react'

export function RecordForm() {
    const [aiSuggestion, setAiSuggestion] = useState(null)
    const [loading, setLoading] = useState(false)
    const [symptoms, setSymptoms] = useState(['fever'])
    
    async function handleGetAIPrediction() {
        if (!symptoms.length) {
            alert('Please enter at least one symptom')
            return
        }
        
        setLoading(true)
        const result = await predictDisease(symptoms)
        setLoading(false)
        
        if (result.error) {
            alert(`Error: ${result.error}`)
        } else {
            setAiSuggestion(result.prediction)
        }
    }
    
    return (
        <div>
            {/* ... existing form ... */}
            
            {/* NEW: AI Diagnosis Section */}
            <div className="p-4 bg-primary/10 rounded-xl mt-6">
                <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">AI Diagnostic Assistant</h3>
                </div>
                
                <button
                    type="button"
                    onClick={handleGetAIPrediction}
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Get AI Prediction
                </button>
                
                {aiSuggestion && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <p><strong>Prediction:</strong> {aiSuggestion.disease}</p>
                        <p><strong>Confidence:</strong> {(aiSuggestion.confidence * 100).toFixed(0)}%</p>
                        <p><strong>Severity:</strong> {aiSuggestion.severity}</p>
                        <ul className="mt-2 space-y-1">
                            {aiSuggestion.recommendations.map((r, i) => (
                                <li key={i}>• {r}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
```

---

## 📝 Environment Variables

### For Next.js (`.env.local`)
```
PYTHON_API_KEY=dev-key-12345
PYTHON_API_URL=http://localhost:5000
```

### For Python (`python/.env`)
```
NEXT_PUBLIC_SUPABASE_URL=https://tbfzzryzusrkxtgjokbi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FLASK_ENV=development
PYTHON_API_KEY=dev-key-12345
```

---

## ✅ Checklist: Everything Running?

- [ ] **Terminal 1:** Python API running on port 5000
- [ ] **Terminal 2:** Next.js running on port 3000
- [ ] **Browser:** Can visit http://localhost:3000
- [ ] **Python health check:** `curl http://localhost:5000/health` returns 200
- [ ] **Environment:** Both .env files have correct credentials

---

## 🔗 Available Python Endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/health` | GET | ❌ | Check API status |
| `/api/predict-disease` | POST | ✅ | Disease prediction from symptoms |
| `/api/process-patient` | POST | ✅ | Patient data analysis |
| `/api/risk-score/<id>` | GET | ✅ | Get patient risk score |
| `/api/diagnoses/<id>` | GET | ✅ | Get patient diagnoses |

---

## 🆘 Troubleshooting

### "Python: command not found"
```powershell
# Python not in PATH - use full path
C:\Python311\python.exe -m venv .venv
```

### ".venv\Scripts\Activate.ps1 cannot be loaded"
```powershell
# Fix PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Flask not found after pip install"
```powershell
# Make sure .venv is activated first!
# On Windows: .venv\Scripts\Activate.ps1
# On macOS: source .venv/bin/activate

# Then install again
pip install Flask Flask-CORS
```

### "Connection refused" to Python API
```powershell
# Flask server not running - check Terminal 1
# Or use correct port (should be 5000, not 5001)
```

### "Supabase credentials missing"
```python
# Make sure python/.env has:
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 📚 Next Steps

1. ✅ Python API is ready
2. ✅ Next.js can call Python
3. ✅ ML prediction is working
4. 🔄 **Next:** Integrate with medical records form
5. 🔄 **Next:** Add patient analytics dashboard
6. 🔄 **Next:** Deploy to production (Heroku + Vercel)

---

## 🎓 Learning Resources

- Flask: https://flask.palletsprojects.com/
- Supabase Python: https://supabase.com/docs/reference/python
- scikit-learn: https://scikit-learn.org/
- Pandas: https://pandas.pydata.org/

---

**You now have a hybrid Next.js + Python hospital system!** 🏥🐍

See `PYTHON_INTEGRATION_GUIDE.md` for full documentation.
