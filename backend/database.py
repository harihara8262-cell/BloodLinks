"""
Supabase database connection and utilities
"""

import os
from supabase import create_client, Client
from typing import Optional

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Global Supabase client
supabase_client: Optional[Client] = None

async def connect_to_supabase():
    """Initialize Supabase client"""
    global supabase_client
    try:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables")
        
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        
        # Test connection
        supabase_client.table("donors").select("id").limit(1).execute()
        
        print("✓ Connected to Supabase successfully")
    except Exception as e:
        print(f"✗ Failed to connect to Supabase: {e}")
        raise

async def close_supabase_connection():
    """Close Supabase connection (cleanup if needed)"""
    global supabase_client
    # Supabase client doesn't need explicit closing
    print("✓ Supabase connection closed")

def get_supabase() -> Client:
    """Get Supabase client instance"""
    if supabase_client is None:
        raise RuntimeError("Supabase client not initialized. Call connect_to_supabase() first.")
    return supabase_client
