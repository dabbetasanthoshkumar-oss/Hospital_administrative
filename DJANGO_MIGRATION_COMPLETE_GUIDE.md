# 🏥 Hospital Management System - Next.js to Django Migration Guide

**Project:** HOPI SYNC - St. Aesculapius Medical Center  
**Current State:** Next.js frontend + Next.js API routes + PostgreSQL  
**Target State:** Next.js frontend + Django backend + PostgreSQL  
**Date:** February 23, 2026

---

## 📋 Table of Contents

1. [Architecture Migration Overview](#architecture-migration-overview)
2. [Complete Django Project Structure](#complete-django-project-structure)
3. [Prisma to Django Models Migration](#prisma-to-django-models-migration)
4. [Django Installation & Setup](#django-installation--setup)
5. [Authentication: JWT Implementation](#authentication-jwt-implementation)
6. [API Endpoints (REST Framework)](#api-endpoints-rest-framework)
7. [Environment Configuration](#environment-configuration)
8. [Connecting Next.js to Django](#connecting-nextjs-to-django)
9. [Database Migration Strategy](#database-migration-strategy)
10. [Deployment Strategy](#deployment-strategy)
11. [Security Best Practices](#security-best-practices)
12. [Testing & Documentation](#testing--documentation)

---

# 🏗️ PART 1: Architecture Migration Overview

## Current Architecture (Before)

```
┌────────────────────────────────┐
│    Browser / Next.js App       │
│  (localhost:3000)              │
└────────────┬───────────────────┘
             │
             │ HTTP Requests
             ↓
┌────────────────────────────────┐
│   Next.js API Routes           │
│  /api/doctors                  │
│  /api/patients                 │
│  /api/appointments             │
│  /api/auth                     │
└────────────┬───────────────────┘
             │
             │ Database Queries
             ↓
┌────────────────────────────────┐
│   PostgreSQL (Supabase)        │
│   - doctors table              │
│   - patients table             │
│   - appointments table         │
│   - prescriptions table        │
└────────────────────────────────┘
```

## New Architecture (After)

```
┌────────────────────────────────┐
│    Browser / Next.js App       │
│  (localhost:3000)              │
│  - Same color theme ✓          │
│  - Same UI/UX ✓                │
│  - No changes ✓                │
└────────────┬───────────────────┘
             │
             │ HTTP REST API Calls
             │ (using fetch or axios)
             ↓
┌────────────────────────────────┐
│   Django REST Framework        │
│  (localhost:8000)              │
│  - /api/doctors/               │
│  - /api/patients/              │
│  - /api/appointments/          │
│  - /api/auth/                  │
│  - JWT Authentication          │
└────────────┬───────────────────┘
             │
             │ Django ORM Queries
             ↓
┌────────────────────────────────┐
│   PostgreSQL (Supabase)        │
│   (Same schema, same data)     │
└────────────────────────────────┘
```

## Benefits of This Migration

✅ **Separation of Concerns** - Backend and frontend are independent  
✅ **Scalability** - Can scale backend separately  
✅ **Flexibility** - Can use different tech for backend  
✅ **Team Structure** - Backend team can work independently  
✅ **Cloud Deployment** - Easy to deploy on different platforms  
✅ **AI Integration Ready** - Perfect for adding ML/AI services  
✅ **Production-Grade** - Django is battle-tested for production  

## Migration Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | Day 1 | Set up Django project, models, and database |
| **Phase 2** | Day 2 | Implement JWT authentication |
| **Phase 3** | Day 2 | Create all REST API endpoints |
| **Phase 4** | Day 1 | Test all APIs with Postman |
| **Phase 5** | Day 1 | Update Next.js to use Django APIs |
| **Phase 6** | Day 1 | Deploy backend to production |
| **Phase 7** | Day 1 | Final testing and monitoring |

---

# 📁 PART 2: Complete Django Project Structure

## Recommended Folder Structure

```
hospital-backend/                          ← New Django project folder
├── hospital/                               ← Main Django project
│   ├── __init__.py
│   ├── settings.py                         ← Configuration (DATABASE, INSTALLED_APPS, etc)
│   ├── urls.py                             ← Main URL router
│   ├── asgi.py                             ← ASGI config (async)
│   └── wsgi.py                             ← WSGI config (production)
│
├── apps/                                   ← Django applications (modular)
│   ├── __init__.py
│   ├── auth/                               ← Authentication app
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                       ← User, Profile models
│   │   ├── serializers.py                  ← DRF serializers for API
│   │   ├── views.py                        ← Authentication endpoints
│   │   ├── urls.py                         ← Auth routes
│   │   └── utils.py                        ← JWT token utils
│   │
│   ├── doctors/                            ← Doctors app
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                       ← Doctor model
│   │   ├── serializers.py                  ← Doctor serializers
│   │   ├── views.py                        ← Doctor endpoints
│   │   ├── urls.py                         ← Doctor routes
│   │   └── filters.py                      ← Search & filter logic
│   │
│   ├── patients/                           ← Patients app
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                       ← Patient model
│   │   ├── serializers.py                  ← Patient serializers
│   │   ├── views.py                        ← Patient endpoints
│   │   ├── urls.py                         ← Patient routes
│   │   └── permissions.py                  ← Patient-specific permissions
│   │
│   ├── appointments/                       ← Appointments app
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                       ← Appointment, Schedule models
│   │   ├── serializers.py                  ← Appointment serializers
│   │   ├── views.py                        ← Appointment endpoints
│   │   ├── urls.py                         ← Appointment routes
│   │   └── validators.py                   ← Business logic validators
│   │
│   ├── prescriptions/                      ← Prescriptions app
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                       ← Prescription model
│   │   ├── serializers.py                  ← Prescription serializers
│   │   ├── views.py                        ← Prescription endpoints
│   │   └── urls.py                         ← Prescription routes
│   │
│   ├── billing/                            ← Billing app
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                       ← Bill, Payment models
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── pharmacy/                           ← Pharmacy app
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                       ← Inventory model
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── records/                            ← Medical Records app
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                       ← MedicalRecord model
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   └── audit/                              ← Audit app (activity logging)
│       ├── migrations/
│       ├── __init__.py
│       ├── models.py                       ← AuditLog model
│       ├── signals.py                      ← Auto-log changes
│       └── views.py
│
├── core/                                   ← Shared utilities
│   ├── __init__.py
│   ├── permissions.py                      ← Role-based permissions
│   ├── pagination.py                       ← Custom pagination
│   ├── exceptions.py                       ← Custom exceptions
│   ├── serializers.py                      ← Base serializers
│   └── decorators.py                       ← Custom decorators
│
├── utils/                                  ← Helper utilities
│   ├── __init__.py
│   ├── tokens.py                           ← JWT token generation
│   ├── email.py                            ← Email sending
│   ├── cache.py                            ← Caching logic
│   └── logging.py                          ← Logging setup
│
├── tests/                                  ← Test files
│   ├── __init__.py
│   ├── test_auth.py                        ← Auth tests
│   ├── test_doctors.py                     ← Doctor tests
│   ├── test_appointments.py                ← Appointment tests
│   └── conftest.py                         ← Test configuration
│
├── manage.py                               ← Django management script
├── requirements.txt                        ← Python dependencies
├── .env                                    ← Environment variables
├── .env.example                            ← Example env file (for git)
├── Dockerfile                              ← Docker container config
├── docker-compose.yml                      ← Docker compose config
├── README.md                               ← Project documentation
└── wsgi_entry.py                           ← Production WSGI entry


# Next.js Frontend (Keep as-is, no changes needed)
../hospital-admin/                          ← Existing Next.js project
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── api-client.ts                   ← UPDATE: Point to Django API
│   │   └── [existing files...]
│   └── [existing files...]
└── [existing files...]
```

---

# 📊 PART 3: Prisma to Django Models Migration

## Your Current Prisma Schema

Let me analyze your current schema based on the structure:

```prisma
// From your schema.sql (converted to Prisma syntax)
model User {
  id String @id @default(cuid())
  email String @unique
  password_hash String
  role Role // ADMIN, DOCTOR, PATIENT
  profile Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Profile {
  id String @id @default(cuid())
  userId String @unique
  user User @relation(fields: [userId], references: [id])
  full_name String
  phone String?
  address String?
  avatar_url String?
  createdAt DateTime @default(now())
}

model Doctor {
  id String @id @default(cuid())
  profile_id String @unique
  profile Profile @relation(fields: [profile_id], references: [id])
  specialization String
  license_number String @unique
  bio String?
  availability String
  appointments Appointment[]
  prescriptions Prescription[]
  createdAt DateTime @default(now())
}

model Patient {
  id String @id @default(cuid())
  profile_id String @unique
  profile Profile @relation(fields: [profile_id], references: [id])
  medical_history String?
  allergies String?
  blood_group String?
  appointments Appointment[]
  medical_records MedicalRecord[]
  createdAt DateTime @default(now())
}

model Appointment {
  id String @id @default(cuid())
  patient_id String
  doctor_id String
  appointment_date DateTime
  status String // SCHEDULED, COMPLETED, CANCELLED
  notes String?
  patient Patient @relation(fields: [patient_id], references: [id])
  doctor Doctor @relation(fields: [doctor_id], references: [id])
  medical_record MedicalRecord?
  createdAt DateTime @default(now())
}

model MedicalRecord {
  id String @id @default(cuid())
  appointment_id String @unique
  patient_id String
  doctor_id String
  diagnosis String
  notes String?
  prescription_text String?
  appointment Appointment @relation(fields: [appointment_id], references: [id])
  patient Patient @relation(fields: [patient_id], references: [id])
  doctor Doctor @relation(fields: [doctor_id], references: [id])
  createdAt DateTime @default(now())
}

model Prescription {
  id String @id @default(cuid())
  medical_record_id String
  doctor_id String
  medication String
  dosage String
  frequency String
  duration String
  doctor Doctor @relation(fields: [doctor_id], references: [id])
  createdAt DateTime @default(now())
}
```

## Django Models (Equivalent)

### 1. Auth App - `apps/auth/models.py`

```python
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import URLValidator
import uuid

class CustomUser(AbstractUser):
    """
    Extended User model with role-based access control
    Replaces Django's default User model
    """
    ROLE_CHOICES = [
        ('ADMIN', 'Administrator'),
        ('DOCTOR', 'Doctor'),
        ('PATIENT', 'Patient'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='PATIENT')
    password_hash = models.CharField(max_length=255, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # For createsuperuser
    
    class Meta:
        db_table = 'auth_user'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


class Profile(models.Model):
    """
    Extended user profile information
    Linked one-to-one with CustomUser
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    avatar_url = models.URLField(null=True, blank=True, validators=[URLValidator()])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'profile'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} ({self.user.email})"
```

### 2. Doctors App - `apps/doctors/models.py`

```python
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from hospital.apps.auth.models import Profile
import uuid

class Doctor(models.Model):
    """
    Doctor information and details
    Linked to Profile through one-to-one relationship
    """
    SPECIALIZATION_CHOICES = [
        ('CARDIOLOGIST', 'Cardiology'),
        ('NEUROLOGIST', 'Neurology'),
        ('PEDIATRICIAN', 'Pediatrics'),
        ('SURGEON', 'Surgery'),
        ('DERMATOLOGIST', 'Dermatology'),
        ('ORTHOPEDIST', 'Orthopedics'),
        ('PSYCHIATRIST', 'Psychiatry'),
        ('GENERAL', 'General Practice'),
    ]
    
    AVAILABILITY_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('BUSY', 'Busy'),
        ('LEAVE', 'On Leave'),
        ('OFFLINE', 'Offline'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name='doctor')
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    license_number = models.CharField(max_length=50, unique=True)
    bio = models.TextField(null=True, blank=True)
    availability = models.CharField(
        max_length=20, 
        choices=AVAILABILITY_CHOICES, 
        default='OFFLINE'
    )
    
    # Optional fields for additional info
    years_of_experience = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(70)],
        null=True, blank=True
    )
    consultation_fee = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'doctor'
        ordering = ['profile__full_name']
        indexes = [
            models.Index(fields=['specialization']),
            models.Index(fields=['availability']),
        ]
    
    def __str__(self):
        return f"Dr. {self.profile.full_name} ({self.get_specialization_display()})"


class DoctorSchedule(models.Model):
    """
    Doctor availability schedule
    Manages working hours and days off
    """
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'doctor_schedule'
        unique_together = ['doctor', 'day_of_week']
    
    def __str__(self):
        return f"{self.doctor.profile.full_name} - {self.get_day_of_week_display()}"
```

### 3. Patients App - `apps/patients/models.py`

```python
from django.db import models
from hospital.apps.auth.models import Profile
import uuid

class Patient(models.Model):
    """
    Patient information and medical history
    Linked to Profile through one-to-one relationship
    """
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name='patient')
    medical_history = models.TextField(null=True, blank=True)
    allergies = models.TextField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, null=True, blank=True)
    emergency_contact = models.CharField(max_length=255, null=True, blank=True)
    insurance_provider = models.CharField(max_length=255, null=True, blank=True)
    insurance_policy_number = models.CharField(max_length=100, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'patient'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Patient: {self.profile.full_name}"
```

### 4. Appointments App - `apps/appointments/models.py`

```python
from django.db import models
from django.core.exceptions import ValidationError
from hospital.apps.doctors.models import Doctor
from hospital.apps.patients.models import Patient
import uuid

class Appointment(models.Model):
    """
    Appointment between Doctor and Patient
    Tracks status and notes
    """
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('CONFIRMED', 'Confirmed'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('NO_SHOW', 'No Show'),
        ('RESCHEDULED', 'Rescheduled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    reason_for_visit = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'appointment'
        ordering = ['-appointment_date']
        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['doctor_id']),
            models.Index(fields=['status']),
            models.Index(fields=['appointment_date']),
        ]
    
    def clean(self):
        """Validate appointment details"""
        if self.appointment_date < timezone.now():
            raise ValidationError("Appointment date cannot be in the past")
    
    def __str__(self):
        return f"Appointment: {self.patient.profile.full_name} with Dr. {self.doctor.profile.full_name}"
```

### 5. Records App - `apps/records/models.py`

```python
from django.db import models
from hospital.apps.doctors.models import Doctor
from hospital.apps.patients.models import Patient
from hospital.apps.appointments.models import Appointment
import uuid

class MedicalRecord(models.Model):
    """
    Medical record created after appointment
    Contains diagnosis, notes, and prescriptions
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='medical_record')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='medical_records')
    
    diagnosis = models.TextField()
    clinical_notes = models.TextField(null=True, blank=True)
    prescription_text = models.TextField(null=True, blank=True)
    
    # Follow-up information
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateTimeField(null=True, blank=True)
    follow_up_notes = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'medical_record'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Medical Record: {self.patient.profile.full_name} - {self.created_at.date()}"
```

### 6. Prescriptions App - `apps/prescriptions/models.py`

```python
from django.db import models
from django.core.validators import MinValueValidator
from hospital.apps.doctors.models import Doctor
from hospital.apps.records.models import MedicalRecord
import uuid

class Prescription(models.Model):
    """
    Prescription issued by doctor
    Contains medication details
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(
        MedicalRecord, 
        on_delete=models.CASCADE, 
        related_name='prescriptions'
    )
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions')
    
    medication_name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)  # e.g., "500mg"
    frequency = models.CharField(max_length=100)  # e.g., "3 times daily"
    duration_days = models.IntegerField(validators=[MinValueValidator(1)])
    instructions = models.TextField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'prescription'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.medication_name} - {self.dosage}"
```

---

# ⚙️ PART 4: Django Installation & Setup

## Step 1: Create Django Project

```bash
# Create project directory
mkdir hospital-backend
cd hospital-backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

# On Windows CMD:
venv\Scripts\activate.bat

# On Mac/Linux:
source venv/bin/activate
```

## Step 2: Install Django & Dependencies

```bash
# Create requirements.txt
cat > requirements.txt << 'EOF'
# Web Framework
Django==4.2.9
djangorestframework==3.14.0
django-cors-headers==4.3.1

# Database & ORM
psycopg2-binary==2.9.9
django-extensions==3.2.3

# Authentication & JWT
djangorestframework-simplejwt==5.3.2
python-decouple==3.8

# Security
django-ratelimit==4.1.0
django-guardian==2.4.0

# Utilities
python-dateutil==2.8.2
pytz==2023.3

# Development & Testing
pytest==7.4.3
pytest-django==4.7.0
black==23.12.0
flake8==6.1.0
isort==5.13.2

# Production
gunicorn==21.2.0
whitenoise==6.6.0
dj-database-url==2.1.0

# Caching
redis==5.0.1

# Email
django-anymail==10.0

# API Documentation
drf-spectacular==0.26.5

# Monitoring & Logging
django-debug-toolbar==4.2.0
sentry-sdk==1.40.0
EOF

# Install all packages
pip install -r requirements.txt
```

## Step 3: Create Django Project Structure

```bash
# Create Django project
django-admin startproject hospital .

# Create Django apps
python manage.py startapp auth
python manage.py startapp doctors
python manage.py startapp patients
python manage.py startapp appointments
python manage.py startapp prescriptions
python manage.py startapp records
python manage.py startapp billing
python manage.py startapp pharmacy
python manage.py startapp audit
python manage.py startapp core

# Create project directories
mkdir apps
mkdir utils
mkdir tests
mkdir core

# Reorganize apps into apps folder
mv auth apps/
mv doctors apps/
mv patients apps/
mv appointments apps/
mv prescriptions apps/
mv records apps/
mv billing apps/
mv pharmacy apps/
mv audit apps/
mv core apps/
```

## Step 4: Update settings.py

```python
# hospital/settings.py

import os
from pathlib import Path
from decouple import config, Csv
from datetime import timedelta

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = config('SECRET_KEY', default='django-insecure-dev-key-change-in-production')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# Installed apps
INSTALLED_APPS = [
    'daphne',  # ASGI server
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'corsheaders',
    'django_extensions',
    'drf_spectacular',
    'django_filters',
    'rest_framework_simplejwt',
    
    # Project apps
    'apps.auth',
    'apps.doctors',
    'apps.patients',
    'apps.appointments',
    'apps.prescriptions',
    'apps.records',
    'apps.billing',
    'apps.pharmacy',
    'apps.audit',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'hospital.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'hospital.wsgi.application'
ASGI_APPLICATION = 'hospital.asgi.application'

# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='hospital_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Custom User Model
AUTH_USER_MODEL = 'auth.CustomUser'

# Password Validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static Files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media Files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default Primary Key Field Type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Configuration (Allow Next.js frontend)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

CORS_ALLOW_CREDENTIALS = True

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFY_SIGNATURE': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'DEBUG',
    },
}
```

---

This is Part 1 of the migration guide. Let me create Part 2 covering JWT Authentication and REST APIs...

