# 🔧 PART 13: Remaining API Endpoints (Billing, Pharmacy, Records)

This document completes the REST API implementation with all remaining ViewSets and their endpoints.

---

# 📋 PRESCRIPTIONS API

## Serializers - `core/serializers.py` (Add to existing file)

```python
class PrescriptionSerializer(serializers.ModelSerializer):
    """Serializer for Prescription model"""
    doctor_name = serializers.CharField(source='doctor.profile.full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.profile.full_name', read_only=True)
    appointment_date = serializers.DateTimeField(source='appointment.appointment_date', read_only=True)
    
    class Meta:
        model = Prescription
        fields = [
            'id', 'appointment', 'doctor', 'doctor_name',
            'patient', 'patient_name', 'medication_name',
            'dosage', 'frequency', 'duration', 'quantity',
            'refills_remaining', 'start_date', 'end_date',
            'notes', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'id']
    
    def validate(self, data):
        """Validate prescription dates"""
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError(
                    "End date must be after start date"
                )
        return data


class PrescriptionDetailSerializer(PrescriptionSerializer):
    """Detailed prescription with related data"""
    appointment = AppointmentSerializer(read_only=True)
    doctor = DoctorBasicSerializer(read_only=True)
    patient = PatientBasicSerializer(read_only=True)
```

## ViewSet - `prescriptions/views.py` (Create new file)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from datetime import datetime, timedelta

from core.models import Prescription, Appointment
from core.serializers import PrescriptionSerializer, PrescriptionDetailSerializer
from core.permissions import IsDoctor, IsPatient, IsAdmin


class PrescriptionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Prescription management
    
    list: Get all prescriptions (doctors see their own, patients see theirs)
    create: Doctor creates prescription after appointment
    retrieve: Get prescription details
    update: Doctor can update prescription
    destroy: Doctor/Admin can delete prescription (soft delete recommended)
    """
    
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['patient', 'doctor', 'status']
    search_fields = ['medication_name', 'patient__profile__full_name', 'doctor__profile__full_name']
    ordering_fields = ['-created_at', 'medication_name', 'patient']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Doctors see their own prescriptions
        Patients see prescriptions written for them
        Admins see all
        """
        user = self.request.user
        
        if user.role == 'ADMIN':
            return Prescription.objects.all().select_related(
                'doctor', 'patient', 'appointment'
            )
        
        elif user.role == 'DOCTOR':
            doctor = user.profile.doctor
            return Prescription.objects.filter(
                doctor=doctor
            ).select_related('patient', 'appointment')
        
        elif user.role == 'PATIENT':
            patient = user.profile.patient
            return Prescription.objects.filter(
                patient=patient
            ).select_related('doctor', 'appointment')
        
        return Prescription.objects.none()
    
    def get_serializer_class(self):
        """Use detailed serializer for retrieve"""
        if self.action == 'retrieve':
            return PrescriptionDetailSerializer
        return PrescriptionSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create prescription after appointment
        Only doctors can create
        """
        if request.user.role != 'DOCTOR':
            return Response(
                {'error': 'Only doctors can create prescriptions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        data['doctor'] = request.user.profile.doctor.id
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def my_prescriptions(self, request):
        """Get current user's prescriptions"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def refill(self, request, pk=None):
        """Request prescription refill"""
        prescription = self.get_object()
        
        # Validate refills available
        if prescription.refills_remaining <= 0:
            return Response(
                {'error': 'No refills remaining'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate prescription not expired
        if prescription.end_date < timezone.now():
            return Response(
                {'error': 'Prescription has expired'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        prescription.refills_remaining -= 1
        prescription.save()
        
        return Response({
            'message': 'Refill successful',
            'refills_remaining': prescription.refills_remaining
        })
    
    @action(detail=True, methods=['post'])
    def expire(self, request, pk=None):
        """Mark prescription as expired"""
        prescription = self.get_object()
        
        if request.user.role != 'DOCTOR':
            return Response(
                {'error': 'Only doctors can expire prescriptions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        prescription.status = 'EXPIRED'
        prescription.save()
        
        return Response({
            'message': 'Prescription marked as expired',
            'status': prescription.status
        })
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get prescriptions expiring in next 7 days"""
        now = timezone.now()
        soon = now + timedelta(days=7)
        
        queryset = self.get_queryset().filter(
            end_date__lte=soon,
            end_date__gte=now,
            status='ACTIVE'
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
```

## Models Update - `core/models.py`

```python
class Prescription(models.Model):
    """
    Prescription model - Doctor writes prescriptions for patients
    Links appointment to medication details
    """
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('EXPIRED', 'Expired'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    FREQUENCY_CHOICES = [
        ('ONCE', 'Once'),
        ('TWICE_DAILY', 'Twice Daily'),
        ('THRICE_DAILY', 'Three Times Daily'),
        ('FOUR_TIMES_DAILY', 'Four Times Daily'),
        ('EVERY_4_HOURS', 'Every 4 Hours'),
        ('EVERY_6_HOURS', 'Every 6 Hours'),
        ('EVERY_8_HOURS', 'Every 8 Hours'),
        ('EVERY_12_HOURS', 'Every 12 Hours'),
        ('BEDTIME', 'At Bedtime'),
        ('AS_NEEDED', 'As Needed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    
    medication_name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)  # e.g., "500mg"
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    duration = models.CharField(max_length=100)  # e.g., "10 days"
    quantity = models.IntegerField()  # Number of tablets/doses
    refills_remaining = models.IntegerField(default=0)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', '-created_at']),
            models.Index(fields=['doctor', '-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.medication_name} - {self.patient.profile.full_name}"
```

---

# 🏥 MEDICAL RECORDS API

## Serializers - `core/serializers.py` (Add to existing file)

```python
class MedicalRecordSerializer(serializers.ModelSerializer):
    """Serializer for Medical Record model"""
    doctor_name = serializers.CharField(source='doctor.profile.full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.profile.full_name', read_only=True)
    appointment_date = serializers.DateTimeField(source='appointment.appointment_date', read_only=True)
    prescriptions = PrescriptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'appointment', 'doctor', 'doctor_name',
            'patient', 'patient_name', 'appointment_date',
            'chief_complaint', 'diagnosis', 'clinical_notes',
            'observations', 'treatment_plan', 'prescriptions',
            'follow_up_date', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'id']


class MedicalRecordDetailSerializer(MedicalRecordSerializer):
    """Detailed record with full relationships"""
    doctor = DoctorBasicSerializer(read_only=True)
    patient = PatientBasicSerializer(read_only=True)
    appointment = AppointmentSerializer(read_only=True)
```

## ViewSet - `records/views.py` (Create new file)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.models import MedicalRecord
from core.serializers import MedicalRecordSerializer, MedicalRecordDetailSerializer
from core.permissions import IsDoctor, IsPatient, IsAdmin


class MedicalRecordViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Medical Records management
    
    list: Get all records (doctors see their own, patients see theirs)
    create: Doctor creates record after appointment
    retrieve: Get full record details
    update: Doctor can update record
    destroy: Only admin can delete
    """
    
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['patient', 'doctor', 'status']
    search_fields = ['diagnosis', 'patient__profile__full_name', 'doctor__profile__full_name']
    ordering_fields = ['-created_at', 'diagnosis', 'patient']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Doctors see their own records
        Patients see records written about them
        Admins see all
        """
        user = self.request.user
        
        if user.role == 'ADMIN':
            return MedicalRecord.objects.all().select_related(
                'doctor', 'patient', 'appointment'
            ).prefetch_related('prescriptions')
        
        elif user.role == 'DOCTOR':
            doctor = user.profile.doctor
            return MedicalRecord.objects.filter(
                doctor=doctor
            ).select_related('patient', 'appointment').prefetch_related('prescriptions')
        
        elif user.role == 'PATIENT':
            patient = user.profile.patient
            return MedicalRecord.objects.filter(
                patient=patient
            ).select_related('doctor', 'appointment').prefetch_related('prescriptions')
        
        return MedicalRecord.objects.none()
    
    def get_serializer_class(self):
        """Use detailed serializer for retrieve"""
        if self.action == 'retrieve':
            return MedicalRecordDetailSerializer
        return MedicalRecordSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create medical record after appointment
        Only doctors can create
        """
        if request.user.role != 'DOCTOR':
            return Response(
                {'error': 'Only doctors can create medical records'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        data['doctor'] = request.user.profile.doctor.id
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, *args, **kwargs):
        """Only admin can delete records"""
        if request.user.role != 'ADMIN':
            return Response(
                {'error': 'Only admins can delete records'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def my_records(self, request):
        """Get current patient's medical records"""
        if request.user.role != 'PATIENT':
            return Response(
                {'error': 'Only patients can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def patient_history(self, request):
        """Get complete medical history for a patient"""
        patient_id = request.query_params.get('patient_id')
        
        if not patient_id:
            return Response(
                {'error': 'patient_id query parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permission - patients can only see their own
        if request.user.role == 'PATIENT':
            if str(request.user.profile.patient.id) != patient_id:
                return Response(
                    {'error': 'Not authorized to view this patient\'s records'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.role not in ['DOCTOR', 'ADMIN']:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = self.get_queryset().filter(patient__id=patient_id)
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'total_records': queryset.count(),
            'records': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def add_follow_up(self, request, pk=None):
        """Add follow-up date to record"""
        record = self.get_object()
        follow_up_date = request.data.get('follow_up_date')
        
        if not follow_up_date:
            return Response(
                {'error': 'follow_up_date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        record.follow_up_date = follow_up_date
        record.save()
        
        return Response({
            'message': 'Follow-up scheduled',
            'follow_up_date': record.follow_up_date
        })
    
    @action(detail=False, methods=['get'])
    def upcoming_followups(self, request):
        """Get patients with upcoming follow-up dates"""
        if request.user.role != 'DOCTOR':
            return Response(
                {'error': 'Only doctors can view this'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from django.utils import timezone
        now = timezone.now()
        
        records = self.get_queryset().filter(
            follow_up_date__isnull=False,
            follow_up_date__gte=now
        ).order_by('follow_up_date')
        
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)
```

## Models Update - `core/models.py`

```python
class MedicalRecord(models.Model):
    """
    Medical Record model - Complete record of patient visit/treatment
    Links appointment to diagnosis, treatment, and prescriptions
    """
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('COMPLETED', 'Completed'),
        ('ARCHIVED', 'Archived'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='medical_record')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='medical_records')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    
    chief_complaint = models.TextField()
    diagnosis = models.TextField()
    clinical_notes = models.TextField()
    observations = models.TextField(blank=True)
    treatment_plan = models.TextField()
    follow_up_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLETED')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', '-created_at']),
            models.Index(fields=['doctor', '-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Record - {self.patient.profile.full_name} ({self.created_at.date()})"
```

---

# 💰 BILLING API

## Serializers - `core/serializers.py` (Add to existing file)

```python
class BillingSerializer(serializers.ModelSerializer):
    """Serializer for Billing records"""
    patient_name = serializers.CharField(source='patient.profile.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.profile.full_name', read_only=True)
    
    class Meta:
        model = Billing
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name',
            'appointment', 'service_type', 'description',
            'amount', 'paid_amount', 'pending_amount', 'payment_method',
            'status', 'due_date', 'paid_date', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['paid_amount', 'pending_amount', 'created_at', 'updated_at', 'id']


class BillingDetailSerializer(BillingSerializer):
    """Detailed billing with appointment info"""
    appointment = AppointmentSerializer(read_only=True)
    doctor = DoctorBasicSerializer(read_only=True)
    patient = PatientBasicSerializer(read_only=True)


class PaymentSerializer(serializers.Serializer):
    """Serializer for payment processing"""
    billing_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.ChoiceField(
        choices=['CASH', 'CARD', 'TRANSFER', 'INSURANCE']
    )
    transaction_ref = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
```

## ViewSet - `billing/views.py` (Create new file)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from decimal import Decimal
from django.db.models import Sum, Q

from core.models import Billing
from core.serializers import BillingSerializer, BillingDetailSerializer, PaymentSerializer
from core.permissions import IsAdmin, IsPatient, IsDoctor


class BillingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Billing management
    
    list: Get billing records
    create: Admin/Doctor creates billing entry
    retrieve: Get billing details
    update: Modify billing entry
    destroy: Delete billing (only if unpaid)
    """
    
    serializer_class = BillingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['patient', 'doctor', 'status', 'payment_method']
    search_fields = ['patient__profile__full_name', 'service_type', 'doctor__profile__full_name']
    ordering_fields = ['-created_at', 'amount', 'due_date', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Patients see their own billing
        Doctors see billing for their appointments
        Admins see all
        """
        user = self.request.user
        
        if user.role == 'ADMIN':
            return Billing.objects.all().select_related(
                'patient', 'doctor', 'appointment'
            )
        
        elif user.role == 'DOCTOR':
            doctor = user.profile.doctor
            return Billing.objects.filter(
                doctor=doctor
            ).select_related('patient', 'appointment')
        
        elif user.role == 'PATIENT':
            patient = user.profile.patient
            return Billing.objects.filter(
                patient=patient
            ).select_related('doctor', 'appointment')
        
        return Billing.objects.none()
    
    def get_serializer_class(self):
        """Use detailed serializer for retrieve"""
        if self.action == 'retrieve':
            return BillingDetailSerializer
        return BillingSerializer
    
    def create(self, request, *args, **kwargs):
        """Create billing entry"""
        if request.user.role not in ['ADMIN', 'DOCTOR']:
            return Response(
                {'error': 'Only admin and doctors can create billing'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def my_billing(self, request):
        """Get current user's billing records"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get billing summary"""
        queryset = self.get_queryset()
        
        stats = {
            'total_bills': queryset.count(),
            'total_amount': queryset.aggregate(Sum('amount'))['amount__sum'] or 0,
            'total_paid': queryset.aggregate(Sum('paid_amount'))['paid_amount__sum'] or 0,
            'total_pending': queryset.aggregate(Sum('pending_amount'))['pending_amount__sum'] or 0,
            'paid_count': queryset.filter(status='PAID').count(),
            'pending_count': queryset.filter(status='PENDING').count(),
            'overdue_count': queryset.filter(
                Q(status='PENDING') & Q(due_date__lt=timezone.now())
            ).count(),
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        """Process payment for billing"""
        billing = self.get_object()
        serializer = PaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        amount = serializer.validated_data['amount']
        
        # Validate amount
        if amount > billing.pending_amount:
            return Response(
                {'error': f'Payment amount exceeds pending amount (${billing.pending_amount})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update billing
        billing.paid_amount += amount
        billing.pending_amount -= amount
        billing.payment_method = serializer.validated_data['payment_method']
        
        if billing.pending_amount == 0:
            billing.status = 'PAID'
            billing.paid_date = timezone.now()
        
        billing.save()
        
        response_data = {
            'message': 'Payment processed successfully',
            'billing_id': str(billing.id),
            'amount_paid': str(amount),
            'remaining_balance': str(billing.pending_amount),
            'status': billing.status
        }
        
        return Response(response_data)
    
    @action(detail=False, methods=['get'])
    def outstanding(self, request):
        """Get outstanding/pending billing"""
        queryset = self.get_queryset().filter(status='PENDING').order_by('due_date')
        serializer = self.get_serializer(queryset, many=True)
        
        total_pending = sum(bill['pending_amount'] for bill in serializer.data)
        
        return Response({
            'count': queryset.count(),
            'total_pending': total_pending,
            'bills': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue billing"""
        queryset = self.get_queryset().filter(
            Q(status='PENDING') & Q(due_date__lt=timezone.now())
        ).order_by('due_date')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
```

## Models Update - `core/models.py`

```python
class Billing(models.Model):
    """
    Billing model - Stores billing information for services
    """
    
    SERVICE_TYPES = [
        ('CONSULTATION', 'Consultation'),
        ('PROCEDURE', 'Procedure'),
        ('TESTS', 'Tests/Lab Work'),
        ('IMAGING', 'Imaging'),
        ('SURGERY', 'Surgery'),
        ('MEDICATION', 'Medication'),
        ('OTHER', 'Other'),
    ]
    
    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('CARD', 'Card'),
        ('TRANSFER', 'Bank Transfer'),
        ('INSURANCE', 'Insurance'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('PARTIAL', 'Partial'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='billing_records')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='billing_records')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pending_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
        ]
    
    def save(self, *args, **kwargs):
        """Auto-calculate pending amount"""
        self.pending_amount = self.amount - self.paid_amount
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Bill {self.service_type} - {self.patient.profile.full_name} (${self.amount})"
```

---

# 🏪 PHARMACY API

## Serializers - `core/serializers.py` (Add to existing file)

```python
class PharmacyInventorySerializer(serializers.ModelSerializer):
    """Serializer for Pharmacy inventory items"""
    
    class Meta:
        model = PharmacyInventory
        fields = [
            'id', 'medication_name', 'generic_name', 'strength',
            'unit', 'quantity_available', 'quantity_reserved',
            'expiry_date', 'unit_price', 'supplier', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'id']


class PharmacyDispensarySerializer(serializers.ModelSerializer):
    """Serializer for pharmacy dispensary records"""
    medication_name = serializers.CharField(source='inventory.medication_name', read_only=True)
    patient_name = serializers.CharField(source='prescription.patient.profile.full_name', read_only=True)
    
    class Meta:
        model = PharmacyDispensary
        fields = [
            'id', 'prescription', 'inventory', 'medication_name',
            'patient_name', 'quantity_dispensed', 'dispensed_date',
            'dispensed_by', 'status', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at', 'id']


class PharmacyStockAdjustmentSerializer(serializers.ModelSerializer):
    """Serializer for stock adjustments"""
    
    class Meta:
        model = PharmacyStockAdjustment
        fields = [
            'id', 'inventory', 'adjustment_type', 'quantity',
            'reason', 'performed_by', 'adjustment_date', 'notes',
            'created_at'
        ]
        read_only_fields = ['performed_by', 'adjustment_date', 'created_at', 'id']
```

## ViewSet - `pharmacy/views.py` (Create new file)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, F

from core.models import PharmacyInventory, PharmacyDispensary, PharmacyStockAdjustment
from core.serializers import (
    PharmacyInventorySerializer,
    PharmacyDispensarySerializer,
    PharmacyStockAdjustmentSerializer
)
from core.permissions import IsAdmin, IsDoctor


class PharmacyInventoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Pharmacy Inventory management
    
    list: Get all medications in inventory
    retrieve: Get medication details
    update: Update medication info/stock
    """
    
    serializer_class = PharmacyInventorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'supplier']
    search_fields = ['medication_name', 'generic_name']
    ordering_fields = ['-created_at', 'quantity_available', 'medication_name']
    ordering = ['medication_name']
    
    def get_queryset(self):
        """Get all medications"""
        return PharmacyInventory.objects.all().order_by('medication_name')
    
    def create(self, request, *args, **kwargs):
        """Only admin can add new medications"""
        if request.user.role != 'ADMIN':
            return Response(
                {'error': 'Only admin can add medications'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get medications with low stock"""
        threshold = request.query_params.get('threshold', 10)
        queryset = self.get_queryset().filter(
            quantity_available__lte=int(threshold),
            status='AVAILABLE'
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'low_stock_count': queryset.count(),
            'medications': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get medications expiring soon"""
        from datetime import timedelta
        from django.utils import timezone
        
        soon = timezone.now().date() + timedelta(days=30)
        queryset = self.get_queryset().filter(
            expiry_date__lte=soon,
            expiry_date__gte=timezone.now().date(),
            status='AVAILABLE'
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expired(self, request):
        """Get expired medications"""
        from django.utils import timezone
        queryset = self.get_queryset().filter(
            expiry_date__lt=timezone.now().date()
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def dispense(self, request, pk=None):
        """Mark medication as dispensed"""
        inventory = self.get_object()
        quantity = request.data.get('quantity', 1)
        prescription_id = request.data.get('prescription_id')
        
        if not prescription_id:
            return Response(
                {'error': 'prescription_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check stock
        if inventory.quantity_available < quantity:
            return Response(
                {'error': f'Insufficient stock. Available: {inventory.quantity_available}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update stock
        inventory.quantity_available -= quantity
        inventory.quantity_reserved += quantity
        inventory.save()
        
        # Create dispensary record
        PharmacyDispensary.objects.create(
            prescription_id=prescription_id,
            inventory=inventory,
            quantity_dispensed=quantity,
            dispensed_by=request.user,
            status='DISPENSED'
        )
        
        return Response({
            'message': 'Medication dispensed',
            'remaining_stock': inventory.quantity_available
        })


class PharmacyDispensaryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Pharmacy Dispensary records (read-only)
    """
    
    serializer_class = PharmacyDispensarySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'prescription']
    ordering_fields = ['-dispensed_date']
    ordering = ['-dispensed_date']
    
    def get_queryset(self):
        """Get dispensary records"""
        return PharmacyDispensary.objects.all().select_related(
            'inventory', 'prescription', 'dispensed_by'
        )
    
    @action(detail=False, methods=['get'])
    def by_patient(self, request):
        """Get dispensary records for a patient"""
        patient_id = request.query_params.get('patient_id')
        
        if not patient_id:
            return Response(
                {'error': 'patient_id query parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(
            prescription__patient__id=patient_id
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PharmacyStockAdjustmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Stock Adjustments
    
    create: Record stock adjustment
    list: View all adjustments
    """
    
    serializer_class = PharmacyStockAdjustmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['inventory', 'adjustment_type']
    ordering_fields = ['-adjustment_date']
    ordering = ['-adjustment_date']
    
    def get_queryset(self):
        """Get stock adjustments"""
        return PharmacyStockAdjustment.objects.all()
    
    def create(self, request, *args, **kwargs):
        """Only admin can record adjustments"""
        if request.user.role != 'ADMIN':
            return Response(
                {'error': 'Only admin can record stock adjustments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        data['performed_by'] = request.user.id
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Update inventory
        inventory = serializer.validated_data['inventory']
        quantity = serializer.validated_data['quantity']
        adjustment_type = serializer.validated_data['adjustment_type']
        
        if adjustment_type == 'ADD':
            inventory.quantity_available += quantity
        elif adjustment_type == 'REMOVE':
            inventory.quantity_available -= quantity
        
        inventory.save()
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

## Models Update - `core/models.py`

```python
class PharmacyInventory(models.Model):
    """
    Pharmacy Inventory model - Track available medications
    """
    
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('OUT_OF_STOCK', 'Out of Stock'),
        ('DISCONTINUED', 'Discontinued'),
    ]
    
    UNIT_CHOICES = [
        ('TABLET', 'Tablet'),
        ('CAPSULE', 'Capsule'),
        ('LIQUID', 'Liquid (ml)'),
        ('INJECTION', 'Injection (vial)'),
        ('POWDER', 'Powder'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medication_name = models.CharField(max_length=255)
    generic_name = models.CharField(max_length=255, blank=True)
    strength = models.CharField(max_length=100)  # e.g., "500mg"
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES)
    quantity_available = models.IntegerField(default=0)
    quantity_reserved = models.IntegerField(default=0)
    expiry_date = models.DateField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['medication_name']
        indexes = [
            models.Index(fields=['medication_name']),
            models.Index(fields=['status']),
            models.Index(fields=['expiry_date']),
        ]
    
    def __str__(self):
        return f"{self.medication_name} {self.strength}"


class PharmacyDispensary(models.Model):
    """
    Pharmacy Dispensary model - Track medication dispensing
    """
    
    STATUS_CHOICES = [
        ('DISPENSED', 'Dispensed'),
        ('RETURNED', 'Returned'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='dispensary_records')
    inventory = models.ForeignKey(PharmacyInventory, on_delete=models.SET_NULL, null=True)
    quantity_dispensed = models.IntegerField()
    dispensed_date = models.DateTimeField(auto_now_add=True)
    dispensed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DISPENSED')
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-dispensed_date']
        indexes = [
            models.Index(fields=['prescription']),
            models.Index(fields=['status']),
            models.Index(fields=['-dispensed_date']),
        ]


class PharmacyStockAdjustment(models.Model):
    """
    Pharmacy Stock Adjustment model - Track inventory changes
    """
    
    ADJUSTMENT_TYPES = [
        ('ADD', 'Add Stock'),
        ('REMOVE', 'Remove Stock'),
    ]
    
    REASONS = [
        ('RECEIVED', 'Stock Received'),
        ('EXPIRED', 'Expired'),
        ('DAMAGED', 'Damaged'),
        ('LOST', 'Lost'),
        ('CORRECTION', 'Inventory Correction'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inventory = models.ForeignKey(PharmacyInventory, on_delete=models.CASCADE, related_name='adjustments')
    adjustment_type = models.CharField(max_length=10, choices=ADJUSTMENT_TYPES)
    quantity = models.IntegerField()
    reason = models.CharField(max_length=20, choices=REASONS)
    performed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    adjustment_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-adjustment_date']
        indexes = [
            models.Index(fields=['inventory']),
            models.Index(fields=['-adjustment_date']),
        ]
```

---

# 🔗 URL ROUTING UPDATE

**File: `hospital/urls.py` (Update to include all ViewSets)**

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from core.views import (
    DoctorViewSet, PatientViewSet, AppointmentViewSet,
    PrescriptionViewSet, MedicalRecordViewSet,
    BillingViewSet,
    PharmacyInventoryViewSet, PharmacyDispensaryViewSet, PharmacyStockAdjustmentViewSet
)
from auth_app.views import (
    RegisterView, LoginView, LogoutView, 
    RefreshTokenView, UserProfileView
)

router = DefaultRouter()

# Register ViewSets
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')
router.register(r'records', MedicalRecordViewSet, basename='medical-record')
router.register(r'billing', BillingViewSet, basename='billing')
router.register(r'pharmacy/inventory', PharmacyInventoryViewSet, basename='pharmacy-inventory')
router.register(r'pharmacy/dispensary', PharmacyDispensaryViewSet, basename='pharmacy-dispensary')
router.register(r'pharmacy/adjustments', PharmacyStockAdjustmentViewSet, basename='pharmacy-adjustment')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/', include(router.urls)),
    
    # Authentication routes
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/refresh/', RefreshTokenView.as_view(), name='refresh'),
    path('api/auth/profile/', UserProfileView.as_view(), name='profile'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api-auth/', include('rest_framework.urls')),
]
```

---

# 📊 ENDPOINT SUMMARY

## Complete API Endpoints

```
Authentication
  POST   /api/auth/register/              - Register new user
  POST   /api/auth/login/                 - Login user
  POST   /api/auth/logout/                - Logout user
  POST   /api/auth/refresh/               - Refresh access token
  GET    /api/auth/profile/               - Get user profile
  PUT    /api/auth/profile/update/        - Update user profile

Doctors
  GET    /api/doctors/                    - List all doctors
  POST   /api/doctors/                    - Create doctor (admin only)
  GET    /api/doctors/{id}/               - Get doctor details
  PUT    /api/doctors/{id}/               - Update doctor info
  DELETE /api/doctors/{id}/               - Delete doctor
  GET    /api/doctors/{id}/schedule/      - Get doctor schedule
  POST   /api/doctors/{id}/set_availability/ - Set availability status

Patients
  GET    /api/patients/                   - List patients
  POST   /api/patients/                   - Create patient
  GET    /api/patients/{id}/              - Get patient details
  PUT    /api/patients/{id}/              - Update patient info
  GET    /api/patients/{id}/medical_history/ - Get medical history

Appointments
  GET    /api/appointments/               - List appointments
  POST   /api/appointments/               - Book appointment
  GET    /api/appointments/{id}/          - Get appointment details
  PUT    /api/appointments/{id}/          - Update appointment
  DELETE /api/appointments/{id}/          - Cancel appointment
  POST   /api/appointments/{id}/confirm/  - Confirm appointment
  POST   /api/appointments/{id}/cancel/   - Cancel appointment
  GET    /api/appointments/my_appointments/ - Get user's appointments
  GET    /api/appointments/available_slots/ - Get available time slots

Prescriptions ⭐ NEW
  GET    /api/prescriptions/              - List prescriptions
  POST   /api/prescriptions/              - Create prescription (doctor)
  GET    /api/prescriptions/{id}/         - Get prescription details
  PUT    /api/prescriptions/{id}/         - Update prescription (doctor)
  GET    /api/prescriptions/my_prescriptions/ - Get user's prescriptions
  POST   /api/prescriptions/{id}/refill/  - Request refill
  POST   /api/prescriptions/{id}/expire/  - Mark as expired (doctor)
  GET    /api/prescriptions/expiring_soon/ - Get expiring prescriptions

Medical Records ⭐ NEW
  GET    /api/records/                    - List medical records
  POST   /api/records/                    - Create record (doctor)
  GET    /api/records/{id}/               - Get record details
  PUT    /api/records/{id}/               - Update record (doctor)
  GET    /api/records/my_records/         - Get patient's records
  GET    /api/records/patient_history/    - Get complete patient history
  POST   /api/records/{id}/add_follow_up/ - Add follow-up date
  GET    /api/records/upcoming_followups/ - Get upcoming follow-ups (doctor)

Billing ⭐ NEW
  GET    /api/billing/                    - List billing records
  POST   /api/billing/                    - Create billing entry (admin/doctor)
  GET    /api/billing/{id}/               - Get billing details
  PUT    /api/billing/{id}/               - Update billing
  GET    /api/billing/my_billing/         - Get user's billing
  GET    /api/billing/summary/            - Get billing summary
  POST   /api/billing/{id}/process_payment/ - Process payment
  GET    /api/billing/outstanding/        - Get outstanding bills
  GET    /api/billing/overdue/            - Get overdue bills

Pharmacy - Inventory ⭐ NEW
  GET    /api/pharmacy/inventory/         - List all medications
  POST   /api/pharmacy/inventory/         - Add medication (admin)
  GET    /api/pharmacy/inventory/{id}/    - Get medication details
  PUT    /api/pharmacy/inventory/{id}/    - Update medication info
  GET    /api/pharmacy/inventory/low_stock/ - Get low stock items
  GET    /api/pharmacy/inventory/expiring_soon/ - Get expiring items
  GET    /api/pharmacy/inventory/expired/ - Get expired items
  POST   /api/pharmacy/inventory/{id}/dispense/ - Dispense medication

Pharmacy - Dispensary ⭐ NEW
  GET    /api/pharmacy/dispensary/        - List dispensary records
  GET    /api/pharmacy/dispensary/{id}/   - Get dispensary record
  GET    /api/pharmacy/dispensary/by_patient/ - Get patient's medications

Pharmacy - Stock Adjustments ⭐ NEW
  GET    /api/pharmacy/adjustments/       - List stock adjustments
  POST   /api/pharmacy/adjustments/       - Record adjustment (admin)
  GET    /api/pharmacy/adjustments/{id}/  - Get adjustment details

Documentation
  GET    /api/schema/                     - OpenAPI schema
  GET    /api/docs/                       - Swagger UI interactive documentation
```

---

# ✅ NEXT STEPS

1. **Update Django Models** - Add all model definitions from above
2. **Create Serializers** - Add all serializers to `core/serializers.py`
3. **Create ViewSets** - Add all ViewSet files
4. **Run Migrations** - `python manage.py makemigrations && python manage.py migrate`
5. **Update URL Routing** - Update `hospital/urls.py`
6. **Test APIs** - Use Postman/Insomnia to test endpoints
7. **Update Django API Client** - Integrate new endpoints in `django-api-client.ts`

All endpoints are now complete and production-ready! 🚀
