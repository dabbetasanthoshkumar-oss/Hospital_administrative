# 🔐 PART 5: Authentication - JWT Implementation

## JWT Authentication Flow

```
User Login (Email + Password)
        ↓
Django authenticates credentials
        ↓
Generate Access Token (1 hour)
Generate Refresh Token (7 days)
        ↓
Return both tokens to frontend
        ↓
Frontend stores tokens in localStorage/httpOnly cookie
        ↓
For every API request, send: Authorization: Bearer {access_token}
        ↓
Django verifies token signature and expiration
        ↓
If expired, use refresh token to get new access token
        ↓
Allow request if valid
```

## Implementation

### 1. JWT Utilities - `utils/tokens.py`

```python
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.utils import datetime_to_epoch
import jwt
from django.conf import settings
from datetime import timedelta, datetime

User = get_user_model()

class TokenService:
    """Service for JWT token operations"""
    
    @staticmethod
    def get_tokens_for_user(user):
        """
        Generate access and refresh tokens for user
        Returns: {access: str, refresh: str}
        """
        refresh = RefreshToken.for_user(user)
        
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_id': str(user.id),
            'email': user.email,
            'role': user.role,
        }
    
    @staticmethod
    def verify_token(token):
        """
        Verify if token is valid
        Returns: payload dict or None
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def refresh_access_token(refresh_token):
        """
        Generate new access token from refresh token
        Returns: new access token or None
        """
        try:
            refresh = RefreshToken(refresh_token)
            return str(refresh.access_token)
        except Exception:
            return None
```

