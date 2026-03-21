# Authentication Flow Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vite)                     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Login Component (Login.jsx)                   │   │
│  │  - Collects email & password from user               │   │
│  │  - Validates input                                   │   │
│  │  - Shows loading/error states                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                        │                                      │
│                        ↓                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      AuthContext (AuthContext.jsx)                    │   │
│  │  - useAuth hook for app-wide auth state             │   │
│  │  - Manages token storage in localStorage            │   │
│  │  - Handles login/logout/register                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                        │                                      │
│                        ↓                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Axios Instance (services/api.js)              │   │
│  │  - HTTP client for API calls                        │   │
│  │  - Adds Bearer token to Authorization header        │   │
│  │  - Handles 401 errors (redirects to login)          │   │
│  └──────────────────────────────────────────────────────┘   │
│                        │                                      │
└─────────────────────────────────────────────────────────────┘
                         │
                    CORS & HTTPS
                         │
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Spring Boot)                        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AuthController (/api/auth/login)                    │   │
│  │  - Receives HTTP POST request                       │   │
│  │  - Validates request body                           │   │
│  │  - Delegates to AuthService                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                        │                                      │
│                        ↓                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      AuthService (auth/service/AuthService.java)    │   │
│  │  - Authenticates user credentials                   │   │
│  │  - Generates JWT token                              │   │
│  │  - Returns AuthResponse with token                  │   │
│  └──────────────────────────────────────────────────────┘   │
│            │                        │                        │
│            ↓                        ↓                        │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ AuthenticationMgr │    │  JwtService      │              │
│  │ - Validates pwd  │    │ - Generates JWT  │              │
│  │ - Authenticates  │    │ - Validates JWT  │              │
│  └──────────────────┘    │ - Extracts claims│              │
│            │              └──────────────────┘              │
│            ↓              │                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   UserDetailsService (CustomUserDetailsService.java) │   │
│  │  - Loads user details by email                       │   │
│  │  - Creates UserDetails object for Spring Security   │   │
│  └──────────────────────────────────────────────────────┘   │
│            │                                                 │
│            ↓                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  UserRepository (MongoDB)                             │   │
│  │  - Finds user by email                              │   │
│  │  - Retrieves password hash                          │   │
│  │  - Returns user with roles                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                        │                                      │
│                        ↓                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      MongoDB Database (users collection)             │   │
│  │  - Stores user documents                            │   │
│  │  - Encrypted password (BCrypt)                      │   │
│  │  - User roles and metadata                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Login Flow Sequence

```
Client                         Server
  │                              │
  ├─── POST /api/auth/login ────→│
  │     (email, password)        │
  │                              ├── Validate request
  │                              ├── Load user from DB
  │                              ├── Verify password (BCrypt)
  │                              ├── Generate JWT token
  │                              │
  │     200 OK + Token          │
  │◄─── {token, user, roles} ───┤
  │                              │
  ├─ Save token in localStorage  │
  ├─ Save user in localStorage   │
  ├─ Redirect to /dashboard      │
  │                              │
  ├─ GET /api/dashboard ────────→│
  │     Authorization: Bearer... │
  │                              ├── Validate JWT token
  │                              ├── Extract user email
  │                              ├── Load user from DB
  │                              │
  │     200 OK + Dashboard Data │
  │◄──────────────────────────────┤
  │                              │
```

## Key Components Explained

### 1. Frontend (React)

**File**: `frontend/src/context/AuthContext.jsx`

```javascript
const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data));
  setUser(data);
  return data;
};
```

**Responsibilities**:
- Make POST request to backend
- Store token in localStorage
- Update auth state
- Handle errors

### 2. Backend - Authentication Controller

**File**: `src/main/java/com/example/academic_support_portal/auth/controller/AuthController.java`

```java
@PostMapping("/login")
public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
  return ResponseEntity.ok(authService.login(request));
}
```

**Responsibilities**:
- Accept login request
- Delegate to service
- Return response

### 3. Backend - Authentication Service

**File**: `src/main/java/com/example/academic_support_portal/auth/service/AuthService.java`

```java
public AuthResponse login(AuthRequest request) {
  // 1. Authenticate using AuthenticationManager
  authenticationManager.authenticate(
    new UsernamePasswordAuthenticationToken(
      request.getEmail(),
      request.getPassword()
    )
  );
  
  // 2. Get user from database
  User user = userRepository.findByEmail(request.getEmail())
    .orElseThrow(() -> new RuntimeException("User not found"));
  
  // 3. Load user details
  UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
  
  // 4. Generate JWT token
  String jwtToken = jwtService.generateToken(userDetails);
  
  // 5. Return response with token
  return AuthResponse.builder()
    .token(jwtToken)
    .id(user.getId())
    .name(user.getName())
    .email(user.getEmail())
    .roles(user.getRoles())
    .build();
}
```

**Responsibilities**:
- Authenticate credentials
- Load user from database
- Generate JWT token
- Return auth response

### 4. JWT Service

**File**: `src/main/java/com/example/academic_support_portal/security/JwtService.java`

```java
public String generateToken(UserDetails userDetails) {
  return Jwts.builder()
    .subject(userDetails.getUsername())  // User email
    .issuedAt(new Date())
    .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
    .signWith(getSignInKey(), Jwts.SIG.HS256)
    .compact();
}
```

