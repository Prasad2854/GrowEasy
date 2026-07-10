import express from 'express';
import cors from 'cors';
import { logger, httpLogger } from './utils/logger';
import { env } from './config/env';
import { uploadRouter } from './api/routes/upload.routes';
import { mappingRouter } from './api/routes/mapping.routes';
import { processRouter } from './api/routes/process.routes';

const app = express();

const allowedOrigins = env.FRONTEND_URL ? [env.FRONTEND_URL, 'http://localhost:3000'] : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(httpLogger);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: env.NODE_ENV });
});

// Routes
app.use('/api/upload', uploadRouter);
app.use('/api/mapping', mappingRouter);
app.use('/api/process', processRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});
