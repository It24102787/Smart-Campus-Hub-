# Authentication Setup & Debugging Guide

## Overview
This guide helps you set up and troubleshoot authentication issues in the Academic Support Portal.

## Test Credentials

The application automatically creates the following test users on startup:

### Admin User
- **Email**: `admin@campus.com`
- **Password**: `admin123`
- **Role**: ADMIN

### Student User
- **Email**: `student@campus.com`
- **Password**: `student123`
- **Role**: STUDENT

### Test User
- **Email**: `test@gmail.com`
- **Password**: `password123`
- **Role**: STUDENT

## Prerequisites

### Backend Requirements
1. **MongoDB**: Must be running on `localhost:27017`
2. **Java 17+**: Required for Spring Boot 3.x
3. **Maven**: For building the project

### Frontend Requirements
1. **Node.js**: v16 or higher
2. **npm** or **yarn**: Package manager
3. **Vite**: Already configured in the project

## Backend Setup

### 1. MongoDB Setup

Make sure MongoDB is running:

```bash
# Windows
mongod

# Or if installed as a service, it should start automatically
```

Check if MongoDB is accessible:

```bash
mongo
# Should connect successfully
```

### 2. Verify Test Users in MongoDB

Connect to MongoDB and check if users were created:

```bash
# Connect to MongoDB shell
mongo

# Use the correct database
use academic_support_portal

# Check if users exist
db.users.find()

# Find specific user
db.users.findOne({ email: "test@gmail.com" })
```

Expected output:
```json
{
  "_id": ObjectId("..."),
  "email": "test@gmail.com",
  "name": "Test User",
  "password": "$2a$10$...", // BCrypt hashed password
  "roles": ["STUDENT"],
  "active": true
}
```

### 3. Build the Backend

```bash
cd C:\Users\ADMIN\OneDrive\Desktop\ITP\academic-support-portal

# Clean and compile
.\mvnw.cmd clean compile

# Run all tests
.\mvnw.cmd test

# Package the application
.\mvnw.cmd clean package
```

### 4. Run the Backend

```bash
# Using Maven
.\mvnw.cmd spring-boot:run

# Or run the JAR file
java -jar target/academic-support-portal-0.0.1-SNAPSHOT.jar
```

The backend will start on `http://localhost:8080`

## Frontend Setup

### 1. Install Dependencies

```bash
cd C:\Users\ADMIN\OneDrive\Desktop\ITP\academic-support-portal\frontend

npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8080/api
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Start the Development Server

```bash
npm run dev
```

The frontend will typically start on:
- `http://localhost:5173` (default Vite port)
- Or the port shown in your terminal

## Testing the Login Flow

### Manual Testing

1. **Open the Frontend**: Navigate to `http://localhost:5173`
2. **Click Login**: Go to the login page
3. **Enter Credentials**:
   - Email: `test@gmail.com`
   - Password: `password123`
4. **Expected Result**: 
   - Should be redirected to the dashboard
   - Token should be saved in localStorage
   - User info should be displayed

### API Testing with cURL

```bash
# Login request
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "password123"
  }'

# Expected response (success):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "...",
  "email": "test@gmail.com",
  "name": "Test User",
  "roles": ["STUDENT"]
}

# Expected response (failure):
{
  "message": "Login failed. Please check your credentials."
}
```

### Using Postman

1. Create a new POST request
2. URL: `http://localhost:8080/api/auth/login`
3. Headers:
   ```
   Content-Type: application/json
   ```
4. Body (raw JSON):
   ```json
   {
     "email": "test@gmail.com",
     "password": "password123"
   }
   ```
5. Send the request

## Debugging Login Issues

### Issue 1: "User not found" Error

**Symptoms**: Login fails even with correct credentials

**Solution**:
1. Verify MongoDB is running
2. Check if users were created:
   ```bash
   mongo
   use academic_support_portal
   db.users.find()
   ```
3. If no users exist, restart the backend:
   ```bash
   .\mvnw.cmd spring-boot:run
   ```
4. Check backend logs for creation errors

### Issue 2: Password Mismatch Error

**Symptoms**: "Invalid email or password" error

