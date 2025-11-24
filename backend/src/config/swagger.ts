import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'University Management Platform API',
      version: '1.0.0',
      description: `
        A comprehensive RESTful API for managing university operations including:
        - User authentication and authorization
        - Department, specialty, and level management
        - Timetable and course scheduling
        - Absence tracking and excuse management
        - Internal messaging system
        - Notifications and alerts
        - Event management
        - Analytics and reporting
      `,
      contact: {
        name: 'API Support',
        email: 'support@university.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.university.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            cin: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: {
              type: 'string',
              enum: ['student', 'teacher', 'department_head', 'admin'],
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended', 'eliminated'],
            },
          },
        },
        Department: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            code: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Departments', description: 'Department management' },
      { name: 'Specialties', description: 'Specialty management' },
      { name: 'Levels', description: 'Level management' },
      { name: 'Groups', description: 'Group management' },
      { name: 'Rooms', description: 'Room management' },
      { name: 'Subjects', description: 'Subject management' },
      { name: 'Timetable', description: 'Timetable management' },
      { name: 'Absences', description: 'Absence tracking' },
      { name: 'Messages', description: 'Internal messaging' },
      { name: 'Notifications', description: 'Notifications' },
      { name: 'Events', description: 'Event management' },
      { name: 'Analytics', description: 'Analytics and reporting' },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
