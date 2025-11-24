# 🎓 University Management Platform - Backend API

A production-ready, modular, and scalable backend API for managing university operations including student management, timetable scheduling, absence tracking, messaging, and analytics.

## 🚀 Features

- **Authentication & Authorization**
  - CIN-based login system
  - JWT tokens with refresh mechanism
  - Role-based access control (RBAC)
  - Password reset via email

- **User Management**
  - Admin-controlled user creation
  - CSV bulk import for users
  - Multiple user roles: Student, Teacher, Department Head, Admin
  - User status management (active, inactive, suspended, eliminated)

- **Academic Structure**
  - Department management
  - Specialties and levels
  - Group assignments
  - Room management with equipment tracking
  - Subject/course management

- **Timetable System**
  - Schedule creation and management
  - Conflict detection (room/teacher double-booking)
  - Different session types (lecture, TD, TP, exam, makeup)
  - Calendar integration

- **Absence Management**
  - Absence recording and tracking
  - Student excuse submission
  - Teacher excuse review workflow
  - Automatic elimination risk detection
  - Email notifications for warnings

- **Communication**
  - Internal messaging system
  - In-app notifications
  - Email alerts (absences, timetable changes)
  - System announcements

- **Event Management**
  - Academic events (holidays, conferences, exam periods)
  - Event calendar
  - Timetable blocking for events

- **Analytics & Reporting**
  - Student performance statistics
  - Room occupancy reports
  - Absence analytics
  - PDF and CSV exports

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Docker** & **Docker Compose**
- **PostgreSQL 17** (handled by Docker)

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 17
- **ORM**: TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Email**: Nodemailer
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose

## 📁 Project Structure

```
university-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files (database, swagger)
│   │   ├── entities/        # TypeORM entity models
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Custom middleware (auth, validation, errors)
│   │   ├── routes/          # API routes
│   │   ├── validators/      # Zod validation schemas
│   │   ├── utils/           # Utility functions (logger, email, auth)
│   │   ├── migrations/      # Database migrations
│   │   ├── app.ts           # Express app setup
│   │   └── index.ts         # Entry point
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── docker-compose.yml       # Development environment
├── docker-compose.prod.yml  # Production environment
├── scripts/
│   ├── start-dev.sh         # Start development environment
│   ├── start-prod.sh        # Start production environment
│   └── init-db.sql          # Database initialization script
├── data/
│   └── sample-users.csv     # Sample user data for import
└── README.md
```

## 🚦 Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory
cd university-platform

# Copy environment file
cp backend/.env.example backend/.env

# Update backend/.env with your configuration
```

### 2. Configure Environment Variables

Edit `backend/.env`:

```env
# Database
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres_password
DB_DATABASE=university_platform

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@university.com

# CORS
CORS_ORIGIN=http://localhost:3001
```

### 3. Start the Development Environment

```bash
# Make scripts executable
chmod +x scripts/start-dev.sh scripts/start-prod.sh

