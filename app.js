'use strict';

import express from 'express';
import morgan from 'morgan';
import connectDB from './configs/db.js';
import bodyParser from 'body-parser';
import expressListEndpoints from 'express-list-endpoints';
import auth from './routes/auth.routes.js';
import superAdmin from './routes/super_admin.routes.js';
import lessor from './routes/lessor.routes.js';
import book from './routes/booking.routes.js';
import userBook from './routes/user_booking.routes.js';
import staticBooking from './routes/booking_calculation.routes.js';
import comments from './routes/comments.routes.js';
import lessorModerator from './routes/lessor_moderator.routes.js';
import location from './routes/location.routes.js';
import rating from './routes/rating.routes.js';
import payment from './routes/payment.routes.js';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import session from 'express-session';
import 'dotenv/config';

const app = express();

// Initialize session middleware
// CORS block
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      process.env.MD5,
      process.env.RENEW_TOKEN,
    ], // Allow the frontend URL
    credentials: true, // Allow cookies and credentials
  }),
);

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  }),
);
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// use helemt
app.use(helmet());

// Middleware to parse JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.status(200).json({
    message: `server is running on ${process.env.FRONTEND_URL}`,
  });
});

// Connect to MongoDB
connectDB().then(() => {
  app.use('/api/auth', auth);
  app.use('/api/lessor', lessor);
  app.use('/api/books', book);
  app.use('/api/user', userBook);
  app.use('/api/period', staticBooking);
  app.use('/api/auth/moderator', superAdmin);
  app.use('/api/user/posts', comments);
  app.use('/api/moderator', lessorModerator);
  app.use('/api/rating', rating);
  app.use('/api/location', location);
  app.use('/api/payment', payment);

  // List all endpoints
  app.get('/api/endpoints', (req, res) => {
    const endpoints = expressListEndpoints(app);
    res.status(200).json({
      status: 'success',
      endpoints,
    });
  });
});

export default app;
