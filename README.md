# Gym Fitness App

A complete gym fitness application with user authentication and class registration.

## Features

- User registration and login
- JWT authentication
- Browse gym classes by category/date
- Register/unregister for classes
- View registered classes
- Class capacity management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB locally or update MONGODB_URI in .env

3. Run the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile (protected)

### Classes
- GET `/api/classes` - Get all classes (filter by category/date)
- POST `/api/classes/:classId/register` - Register for class (protected)
- DELETE `/api/classes/:classId/unregister` - Unregister from class (protected)
- GET `/api/classes/my-classes` - Get user's registered classes (protected)

## Example Usage

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","membershipType":"premium"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Register for Class
```bash
curl -X POST http://localhost:3000/api/classes/CLASS_ID/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```