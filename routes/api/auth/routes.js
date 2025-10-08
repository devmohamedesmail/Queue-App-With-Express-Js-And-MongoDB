import express from 'express';
import { register_user, login_user, edit_user, delete_user } from '../../../controllers/api/auth_api_controller.js';
const router = express.Router();


/**
 * @route   POST /register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', register_user)

/**
 * @route   POST /login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post('/login', login_user);

/**
 * @route   POST /edit/user/:userId
 * @desc    Edit user profile information
 * @access  Private
 */
router.post('/edit/user/:userId', edit_user)

/**
 * @route   GET /delete/user/:userId
 * @desc    Delete a user account
 * @access  Private
 */
router.get('/delete/user/:userId', delete_user)



export default router;