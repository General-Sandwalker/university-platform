import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import * as dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { logger, stream } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './config/swagger';
import routes from './routes';

// Load environment variables
dotenv.config();

class App {
  public app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    
    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeDatabase() {
    try {
      await AppDataSource.initialize();
      logger.info('✅ Database connection established successfully');
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  private initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // HTTP request logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      const morgan = require('morgan');
      this.app.use(morgan('combined', { stream }));
    }

    logger.info('✅ Middlewares initialized');
  }

  private initializeRoutes() {
    // API documentation
    this.app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
      })
    );

    // API routes
    this.app.use('/api/v1', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'University Management Platform API',
        version: '1.0.0',
        documentation: '/api/docs',
        health: '/api/v1/health',
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        status: 'error',
        message: 'Route not found',
      });
    });

    logger.info('✅ Routes initialized');
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
    logger.info('✅ Error handling initialized');
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`🚀 Server is running on port ${this.port}`);
      logger.info(`📚 API Documentation: http://localhost:${this.port}/api/docs`);
      logger.info(`🏥 Health Check: http://localhost:${this.port}/api/v1/health`);
    });
  }
}

export default App;
