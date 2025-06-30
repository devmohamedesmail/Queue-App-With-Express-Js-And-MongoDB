import express from 'express';
import { register_user, login_user, delete_user, logout_user } from '../../controllers/web/AuthController.js';

const router = express.Router();

// Register User
router.post('/register', register_user);
// Login User
router.post('/login', login_user);

// logout user
router.get('/logout', logout_user);

// delete user
router.get('/delete/user/:id', delete_user)






export default router;