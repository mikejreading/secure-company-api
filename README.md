# Secure Company API

A secure REST API built with Express.js featuring user authentication, CRUD operations, and comprehensive security features.

## Features

- User authentication with JWT
- Role-based access control
- Rate limiting and security headers
- Input validation and sanitization
- Error handling
- MongoDB integration
- API compression
- Comprehensive test suite

## Security Features

- JWT token authentication
- Password complexity requirements
- Rate limiting for login attempts
- Helmet security headers
- CORS protection
- HTTP Parameter Pollution protection
- Input validation and sanitization
- Error handling and standardization

## Setup

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the following values:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/your-database
   JWT_SECRET=your-secure-secret-key
   JWT_EXPIRE=24h
   ```

3. Start MongoDB locally:
   ```bash
   mongod
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### Production Deployment

1. Set up a MongoDB database (e.g., MongoDB Atlas)

2. Configure production environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secure-secret-key
   JWT_EXPIRE=24h
   ```

3. Build and start:
   ```bash
   npm install --production
   npm start
   ```

4. Use a process manager (e.g., PM2):
   ```bash
   npm install -g pm2
   pm2 start src/server.js
   ```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
```
Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
Response (201):
```json
{
  "token": "jwt-token-here"
}
```

#### Login User
```
POST /api/auth/login
```
Body:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
Response (200):
```json
{
  "token": "jwt-token-here"
}
```

### User Endpoints

#### Get All Users (Admin Only)
```
GET /api/users
Authorization: Bearer <token>
```
Response (200):
```json
[
  {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
]
```

#### Get User by ID
```
GET /api/users/:id
Authorization: Bearer <token>
```
Response (200):
```json
{
  "_id": "user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

#### Update User
```
PUT /api/users/:id
Authorization: Bearer <token>
```
Body:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```
Response (200):
```json
{
  "_id": "user-id",
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "user"
}
```

#### Delete User (Admin Only)
```
DELETE /api/users/:id
Authorization: Bearer <token>
```
Response (204): No content

## Error Handling

All errors follow this format:
```json
{
  "message": "Error description",
  "errors": ["Detailed error messages"] // For validation errors
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

- API endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per hour

## Testing

Run tests:
```bash
NODE_ENV=test npm test
```

View coverage:
```bash
NODE_ENV=test npm test -- --coverage
```

## Security Best Practices

1. Use HTTPS in production
2. Set secure HTTP headers (Helmet)
3. Implement rate limiting
4. Use strong password requirements
5. Validate and sanitize all inputs
6. Use JWT for authentication
7. Implement role-based access control
8. Handle errors securely
9. Use proper CORS configuration
10. Regular security updates

## License

MIT
