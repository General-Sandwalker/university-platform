# Quick Reference Guide for Future Development

## 🚀 Quick Start Commands

```bash
# Start the system
docker-compose up -d

# View logs
docker logs university_backend -f
docker logs university_db -f

# Restart backend after code changes
docker-compose restart backend

# Stop everything
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Access database directly
docker exec -it university_db psql -U postgres -d university_db

# Run tests
cd backend/scripts
bash test-messaging-final.sh
bash test-auth.sh
```

---

## 📡 Common API Calls

### Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cin":"ADMIN001","password":"Admin@123456"}'

# Get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cin":"ADMIN001","password":"Admin@123456"}' | jq -r '.data.accessToken')
```

### Messaging
```bash
# Send message
curl -X POST http://localhost:3000/api/v1/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId":"USER_ID","content":"Hello!"}'

# Get inbox
curl -X GET http://localhost:3000/api/v1/messages/inbox \
  -H "Authorization: Bearer $TOKEN"

# Get unread count
curl -X GET http://localhost:3000/api/v1/messages/unread-count \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔑 Test Credentials

```
Admin:    CIN: ADMIN001  | Password: Admin@123456
Head 1:   CIN: HEAD001   | Password: Head@123
Head 2:   CIN: HEAD002   | Password: Head@123
Head 3:   CIN: HEAD003   | Password: Head@123
Teacher 1: CIN: TEACH001 | Password: Teacher@123
Teacher 2: CIN: TEACH002 | Password: Teacher@123
Student 1-5: CIN: STUD001-005 | Password: Student@123
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Swagger configuration
│   ├── controllers/     # Request handlers
│   ├── entities/        # TypeORM entities (database models)
│   ├── middleware/      # Auth, validation, error handling
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions (auth, logger)
│   ├── scripts/         # Database seeding, tests
│   └── app.ts           # Express app setup
├── tests/               # Test files
└── package.json         # Dependencies
```

---

## 🛠️ Adding a New Feature

### 1. Create Entity (Database Model)
**File:** `src/entities/NewEntity.ts`
```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('new_entities')
export class NewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
```

### 2. Create Service (Business Logic)
**File:** `src/services/newEntity.service.ts`
```typescript
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { NewEntity } from '../entities/NewEntity';
import { AppError } from '../middleware/errorHandler';

export class NewEntityService {
  private repository: Repository<NewEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(NewEntity);
  }

  async getAll(): Promise<NewEntity[]> {
    return await this.repository.find();
  }

  async getById(id: string): Promise<NewEntity> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new AppError(404, 'Entity not found');
    }
    return entity;
  }

  async create(data: Partial<NewEntity>): Promise<NewEntity> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async update(id: string, data: Partial<NewEntity>): Promise<NewEntity> {
    const entity = await this.getById(id);
    Object.assign(entity, data);
    return await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.getById(id);
    await this.repository.remove(entity);
  }
}
```

### 3. Create Controller (Request Handler)
**File:** `src/controllers/newEntity.controller.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { NewEntityService } from '../services/newEntity.service';

const service = new NewEntityService();

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entities = await service.getAll();
    res.json(entities);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = await service.getById(req.params.id);
    res.json(entity);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = await service.create(req.body);
    res.status(201).json(entity);
  } catch (error) {
    next(error);
  }
};
```

### 4. Create Routes with Validation
**File:** `src/routes/newEntity.routes.ts`
```typescript
import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { z } from 'zod';
import { getAll, getById, create } from '../controllers/newEntity.controller';

const router = Router();

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
  }),
});

/**
 * @swagger
 * /api/newentities:
 *   get:
 *     summary: Get all entities
 *     tags: [NewEntity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of entities
 */
router.get('/', authenticate, getAll);

/**
 * @swagger
 * /api/newentities/{id}:
 *   get:
 *     summary: Get entity by ID
 *     tags: [NewEntity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', authenticate, getById);

/**
 * @swagger
 * /api/newentities:
 *   post:
 *     summary: Create new entity
 *     tags: [NewEntity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 */
router.post('/', authenticate, adminOnly, validate(createSchema), create);

export default router;
```

### 5. Register Routes
**File:** `src/routes/index.ts`
```typescript
import newEntityRoutes from './newEntity.routes';

// Add to router.use() section
router.use('/newentities', newEntityRoutes);
```

