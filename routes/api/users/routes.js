import express from 'express'
const router = express.Router()
import { show_users } from '../../../controllers/api/users_api_controller.js';


router.get('/users', show_users); 
export default router