# Testing Office Location dengan Postman

## 🚀 Prerequisites

1. **Server berjalan**: `npm start`
2. **Admin user tersedia**: Jalankan `npm run seed:admin` jika belum ada
3. **Postman installed**

## 📋 Step-by-Step Testing

### 1. Login sebagai Admin

**Endpoint**: `POST http://localhost:5000/api/auth/login`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "email": "admin@absensi.com",
  "password": "admin123456"
}
```

**Response**: Copy `accessToken` untuk authorization selanjutnya.

---

### 2. Create Office Location

**Endpoint**: `POST http://localhost:5000/api/office-location`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Body** (raw JSON):
```json
{
  "name": "Kantor Pusat Jakarta",
  "lat": -6.2088,
  "lng": 106.8456,
  "radius": 100
}
```

**Contoh Koordinat Lokasi Indonesia**:
- **Jakarta**: `lat: -6.2088, lng: 106.8456`
- **Bandung**: `lat: -6.9175, lng: 107.6191`
- **Surabaya**: `lat: -7.2575, lng: 112.7521`
- **Yogyakarta**: `lat: -7.7956, lng: 110.3695`

---

### 3. Get All Office Locations

**Endpoint**: `GET http://localhost:5000/api/office-location`

**Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Body**: None (GET request)

---

### 4. Validate Location (Check if within radius)

**Endpoint**: `POST http://localhost:5000/api/office-location/validate`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Body untuk test DALAM radius** (raw JSON):
```json
{
  "lat": -6.2090,
  "lng": 106.8458
}
```

**Body untuk test LUAR radius** (raw JSON):
```json
{
  "lat": -6.2150,
  "lng": 106.8500
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Employee di Kantor (Dalam Radius)
```json
{
  "lat": -6.2088,
  "lng": 106.8456
}
```
**Expected**: `isWithinRadius: true`, `distance: ~0 meters`

### Scenario 2: Employee Dekat Kantor (Masih Dalam Radius)
```json
{
  "lat": -6.2085,
  "lng": 106.8460
}
```
**Expected**: `isWithinRadius: true`, `distance: <100 meters`

### Scenario 3: Employee Jauh dari Kantor (Luar Radius)
```json
{
  "lat": -6.2200,
  "lng": 106.8600
}
```
**Expected**: `isWithinRadius: false`, `distance: >100 meters`

---

## 📱 Cara Mendapatkan Koordinat Real

### Method 1: Google Maps
1. Buka Google Maps
2. Klik kanan pada lokasi
3. Copy koordinat (format: lat, lng)

### Method 2: GPS HP
1. Buka GPS/Maps di HP
2. Share location
3. Copy koordinat dari URL

### Method 3: Online Tools
- https://www.latlong.net/
- https://www.gps-coordinates.net/

---

## 🔄 Full Testing Flow

```bash
# 1. Start server
npm start

# 2. Seed admin (if not done)
npm run seed:admin

# 3. Test sequence in Postman:
POST /api/auth/login          # Get token
POST /api/office-location     # Create office location
GET  /api/office-location     # Verify creation
POST /api/office-location/validate  # Test validation
```

---

## 📊 Expected Response Examples

### Create Office Location Response:
```json
{
  "success": true,
  "message": "Lokasi kantor berhasil dibuat",
  "data": {
    "officeLocation": {
      "_id": "...",
      "name": "Kantor Pusat Jakarta",
      "lat": -6.2088,
      "lng": 106.8456,
      "radius": 100,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

### Validate Location Response (Dalam Radius):
```json
{
  "success": true,
  "data": {
    "isWithinRadius": true,
    "distance": 45.67,
    "officeLocation": {
      "name": "Kantor Pusat Jakarta",
      "radius": 100
    }
  }
}
```

### Validate Location Response (Luar Radius):
```json
{
  "success": true,
  "data": {
    "isWithinRadius": false,
    "distance": 850.23,
    "officeLocation": {
      "name": "Kantor Pusat Jakarta",
      "radius": 100
    }
  }
}
```

---

## ⚠️ Troubleshooting

### Error: "Token tidak ditemukan"
- Pastikan header `Authorization: Bearer TOKEN` sudah benar
- Token mungkin expired, login ulang

### Error: "Lokasi kantor belum dikonfigurasi"
- Buat office location dulu dengan POST `/api/office-location`

### Error: "Validation Error"
- Pastikan lat/lng dalam format number (bukan string)
- Pastikan radius adalah number positif
