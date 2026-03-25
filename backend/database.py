"""
MongoDB database connection and utilities
"""

import motor.motor_asyncio
from datetime import datetime
import os

# MongoDB connection URL (update with your credentials)
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "bloodconnect"

client = None
db = None

async def connect_to_mongo():
    """Connect to MongoDB"""
    global client, db
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Create indexes
        donors_collection = db["donors"]
        await donors_collection.create_index("blood_group")
        await donors_collection.create_index([("location", "2dsphere")])
        
        print("✓ Connected to MongoDB successfully")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("✓ Disconnected from MongoDB")

def get_db():
    """Get database instance"""
    return db

async def get_donors_collection():
    """Get donors collection"""
    return get_db()["donors"]
