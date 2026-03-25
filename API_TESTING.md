# BloodConnect - API Testing Guide

## 📝 Complete API Examples

This document shows how to test all BloodConnect API endpoints using different tools.

---

## 🔗 API Base URL

```
http://localhost:8000/api
```

---

## 1️⃣ Register Donor

### Method: POST
### Endpoint: `/donor/register`

### cURL
```bash
curl -X POST "http://localhost:8000/api/donor/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arun Kumar",
    "phone": "9876543210",
    "blood_group": "A+",
    "address": "Anna Nagar, Chennai",
    "city": "Chennai",
    "latitude": 13.0827,
    "longitude": 80.2707,
    "available": true
  }'
```

### JavaScript (Fetch)
```javascript
const response = await fetch('http://localhost:8000/api/donor/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Arun Kumar',
    phone: '9876543210',
    blood_group: 'A+',
    address: 'Anna Nagar, Chennai',
    city: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    available: true
  })
});
const data = await response.json();
console.log(data);
```

### Python (Requests)
```python
import requests

response = requests.post(
    'http://localhost:8000/api/donor/register',
    json={
        'name': 'Arun Kumar',
        'phone': '9876543210',
        'blood_group': 'A+',
        'address': 'Anna Nagar, Chennai',
        'city': 'Chennai',
        'latitude': 13.0827,
        'longitude': 80.2707,
        'available': True
    }
)
print(response.json())
```

### Response
```json
{
  "message": "Donor registered successfully",
  "donor_id": "507f1f77bcf86cd799439011"
}
```

---

## 2️⃣ Search Donors

### Method: GET
### Endpoint: `/donor/search`

### Query Parameters
- `blood` (required): Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional): Search radius in km (default: 5)

### cURL
```bash
curl "http://localhost:8000/api/donor/search?blood=A%2B&lat=13.0827&lng=80.2707&radius=5"
```

### JavaScript (Fetch)
```javascript
const blood = 'A+';
const lat = 13.0827;
const lng = 80.2707;
const radius = 5;

const params = new URLSearchParams({
  blood,
  lat,
  lng,
  radius
});

const response = await fetch(`http://localhost:8000/api/donor/search?${params}`);
const data = await response.json();
console.log(data);
```

### Browser (Direct URL)
```
http://localhost:8000/api/donor/search?blood=A%2B&lat=13.0827&lng=80.2707&radius=5
```

### Response
```json
{
  "blood_group": "A+",
  "search_radius": 5,
  "donors_found": 2,
  "donors": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Arun Kumar",
      "phone": "9876543210",
      "blood_group": "A+",
      "address": "Anna Nagar, Chennai",
      "city": "Chennai",
      "latitude": 13.0827,
      "longitude": 80.2707,
      "available": true,
      "distance": 0.5
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Priya Singh",
      "phone": "9876543211",
      "blood_group": "A+",
      "address": "T Nagar, Chennai",
      "city": "Chennai",
      "latitude": 13.0329,
      "longitude": 80.2385,
      "available": true,
      "distance": 3.2
    }
  ]
}
```

---

## 3️⃣ Emergency Search

### Method: GET
### Endpoint: `/donor/emergency-search`

Auto-expands radius: 5km → 10km → 20km

### cURL
```bash
curl "http://localhost:8000/api/donor/emergency-search?blood=AB%2B&lat=13.0827&lng=80.2707"
```

### JavaScript
```javascript
const response = await fetch(
  'http://localhost:8000/api/donor/emergency-search?blood=AB%2B&lat=13.0827&lng=80.2707'
);
const data = await response.json();
console.log(data);
```

### Response (When no donors in 5km)
```json
{
  "blood_group": "AB+",
  "search_radius": 10,
  "donors_found": 1,
  "message": "No donors in 5km. Expanded search to 10km.",
  "donors": [
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "Rajesh Kumar",
      "phone": "9876543212",
      "blood_group": "AB+",
      "address": "Mylapore, Chennai",
      "city": "Chennai",
      "latitude": 12.9916,
      "longitude": 80.2707,
      "available": true,
      "distance": 8.5
    }
  ]
}
```

---

## 4️⃣ Get All Donors

### Method: GET
### Endpoint: `/donor/all`

### cURL
```bash
curl "http://localhost:8000/api/donor/all"
```

### Browser
```
http://localhost:8000/api/donor/all
```

### Response
```json
{
  "total_donors": 25,
  "donors": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Arun Kumar",
      "phone": "9876543210",
      "blood_group": "A+",
      "address": "Anna Nagar, Chennai",
      "city": "Chennai",
      "latitude": 13.0827,
      "longitude": 80.2707,
      "available": true,
      "created_at": "2024-01-15T10:30:00"
    }
    // ... more donors
  ]
}
```

---

## 5️⃣ Update Donor Status

### Method: PUT
### Endpoint: `/donor/update-status/{donor_id}`

### Query Parameters
- `available` (required): true or false

### cURL
```bash
curl -X PUT "http://localhost:8000/api/donor/update-status/507f1f77bcf86cd799439011?available=false"
```

### JavaScript (Fetch)
```javascript
const donorId = '507f1f77bcf86cd799439011';
const available = false;

