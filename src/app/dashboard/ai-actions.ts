'use server'

/**
 * AI-Powered Medical Actions
 * Integrates Python ML/AI capabilities with Next.js
 */

import { 
    predictDisease, 
    analyzePatient, 
    scorePatientRisk, 
    analyzeLabResult, 
    aiChat, 
    getHospitalInsights,
    checkInteractions,
    getSmartTips
} from '@/lib/python-client'

/**
 * Get Hospital-wide AI Strategic Insights
 */
export async function getHospitalInsightsAction() {
    try {
        const result = await getHospitalInsights()
        return {
            success: true,
            data: result
        }
    } catch (error) {
        return { 
            error: 'Failed to fetch hospital insights',
            hint: 'Ensure Python service is running'
        }
    }
}

/**
 * Get AI response for Clinical Copilot Chat
 */
export async function aiChatAction(message: string) {
    if (!message) return { error: 'Message is required' }

    try {
        const result = await aiChat(message)
        return {
            success: true,
            data: result
        }
    } catch (error) {
        return { 
            error: 'Failed to connect to Clinical Copilot',
            hint: 'Ensure Python service is running'
        }
    }
}

/**
 * Get AI diagnosis suggestions based on symptoms
 * Used in Medical Records form for intelligent diagnosis suggestions
 */
export async function getAIDiagnosisSuggestions(symptoms: string[]) {
    if (!symptoms || symptoms.length === 0) {
        return { error: 'Please provide at least one symptom' }
    }

    try {
        const prediction = await predictDisease(symptoms)
        return {
            success: true,
            data: {
                suggestedDiagnosis: prediction.disease,
                confidence: (prediction.confidence * 100).toFixed(1),
                severity: prediction.severity,
                symptoms: prediction.symptoms,
                recommendations: prediction.recommendations,
                followUpDays: prediction.follow_up_in_days,
            }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get AI suggestions'
        return { 
            error: message,
            hint: 'Make sure the Python service is running on http://localhost:5000'
        }
    }
}

/**
 * Analyze patient health metrics
 * Shows patient risk score, visit frequency, and health trends
 */
export async function analyzePatientHealth(patientId: string) {
    if (!patientId) {
        return { error: 'Patient ID is required' }
    }

    try {
        const analysis = await analyzePatient(patientId)
        return {
            success: true,
            data: {
                totalVisits: analysis.total_visits,
                uniqueDiagnoses: analysis.unique_diagnoses,
                visitFrequency: analysis.visit_frequency,
                riskScore: (analysis.risk_score * 100).toFixed(1),
                lastVisit: analysis.last_visit_date,
                upcomingAppointments: analysis.current_month_appointments,
                totalBilling: analysis.total_billing,
            }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to analyze patient'
        return { 
            error: message,
            hint: 'Make sure the Python service is running and the patient exists'
        }
    }
}

/**
 * Calculate patient risk score (0-100)
 * Returns risk level and preventive recommendations
 */
export async function calculatePatientRisk(patientId: string) {
    if (!patientId) {
        return { error: 'Patient ID is required' }
    }

    try {
        const risk = await scorePatientRisk(patientId)
        return {
            success: true,
            data: {
                riskScore: (risk.risk_score * 100).toFixed(1),
                riskLevel: risk.risk_level,
                recommendations: risk.recommendations,
            }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to calculate risk'
        return { 
            error: message,
            hint: 'Make sure the Python service is running'
        }
    }
}

/**
 * Analyze lab result value against reference range
 * Returns normal/abnormal status and clinical insight
 */
export async function analyzeLabResultAction(value: number, referenceRange: string) {
    if (value === undefined || !referenceRange) {
        return { error: 'Value and reference range are required' }
    }

    try {
        const result = await analyzeLabResult(value, referenceRange)
        return {
            success: true,
            data: result
        }
    } catch (error) {
        return { 
            error: 'Failed to analyze lab result',
            hint: 'Ensure Python service is running'
        }
    }
}

/**
 * Check for high-risk drug-drug interactions (AI)
 */
export async function checkDrugInteractionsAction(medicines: string[]) {
    if (!medicines || medicines.length < 2) return { success: true, alerts: [] }

    try {
        const alerts = await checkInteractions(medicines)
        return {
            success: true,
            data: alerts
        }
    } catch (error) {
        return { 
            error: 'Failed to perform drug interaction check',
            hint: 'Ensure Python service is running'
        }
    }
}

/**
 * Get personalized patient health suggestions (AI)
 */
export async function getSmartHealthTipsAction(patientId: string) {
    if (!patientId) return { error: 'Patient ID is required' }

    try {
        const tips = await getSmartTips(patientId)
        return {
            success: true,
            data: tips
        }
    } catch (error) {
        return { 
            error: 'Failed to fetch AI health tips',
            hint: 'Ensure Python service is running'
        }
    }
}
