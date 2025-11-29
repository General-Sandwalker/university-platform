# 🚀 Quick Start - University Management Platform

## Complete Full-Stack Application

This platform includes:
- ✅ **Backend**: Node.js + TypeScript + Express.js API
- ✅ **Frontend**: React + TypeScript + Tailwind CSS
- ✅ **Database**: PostgreSQL 17
- ✅ **Docker**: Full containerization

---

## 🎯 One-Command Startup

### Development Mode (Hot Reload)
```bash
./scripts/start-dev-mode.sh
```
- Frontend: http://localhost:5173 (Vite with hot reload)
- Backend: http://localhost:3000
- Changes to frontend auto-reload instantly!

### Production Mode (Docker)
```bash
./scripts/start-fullstack.sh
```
- Frontend: http://localhost (Nginx)
- Backend: http://localhost:3000
- All services containerized

---

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `./scripts/start-dev-mode.sh` | Start with frontend hot reload |
| `./scripts/start-fullstack.sh` | Start full stack with Docker |
| `./scripts/start-frontend-dev.sh` | Frontend only (dev server) |
| `./scripts/build-frontend.sh` | Build frontend for production |
| `./scripts/stop-all.sh` | Stop all services |
| `./scripts/start-prod.sh` | Production mode |

---

## 🌐 Access Points

### After Starting:

**Frontend Application:**
- Development: http://localhost:5173
- Production: http://localhost

**Backend API:**
- Base URL: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/api/v1/health

**Database:**
- Host: localhost
- Port: 5432
- Database: university_platform

---

### Default Login Credentials

```
CIN: ADMIN001
Password: Admin@123456
```

---

## 🎨 Frontend Features

### Fully Implemented Pages:
- ✅ **Dashboard** - Role-based analytics and statistics
- ✅ **Users Management** - Complete CRUD with filters
- ✅ **Messages** - Real-time messaging system
- ✅ **Schedule** - Semester-based weekly class schedules
- ✅ **Semesters** - Academic semester management (Admin)
- ✅ **Absences** - Student absence tracking
- ✅ **Events** - University events calendar
- ✅ **Notifications** - Real-time notification center
- ✅ **Academic Entities** - Departments, Specialties, Groups, Levels, Subjects, Rooms

### UI/UX Features:
- 🎨 Modern, responsive design with Tailwind CSS
- 🌙 Clean and professional interface
- 📱 Mobile-friendly layout
- ⚡ Fast and smooth interactions
- 🔄 Real-time updates with React Query
- 📊 Interactive charts and visualizations
- 🔔 Toast notifications for user feedback
- 🔐 Protected routes and role-based access

---

## 🛠️ Development Workflow

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Full Stack with Docker
```bash
docker-compose up -d --build
docker-compose logs -f  # View logs
```

---

## 📦 Tech Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Routing**: React Router DOM v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Lucide Icons
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 17
- **ORM**: TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: class-validator, class-transformer
- **File Upload**: Multer
- **Email**: Nodemailer
- **API Docs**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Security**: bcryptjs, cors, helmet

### DevOps
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (for frontend production)
- **Process Manager**: PM2 (for backend production)

---

## 🔧 Configuration

### Frontend Environment (.env)
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Backend Environment (.env)
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres_password
DB_DATABASE=university_platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 📊 Project Structure

```
university-platform/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── stores/         # State management (Zustand)
│   │   ├── types/          # TypeScript types
│   │   ├── lib/            # Utilities and configurations
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── Dockerfile          # Frontend container config
│   ├── nginx.conf          # Nginx configuration
│   └── package.json        # Dependencies
│
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── entities/       # TypeORM entities
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── validators/     # Input validation
│   │   └── utils/          # Helper functions
│   ├── Dockerfile          # Backend container config
│   └── package.json        # Dependencies
│
├── scripts/                 # Deployment and utility scripts
│   ├── start-dev-mode.sh   # Development with hot reload
│   ├── start-fullstack.sh  # Full stack Docker
│   ├── build-frontend.sh   # Build frontend
│   ├── stop-all.sh         # Stop all services
│   └── ...
│
├── docker-compose.yml       # Development compose file
├── docker-compose.prod.yml  # Production compose file
└── README.md               # This file
```

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :80    # Frontend
sudo lsof -i :3000  # Backend
sudo lsof -i :5432  # Database

# Stop the conflicting service or change ports in docker-compose.yml
```

### Database Connection Issues
```bash
# Reset database
docker-compose down -v  # Remove volumes
docker-compose up -d db
```

### Frontend Not Loading
```bash
# Rebuild frontend
cd frontend
rm -rf node_modules dist
npm install
npm run build

# Or rebuild Docker
docker-compose up -d --build frontend
```

### Backend Errors
```bash
# View backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

---

## 📚 API Documentation

Once running, visit: **http://localhost:3000/api/docs**

Interactive Swagger documentation with:
- All available endpoints
- Request/response schemas
- Try-it-out functionality
- Authentication instructions

---

## 🔄 Update and Maintenance

### Pull Latest Changes
```bash
git pull origin main
docker-compose down
docker-compose up -d --build
```

### Database Migrations
```bash
docker-compose exec backend npm run migration:generate
docker-compose exec backend npm run migration:run
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

---

## 🎓 User Roles

The system supports 4 user roles:

1. **Student** - View schedules, absences, grades
2. **Teacher** - Manage classes, record absences
3. **Department Head** - Manage department operations
4. **Admin** - Full system access

---

## 📞 Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Review API docs: http://localhost:3000/api/docs
3. Verify environment files are configured
4. Ensure all services are running: `docker-compose ps`

---

## 🎉 You're All Set!

Start developing with:
```bash
./scripts/start-dev-mode.sh
```

Visit http://localhost:5173 and login with the default credentials!

---

**Built with ❤️ using React, Node.js, TypeScript, and Docker**