const response = await fetch(
  `http://localhost:8000/api/donor/update-status/${donorId}?available=${available}`,
  { method: 'PUT' }
);
const data = await response.json();
console.log(data);
```

### Response
```json
{
  "message": "Donor status updated successfully",
  "donor_id": "507f1f77bcf86cd799439011",
  "available": false
}
```

---

## 6️⃣ Get Single Donor

### Method: GET
### Endpoint: `/donor/donor/{donor_id}`

### cURL
```bash
curl "http://localhost:8000/api/donor/donor/507f1f77bcf86cd799439011"
```

### Response
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Arun Kumar",
  "phone": "9876543210",
  "blood_group": "A+",
  "address": "Anna Nagar, Chennai",
  "city": "Chennai",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "available": true,
  "created_at": "2024-01-15T10:30:00"
}
```

---

## 🧪 Testing Workflow

### 1. Start Fresh
```bash
# Register 3 test donors
curl -X POST "http://localhost:8000/api/donor/register" -H "Content-Type: application/json" -d '{"name": "John Doe", "phone": "9876543210", "blood_group": "O+", "address": "123 Main St", "city": "New York", "latitude": 40.7128, "longitude": -74.0060, "available": true}'

curl -X POST "http://localhost:8000/api/donor/register" -H "Content-Type: application/json" -d '{"name": "Jane Smith", "phone": "9876543211", "blood_group": "A+", "address": "456 Oak Ave", "city": "New York", "latitude": 40.7150, "longitude": -74.0045, "available": true}'

curl -X POST "http://localhost:8000/api/donor/register" -H "Content-Type: application/json" -d '{"name": "Bob Wilson", "phone": "9876543212", "blood_group": "B+", "address": "789 Pine Rd", "city": "New York", "latitude": 40.7200, "longitude": -74.0100, "available": true}'
```

### 2. List All
```bash
curl "http://localhost:8000/api/donor/all"
```

### 3. Search
```bash
curl "http://localhost:8000/api/donor/search?blood=A%2B&lat=40.7128&lng=-74.0060&radius=5"
```

### 4. Get One
```bash
curl "http://localhost:8000/api/donor/donor/{donor_id}"
```

### 5. Update Status
```bash
curl -X PUT "http://localhost:8000/api/donor/update-status/{donor_id}?available=false"
```

---

## 🛠️ Tools for API Testing

### 1. Swagger UI (Built-in)
- Visit: `http://localhost:8000/docs`
- Interactive API explorer
- Try endpoints directly
- No setup needed

### 2. Postman
- Download: https://www.postman.com/downloads/
- Import endpoints
- Save requests
- Create collections
- Automated testing

### 3. VS Code REST Client
```
# Install Extension: REST Client by Huachao Guo

# Create file: test.http

POST http://localhost:8000/api/donor/register
Content-Type: application/json

{
  "name": "Test User",
  "phone": "9876543210",
  "blood_group": "O+",
  "address": "Test Address",
  "city": "Test City",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "available": true
}

###

GET http://localhost:8000/api/donor/all
```

### 4. Thunder Client (VS Code)
- Extension: Thunder Client
- Built-in VS Code
- Similar to Postman
- Lightweight

---

## 📋 Test Cases

### Test 1: Register Donor
```
Input: Valid donor data
Expected: 200 OK + donor_id
Status: ✓
```

### Test 2: Search Existing Blood Group
```
Input: Valid blood group, lat, lng
Expected: 200 OK + list of donors
Status: ✓
```

### Test 3: Search Non-Existing Blood Group
```
Input: "XYZ" (invalid blood group)
Expected: 400 Bad Request
Status: ✓
```

### Test 4: Emergency Search
```
Input: Blood group with no donors in 5km
Expected: 200 OK + expanded radius message
Status: ✓
```

### Test 5: Update Status
```
Input: Valid donor_id, available = false
Expected: 200 OK + confirmation
Status: ✓
```

---

## 🐛 Common Issues & Solutions

### "CORS error"
- Ensure backend running on 8000
- Check CORS origins in main.py

### "404 Not Found"
- Check endpoint spelling
- Verify donor_id exists
- Check HTTP method (GET vs POST)

### "Invalid coordinates"
- Latitude: -90 to 90
- Longitude: -180 to 180

### "Invalid blood group"
- Must be: A+, A-, B+, B-, AB+, AB-, O+, O-

### "No response"
- Check backend status
- Check MongoDB connection
- Check API port: 8000

---

**Happy Testing! 🚀**
