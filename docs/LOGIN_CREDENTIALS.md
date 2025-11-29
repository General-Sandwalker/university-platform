# 🔐 LOGIN CREDENTIALS

## Quick Access

**Frontend URL:** http://localhost:5173 (dev) or http://localhost (prod)

---

## Default User Accounts

### Admin Account
```
CIN:      ADMIN001
Password: Admin@123456
Role:     Administrator
```
**Permissions:** Full system access

---

### Department Head
```
CIN:      DHEAD001
Password: DeptHead@123
Role:     Department Head
```
**Permissions:** Department management

---

### Teachers
```
Teacher 1:
  CIN:      TEACH001
  Password: Teacher@123
  Name:     Alice Johnson

Teacher 2:
  CIN:      TEACH002
  Password: Teacher@123
  Name:     Bob Williams
```
**Permissions:** Class management, attendance tracking

---

### Students
```
Student 1:
  CIN:      STUD001
  Password: Student@123
  Name:     Emma Davis

Student 2:
  CIN:      STUD002
  Password: Student@123
  Name:     Michael Brown

Student 3:
  CIN:      STUD003
  Password: Student@123
  Name:     Sophia Martinez
```
**Permissions:** View schedules, check grades, receive notifications

---

## API Access

**Base URL:** http://localhost:3000/api/v1
**Swagger Docs:** http://localhost:3000/api/docs

### Example Login Request
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cin":"ADMIN001","password":"Admin@123456"}'
```

---

## Database Access

```
Host:     localhost
Port:     5432
Database: university_platform
Username: postgres
Password: postgres_password
```

### Connect via psql
```bash
psql -h localhost -p 5432 -U postgres -d university_platform
```

---

## Quick Start

1. **Start the application:**
   ```bash
   ./scripts/start-dev-mode.sh
   ```

2. **Open browser:** http://localhost:5173

3. **Login with Admin account:**
   - CIN: `ADMIN001`
   - Password: `Admin@123456`

4. **Explore all features!**

---

## Troubleshooting

### Login fails with "Invalid credentials"
- Make sure the password is **exactly** `Admin@123456` (case-sensitive)
- Check if backend is running: `curl http://localhost:3000/api/v1/health`
- Verify database is seeded: `./backend/scripts/seed-database.sh`

### Backend not responding
```bash
docker-compose ps  # Check services
docker-compose logs backend  # View logs
docker-compose restart backend  # Restart backend
```

### Database connection issues
```bash
docker-compose restart db
# Wait 5 seconds
docker-compose restart backend
```

---

**🎉 Ready to use! All accounts are set up and ready for testing.**
