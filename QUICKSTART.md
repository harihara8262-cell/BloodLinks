# BloodConnect Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Prerequisites Check
```bash
python --version      # Should be 3.8+
node --version        # Should be 16+
npm --version         # Should be 8+
```

### Step 2: Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start MongoDB (in another terminal)
mongod

# Run backend
uvicorn main:app --reload
```
✅ Backend ready at: `http://localhost:8000`

### Step 3: Frontend Setup
```bash
# In new terminal, navigate to frontend
cd frontend

# Install and run
npm install
npm run dev
```
✅ Frontend ready at: `http://localhost:3000`

---

## 🐳 Docker Setup (Alternative)

```bash
# One command to start everything
docker-compose up -d

# Check status
docker ps

# View logs
docker logs bloodconnect-backend
docker logs bloodconnect-mongodb
```

✅ Everything runs in containers!

---

## 📱 Test the Application

### 1. Register a Donor
1. Go to http://localhost:3000
2. Click "Register as Donor"
3. Fill in details
4. Click "Get My Location"
5. Submit

### 2. Search for Donors
1. Click "Find Donors"
2. Browser will ask for location - Allow it
3. Select blood group
4. Click "Search Donors"
5. View results on list or map

### 3. Make a Call
1. Click phone number on any donor card
2. Your default phone app will open

---

## 🧪 API Testing

### Using cURL

**Register Donor:**
```bash
curl -X POST "http://localhost:8000/api/donor/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "9876543210",
    "blood_group": "A+",
    "address": "123 Main St",
    "city": "New York",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "available": true
  }'
```

**Search Donors:**
```bash
curl "http://localhost:8000/api/donor/search?blood=A%2B&lat=40.7128&lng=-74.0060&radius=5"
```

**Get All Donors:**
```bash
curl "http://localhost:8000/api/donor/all"
```

### Using Postman
1. Import or create requests
2. Set method to POST/GET
3. Add URL and body
4. Click Send

### Using Swagger UI
1. Open http://localhost:8000/docs
2. Try out any endpoint
3. Fill in parameters
4. Click Execute

---

## 🆘 Troubleshooting

### Issue: "Connection refused" to MongoDB
```bash
# Mac
brew services start mongodb-community

# Windows
mongod

# Linux
sudo systemctl start mongod
```

### Issue: Port 8000 already in use
```bash
# Change port in main.py or use:
uvicorn main:app --reload --port 8001
```

### Issue: CORS error in browser
- Backend must be running on port 8000
- Frontend on port 3000
- Check that CORS is enabled in main.py

### Issue: Geolocation not working
- Use HTTPS (or localhost for testing)
- Check browser permissions
- Allow location access when prompted

### Issue: Map not showing
- Check internet connection (Leaflet needs tiles)
- Check browser console for errors
- Verify leaflet library is installed

---

## 📊 Database

### Connect to MongoDB directly
```bash
# Local MongoDB
mongosh

# Check databases
show dbs

# Use BloodConnect database
use bloodconnect

# View donors
db.donors.find()

# Count donors
db.donors.countDocuments()
```

### Add Sample Data
```javascript
db.donors.insertMany([
  {
    name: "Arun Kumar",
    phone: "9876543210",
    blood_group: "A+",
    address: "Anna Nagar, Chennai",
    city: "Chennai",
    latitude: 13.0827,
    longitude: 80.2707,
    available: true,
    created_at: new Date()
  },
  {
    name: "Priya Singh",
    phone: "9876543211",
    blood_group: "O+",
    address: "Koramangala, Bangalore",
    city: "Bangalore",
    latitude: 12.9352,
    longitude: 77.6245,
    available: true,
    created_at: new Date()
  }
])
```

---

## 🔄 Workflow

### Development
1. Make code changes
2. Backend auto-reloads (with `--reload`)
3. Frontend hot-reloads
4. Test in browser
5. Push to GitHub

### File Changes
```
bloodconnect/
├── Add new endpoint → backend/routes/
├── Add new component → frontend/src/components/
├── Add new page → frontend/src/pages/
└── Update config → frontend/src/api.js
```

---

## 📦 Production Deployment

### Heroku (Backend)
```bash
heroku create bloodconnect-api
heroku config:set MONGO_URL=<your-mongo-atlas-url>
git push heroku main
```

### Vercel (Frontend)
```bash
vercel
# Follow prompts
# Set REACT_APP_API_URL env variable
```

---

## 🆕 Next Steps

After setup, try:
1. Register 3-4 test donors in different areas
2. Search and find them by blood group
3. Test emergency mode (expand radius)
4. View on map
5. Check MongoDB to see stored data

---

## 💡 Tips

- Use browser DevTools (F12) to debug
- Check Network tab for API calls
- Use VS Code for code editing
- Keep both terminals open (backend + frontend)
- Restart services after config changes

---

## 📞 Need Help?

1. Check README.md for detailed docs
2. Review code comments
3. Check API logs: `http://localhost:8000/docs`
4. Check browser console: F12 → Console tab
5. Check MongoDB: `mongosh` or Atlas UI

---

**Happy Coding! 🚀**
