# Smart Campus Hub

A full-stack intelligent campus management system.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Axios, Framer Motion, Lucide Icons.
- **Backend**: Spring Boot 3.2.x, Spring Security, JWT (io.jsonwebtoken), MongoDB.
- **Database**: MongoDB (Local or Atlas).

## Prerequisites
- Node.js 20+
- Java 17+
- MongoDB 6.0+

## Setup & Run

### Backend
1. Navigate to the root directory.
2. Configure MongoDB in `src/main/resources/application.properties`.
3. Run with Maven: `./mvnw spring-boot:run`.
4. The API will be available at `http://localhost:8080`.
5. Initial Admin Account: `admin@campus.com` / `admin123`.

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Run development server: `npm run dev`.
4. Open `http://localhost:5173`.

### Dev API Configuration
- Set `frontend/.env` to `VITE_API_URL=http://localhost:8080` (no `/api` suffix).
- Frontend axios appends `/api` once, so calls resolve like `http://localhost:8080/api/tutors`.
- For local development, unauthenticated `GET` requests to `/api/tutors`, `/api/groups`, and `/api/resources` are allowed so the Academic Support page can load.

### How to configure SMTP for local/dev
- Tutor request notifications use Spring Mail (`JavaMailSender`).
- Set these environment variables before starting the backend:
  - `MAIL_ENABLED=true`
  - `MAIL_HOST`
  - `MAIL_PORT`
  - `MAIL_USERNAME`
  - `MAIL_PASSWORD`
  - `MAIL_FROM`
  - `APP_FRONTEND_URL` (example: `http://localhost:5173`)
- Mailtrap example:
  - `MAIL_HOST=sandbox.smtp.mailtrap.io`
  - `MAIL_PORT=587`
  - `MAIL_USERNAME=<mailtrap-username>`
  - `MAIL_PASSWORD=<mailtrap-password>`
- Gmail example:
  - Enable Google account 2FA.
  - Create an App Password.
  - Use `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=587`, `MAIL_USERNAME=<your-gmail>`, `MAIL_PASSWORD=<app-password>`.

## Features
- **Study Spot Finder**: Real-time room availability and bookings.
- **Issue Reporter**: Step-by-step reporting with status tracking.
- **Equipment Portal**: Catalog with QR-based rentals.
- **Environment Monitor**: Live sensor dashboard for campus rooms.
- **Academic Support**: Tutor matching and student group chats.

## Smart Campus Booking + IoT Module

### New REST APIs
- `POST /api/bookings`
- `GET /api/bookings/my`
- `GET /api/bookings/{id}`
- `DELETE /api/bookings/{id}`
- `GET /api/study-rooms`
- `GET /api/study-rooms/{id}`
- `GET /api/study-rooms/{id}/availability?date=YYYY-MM-DD`
- `GET /api/dashboard/environment`
- `POST /api/iot/card-tap`
- `POST /api/iot/environment-reading`

### IoT Simulation
Run:
```bash
node scripts/iot-simulator.js
```
Optional:
```bash
API_BASE=http://localhost:8080/api node scripts/iot-simulator.js
```

### Sample Assets
- MongoDB schema notes: `docs/mongodb-schema.md`
- Sample IoT payloads: `sample-data/iot-sample-data.json`
- Postman collection: `postman/smart-campus-iot.postman_collection.json`
