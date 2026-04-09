"""
Clinical Intelligence Engine
Handles drug interactions, dosage validation, and safety checks.
"""

# Mock Drug Interaction Database
CONTRAINDICATIONS = {
    'Aspirin': ['Warfarin', 'Ibuprofen', 'Heparin'],
    'Warfarin': ['Aspirin', 'Ibuprofen', 'Naproxen', 'Amiodarone'],
    'Amoxicillin': ['Methotrexate'],
    'Insulin': ['Beta Blockers', 'Alcohol'],
    'Metformin': ['Contrast Dye', 'Topiramate'],
    'Lisinopril': ['Spironolactone', 'Potassium Supplements']
}

def check_drug_interactions(medicines: list) -> list:
    """
    Checks for potential drug-drug interactions in a list of medicines.
    
    Args:
        medicines: List of medicine names (strings)
        
    Returns:
        List of interaction alerts (dict)
    """
    alerts = []
    meds_upper = [m.split(' ')[0].capitalize() for m in medicines]
    
    for i, med1 in enumerate(meds_upper):
        if med1 in CONTRAINDICATIONS:
            for med2 in meds_upper[i+1:]:
                if med2 in CONTRAINDICATIONS[med1]:
                    alerts.append({
                        'severity': 'high',
                        'type': 'Drug Interaction',
                        'medicines': [med1, med2],
                        'message': f"Potential high-risk interaction detected between {med1} and {med2}. Consult clinical guidelines."
                    })
                    
    return alerts

def get_smart_health_recommendations(patient_data: dict) -> list:
    """
    Generates personalized health tips based on visit history and demographics.
    """
    recommendations = []
    diagnoses = patient_data.get('active_diagnoses', [])
    risk_score = patient_data.get('risk_score', 0)
    
    # Simple rule-based engine for personalized tips
    if any('hypertension' in d.lower() for d in diagnoses):
        recommendations.append({
            'category': 'Physical Activity',
            'tip': 'Maintain consistent blood pressure monitoring. Aim for 30 minutes of light cardio 5 times a week.',
            'priority': 'high'
        })
    
    if any('diabetes' in d.lower() for d in diagnoses):
        recommendations.append({
            'category': 'Dietary',
            'tip': 'Focus on low-glycemic index foods. Monitor blood sugar levels after meals.',
            'priority': 'high'
        })
        
    if risk_score > 0.6:
        recommendations.append({
            'category': 'Clinical Follow-up',
            'tip': 'Your recent health markers suggest a follow-up consultation within 14 days.',
            'priority': 'critical'
        })
        
    # General wellness
    if not recommendations:
        recommendations.append({
            'category': 'General Wellness',
            'tip': 'Stay hydrated and ensure 7-8 hours of sleep for optimal recovery.',
            'priority': 'medium'
        })
        
    return recommendations
