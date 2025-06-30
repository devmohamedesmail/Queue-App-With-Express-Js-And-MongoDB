import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupApp } from './config/appConfig.js';
import places_routes from './routes/api/places_routes.js'
import queues_routes from './routes/api/queue_routes.js'
import services_routes from './routes/api/services_routes.js'
import settingRoutes from './routes/api/settingRoutes.js'
import pagesRoutes from './routes/api/pagesRoutes.js'
import auth_routes from './routes/api/auth_routes.js'
import subscriberRoutes from './routes/api/subscriberRoutes.js'
import api from './routes/api/routes.js'






const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


await setupApp(app);

// Socket.IO configuration
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

 // Listen to a custom event
  socket.on('message', (data) => {
    console.log('Received message:', data);
    // Send response back to all connected clients
    io.emit('message', data);
  });
  

 socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });



 
  

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

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









// settings Api Routes file
app.use('/api/v1/settings', settingRoutes);


// pages api Routes file
app.use('/api/v1/pages', pagesRoutes);
// subscribe api Routes file
app.use('/api/v1/subscriber', subscriberRoutes)

app.use('/api/v1', api);

// ********************************************************* Api Routes End *********************************************************





server.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
  console.log('Socket.IO server is ready');
});