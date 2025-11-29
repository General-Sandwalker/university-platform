# 🚀 Quick Reference Card

## 📍 URLs

```
API Base:        http://localhost:3000/api/v1
API Docs:        http://localhost:3000/api/docs
Health Check:    http://localhost:3000/api/v1/health
```

## 🎬 Quick Start

```bash
# Start everything
./scripts/start-dev.sh

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down
```

## 🔑 Authentication Flow

```bash
# 1. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cin": "ADMIN001", "password": "Admin@123456"}'

# Response includes: accessToken, refreshToken

# 2. Use token in requests
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 3. Refresh token when expired
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

## 🗄️ Database Commands

```bash
# Access database
docker-compose exec db psql -U postgres -d university_platform

# Inside PostgreSQL:
\dt                                    # List tables
\d users                               # Describe users table
SELECT * FROM users;                   # Query users
\q                                     # Exit
```

## 🔧 Common Docker Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f                 # All services
docker-compose logs -f backend         # Backend only

# Restart services
docker-compose restart                 # All services
docker-compose restart backend         # Backend only

# Rebuild
docker-compose build backend           # Rebuild backend
docker-compose up -d --build           # Rebuild and start

# Stop and remove
docker-compose down                    # Stop services
docker-compose down -v                 # Stop and remove volumes (⚠️ deletes data)

# Execute commands in container
docker-compose exec backend npm run migration:run
docker-compose exec backend npm test
```

## 📝 Create First Admin User

```bash
# 1. Generate password hash
docker-compose exec backend node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin@123456', 10).then(console.log)"

# Copy the hash output, then:

# 2. Access database
docker-compose exec db psql -U postgres -d university_platform

# 3. Insert admin (paste the hash from step 1)
INSERT INTO users (id, cin, "firstName", "lastName", email, password, role, status, "isEmailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'ADMIN001',
  'System',
  'Administrator',
  'admin@university.com',
  'PASTE_HASH_HERE',
  'admin',
  'active',
  true,
  NOW(),
  NOW()
);

# 4. Exit
\q
```

## 🧪 Test Endpoints

```bash
# Set token (replace with your actual token)
TOKEN="your_access_token_here"

# Test health
curl http://localhost:3000/api/v1/health

# Test auth
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cin": "ADMIN001", "password": "Admin@123456"}'

# Password reset request
curl -X POST http://localhost:3000/api/v1/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@university.com"}'
```

## 📊 Development Workflow

```bash
# 1. Make changes to code in backend/src/

# 2. Check logs for auto-reload
docker-compose logs -f backend

# 3. Test changes
curl http://localhost:3000/api/v1/...

# 4. Check for errors
docker-compose logs backend | grep ERROR
```

## 🔍 Debugging

```bash
# Check if containers are running
docker-compose ps

# Check container logs
docker-compose logs backend
docker-compose logs db

# Check database connection
docker-compose exec backend npm run typeorm -- query "SELECT NOW()"

# Check environment variables
docker-compose exec backend printenv | grep DB_

# Restart with fresh logs
docker-compose restart backend && docker-compose logs -f backend
```

## 📦 Install New Dependencies

```bash
# 1. Add to backend/package.json

# 2. Rebuild container
docker-compose build backend

# 3. Restart
docker-compose up -d backend
```

## 🎨 Code Quality

```bash
# Inside container
docker-compose exec backend npm run lint
docker-compose exec backend npm run format
docker-compose exec backend npm test
```

## 📁 Important Files

```
backend/.env                           # Environment config
backend/src/index.ts                   # App entry point
backend/src/app.ts                     # Express setup
backend/src/config/database.ts         # DB config
backend/src/entities/                  # Database models
backend/src/routes/                    # API routes
docker-compose.yml                     # Dev environment
scripts/start-dev.sh                   # Start script
```

## 🆘 Troubleshooting

### Port already in use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection failed
```bash
# Restart database
docker-compose restart db

# Check if database is ready
docker-compose exec db pg_isready -U postgres
```

### Container won't start
```bash
# View detailed logs
docker-compose logs backend

# Remove and rebuild
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

### TypeScript errors
```bash
# Rebuild with clean cache
docker-compose build --no-cache backend
```

## 🔐 Security Reminders

- ✅ Change JWT secrets in production
- ✅ Use strong database passwords
- ✅ Configure proper CORS origins
- ✅ Enable HTTPS in production
- ✅ Set up email service credentials
- ✅ Use environment variables for secrets
- ✅ Enable rate limiting
- ✅ Regular security updates

## 📚 Resources

- Main Documentation: [README.md](README.md)
- Setup Guide: [SETUP.md](SETUP.md)
- Implementation Summary: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- API Docs: http://localhost:3000/api/docs

---

**Keep this file handy for quick reference!** 📌