# Start services (backend + PostgreSQL)
./scripts/start-dev.sh
```

This will:
- Build the Docker containers
- Start PostgreSQL 17 database
- Start the backend API on port 3000
- Run database migrations automatically

### 4. Access the API

- **API Base URL**: http://localhost:3000/api/v1
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 📚 API Documentation

Interactive API documentation is available at `/api/docs` when the server is running.

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/login` - Login with CIN and password
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/password-reset/request` - Request password reset
- `POST /api/v1/auth/password-reset/confirm` - Confirm password reset
- `POST /api/v1/auth/password/change` - Change password (authenticated)
- `GET /api/v1/auth/me` - Get current user profile

#### User Management (Admin only)
- `POST /api/v1/users` - Create new user
- `GET /api/v1/users` - List all users (with filters)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `POST /api/v1/users/import` - Bulk import users from CSV

#### Departments, Specialties, Levels, Groups, Rooms, Subjects
- Full CRUD operations available for each
- `GET /api/v1/departments` - List departments
- `POST /api/v1/departments` - Create department (admin only)
- Similar patterns for other referential data

#### Timetable
- `GET /api/v1/timetable` - Get timetable (with filters)
- `POST /api/v1/timetable` - Create timetable entry (teacher/admin)
- `PUT /api/v1/timetable/:id` - Update timetable entry
- `DELETE /api/v1/timetable/:id` - Delete timetable entry

#### Absences
- `GET /api/v1/absences` - List absences
- `POST /api/v1/absences` - Record absence (teacher)
- `POST /api/v1/absences/:id/excuse` - Submit excuse (student)
- `PUT /api/v1/absences/:id/review` - Review excuse (teacher)

#### Messages
- `GET /api/v1/messages` - Get messages
- `POST /api/v1/messages` - Send message
- `PUT /api/v1/messages/:id/read` - Mark as read

#### Notifications
- `GET /api/v1/notifications` - Get notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read

#### Events
- `GET /api/v1/events` - List events
- `POST /api/v1/events` - Create event (admin)

#### Analytics
- `GET /api/v1/analytics/student-performance` - Student performance stats
- `GET /api/v1/analytics/room-occupancy` - Room occupancy reports
- `GET /api/v1/analytics/absence-summary` - Absence analytics
- `GET /api/v1/analytics/export/pdf` - Export report as PDF
- `GET /api/v1/analytics/export/csv` - Export data as CSV

## 👥 Default Admin Credentials

After first setup, create an admin user using the CSV import or database seeder.

**Sample Admin**:
- CIN: `ADMIN001`
- Password: `Admin@123456`

> ⚠️ **Security**: Change default credentials immediately in production!

## 📊 Database Schema

The database includes the following main tables:

- `users` - All system users (students, teachers, admins)
- `departments` - Academic departments
- `specialties` - Degree specializations
- `levels` - Academic levels (L1, L2, M1, etc.)
- `groups` - Student groups
- `rooms` - Classrooms and facilities
- `subjects` - Courses/subjects
- `timetable` - Class schedules
- `absences` - Absence records
- `messages` - Internal messages
- `notifications` - User notifications
- `events` - Academic events

## 📤 Bulk User Import

### CSV Format

Create a CSV file with the following format:

```csv
cin,firstName,lastName,email,password,role,studentCode,departmentCode,groupCode
12345678,John,Doe,john.doe@university.com,Password123!,student,STU001,CS,L1-G1
87654321,Jane,Smith,jane.smith@university.com,Password123!,teacher,TEACH001,CS,
```

### Import via API

```bash
curl -X POST http://localhost:3000/api/v1/users/import \
  -H "Authorization: Bearer <admin-token>" \
  -F "file=@users.csv"
```

## 🐳 Docker Commands

```bash
# Start development environment
./scripts/start-dev.sh

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Restart backend only
docker-compose restart backend

# Access database
docker-compose exec db psql -U postgres -d university_platform

# Run migrations
docker-compose exec backend npm run migration:run

# Generate migration
docker-compose exec backend npm run migration:generate -- -n MigrationName
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `db` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres_password` |
| `DB_DATABASE` | Database name | `university_platform` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | Required |
| `SMTP_PASSWORD` | SMTP password | Required |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- Helmet.js security headers
- SQL injection prevention (TypeORM)
- Input validation (Zod)
- CORS configuration
- Password reset token expiry
- Secure password requirements

## 📈 Production Deployment

### 1. Update Environment Variables

Create `backend/.env.production` with production values:

```env
NODE_ENV=production
DB_PASSWORD=<strong-password>
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
# ... other production values
```

### 2. Start Production Environment

```bash
./scripts/start-prod.sh
```

### 3. Production Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure production database
- [ ] Set up email service (SendGrid, AWS SES, etc.)
- [ ] Enable database backups
- [ ] Configure monitoring and logging
- [ ] Set up reverse proxy (Nginx)
- [ ] Enable firewall rules

## 🤝 Contributing

This is a university project. For contributions:

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Port Already in Use

```bash
# Change PORT in .env file
PORT=3001

# Or kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### TypeScript Compilation Errors

```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

## 📞 Support

For issues and questions:
- Email: support@university.com
- Documentation: http://localhost:3000/api/docs

---

**Built with ❤️ for University Management**
