/**
 * Python API Client
 * Bridge between Next.js and Python Microservice
 * Handles all communication with the Flask backend
 */

const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://127.0.0.1:5000'
const PYTHON_API_KEY = process.env.PYTHON_API_KEY || 'dev-key-12345'

interface PredictionResult {
    disease: string
    confidence: number
    severity: 'low' | 'moderate' | 'high' | 'critical'
    symptoms: string[]
    recommendations: string[]
    follow_up_in_days: number
}

interface PatientAnalysisResult {
    patient_id: string
    total_visits: number
    unique_diagnoses: string[]
    visit_frequency: number
    risk_score: number
    last_visit_date: string | null
    current_month_appointments: number
    total_billing: number
}

interface DiagnosisHistory {
    diagnosis: string
    date: string
    doctor: string
    record_id: string
}

/**
 * Call Python API endpoint with proper error handling
 */
async function callPythonAPI<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, any>
): Promise<T> {
    try {
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': PYTHON_API_KEY,
            },
        }

        if (body) {
            options.body = JSON.stringify(body)
        }

        const response = await fetch(`${PYTHON_API_URL}${endpoint}`, options)

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || `Python API error: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error(`Python API call failed for ${endpoint}:`, error)
        throw error
    }
}

/**
 * Predict disease based on symptoms
 * @param symptoms - Array of symptom strings
 * @returns Prediction with confidence, severity, and recommendations
 */
export async function predictDisease(symptoms: string[]): Promise<PredictionResult> {
    return callPythonAPI(
        '/api/predict-disease',
        'POST',
        { symptoms }
    )
}

/**
 * Analyze patient health data
 * @param patientId - Supabase patient ID
 * @returns Analysis with risk score and visit history
 */
export async function analyzePatient(patientId: string): Promise<PatientAnalysisResult> {
    return callPythonAPI(
        `/api/patient-analysis/${patientId}`,
        'GET'
    )
}

/**
 * Get diagnosis history for a patient
 * @param patientId - Supabase patient ID
 * @returns Array of past diagnoses
 */
export async function getDiagnosisHistory(patientId: string): Promise<DiagnosisHistory[]> {
    return callPythonAPI(
        `/api/diagnosis-history/${patientId}`,
        'GET'
    )
}

/**
 * Score risk for a patient (0-1)
 * @param patientId - Supabase patient ID
 * @returns Risk score and recommendations
 */
export async function scorePatientRisk(patientId: string): Promise<{
    risk_score: number
    risk_level: 'low' | 'medium' | 'high'
    recommendations: string[]
}> {
    return callPythonAPI(
        `/api/patient-risk/${patientId}`,
        'GET'
    )
}

/**
 * Analyze lab result value against reference range
 * @param value - Numeric result
 * @param referenceRange - String like "11.0 - 15.0"
 * @returns Status (normal/abnormal) and clinical insight
 */
export async function analyzeLabResult(value: number, referenceRange: string): Promise<{
    status: 'normal' | 'abnormal' | 'unknown'
    insight: string
    severity: 'low' | 'high'
}> {
    return callPythonAPI(
        '/api/analyze-lab-result',
        'POST',
        { value, reference_range: referenceRange }
    )
}

/**
 * Hospital-wide Strategic Insights
 * @returns Strategic data, health score, and trends
 */
export async function getHospitalInsights(): Promise<{
    insights: { id: number, title: string, content: string, type: 'positive' | 'warning' | 'info' }[]
    health_score: number
    trend: 'upward' | 'downward' | 'stable'
}> {
    return callPythonAPI(
        '/api/hospital-insights',
        'GET'
    )
}

/**
 * Clinical Copilot Chat
 * @param message - User message
 * @returns AI response with clinical context
 */
export async function aiChat(message: string): Promise<{
    response: string
    context: string
}> {
    return callPythonAPI(
        '/api/ai-chat',
        'POST',
        { message }
    )
}

/**
 * Check for drug-drug interactions
 */
export async function checkInteractions(medicines: string[]): Promise<{
    severity: 'low' | 'high'
    type: string
    medicines: string[]
    message: string
}[]> {
    return callPythonAPI(
        '/api/check-interactions',
        'POST',
        { medicines }
    )
}

/**
 * Get personalized health tips from Python AI
 */
export async function getSmartTips(patientId: string): Promise<{
    category: string
    tip: string
    priority: 'low' | 'medium' | 'high' | 'critical'
}[]> {
    const result = await callPythonAPI<{ tips: any[] }>(
        `/api/smart-tips/${patientId}`,
        'GET'
    )
    return result.tips
}

/**
 * Health check - verify Python service is running
 */
export async function checkPythonHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${PYTHON_API_URL}/health`)
        return response.ok
    } catch {
        return false
    }
}
