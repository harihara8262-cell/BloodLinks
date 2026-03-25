"""
Distance calculation utilities using Haversine formula
"""

import math

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates using Haversine formula
    
    Args:
        lat1, lon1: First coordinate (patient/user)
        lat2, lon2: Second coordinate (donor)
    
    Returns:
        Distance in kilometers
    """
    # Earth's radius in kilometers
    R = 6371.0
    
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Differences
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formula
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    
    # Distance in km
    distance = R * c
    
    return round(distance, 2)

def is_within_radius(distance: float, radius: float) -> bool:
    """
    Check if distance is within search radius
    
    Args:
        distance: Calculated distance in km
        radius: Search radius in km
    
    Returns:
        True if within radius, False otherwise
    """
    return distance <= radius