**Solution**:
1. Verify the password is correct (case-sensitive)
2. Check if password was hashed during signup:
   ```bash
   # In MongoDB, password should start with $2a$ or $2b$
   db.users.findOne({ email: "test@gmail.com" }).password
   # Should output: $2a$10$... (BCrypt hash)
   ```
3. If password doesn't start with `$2a$` or `$2b$`, the user was not properly encrypted
4. Delete and recreate the user

### Issue 3: CORS Errors

**Symptoms**: Browser console shows CORS errors, request blocked

**Solution**:
1. Verify backend is allowing the frontend origin:
   - Check `SecurityConfig.java` for allowed origins
   - Should include `http://localhost:5173` and `http://localhost:5176`
2. Clear browser cache and cookies
3. Restart both frontend and backend

### Issue 4: JWT Token Invalid

**Symptoms**: Token generated but rejected on subsequent requests

**Solution**:
1. Check if JWT secret key is consistent:
   - `application.properties` should have the JWT secret
   - Secret must be at least 32 bytes (Base64 encoded)
2. Verify token expiration:
   - Default: 24 hours (86400000 ms)
3. Check token format in localStorage (should be valid JWT)

### Issue 5: Frontend Cannot Connect to Backend

**Symptoms**: Network error, connection refused

**Solution**:
1. Verify backend is running: `http://localhost:8080/api/auth/login`
2. Check if ports are correct:
   - Backend: 8080
   - Frontend: 5173
3. Firewall settings - ensure port 8080 is accessible
4. Update VITE_API_URL in `.env.local`

## Enabling Debug Mode in IntelliJ

### Method 1: Debug Configuration

1. Click **Run > Edit Configurations**
2. Select your Spring Boot configuration
3. Under **VM Options**, add: `-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005`
4. Click **Debug** instead of **Run**

### Method 2: Add Breakpoints

1. Open `AuthService.java`
2. Click on line numbers to add breakpoints
3. Run in Debug mode
4. Execution will pause at breakpoints

## Checking Logs

### Backend Logs

The backend logs will show:
- User creation during startup
- Login attempts
- Authentication success/failure
- JWT token generation

Example log output:
```
2026-03-03 10:15:23 - User registered successfully: test@gmail.com
2026-03-03 10:15:45 - Login attempt for user: test@gmail.com
2026-03-03 10:15:45 - Authentication successful for user: test@gmail.com
2026-03-03 10:15:45 - JWT token generated successfully for user: test@gmail.com
```

### Frontend Console Logs

Check browser console (F12) for:
- API response status
- Token storage
- Navigation events

## Environment Variables Reference

### Backend (application.properties)

| Variable | Default | Description |
|----------|---------|-------------|
| `spring.data.mongodb.uri` | `mongodb://localhost:27017/academic_support_portal` | MongoDB connection string |
| `application.security.jwt.secret-key` | Base64 encoded key | JWT signing secret |
| `application.security.jwt.expiration` | `86400000` | Token expiration in ms (24 hours) |

### Frontend (.env.local)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8080/api` | API base URL |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Alternative API base URL |

## Troubleshooting Checklist

- [ ] MongoDB is running
- [ ] Test users exist in database
- [ ] Backend starts without errors
- [ ] Frontend loads without CORS errors
- [ ] Backend logs show "User registered successfully"
- [ ] Login request returns valid JWT token
- [ ] Token is stored in localStorage
- [ ] Dashboard loads after login

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| MongoNetworkError | MongoDB not running | Start MongoDB service |
| Cannot resolve symbol 'Slf4j' | Lombok not installed | Run `mvn clean install` |
| CORS error in browser | Origin not allowed | Check SecurityConfig origins |
| "User not found" | User doesn't exist | Restart backend to seed users |
| "Invalid credentials" | Password mismatch | Verify correct password |
| Network error | Backend not running | Start backend with `mvn spring-boot:run` |

## Support

For additional help:
1. Check the application logs
2. Verify all services are running
3. Clear browser cache/cookies
4. Restart both backend and frontend
5. Ensure MongoDB database is clean (no corrupted entries)


