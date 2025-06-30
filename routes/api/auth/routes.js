import express from 'express';
import { register_user ,login_user , edit_user ,delete_user } from '../../../controllers/api/auth_api_controller.js';
const router = express.Router();


// Register User
router.post('/register', register_user )

// Login User
router.post('/login', login_user );

// Edit user
router.post('/edit/user/:userId', edit_user )

// delete account
router.get('/delete/user/:userId', delete_user)



export default router;