---

## 🧪 Testing Pattern

**File:** `backend/scripts/test-newentity.sh`
```bash
#!/bin/bash

API_URL="http://localhost:3000/api/v1"

# Get token
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"ADMIN001","password":"Admin@123456"}' | jq -r '.data.accessToken')

echo "Testing New Entity endpoints..."

# Test GET all
echo "1. Get all entities"
curl -s -X GET "$API_URL/newentities" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test POST create
echo "2. Create entity"
ENTITY=$(curl -s -X POST "$API_URL/newentities" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Entity"}')
echo "$ENTITY" | jq
ENTITY_ID=$(echo "$ENTITY" | jq -r '.id')

# Test GET by ID
echo "3. Get entity by ID"
curl -s -X GET "$API_URL/newentities/$ENTITY_ID" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "All tests completed!"
```

---

## 🔍 Common Debugging Steps

### 1. Check Container Status
```bash
docker-compose ps
```

### 2. View Backend Logs
```bash
docker logs university_backend --tail 100 -f
```

### 3. Check Database Connection
```bash
docker exec -it university_db psql -U postgres -d university_db -c "\dt"
```

### 4. Restart Backend
```bash
docker-compose restart backend && sleep 5 && docker logs university_backend --tail 50
```

### 5. Check Compilation Errors
```bash
docker logs university_backend 2>&1 | grep -i "error"
```

---

## 📊 Common SQL Queries

```sql
-- View all tables
\dt

-- View users
SELECT id, cin, "firstName", "lastName", role FROM users;

-- View messages
SELECT id, content, status, "senderId", "receiverId", "createdAt" 
FROM messages ORDER BY "createdAt" DESC LIMIT 10;

-- Count unread messages per user
SELECT u.cin, COUNT(m.id) as unread_count
FROM users u
LEFT JOIN messages m ON m."receiverId" = u.id AND m."readAt" IS NULL
GROUP BY u.id, u.cin
ORDER BY unread_count DESC;

-- View recent absences
SELECT s.cin as student, t."firstName" as teacher, a.date, a.status
FROM absences a
JOIN users s ON a."studentId" = s.id
JOIN users t ON a."teacherId" = t.id
ORDER BY a.date DESC LIMIT 10;
```

---

## 🔧 Common Environment Variables

**File:** `backend/.env`
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=university_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🚨 Error Handling Pattern

```typescript
// Use AppError for custom errors
throw new AppError(404, 'Resource not found');
throw new AppError(400, 'Invalid input');
throw new AppError(401, 'Authentication required');
throw new AppError(403, 'Access denied');
throw new AppError(500, 'Internal server error');

// Validation errors are handled automatically by Zod
// Database errors are caught by error handler middleware
```

---

## 📚 Useful TypeORM Patterns

```typescript
// Find with relations
await repository.find({
  where: { id },
  relations: ['sender', 'receiver'],
});

// Find with conditions
await repository.find({
  where: { status: 'active', role: UserRole.STUDENT },
  order: { createdAt: 'DESC' },
});

// Query builder for complex queries
await repository
  .createQueryBuilder('message')
  .leftJoinAndSelect('message.sender', 'sender')
  .where('message.receiverId = :userId', { userId })
  .andWhere('message.readAt IS NULL')
  .orderBy('message.createdAt', 'DESC')
  .getMany();

// Update
await repository.update({ id }, { status: 'read' });

// Count
await repository.count({ where: { receiverId: userId, readAt: IsNull() } });
```

---

## 🎯 Best Practices

1. **Always use authentication middleware** for protected routes
2. **Always validate request data** with Zod schemas
3. **Always use AppError** for consistent error responses
4. **Always add Swagger documentation** for new endpoints
5. **Always test endpoints** after implementation
6. **Always use transactions** for multi-step database operations
7. **Always log important actions** using the logger utility
8. **Never commit sensitive data** (.env files)
9. **Never expose internal errors** to clients
10. **Never trust user input** - always validate

---

## 📖 Additional Resources

- **Swagger UI:** http://localhost:3000/api/docs
- **TypeORM Docs:** https://typeorm.io
- **Express Docs:** https://expressjs.com
- **Zod Docs:** https://zod.dev
- **JWT.io:** https://jwt.io

---

**Created:** November 24, 2025  
**For:** University Management Platform v1.0.0
