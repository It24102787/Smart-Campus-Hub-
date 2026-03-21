# 🔴 Login Not Working? Quick Fix Guide

## Immediate Solution (2 minutes)

### Step 1: Make sure backend is running
```powershell
# Check if backend responds
curl http://localhost:8080/api/debug/check-user
```

### Step 2: If you get an error, start backend
```powershell
cd "C:\Users\ADMIN\OneDrive\Desktop\ITP\academic-support-portal"
.\mvnw.cmd spring-boot:run
```

### Step 3: Seed users manually
Once backend is running, open a new PowerShell and run:

```powershell
curl -X POST http://localhost:8080/api/debug/seed-users
```

You should see:
```json
{
  "message": "Users seeded successfully!",
  "test_email": "test@gmail.com",
  "test_password": "password123",
  "admin_email": "admin@campus.com",
  "admin_password": "admin123",
  "student_email": "student@campus.com",
  "student_password": "student123",
  "total_users_created": "3"
}
```

### Step 4: Now try login in browser
- Navigate to `http://localhost:5173`
- Click "Sign In"
- Use:
  - Email: `test@gmail.com`
  - Password: `password123`

---

## Still Not Working? Try This

### Check if users exist
```powershell
curl http://localhost:8080/api/debug/users
```

Should return a list of users with email, name, password (hashed).

### Verify backend is responding
```powershell
curl http://localhost:8080/actuator/health
```

Should return:
```json
{"status":"UP"}
```

### Check the login endpoint directly
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@gmail.com","password":"password123"}'
```

Should return JWT token if successful.

---

## Still Having Issues?

1. **Make sure MongoDB is running**
   ```powershell
   mongod
   ```

2. **Restart everything**
   - Stop backend (Ctrl+C in backend terminal)
   - Stop frontend (Ctrl+C in frontend terminal)
   - Start backend: `.\mvnw.cmd spring-boot:run`
   - Seed users: `curl -X POST http://localhost:8080/api/debug/seed-users`
   - Start frontend: `npm run dev` (in frontend folder)

3. **Clear browser cache**
   - Press F12
   - Application tab
   - Clear Local Storage
   - Refresh page

4. **Check browser console for errors**
   - Press F12
   - Console tab
   - Look for red error messages

---

## Debug Endpoints Available

Once backend is running, you can use these endpoints:

### Check all users
```
GET http://localhost:8080/api/debug/users
```

### Check if test user exists
```
GET http://localhost:8080/api/debug/check-user
```

### Seed all users
```
POST http://localhost:8080/api/debug/seed-users
```

---

## Test Credentials (After Seeding)

```
Email: test@gmail.com
Password: password123

Email: admin@campus.com
Password: admin123

Email: student@campus.com
Password: student123
```

---

## Expected Success

✅ Login endpoint returns JWT token  
✅ Frontend redirects to dashboard  
✅ User name displayed after login  
✅ Token stored in browser localStorage  

---

**Still stuck?** Make sure:
1. MongoDB is running (`mongod`)
2. Backend is running (`.\mvnw.cmd spring-boot:run`)
3. Frontend is running (`npm run dev` in frontend folder)
4. You ran the seed-users endpoint


