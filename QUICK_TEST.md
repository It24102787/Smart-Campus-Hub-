# Quick Authentication Testing Guide

## ✅ Login Test Credentials

| Email | Password | Role |
|-------|----------|------|
| `test@gmail.com` | `password123` | Student |
| `admin@campus.com` | `admin123` | Admin |
| `student@campus.com` | `student123` | Student |

## 🚀 Quick Start

### 1. Start MongoDB
```bash
mongod
```

### 2. Start Backend
```bash
cd C:\Users\ADMIN\OneDrive\Desktop\ITP\academic-support-portal
.\mvnw.cmd spring-boot:run
```
✓ Backend will be available at `http://localhost:8080`

### 3. Start Frontend
```bash
cd frontend
npm install  # Only if you haven't done this
npm run dev
```
✓ Frontend will be available at `http://localhost:5173`

## 🧪 Test Login in Browser

1. Navigate to `http://localhost:5173`
2. Click "Sign In"
3. Enter:
   - Email: `test@gmail.com`
   - Password: `password123`
4. Click "Sign In"
5. ✓ Should be redirected to dashboard

## 🔍 API Testing with cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"password123"}'

# Success Response:
# {"token":"eyJ...","id":"...","email":"test@gmail.com","name":"Test User","roles":["STUDENT"]}

# Failed Response:
# {"message":"Login failed. Please check your credentials."}
```

## 🛠️ Troubleshooting

### Backend won't start
- [ ] MongoDB is running
- [ ] Port 8080 is available
- [ ] No Java compilation errors

### Login shows "credentials invalid"
- [ ] Correct email/password (case-sensitive)
- [ ] MongoDB is running
- [ ] Users were created (check logs)

### CORS error in frontend
- [ ] Backend is running on port 8080
- [ ] Frontend is on port 5173
- [ ] Check browser console for CORS error details

### Check Logs
```bash
# Backend logs show:
# - User registered successfully: test@gmail.com
# - Login attempt for user: test@gmail.com
# - Authentication successful for user: test@gmail.com
# - JWT token generated successfully for user: test@gmail.com
```

## 📝 Key Files Changed

1. ✅ `SeedDataService.java` - Added test@gmail.com user
2. ✅ `AuthService.java` - Enhanced error handling & logging
3. ✅ `GlobalExceptionHandler.java` - Better exception handling
4. ✅ `application.properties` - Added logging configuration
5. ✅ `AUTHENTICATION_SETUP.md` - Comprehensive debugging guide

## 💡 What Was Fixed

1. **Test User Added** - `test@gmail.com` with password `password123`
2. **Logging Enhanced** - Debug logs for authentication flow
3. **Error Handling** - Better error messages and HTTP status codes
4. **Exception Handlers** - Specific handlers for auth exceptions
5. **Documentation** - Complete setup and debugging guide

## ✨ Next Steps

1. Clean rebuild the project:
   ```bash
   .\mvnw.cmd clean install
   ```

2. Start MongoDB and backend

3. Test login with provided credentials

4. Check backend logs for detailed information

5. If issues persist, see `AUTHENTICATION_SETUP.md` for detailed debugging


