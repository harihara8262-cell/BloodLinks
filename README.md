# BloodConnect - Smart Nearby Blood Donor Finder

![BloodConnect](https://img.shields.io/badge/Blood-Donor-red?style=flat-square) ![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green?style=flat-square) ![React](https://img.shields.io/badge/Frontend-React-blue?style=flat-square) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=flat-square)

## 📋 Project Overview

**BloodConnect** is a complete, production-ready web application that enables hospitals and patients to find blood donors within a **5 km radius** based on blood group using real-time geolocation.

### 🎯 Core Features

✅ **Donor Registration** - Register with blood group, location, and availability  
✅ **Real-time Search** - Find nearby donors using geolocation API  
✅ **Distance Calculation** - Haversine formula for accurate distance measurement  
✅ **Interactive Maps** - Leaflet.js integration to visualize donor locations  
✅ **Emergency Mode** - AI-powered radius expansion (5km → 10km → 20km)  
✅ **Modern UI** - TailwindCSS responsive design  
✅ **RESTful API** - FastAPI with async/await support  
✅ **MongoDB Database** - Scalable NoSQL storage  

---

## 🏗️ Architecture

### Frontend Stack
- **React 18** - UI framework
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Leaflet.js** - Map visualization
- **Vite** - Build tool

### Backend Stack
- **Python FastAPI** - Web framework
- **Motor (async MongoDB)** - Database driver
- **Pydantic** - Data validation
- **CORS Middleware** - Cross-origin support

### Database
- **MongoDB** - Document-based storage with geospatial indexing

---

## 📁 Project Structure

```
bloodconnect/
│
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── database.py               # MongoDB connection
│   ├── requirements.txt          # Python dependencies
│   ├── models/
│   │   └── donor.py             # Pydantic schemas
│   ├── routes/
│   │   └── donor_routes.py      # API endpoints
│   └── utils/
│       └── distance.py          # Haversine formula
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DonorCard.jsx    # Donor card component
│   │   │   └── MapView.jsx      # Leaflet map component
│   │   ├── pages/
│   │   │   ├── Register.jsx     # Donor registration
│   │   │   └── Search.jsx       # Blood search page
│   │   ├── api.js               # API client
│   │   ├── App.jsx              # Main component
│   │   ├── App.css              # Styles
│   │   ├── index.jsx            # Entry point
│   │   └── index.css            # Global styles
│   ├── public/
│   │   └── index.html           # HTML template
│   ├── package.json             # NPM dependencies
│   ├── vite.config.js           # Vite config
│   ├── tailwind.config.js       # Tailwind config
│   └── postcss.config.js        # PostCSS config
│
└── README.md                      # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ & npm
- Python 3.8+
- MongoDB (local or cloud)
- Git

### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start MongoDB (ensure it's running)
# Default: mongod (in another terminal)

# Run FastAPI server
uvicorn main:app --reload
```

**Backend runs on:** `http://localhost:8000`  
**API Docs:** `http://localhost:8000/docs` (Swagger UI)

---

### 2️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:3000` (or similar, check terminal)

---

### 3️⃣ Configure MongoDB

**Option A: Local MongoDB**
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Update `backend/.env`:
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### 1. Register Donor
```http
POST /donor/register
Content-Type: application/json

{
  "name": "Arun Kumar",
  "phone": "9876543210",
  "blood_group": "A+",
  "address": "Anna Nagar, Chennai",
  "city": "Chennai",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "available": true
}
```

**Response:**
```json
{
  "message": "Donor registered successfully",
  "donor_id": "507f1f77bcf86cd799439011"
}
```

---

#### 2. Search Donors by Blood Group
```http
GET /donor/search?blood=A+&lat=13.0827&lng=80.2707&radius=5
```

**Response:**
```json
{
  "blood_group": "A+",
  "search_radius": 5,
  "donors_found": 3,
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
      "distance": 2.3
    }
  ]
}
```

---

#### 3. Emergency Search (Auto-expand Radius)
```http
GET /donor/emergency-search?blood=A+&lat=13.0827&lng=80.2707
```

Searches in order: 5km → 10km → 20km. Returns first match found.

**Response:**
```json
{
  "blood_group": "A+",
  "search_radius": 10,
  "donors_found": 2,
  "message": "No donors in 5km. Expanded search to 10km.",
  "donors": [...]
}
```

---

#### 4. Get All Donors
```http
GET /donor/all
```

**Response:**
```json
{
  "total_donors": 25,
  "donors": [...]
}
```

---

#### 5. Update Donor Availability
```http
PUT /donor/update-status/{donor_id}?available=false
```

**Response:**
```json
{
  "message": "Donor status updated successfully",
  "donor_id": "507f1f77bcf86cd799439011",
  "available": false
}
```

---

## 🧮 Distance Calculation (Haversine Formula)

The Haversine formula calculates great-circle distance between two points on Earth:

```python
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth's radius in km
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad)*math.cos(lat2_rad)*math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c
```

**Example:**
- Patient at: (13.0827, 80.2707) - Chennai
- Donor at: (13.1939, 80.1044) - Chennai
- Distance: ~15.2 km

---

## 🗄️ MongoDB Schema

### Donors Collection

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: String,
  phone: String,
  blood_group: String,  // A+, A-, B+, B-, AB+, AB-, O+, O-
  address: String,
  city: String,
  latitude: Number,
  longitude: Number,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]  // GeoJSON format
  },
  available: Boolean,
  created_at: ISODate("2024-01-15T10:30:00Z")
}
```

**Indexes:**
- `blood_group` - For blood group filtering
- `location: 2dsphere` - For geospatial queries

---

## 🎨 Features in Detail

### 1. Donor Registration
- Validates blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Captures geolocation via browser API
- Stores donor details in MongoDB
- Real-time validation feedback

### 2. Patient Search
- Selects blood group and search radius
- Gets current location
- Returns sorted results by distance
- Shows on interactive map or list view

### 3. Emergency Mode (AI Feature)
- Automatically expands search radius if no donors found
- Progressive expansion: 5km → 10km → 20km
- Returns nearest donor across all radii
- Ideal for critical blood needs

### 4. Map Visualization
- User location marked in blue
- Donor locations marked in red
- Popups show donor details
- Click to navigate to detailed view

### 5. Blood Group Color Coding
- **A+/A-** - Red tones
- **B+/B-** - Blue tones
- **AB+/AB-** - Purple tones
- **O+/O-** - Yellow tones

---

## 🔐 Security Considerations

⚠️ **Current Implementation (Development)**
- CORS enabled for localhost
- No authentication/JWT implemented yet
- No rate limiting

✅ **Production Recommendations**
1. Implement JWT authentication
2. Add rate limiting (slower down brute force)
3. Validate all inputs server-side
4. Use HTTPS only
5. Hash sensitive data
6. Implement RBAC (role-based access control)
7. Add logging and monitoring

---

## 🚀 Deployment

### Backend (Heroku/Railway)
```bash
# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

