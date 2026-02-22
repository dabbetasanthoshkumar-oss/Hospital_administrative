"""
Data processing and analytics module
Fetches and analyzes patient data from Supabase
"""

from utils.supabase_client import get_supabase_client
from datetime import datetime

def process_patient_data(patient_id: str) -> dict:
    """
    Fetch and analyze patient data from Supabase
    
    Args:
        patient_id: UUID of patient
        
    Returns:
        {
            'patient_name': 'Rajesh Kumar',
            'total_visits': 5,
            'total_records': 12,
            'active_diagnoses': ['Hypertension', 'Diabetes'],
            'visit_frequency': 'Occasional (1-5 visits)',
            'risk_score': 0.65,
            'last_visit': '2026-02-20',
            'appointments_this_month': 2
        }
    """
    
    try:
        supabase = get_supabase_client()
        
        # Fetch patient data
        patient_response = supabase.table('patients').select('*').eq('id', patient_id).execute()
        
        if not patient_response.data:
            return {'error': 'Patient not found'}
        
        patient = patient_response.data[0]
        
        # Fetch medical records
        records_response = supabase.table('medical_records').select('*').eq('patient_id', patient_id).execute()
        records = records_response.data if records_response.data else []
        
        # Fetch appointments
        appointments_response = supabase.table('appointments').select('*').eq('patient_id', patient_id).execute()
        appointments = appointments_response.data if appointments_response.data else []
        
        # Fetch billing
        billing_response = supabase.table('billing').select('*').execute()
        
        # Extract appointments related to this patient
        patient_appointments = [a for a in appointments]
        
        # Extract diagnoses
        diagnoses = extract_diagnoses(records)
        
        # Calculate metrics
        visit_frequency = calculate_frequency(appointments)
        risk_score = calculate_risk_score(records, appointments)
        last_visit = get_last_visit_date(appointments)
        appointments_this_month = count_appointments_this_month(appointments)
        total_billing = calculate_total_billing(billing_response.data, [a['id'] for a in appointments])
        
        analysis = {
            'patient_id': patient_id,
            'patient_name': patient.get('full_name', 'Unknown'),
            'patient_age': calculate_age(patient.get('dob')),
            'gender': patient.get('gender', 'Not specified'),
            'contact': patient.get('phone', 'Not provided'),
            'address': patient.get('address', 'Not provided'),
            
            # Visit metrics
            'total_visits': len(appointments),
            'total_records': len(records),
            'visit_frequency': visit_frequency,
            'last_visit': last_visit,
            'appointments_this_month': appointments_this_month,
            
            # Clinical data
            'active_diagnoses': diagnoses,
            'number_of_diagnoses': len(diagnoses),
            
            # Risk assessment
            'risk_score': round(risk_score, 2),
            'risk_level': get_risk_level(risk_score),
            
            # Financial
            'total_billing': round(total_billing, 2),
            'currency': 'INR'
        }
        
        return analysis
        
    except Exception as e:
        return {'error': f'Data processing error: {str(e)}'}

def extract_diagnoses(records: list) -> list:
    """Extract unique diagnoses from medical records"""
    diagnoses = set()
    for record in records:
        if record.get('diagnosis'):
            diagnoses.add(record['diagnosis'])
    return sorted(list(diagnoses))

def calculate_age(dob: str) -> int:
    """Calculate age from date of birth"""
    try:
        from datetime import datetime
        birth_date = datetime.strptime(dob, '%Y-%m-%d')
        today = datetime.now()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return age
    except:
        return 0

def calculate_frequency(appointments: list) -> str:
    """Calculate visit frequency category"""
    count = len(appointments)
    
    if count == 0:
        return 'No visits'
    elif count == 1:
        return 'Rare (1 visit)'
    elif count <= 5:
        return 'Occasional (2-5 visits)'
    elif count <= 15:
        return 'Regular (6-15 visits)'
    else:
        return 'Frequent (15+ visits)'

def calculate_risk_score(records: list, appointments: list) -> float:
    """
    Calculate patient risk score (0.0 - 1.0)
    
    Factors:
    - Number of diagnoses (more = higher risk)
    - Appointment frequency (more visits = potential higher risk)
    - Prescription complexity (more meds = higher risk)
    """
    
    base_score = 0.0
    
    # Factor 1: Number of diagnoses (0-0.5 points)
    diagnoses = extract_diagnoses(records)
    diagnosis_score = min(len(diagnoses) * 0.1, 0.5)
    base_score += diagnosis_score
    
    # Factor 2: Visit frequency (0-0.3 points)
    visit_count = len(appointments)
    if visit_count > 20:
        base_score += 0.3
    elif visit_count > 10:
        base_score += 0.2
    elif visit_count > 5:
        base_score += 0.1
    
    # Factor 3: Prescription complexity (0-0.2 points)
    prescription_count = sum(1 for r in records if r.get('prescription_text'))
    if prescription_count > 10:
        base_score += 0.2
    elif prescription_count > 5:
        base_score += 0.1
    
    # Cap at 1.0
    return min(base_score, 1.0)

def get_risk_level(risk_score: float) -> str:
    """Convert risk score to risk level"""
    if risk_score >= 0.8:
        return 'Critical ⚠️'
    elif risk_score >= 0.6:
        return 'High 🟡'
    elif risk_score >= 0.4:
        return 'Moderate 🟢'
    else:
        return 'Low ✅'

def get_last_visit_date(appointments: list) -> str:
    """Get date of most recent appointment"""
    if not appointments:
        return 'Never'
    
    try:
        dates = [a.get('appointment_date') for a in appointments if a.get('appointment_date')]
        if dates:
            latest = max(dates)
            return latest.split('T')[0] if isinstance(latest, str) else str(latest)[:10]
    except:
        pass
    
    return 'Unknown'

def count_appointments_this_month(appointments: list) -> int:
    """Count appointments scheduled for current month"""
    from datetime import datetime
    
    current_year = datetime.now().year
    current_month = datetime.now().month
    count = 0
    
    for apt in appointments:
        if apt.get('appointment_date'):
            try:
                apt_date = datetime.fromisoformat(apt['appointment_date'].replace('Z', '+00:00'))
                if apt_date.year == current_year and apt_date.month == current_month:
                    count += 1
            except:
                pass
    
    return count

def calculate_total_billing(billing_records: list, appointment_ids: list) -> float:
    """Calculate total billing for patient"""
    total = 0.0
    
    for billing in billing_records:
        if billing.get('appointment_id') in appointment_ids:
            total += float(billing.get('total_amount', 0))
    
    return total
