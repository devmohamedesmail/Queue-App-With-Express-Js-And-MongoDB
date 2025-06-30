# Queue App Express.js

A real-time queue management system built with Express.js, Socket.IO, MongoDB, and EJS. Supports user registration, authentication, queue booking, admin and subscriber dashboards, and real-time updates.

---

## Features
- User registration and authentication (JWT)
- Real-time queue updates with Socket.IO
- Admin, subscriber, and front-end user dashboards
- RESTful API for places, queues, services, settings, pages, and subscribers
- EJS templating for server-rendered views
- File uploads (multer)
- Multi-language support (i18n)
- TypeScript support for controllers/routes
- Modular code structure

---

## Project Structure
```
queue-app-express-js/
├── app.js
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── config/
├── controllers/
├── locales/
├── middlewares/
├── models/
├── public/
├── routes/
├── utilites/
├── views/
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB

### Installation
```sh
npm install
```

### Development (with TypeScript)
```sh
npm run dev
```

### Build TypeScript
```sh
npx tsc
```

### Start Production Server
```sh
npm start
```

---

## API Endpoints

### Auth
- `POST /api/v1/auth/register` — Register user
- `POST /api/v1/auth/login` — Login user
- `POST /api/v1/auth/edit/user/:userId` — Edit user
- `GET /api/v1/auth/delete/user/:userId` — Delete user

### Queues
- `POST /api/v1/queues/book/new/queue/:user/:place/:service?` — Book queue
- `GET /api/v1/queues/cancel/queue/:id` — Cancel queue
- `GET /api/v1/queues/active/queue/:queueId/:userId` — Activate queue
- `GET /api/v1/queues/move/queue/:queueId` — Move queue to back

### Places, Services, Settings, Pages, Subscribers
- Standard RESTful endpoints under `/api/v1/`

---

## Real-Time Events (Socket.IO)
- `join_room` — Join a queue room
- `leave_room` — Leave a queue room
- `queue_update` — Broadcast queue updates
- `new_queue_entry` — Notify new queue entry
- `queue_status_change` — Notify queue status change

---

## Environment Variables
Create a `.env` file in the root:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3000
```

---

## Scripts
- `npm run dev` — Start with nodemon and TypeScript
- `npm start` — Start compiled JS
- `npx tsc` — Compile TypeScript

---

## License
MIT
# Queue-App-With-Express-Js-And-MongoDB