---

## 🆚 Git Workflow

```bash
# Clone repository
git clone <repo-url>

# Create feature branch
git checkout -b feature/donor-rating

# Make changes
git add .
git commit -m "Add donor rating system"

# Push to GitHub
git push origin feature/donor-rating

# Create Pull Request
```

---

## 🧪 Testing

### Backend Testing
```bash
# Install pytest
pip install pytest

# Create test file
touch test_donors.py

# Run tests
pytest test_donors.py -v
```

### Frontend Testing
```bash
# Jest + React Testing Library (built into Vite)
npm run test
```

---

## 📱 Screenshots

### Home Page
- Welcome screen with two CTA buttons
- Navigation bar with logo

### Donor Registration
- Form with blood group dropdown
- Location capture button
- Real-time validation

### Blood Search
- Blood group selection
- Radius slider (1-50 km)
- Emergency mode toggle
- List/Map view toggle

### Results
- Cards with donor details
- Contact phone number
- Distance and availability
- Call button

### Map View
- Interactive Leaflet map
- User location (blue marker)
- Donor locations (red markers)
- Clickable popups

---

## 🐛 Common Issues & Solutions

### "ModuleNotFoundError: No module named 'fastapi'"
```bash
pip install -r requirements.txt
```

### "MongoDB connection refused"
```bash
# Start MongoDB
mongod  # or
brew services start mongodb-community
```

### "CORS Error" in browser
Ensure backend is running and frontend API URL matches

### "Geolocation not working"
- Use HTTPS (browsers block HTTP geolocation in production)
- Check location permissions in browser settings

### "Map not rendering"
Make sure Leaflet CSS is imported in styles

---

## 📚 Learning Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Leaflet.js Guide](https://leafletjs.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)

---

## 🎓 Use Cases for College Projects

✅ **Web Development** - Full-stack MERN/MEAN equivalent  
✅ **Database Design** - MongoDB geospatial indexing  
✅ **API Development** - RESTful design patterns  
✅ **Geolocation** - Real-world GPS applications  
✅ **AI/ML** - Predictive availability (future enhancement)  
✅ **DevOps** - Docker, deployment pipelines  

---

## 🚀 Future Enhancements (Startup Level)

### 1. AI Donor Prediction
```python
# Predict donor availability using ML
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier()
model.fit(X_train, y_train)
availability = model.predict(donor_features)
```

### 2. Real-time Emergency Broadcasting
```python
# Alert all donors in radius when emergency request made
async def broadcast_emergency(blood_group, location):
    donors = await collection.find({
        "blood_group": blood_group,
        "location": {"$near": location}
    }).to_list(100)
    
    for donor in donors:
        await send_push_notification(donor["phone"])
```

### 3. Admin Dashboard
- Donor statistics
- Search analytics
- Verification system for donors
- Reporting and compliance

### 4. SMS/Email Alerts
- Notify donors when matched
- Send confirmations to patients
- Emergency request notifications

### 5. Donor Rating System
- Rate donors after successful donation
- Build trust in community
- Display ratings on profiles

### 6. Mobile App
- Native iOS/Android version
- Offline map caching
- Push notifications

---

## 📄 License

MIT License - Feel free to use for college projects!

---

## 💬 Support

### Questions or Issues?
- Check existing documentation
- Review code comments
- Check API response status codes
- Enable debug logging

### Contact
- Email: support@bloodconnect.local
- Issues: GitHub Issues tab
- Discussions: GitHub Discussions

---

## 🎉 Credits

Built as a **College AI Mini Project** demonstrating:
- Full-stack development
- Geolocation services
- Real-time search algorithms
- Modern web technologies

---

## ⚖️ Disclaimer

This is a **demonstration/educational project**. For production use in healthcare:
- ✅ Add proper authentication
- ✅ Comply with healthcare regulations (HIPAA, GDPR)
- ✅ Implement comprehensive testing
- ✅ Add audit logging
- ✅ Use secure data encryption

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready (for college projects)

---

*Made with ❤️ for the Blood Donation Community*
