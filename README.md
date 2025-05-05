# Secure Company API

A secure REST API built with Express.js featuring user authentication and CRUD operations.

## Features

- User authentication with JWT
- CRUD operations
- Input validation
- Error handling
- MongoDB integration

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values as needed

3. Start MongoDB locally

4. Run the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Users
- GET /api/users - Get all users (protected)
- GET /api/users/:id - Get user by ID (protected)
- PUT /api/users/:id - Update user (protected)
- DELETE /api/users/:id - Delete user (protected)
