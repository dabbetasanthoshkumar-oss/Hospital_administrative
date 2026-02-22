"""
Supabase client for Python backend
Connects to PostgreSQL via Supabase
"""

from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Validate credentials are loaded
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError(
        'Missing Supabase credentials. '
        'Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY '
        'are set in python/.env'
    )

def get_supabase_client():
    """
    Create and return Supabase client
    Uses SERVICE_ROLE_KEY for full admin access (bypass RLS)
    
    Returns:
        Supabase client instance
    """
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Optionally, create a cached client instance
_client = None

def get_supabase_client_cached():
    """Get or create cached Supabase client"""
    global _client
    if _client is None:
        _client = get_supabase_client()
    return _client
