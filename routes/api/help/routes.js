import express from 'express'
import {send_help,show_help_replies,edit_help,show_help_messages} from '../../../controllers/api/help_api_controller.js'


const router = express.Router();


router.post('/send/help', send_help);
// show help message for user
router.get('/show/help/replies/:userId', show_help_replies);
// edit help message
router.post('/edit/help/:helpId', edit_help)
// show all help messages
router.get('/show/all/helps', show_help_messages);

export default router;