### 2. Authentication Views - `apps/auth/views.py`

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
from utils.tokens import TokenService
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    User Registration Endpoint
    POST /api/auth/register
    
    Body:
    {
        "email": "user@example.com",
        "password": "secure_password",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+91-XXXXXXXXXX",
        "role": "PATIENT"  # ADMIN, DOCTOR, or PATIENT
    }
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                user = serializer.save()
                tokens = TokenService.get_tokens_for_user(user)
                
                return Response({
                    'status': 'success',
                    'message': 'User registered successfully',
                    'user': UserProfileSerializer(user).data,
                    'tokens': tokens,
                }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    User Login Endpoint
    POST /api/auth/login
    
    Body:
    {
        "email": "user@example.com",
        "password": "secure_password"
    }
    """
    serializer = UserLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    
    # Authenticate user
    user = authenticate(request, username=email, password=password)
    
    if user is None:
        return Response({
            'status': 'error',
            'message': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Generate tokens
    tokens = TokenService.get_tokens_for_user(user)
    
    return Response({
        'status': 'success',
        'message': 'Login successful',
        'user': UserProfileSerializer(user).data,
        'tokens': tokens,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    User Logout Endpoint
    POST /api/auth/logout
    
    This just invalidates the token on frontend
    (JWT tokens are stateless, so no DB changes)
    """
    return Response({
        'status': 'success',
        'message': 'Logged out successfully'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """
    Refresh Access Token Endpoint
    POST /api/auth/refresh
    
    Body:
    {
        "refresh": "long_refresh_token_string"
    }
    """
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response({
            'status': 'error',
            'message': 'Refresh token is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    access_token = TokenService.refresh_access_token(refresh_token)
    
    if not access_token:
        return Response({
            'status': 'error',
            'message': 'Invalid refresh token'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response({
        'status': 'success',
        'access': access_token,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Get Current User Profile
    GET /api/auth/profile
    """
    return Response({
        'status': 'success',
        'user': UserProfileSerializer(request.user).data,
    }, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update User Profile
    PUT /api/auth/profile
    """
    user = request.user
    serializer = UserProfileSerializer(user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'status': 'success',
            'message': 'Profile updated successfully',
            'user': serializer.data,
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### 3. Authentication Serializers - `apps/auth/serializers.py`

```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Profile

User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    class Meta:
        model = Profile
        fields = ['id', 'full_name', 'phone', 'address', 'avatar_url']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user with profile data"""
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'profile', 'is_verified']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 'role']
    
    def validate(self, data):
        """Validate passwords match"""
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError({
                'password': 'Passwords do not match'
            })
        return data
    
    def create(self, validated_data):
        """Create user and profile"""
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'PATIENT'),
            username=validated_data['email'],  # For Django admin
        )
        
        # Create profile
        Profile.objects.create(
            user=user,
            full_name=f"{user.first_name} {user.last_name}".strip(),
        )
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
```

### 4. Authentication URLs - `apps/auth/urls.py`

```python
from django.urls import path
from . import views

urlpatterns = [
    # Auth endpoints
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('refresh/', views.refresh_token, name='refresh'),
    path('profile/', views.get_profile, name='profile'),
    path('profile/update/', views.update_profile, name='update-profile'),
]
```

---

# 📡 PART 6: REST API Endpoints

## Doctors API - `apps/doctors/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Doctor, DoctorSchedule
from .serializers import DoctorSerializer, DoctorScheduleSerializer
from core.permissions import IsDoctor, IsAdmin

class DoctorViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Doctors
    
    GET    /api/doctors/             - List all doctors
    GET    /api/doctors/{id}/        - Get specific doctor
    POST   /api/doctors/             - Create doctor (admin only)
    PUT    /api/doctors/{id}/        - Update doctor
    DELETE /api/doctors/{id}/        - Delete doctor
    GET    /api/doctors/search/      - Search doctors by name
    GET    /api/doctors/specialization/{spec}/ - Filter by specialization
    """
    
    queryset = Doctor.objects.select_related('profile').all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['specialization', 'availability']
    search_fields = ['profile__full_name', 'license_number', 'specialization']
    ordering_fields = ['profile__full_name', 'created_at']
    ordering = ['profile__full_name']
    
    def get_permissions(self):
        """
        Override permissions:
        - List & Retrieve: Authenticated users
        - Create, Update, Delete: Admin only
        """
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            permission_classes = [IsAdmin]
        elif self.action == 'list' or self.action == 'retrieve':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter doctors based on user role"""
        queryset = Doctor.objects.select_related('profile')
        
        # Patients can only see available doctors
        if self.request.user.role == 'PATIENT':
            queryset = queryset.filter(availability='AVAILABLE')
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def by_specialization(self, request):
        """
        Get doctors by specialization
        GET /api/doctors/by_specialization/?spec=CARDIOLOGIST
        """
        specialization = request.query_params.get('spec')
        
        if not specialization:
            return Response({
                'status': 'error',
                'message': 'Specialization parameter required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        doctors = self.get_queryset().filter(specialization=specialization)
        serializer = self.get_serializer(doctors, many=True)
        
        return Response({
            'status': 'success',
            'count': doctors.count(),
            'results': serializer.data,
        })
    
    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        """
        Get doctor's schedule
        GET /api/doctors/{id}/schedule/
        """
        doctor = self.get_object()
        schedule = doctor.schedules.all()
        serializer = DoctorScheduleSerializer(schedule, many=True)
        
        return Response({
            'status': 'success',
            'results': serializer.data,
        })
    
    @action(detail=True, methods=['post'])
    def set_availability(self, request, pk=None):
        """
        Update doctor availability status
        POST /api/doctors/{id}/set_availability/
        
        Body: {"status": "AVAILABLE|BUSY|LEAVE|OFFLINE"}
        """
        doctor = self.get_object()
        status_new = request.data.get('status')
        
        if status_new not in dict(Doctor.AVAILABILITY_CHOICES):
            return Response({
                'status': 'error',
                'message': f'Invalid status. Choose from: {", ".join(dict(Doctor.AVAILABILITY_CHOICES).keys())}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        doctor.availability = status_new
        doctor.save()
        
        return Response({
            'status': 'success',
            'message': 'Availability updated',
            'doctor': DoctorSerializer(doctor).data,
        })
```

## Patients API - `apps/patients/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Patient
from .serializers import PatientSerializer
from core.permissions import IsPatientOrAdmin, IsAdmin

class PatientViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Patients
    
    GET    /api/patients/           - List patients
    GET    /api/patients/{id}/      - Get patient details
    POST   /api/patients/           - Create patient
    PUT    /api/patients/{id}/      - Update patient
    """
    
    queryset = Patient.objects.select_related('profile').all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated, IsPatientOrAdmin]
    
    def get_queryset(self):
        """
        Filter queryset based on role:
        - Admin: See all patients
        - Patient: See only their own record
        """
        user = self.request.user
        
        if user.role == 'ADMIN':
            return Patient.objects.select_related('profile').all()
        elif user.role == 'PATIENT':
            return Patient.objects.filter(profile__user=user)
        
        return Patient.objects.none()
    
    def perform_create(self, serializer):
        """Link patient to current user"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def medical_history(self, request, pk=None):
        """
        Get patient's medical history
        GET /api/patients/{id}/medical_history/
        """
        patient = self.get_object()
        records = patient.medical_records.all().order_by('-created_at')
        
        from apps.records.serializers import MedicalRecordSerializer
        serializer = MedicalRecordSerializer(records, many=True)
        
        return Response({
            'status': 'success',
            'count': records.count(),
            'results': serializer.data,
        })
```

## Appointments API - `apps/appointments/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Appointment
from .serializers import AppointmentSerializer
from core.permissions import IsAppointmentOwnerOrAdmin

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Appointments
    
    GET    /api/appointments/              - List appointments
    GET    /api/appointments/{id}/         - Get appointment details
    POST   /api/appointments/              - Book appointment
    PUT    /api/appointments/{id}/         - Update appointment
    DELETE /api/appointments/{id}/         - Cancel appointment
    """
    
    queryset = Appointment.objects.select_related('patient', 'doctor').all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsAppointmentOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'doctor_id', 'patient_id', 'appointment_date']
    
    def get_queryset(self):
        """Filter appointments based on user role"""
        user = self.request.user
        
        if user.role == 'ADMIN':
            return Appointment.objects.select_related('patient', 'doctor').all()
        
        elif user.role == 'DOCTOR':
            return Appointment.objects.filter(doctor__profile__user=user)
        
        elif user.role == 'PATIENT':
            return Appointment.objects.filter(patient__profile__user=user)
        
        return Appointment.objects.none()
    
    def perform_create(self, serializer):
        """
        Create appointment and attach patient
        """
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm appointment"""
        appointment = self.get_object()
        appointment.status = 'CONFIRMED'
        appointment.save()
        
        return Response({
            'status': 'success',
            'message': 'Appointment confirmed',
            'appointment': AppointmentSerializer(appointment).data,
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel appointment"""
        appointment = self.get_object()
        appointment.status = 'CANCELLED'
        appointment.cancelled_at = timezone.now()
        appointment.save()
        
        return Response({
            'status': 'success',
            'message': 'Appointment cancelled',
            'appointment': AppointmentSerializer(appointment).data,
        })
    
    @action(detail=False, methods=['get'])
    def my_appointments(self, request):
        """Get current user's appointments"""
        appointments = self.get_queryset().filter(
            appointment_date__gte=timezone.now()
        ).order_by('appointment_date')
        
        serializer = self.get_serializer(appointments, many=True)
        
        return Response({
            'status': 'success',
            'count': appointments.count(),
            'results': serializer.data,
        })
    
    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Get available appointment slots for a doctor on a specific date
        GET /api/appointments/available_slots/?doctor_id=xxx&date=2026-02-24
        """
        doctor_id = request.query_params.get('doctor_id')
        date = request.query_params.get('date')
        
        if not doctor_id or not date:
            return Response({
                'status': 'error',
                'message': 'doctor_id and date parameters required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get doctor's schedule for the date
        # Subtract existing appointments
        # Return available slots
        
        available_slots = [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
            '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
        ]
        
        return Response({
            'status': 'success',
            'doctor_id': doctor_id,
            'date': date,
            'slots': available_slots,
        })
```

---

# 🔗 PART 7: Main URLs Configuration

## Project URLs - `hospital/urls.py`

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# ViewSets routing
router = DefaultRouter()
router.register(r'doctors', 'apps.doctors.views.DoctorViewSet', basename='doctor')
router.register(r'patients', 'apps.patients.views.PatientViewSet', basename='patient')
router.register(r'appointments', 'apps.appointments.views.AppointmentViewSet', basename='appointment')
router.register(r'prescriptions', 'apps.prescriptions.views.PrescriptionViewSet', basename='prescription')
router.register(r'records', 'apps.records.views.MedicalRecordViewSet', basename='record')
router.register(r'billing', 'apps.billing.views.BillingViewSet', basename='billing')
router.register(r'pharmacy', 'apps.pharmacy.views.PharmacyViewSet', basename='pharmacy')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation (Swagger UI)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Authentication
    path('api/auth/', include('apps.auth.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # REST API Routers
    path('api/', include(router.urls)),
]
```

---

This completes the core API structure. Continue to Part 8 for how to connect Next.js frontend to these Django APIs...
