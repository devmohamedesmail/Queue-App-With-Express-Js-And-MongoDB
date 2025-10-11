import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupApp } from './config/appConfig.js';
import places_routes from './routes/api/places/routes.js';
import queues_routes from './routes/api/queues/routes.js';
import services_routes from './routes/api/services/routes.js';
import setting_routes from './routes/api/settings/routes.js';
import pages_routes from './routes/api/pages/routes.js';
import auth_routes from './routes/api/auth/routes.js';
import subscriber_routes from './routes/api/subscriber/routes.js';
import help_routes from './routes/api/help/routes.js';
import users_routes from './routes/api/users/routes.js';
import notification_routes from "./routes/api/notifications/routes.js";
import connectDB from './config/db.js';
import setupSocket from './config/socket.js';

// Connect to MongoDB
connectDB();

const app = express();

// Create HTTP server and setup Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Setup Express middlewares and configuration
await setupApp(app);

// Configure Socket.IO events and handlers
setupSocket(io);

// Make io instance accessible throughout the app
app.set('io', io);

// Root route for rendering index page
app.get('/', (req, res) => {
  res.render('index');
});

// *********************************************************
// API Routes Registration
// *********************************************************

// Auth API routes
app.use('/api/v1/auth', auth_routes);

// Places API routes
app.use('/api/v1/places', places_routes);

// Services API routes
app.use('/api/v1/services', services_routes);

// Queue API routes
app.use('/api/v1/queues', queues_routes);

// Notifications API routes
app.use('/api/v1/notifications', notification_routes);

// Settings API routes
app.use('/api/v1/settings', setting_routes);

// Pages API routes
app.use('/api/v1/pages', pages_routes);

// Subscriber API routes
app.use('/api/v1/subscriber', subscriber_routes);

// Help API routes
app.use('/api/v1/help', help_routes);

// Users API routes
app.use('/api/v1/users', users_routes);

// *********************************************************
// Start Server
// *********************************************************

server.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});