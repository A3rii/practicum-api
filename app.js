'use strict';

import express from 'express';
import morgan from 'morgan';
import connectDB from './configs/db.js';
import bodyParser from 'body-parser';
import expressListEndpoints from 'express-list-endpoints';
import auth from './routes/auth.routes.js';
import lessor from './routes/lessor.routes.js';
import book from './routes/booking.routes.js';
import cors from 'cors';
import 'dotenv/config';

const app = express();

// Middleware to parse JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'server is running',
  });
});

// Connect to MongoDB
connectDB().then(() => {
  app.use('/api/auth', auth);
  app.use('/api/lessor', lessor);
  app.use('/api/books', book);

  //*  List all endpoints
  app.get('/api/endpoints', (req, res) => {
    const endpoints = expressListEndpoints(app);
    res.status(200).json({
      status: 'success',
      endpoints,
    });
  });
});

export default app;
