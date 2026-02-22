"""
Machine Learning module for disease prediction
Uses symptom-disease mapping and confidence scoring
"""

import json

# Symptom to disease mapping
SYMPTOM_DISEASE_MAP = {
    # Respiratory diseases
    'fever': {'Influenza': 0.35, 'Cold': 0.25, 'COVID-19': 0.30, 'Pneumonia': 0.20},
    'cough': {'Influenza': 0.40, 'Cold': 0.35, 'COVID-19': 0.35, 'Pneumonia': 0.45},
    'sore_throat': {'Cold': 0.40, 'Influenza': 0.25, 'COVID-19': 0.20},
    'fatigue': {'Influenza': 0.30, 'COVID-19': 0.35, 'Cold': 0.15},
    'shortness_breath': {'Pneumonia': 0.50, 'COVID-19': 0.40, 'Asthma': 0.45},
    
    # Cardiac diseases
    'chest_pain': {'Heart Attack': 0.70, 'Angina': 0.60, 'GERD': 0.40},
    'palpitations': {'Arrhythmia': 0.75, 'Anxiety': 0.50},
    'shortness_breath_exertion': {'Heart Failure': 0.65, 'Cardiac Arrhythmia': 0.60},
    
    # Gastrointestinal
    'nausea': {'Gastritis': 0.50, 'Food Poisoning': 0.55, 'COVID-19': 0.20},
    'vomiting': {'Food Poisoning': 0.65, 'Gastritis': 0.55, 'Appendicitis': 0.40},
    'abdominal_pain': {'Appendicitis': 0.60, 'Gastritis': 0.50, 'Colitis': 0.45},
    
    # Neurological
    'headache': {'Migraine': 0.70, 'Tension Headache': 0.60, 'Meningitis': 0.20},
    'dizziness': {'Vertigo': 0.65, 'Anemia': 0.40, 'Hypertension': 0.35},
    'confusion': {'Concussion': 0.70, 'Meningitis': 0.55},
    
    # Infectious/Meningitis
    'rash': {'Meningitis': 0.65, 'Measles': 0.70, 'Chickenpox': 0.75},
    'neck_stiffness': {'Meningitis': 0.80, 'Muscle Strain': 0.30},
}

DISEASE_RECOMMENDATIONS = {
    'Influenza': {
        'severity': 'moderate',
        'recommendations': [
            'Rest for 7-10 days',
            'Stay hydrated',
            'Antiviral medication (Oseltamivir)',
            'See doctor if symptoms worsen',
            'Isolate from others (contagious)'
        ],
        'follow_up': '48 hours'
    },
    'Cold': {
        'severity': 'mild',
        'recommendations': [
            'Rest and fluids',
            'Honey for sore throat',
            'Vitamin C supplementation',
            'Over-the-counter cough drops',
            'Monitor for secondary infections'
        ],
        'follow_up': '1 week'
    },
    'COVID-19': {
        'severity': 'moderate-high',
        'recommendations': [
            'Self-isolate for 10 days',
            'Get tested immediately',
            'Monitor oxygen levels',
            'Consult doctor if difficulty breathing',
            'Quarantine household contacts'
        ],
        'follow_up': '48 hours'
    },
    'Pneumonia': {
        'severity': 'high',
        'recommendations': [
            'SEEK IMMEDIATE MEDICAL ATTENTION',
            'Chest X-ray required',
            'Antibiotics or antivirals',
            'Hospitalization may be needed',
            'Oxygen therapy if SpO2 < 94%'
        ],
        'follow_up': 'Immediate'
    },
    'Heart Attack': {
        'severity': 'critical',
        'recommendations': [
            'CALL AMBULANCE IMMEDIATELY',
            'Chew aspirin (325mg)',
            'Do not drive',
            'Coronary angiography needed',
            'ICU monitoring'
        ],
        'follow_up': 'Emergency (now)'
    },
    'Angina': {
        'severity': 'high',
        'recommendations': [
            'SEEK IMMEDIATE MEDICAL ATTENTION',
            'Rest immediately',
            'Use sublingual nitroglycerin',
            'ECG and cardiac workup',
            'Cardiology consultation'
        ],
        'follow_up': 'Emergency (now)'
    },
    'Appendicitis': {
        'severity': 'high',
        'recommendations': [
            'SEEK IMMEDIATE MEDICAL ATTENTION',
            'Abdominal ultrasound/CT scan',
            'Keep NPO (nothing by mouth)',
            'Surgical consultation',
            'Possible emergency surgery'
        ],
        'follow_up': 'Emergency (now)'
    },
    'Meningitis': {
        'severity': 'critical',
        'recommendations': [
            'CALL AMBULANCE IMMEDIATELY',
            'Admit to hospital',
            'Lumbar puncture (CSF analysis)',
            'Blood cultures',
            'Empirical antibiotics immediately'
        ],
        'follow_up': 'Emergency (now)'
    },
}

def predict_disease(symptoms: list) -> dict:
    """
    Predict disease based on symptoms using ML-like scoring
    
    Args:
        symptoms: List of symptom strings (e.g., ['fever', 'cough'])
        
    Returns:
        {
            'disease': 'Influenza',
            'confidence': 0.92,
            'severity': 'moderate',
            'recommendations': [...],
            'follow_up': '48 hours'
        }
    """
    
    if not symptoms or not isinstance(symptoms, list):
        return {
            'disease': 'Unknown',
            'confidence': 0.0,
            'severity': 'unknown',
            'recommendations': ['Consult a healthcare provider'],
            'follow_up': 'ASAP'
        }
    
    # Normalize symptoms (lowercase, strip whitespace)
    normalized_symptoms = [s.lower().strip() for s in symptoms]
    
    # Score each possible disease
    disease_scores = {}
    
    for symptom in normalized_symptoms:
        if symptom in SYMPTOM_DISEASE_MAP:
            for disease, score in SYMPTOM_DISEASE_MAP[symptom].items():
                if disease not in disease_scores:
                    disease_scores[disease] = []
                disease_scores[disease].append(score)
    
    # Average scores for each disease
    disease_confidences = {}
    for disease, scores in disease_scores.items():
        disease_confidences[disease] = sum(scores) / len(scores)
    
    # Get top prediction
    if disease_confidences:
        top_disease = max(disease_confidences, key=disease_confidences.get)
        confidence = min(disease_confidences[top_disease], 1.0)  # Cap at 1.0
    else:
        top_disease = 'Unknown'
        confidence = 0.0
    
    # Get recommendations
    if top_disease in DISEASE_RECOMMENDATIONS:
        rec_data = DISEASE_RECOMMENDATIONS[top_disease]
    else:
        rec_data = {
            'severity': 'unknown',
            'recommendations': ['Consult a healthcare provider for proper diagnosis'],
            'follow_up': 'ASAP'
        }
    
    return {
        'disease': top_disease,
        'confidence': round(confidence, 2),
        'severity': rec_data.get('severity', 'unknown'),
        'recommendations': rec_data.get('recommendations', []),
        'follow_up': rec_data.get('follow_up', 'ASAP'),
        'symptoms_matched': len(normalized_symptoms),
        'confidence_interpretation': 'High' if confidence >= 0.7 else 'Moderate' if confidence >= 0.5 else 'Low'
    }

def retrain_model_with_patient_data():
    """
    Retrain ML model with new patient data (run monthly)
    Currently a placeholder - would use scikit-learn RandomForest
    """
    pass