**Responsibilities**:
- Generate JWT tokens
- Validate tokens
- Extract claims from tokens
- Check token expiration

### 5. Security Configuration

**File**: `src/main/java/com/example/academic_support_portal/security/SecurityConfig.java`

**Responsibilities**:
- Configure CORS
- Set up authentication provider
- Define authorization rules
- Configure JWT filter

### 6. JWT Authentication Filter

**File**: `src/main/java/com/example/academic_support_portal/security/JwtAuthenticationFilter.java`

```java
protected void doFilterInternal(
  HttpServletRequest request,
  HttpServletResponse response,
  FilterChain filterChain
) throws ServletException, IOException {
  // 1. Extract JWT from Authorization header
  String jwt = authHeader.substring(7);  // Remove "Bearer "
  
  // 2. Extract username from JWT
  String userEmail = jwtService.extractUsername(jwt);
  
  // 3. Load user details
  UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
  
  // 4. Validate JWT
  if (jwtService.isTokenValid(jwt, userDetails)) {
    // Create authentication token
    UsernamePasswordAuthenticationToken authToken = 
      new UsernamePasswordAuthenticationToken(
        userDetails, null, userDetails.getAuthorities()
      );
    SecurityContextHolder.getContext().setAuthentication(authToken);
  }
  
  filterChain.doFilter(request, response);
}
```

**Responsibilities**:
- Intercept incoming requests
- Extract JWT from headers
- Validate JWT
- Set authentication context

## Error Handling

### Exception Hierarchy

```
AuthenticationException
├── BadCredentialsException
│   └── Invalid password
├── UsernameNotFoundException
│   └── User not found
└── InternalAuthenticationServiceException
    └── Internal auth error
```

### Global Exception Handler

**File**: `src/main/java/com/example/academic_support_portal/exception/GlobalExceptionHandler.java`

```java
@ExceptionHandler(BadCredentialsException.class)
public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException e) {
  return ResponseEntity
    .status(HttpStatus.UNAUTHORIZED)
    .body(Map.of("message", "Login failed. Please check your credentials."));
}
```

**Responsibilities**:
- Catch specific exceptions
- Return appropriate HTTP status
- Format error messages
- Log errors

## Security Features

### 1. Password Encryption (BCrypt)

```java
private final PasswordEncoder passwordEncoder;

// During registration:
user.setPassword(passwordEncoder.encode(request.getPassword()));

// During login:
// AuthenticationManager uses PasswordEncoder to verify
```

**Benefits**:
- One-way hashing
- Salt-based encryption
- Resistant to rainbow table attacks
- Adaptive work factor

### 2. JWT Tokens

**Token Structure**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGdtYWlsLmNvbSIsImlhdCI6MTY3Njc5NDM5OSwiZXhwIjoxNjc2ODgwNzk5fQ.signature
```

**Token Composition**:
- **Header**: Algorithm and type
- **Payload**: Claims (user email, issued at, expiration)
- **Signature**: HMAC-SHA256 with secret key

**Security**:
- Signed with secret key (server-side)
- Tamper-proof (signature validation)
- Expires after 24 hours
- Stateless authentication

### 3. CORS Configuration

```java
configuration.setAllowedOrigins(List.of(
  "http://localhost:5173",
  "http://localhost:5176",
  "http://localhost:3000"
));
```

**Benefits**:
- Restricts cross-origin requests
- Prevents unauthorized access from malicious sites
- Allows legitimate frontend to access backend

### 4. Authorization Levels

```
┌─ Public Routes (No Auth Required)
│  ├── /api/auth/login
│  ├── /api/auth/register
│  └── /api/resources/**
│
└─ Protected Routes (Auth Required)
   ├── /api/dashboard
   ├── /api/profile
   ├── /api/tutors
   └── ... (all other routes)
```

## Token Lifecycle

```
┌─────────────────────────────────────────┐
│  Token Generation (Login)                 │
│  - User submits email & password          │
│  - Server validates credentials           │
│  - Server generates JWT (24h expiration)  │
│  - Client stores in localStorage          │
└─────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│  Token Usage (Authenticated Requests)    │
│  - Client adds token to Authorization    │
│  - Server validates token signature      │
│  - Server checks token expiration        │
│  - Server grants access to resource      │
└─────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│  Token Expiration / Renewal              │
│  - Token expires after 24 hours          │
│  - User redirected to login              │
│  - New token generated on re-login       │
└─────────────────────────────────────────┘
```

## Debugging Authentication Issues

### Check 1: Verify User Exists

```bash
mongo academic_support_portal
db.users.findOne({ email: "test@gmail.com" })
```

### Check 2: Verify Password Hash

```bash
# Should start with $2a$ or $2b$
db.users.findOne({ email: "test@gmail.com" }).password
# Example: $2a$10$xxxxxxxxxxxxxyyyyyyyyyyy
```

### Check 3: Verify JWT Configuration

```bash
# Check application.properties
cat src/main/resources/application.properties | grep jwt
# Should show:
# application.security.jwt.secret-key=...
# application.security.jwt.expiration=86400000
```

### Check 4: Check Backend Logs

```
2026-03-03 10:15:45 - Login attempt for user: test@gmail.com
2026-03-03 10:15:45 - Authentication successful for user: test@gmail.com
2026-03-03 10:15:45 - JWT token generated successfully for user: test@gmail.com
```

### Check 5: Test API Directly

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"password123"}'
```


