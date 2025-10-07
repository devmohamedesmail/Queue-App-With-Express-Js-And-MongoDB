import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupApp } from './config/appConfig.js';
import places_routes from './routes/api/places/routes.js'
import queues_routes from './routes/api/queues/routes.js'
import services_routes from './routes/api/services/routes.js'
import setting_routes from './routes/api/settings/routes.js'
import pages_routes from './routes/api/pages/routes.js'
import auth_routes from './routes/api/auth/routes.js'
import subscriber_routes from './routes/api/subscriber/routes.js'
import api from './routes/api/routes.js'
import notification_routes from "./routes/api/notifications/routes.js";
import connectDB from './config/db.js';
import setupSocket from './config/socket.js';


connectDB();


const app = express();

// Socket.IO server setup
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


await setupApp(app);

// Socket.IO configuration
setupSocket(io);

// Make io accessible to routes
app.set('io', io);


app.get('/', (req, res) => {
  res.render('index');
});


// ********************************************************* Api Routes Start *********************************************************
// Auth Api Routes file
app.use('/api/v1/auth', auth_routes);
// Places Api Routes file
app.use('/api/v1/places', places_routes);
// Services Api Routes file
app.use('/api/v1/services', services_routes);
// Queue Api Routes file
app.use('/api/v1/queues', queues_routes);
// notifications Api Routes file
app.use('/api/v1/notifications', notification_routes);
// settings Api Routes file
app.use('/api/v1/settings', setting_routes);
// pages api Routes file
app.use('/api/v1/pages', pages_routes);
// subscribe api Routes file
app.use('/api/v1/subscriber', subscriber_routes)

app.use('/api/v1', api);

// ********************************************************* Api Routes End *********************************************************

server.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});