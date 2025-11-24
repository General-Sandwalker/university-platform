# 🚀 Quick Setup Guide

This guide will help you get the University Management Platform backend up and running in minutes.

## Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js version (should be 18+)
node --version

# Check Docker
docker --version

# Check Docker Compose
docker-compose --version
```

## Step-by-Step Setup

### 1. Environment Configuration

The `.env` file has been created with development defaults. You should update the email settings:

```bash
# Edit backend/.env
nano backend/.env
```

Update these email settings (or skip for now):
```env
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
```

> **Note**: For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833).

### 2. Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

### 3. Start the Development Environment

```bash
./scripts/start-dev.sh
```

This will:
- ✅ Build Docker images
- ✅ Start PostgreSQL 17 database
- ✅ Start the backend API
- ✅ Create database tables automatically
- ✅ Show service status

### 4. Verify Installation

Once the services are running, open your browser:

- **API Health Check**: http://localhost:3000/api/v1/health
- **API Documentation**: http://localhost:3000/api/docs
- **Root Endpoint**: http://localhost:3000

You should see:
```json
{
  "status": "success",
  "message": "University Platform API is running"
}
```

## First Steps

### 1. Install Dependencies Locally (Optional - for IDE support)

```bash
cd backend
npm install
```

This helps your IDE with TypeScript autocomplete, but the app runs in Docker.

### 2. Create Initial Admin User

Since there's no self-registration, you need to create the first admin user via database:

```bash
# Access the database
docker-compose exec db psql -U postgres -d university_platform

# Create admin user (in PostgreSQL prompt)
INSERT INTO users (id, cin, "firstName", "lastName", email, password, role, status, "isEmailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'ADMIN001',
  'System',
  'Administrator',
  'admin@university.com',
  '$2b$10$YourHashedPasswordHere', -- See note below
  'admin',
  'active',
  true,
  NOW(),
  NOW()
);

# Exit PostgreSQL
\q
```

**Note**: The password needs to be bcrypt hashed. For development, you can use online tools or:

```bash
# Generate hashed password using Node.js
docker-compose exec backend node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin@123456', 10).then(console.log)"
```

Then use the output in the INSERT query above.

### 3. Test Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "cin": "ADMIN001",
    "password": "Admin@123456"
  }'
```

You should receive:
```json
{
  "status": "success",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### 4. Use the Token

Save the `accessToken` and use it in subsequent requests:

```bash
TOKEN="your-access-token-here"

curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Database only
docker-compose logs -f db
```

### Restart Services

```bash
# Restart everything
docker-compose restart

# Restart backend only
docker-compose restart backend
```

### Stop Services

```bash
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### Access Database

```bash
# PostgreSQL CLI
docker-compose exec db psql -U postgres -d university_platform

# List tables
\dt

# View users
SELECT id, cin, email, role FROM users;

# Exit
\q
```

## Next Steps

1. **Import Sample Data**: Use the CSV files in `data/` directory
2. **Create Users**: Use the `/api/v1/users` endpoint (admin only)
3. **Setup Departments**: Create departments, specialties, levels, groups
4. **Configure Rooms**: Add classrooms and labs
5. **Create Timetables**: Schedule classes

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill -9

# Or change port in backend/.env
PORT=3001
```

### Database Connection Error

```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### "Cannot find module" Errors

```bash
# Rebuild the backend container
docker-compose build backend

# Restart services
docker-compose up -d
```

### TypeScript Errors in IDE

```bash
# Install dependencies locally
cd backend
npm install
```

## Development Workflow

1. **Make changes** to code in `backend/src/`
2. **Auto-reload** happens via `ts-node-dev` (watch mode)
3. **View logs** with `docker-compose logs -f backend`
4. **Test endpoints** at http://localhost:3000/api/docs

## Production Deployment

See the main [README.md](../README.md) for production deployment instructions.

## Need Help?

- 📚 Full API Documentation: http://localhost:3000/api/docs
- 📖 Main README: [../README.md](../README.md)
- 🐛 Check logs: `docker-compose logs -f`

---

**Happy coding! 🎓**
